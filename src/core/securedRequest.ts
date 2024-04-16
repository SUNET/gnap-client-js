import { getSHA256Hash } from "../cryptoUtils";
import { CompactJWSHeaderParameters, CompactSign, KeyLike, JWK, importJWK } from "jose";
import { ContinueRequest, GrantRequest } from "typescript-client";
import { HTTPMethods } from "../utils";

/**
 * 7. Securing Requests from the Client Instance
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-securing-requests-from-the-
 *
 */

/**
 *  7.3.4. Attached JWS
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-attached-jws
 *
 * @param body
 * @param alg
 * @param privateKey
 * @param kid
 * @param htm
 * @param transactionUrl
 * @param access_token
 * @returns
 */
export async function attachedJWSRequestInit(
  body: GrantRequest | ContinueRequest, // maybe this should work for any string, could be GrantRequest or ContinueRequest
  alg: string,
  privateKey: KeyLike | Uint8Array, // same type as JOSE sign() argument
  kid: string,
  htm: HTTPMethods, // for example "POST"
  transactionUrl: string,
  access_token?: string // if the grant request is bound to an access token
): Promise<RequestInit> {
  //TODO: Prepare the JWS Header by reading from the Grant Request / Response??
  const jwsHeader: CompactJWSHeaderParameters = {
    typ: "gnap-binding+jws", // "gnap-binding-jws" from version 19: Updated JOSE types to no longer use subtypes  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.2.2.2.1
    alg: alg,
    kid: kid,
    htm: htm, // linked in jwsRequest method
    uri: transactionUrl,
    created: Date.now(),
  };

  // When the request is bound to an access token, the JOSE header MUST also include the following:
  //    ath (string): The hash of the access token. The value MUST be the result of Base64url encoding (with no padding)
  //                  of the SHA-256 digest of the ASCII encoding of the associated access token's value.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-7.2.1
  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
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

  // Prepare the fetch requestInit object
  // "The signer presents the JWS as the content of the request along with a content type of application/jose."
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-8
  // "application/jose" vs "application/jose+json" https://www.rfc-editor.org/rfc/rfc7515.html#section-9.2.1
  const headers: HeadersInit = {
    "Content-Type": "application/jose+json", // or should it be "application/jose" ?
  };

  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  // request calculated by reading Grant Request??
  const jwsRequestInit: RequestInit = {
    headers: headers,
    body: jws,
    method: htm, // linked in jwsHeader
  };

  return jwsRequestInit;
}

/**
 * With Detached JWS!!
 * Inherit from attached JWSRequestInit and to proper changes to:
 *  - typ: "gnap-binding+jwsd"
 *  - strip body payload from jws
 *
 * Detached JWS is a variation of JWS that allows the signing of content (body) of
 * HTTP requests or responses without its modification. Turn the middle part of a JWS
 * into an empty string to create a detached JWS.
 *
 * @param body
 * @param alg
 * @param privateKey
 * @param kid
 * @param htm
 * @param transactionUrl
 * @param access_token
 * @returns
 */
export async function detachedJWSRequestInit(
  body: GrantRequest | ContinueRequest, // maybe this should work for any string, could be GrantRequest or ContinueRequest
  alg: string,
  key: KeyLike | Uint8Array, // same type as JOSE sign() argument
  kid: string,
  htm: HTTPMethods, // for example "POST"
  transactionUrl: string,
  access_token?: string // if the grant request is bound to an access token
): Promise<RequestInit> {
  const jwsHeader: CompactJWSHeaderParameters = {
    typ: "gnap-binding+jwsd", // HERE FIRST DIFFERENCE
    alg: alg,
    kid: kid, // HERE: KEY_ID MUST BE REGISTERED IN THE BACKEND
    htm: htm,
    uri: transactionUrl,
    created: Date.now(),
  };

  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  let jws;
  if (htm === HTTPMethods.POST || htm === HTTPMethods.PUT) {
    jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(body))).setProtectedHeader(jwsHeader).sign(key);
  } else {
    jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(""))).setProtectedHeader(jwsHeader).sign(key);
  }

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

  const jwsParts = jws.split(".");
  const jwsdHeader = jwsParts[0] + ".." + jwsParts[2];

  const headers: HeadersInit = {
    "detached-jws": jwsdHeader, // custom header?
    "Content-Type": "application/jose+json",
  };

  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  // request calculated by reading Grant Request??
  const jwsdRequestInit: RequestInit = {
    headers: headers, // header with JWS signature
    body: JSON.stringify(body), // original body
    method: htm, // linked in jwsHeader
  };

  return jwsdRequestInit;
}
