import { getEncodedHash } from "../cryptoUtils";
import { CompactJWSHeaderParameters, CompactSign, KeyLike } from "jose";
import { ContinueRequest, GrantRequest, ProofMethod } from "../typescript-client";
import { HTTPMethods } from "../utils";

/**
 * 7. Securing Requests from the Client Instance
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-securing-requests-from-the-
 *
 *
 *
 *  13.2. Signing Requests from the Client Software
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-determining-authorization-a
 *
 */

/**
 * 7.3. Proving Possession of a Key with a Request
 *
 * Any keys presented by the client instance to the AS or RS MUST be validated as part of the request in which they are presented.
 * The type of binding used is indicated by the proof parameter of the key object in Section 7.1. Key proof methods are specified
 * either by a string, which consists of the key proof method name on its own, or by a JSON object with the required field method
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-proving-possession-of-a-key
 *
 *
 * Values for the method defined by this specification are as follows:
 * - "httpsig" (string or object): HTTP Signing signature headers. See Section 7.3.1.
 * - "mtls" (string): Mutual TLS certificate verification. See Section 7.3.2.
 * - "jwsd" (string): A detached JWS signature header. See Section 7.3.3.
 * - "jws" (string): Attached JWS payload. See Section 7.3.4.
 *
 */

/**
 * JWSD and JWS
 *
 *  7.3.3. Detached JWS
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-detached-jws
 *  7.3.4. Attached JWS
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-attached-jws
 *
 * @param jwsType
 * @param body
 * @param alg
 * @param privateKey
 * @param kid
 * @param htm
 * @param transactionUrl
 * @param access_token
 * @returns
 */
export async function JWSRequestInit(
  jwsType: ProofMethod,
  body: GrantRequest | ContinueRequest, // maybe this should work for any string, could be GrantRequest or ContinueRequest
  alg: string,
  privateKey: KeyLike | Uint8Array, // same type as JOSE sign() argument
  kid: string,
  htm: HTTPMethods, // for example "POST"
  transactionUrl: string,
  access_token?: string // if the grant request is bound to an access token
): Promise<RequestInit> {
  // validate JWS "type":
  if (jwsType !== ProofMethod.JWS && jwsType !== ProofMethod.JWSD)
    throw new Error("JWSRequestInit: invalid ProofMethod type");

  // set right typ for the jwsHeader
  let typ;
  if (jwsType === ProofMethod.JWS) typ = "gnap-binding+jws"; // "gnap-binding-jws" from version 19: Updated JOSE types to no longer use subtypes  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.2.2.2.1
  if (jwsType === ProofMethod.JWSD) typ = "gnap-binding+jwsd";

  //TODO: Prepare the JWS Header by reading from the Grant Request / Response??
  const jwsHeader: CompactJWSHeaderParameters = {
    typ: typ,
    alg: alg,
    kid: kid,
    htm: htm, // linked to requestInit method
    uri: transactionUrl,
    created: Date.now(),
  };

  // When the request is bound to an access token, the JOSE header MUST also include the following:
  //    ath (string): The hash of the access token. The value MUST be the result of Base64url encoding (with no padding)
  //                  of the SHA-256 digest of the ASCII encoding of the associated access token's value.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-7.2.1
  if (access_token) {
    const accessTokenHash = await getEncodedHash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  let jws;
  // If the HTTP request has content, such as an HTTP POST or PUT method, the payload of the JWS object is the JSON serialized
  // content of the request, and the object is signed according to JWS and serialized into compact form [RFC7515].
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-8
  if (htm === HTTPMethods.POST || htm === HTTPMethods.PUT) {
    jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(body)))
      .setProtectedHeader(jwsHeader)
      .sign(privateKey);
  } else {
    // If the request being made does not have content, such as an HTTP GET, OPTIONS, or DELETE method,
    // the JWS signature is calculated over an empty payload and passed in the Detached-JWS header as described in Section 7.3.3.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-7.3.4-9
    jws = await new CompactSign(new TextEncoder().encode(JSON.stringify("")))
      .setProtectedHeader(jwsHeader)
      .sign(privateKey);
  }

  let headers; //: HeadersInit
  // Prepare the fetch requestInit object
  // "The signer presents the JWS as the content of the request along with a content type of application/jose."
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-8
  // https://www.rfc-editor.org/rfc/rfc7515.html#section-9.2.1
  if (jwsType === ProofMethod.JWS) {
    headers = {
      "Content-Type": "application/jose",
    };
  }

  if (jwsType === ProofMethod.JWSD) {
    /**
     * If the HTTP request has content, such as an HTTP POST or PUT method, the payload of the JWS object is the
     * Base64url encoding (without padding) of the SHA256 digest of the bytes of the content. If the request being
     * made does not have content, such as an HTTP GET, OPTIONS, or DELETE method, the JWS signature is calculated
     * over an empty payload.
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.3-8
     */
    /**
     *  HERE: JWSD is like JWS without the payload
     *
     * Appendix F.  Detached Content
     *
     * One way to do this is to create a JWS
     * in the normal fashion using a representation of the content as the
     * payload but then delete the payload representation from the JWS and
     * send this modified object to the recipient rather than the JWS.  When
     * using the JWS Compact Serialization, the deletion is accomplished by
     * replacing the second field (which contains BASE64URL(JWS Payload))
     * value with the empty string
     *
     * https://datatracker.ietf.org/doc/html/rfc7515/#appendix-F
     */
    console.log("ATTACHED JWS", jws);
    const jwsParts = jws.split(".");
    const jwsdPayload = await getEncodedHash(JSON.stringify(body));
    const jwsdHeader = jwsParts[0] + "." + jwsdPayload + "." + jwsParts[2];

    console.log("DETACHED JWS", jwsdHeader);
    // The signer presents the signed object in compact form [RFC7515] in the Detached-JWS HTTP Header field.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.3-9
    headers = { "Content-Type": "application/json", "Detached-JWS": jwsdHeader };
  }

  if (access_token) {
    const accessTokenHash = await getEncodedHash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  // Modify request payload based on if it is JWS or JWSD
  let payload; // : BodyInit
  if (jwsType === ProofMethod.JWS) payload = jws;
  if (jwsType === ProofMethod.JWSD) payload = JSON.stringify(body); // original body

  // request calculated by reading Grant Request??
  const requestInit: RequestInit = {
    method: htm, // linked to jwsHeader
    headers: headers, // header with JWS signature or Detached-JWS
    body: payload,
  };

  return requestInit;
}
