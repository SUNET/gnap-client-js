import { getEncodedHash } from "../cryptoUtils";
import { CompactJWSHeaderParameters, CompactSign, JWK, importJWK } from "jose";
import {
  ContinueRequestAfterInteraction,
  ECJWK,
  GrantRequest,
  ProofMethod,
  RSAJWK,
  SymmetricJWK,
} from "../typescript-client";
import { HTTPMethods } from "../utils";

/**
 * 7. Securing Requests from the Client Instance
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-securing-requests-from-the-
 *
 *
 *
 *  13.2. Signing Requests from the Client Software
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-signing-requests-from-the-c
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
 *  7.3.3. Detached JWS
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-detached-jws
 *  7.3.4. Attached JWS
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-attached-jws
 *
 * @param jwsType
 * @param body
 * @param jwk
 * @param privateKey
 * @param htm
 * @param transactionUrl
 * @param boundAccessToken
 * @returns
 */
export async function createJWSRequestInit(
  jwsType: ProofMethod,
  body: GrantRequest | ContinueRequestAfterInteraction, // maybe this should work for any string, could be GrantRequest or ContinueRequest
  jwk: ECJWK | RSAJWK | SymmetricJWK,
  privateJwk: JWK,
  htm: HTTPMethods, // for example "POST"
  transactionUrl: string,
  boundAccessToken?: string // if the grant request is bound to an access token
): Promise<RequestInit> {
  /**
   * createJWSRequestInit() could be self-configuring with a boundAccessToken, if the previous GrandResponse is provided.
   * At the moment it is the function that call createJWSRequestInit() that reads the previous GrantResponse and provide the boundAccessToken to the createJWSRequestInit()
   */

  if (!jwk.alg || !jwk.kid) {
    throw new Error("createJWSRequestInit: jwk must have alg and kid");
  }
  const alg = jwk["alg"];
  const kid = jwk["kid"];

  /**
   * JWS HEADER
   */

  // validate JWS "type":
  if (jwsType !== ProofMethod.JWS && jwsType !== ProofMethod.JWSD)
    throw new Error("JWSRequestInit: invalid ProofMethod type");

  // set right typ for the jwsHeader
  let typ;
  if (jwsType === ProofMethod.JWS) typ = "gnap-binding+jws"; // "gnap-binding-jws" from version 19: Updated JOSE types to no longer use subtypes  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.2.2.2.1
  if (jwsType === ProofMethod.JWSD) typ = "gnap-binding+jwsd";

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
  if (boundAccessToken) {
    const accessTokenHash = await getEncodedHash(boundAccessToken);
    jwsHeader.ath = accessTokenHash;
  }

  const privateKey = await importJWK(privateJwk, alg);

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

  /**
   * Request Init object by JWS types
   */
  let headers;
  let payload;

  if (jwsType === ProofMethod.JWS) {
    headers = {
      "Content-Type": "application/jose",
    };
    payload = jws;
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
    const jwsParts = jws.split(".");
    const jwsdPayload = await getEncodedHash(JSON.stringify(body));
    const jwsdHeader = jwsParts[0] + "." + jwsdPayload + "." + jwsParts[2];

    // The signer presents the signed object in compact form [RFC7515] in the Detached-JWS HTTP Header field.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.3-9
    headers = { "Content-Type": "application/json", "Detached-JWS": jwsdHeader };
    payload = JSON.stringify(body);
  }

  if (boundAccessToken) {
    // The access token MUST be sent using the HTTP "Authorization" request header field and the "GNAP" authorization
    // scheme along with a key proof as described in Section 7.3 for the key bound to the access token.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.2-4
    headers = { ...headers, ...{ Authorization: `GNAP ${boundAccessToken}` } };
  }

  const requestInit: RequestInit = {
    method: htm, // same as in jwsHeader
    headers: headers,
    body: payload,
  };

  return requestInit;
}
