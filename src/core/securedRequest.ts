import { getSHA256Hash } from "../cryptoUtils";
import { CompactJWSHeaderParameters, CompactSign, KeyLike } from "jose";
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
 * @param gr
 * @param alg
 * @param privateKey
 * @param random_generated_kid
 * @param htm
 * @param transactionUrl
 * @param access_token
 * @returns
 */
export async function attachedJWSRequest(
  gr: GrantRequest | ContinueRequest, // maybe this should work for any string, could be GrantRequest or ContinueRequest
  alg: string,
  privateKey: KeyLike,
  random_generated_kid: string,
  htm: HTTPMethods, // for example "POST"
  transactionUrl: string,
  access_token?: string // if the gr is bound to an access token
): Promise<RequestInit> {
  //TODO: Prepare the JWS Header by reading from the Grant Request??
  const jwsHeader: CompactJWSHeaderParameters = {
    typ: "gnap-binding+jws", // "gnap-binding-jws" from version 19: Updated JOSE types to no longer use subtypes  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#appendix-A-2.2.2.2.1
    alg: alg,
    kid: random_generated_kid,
    htm: htm, // linked in jwsRequest method
    uri: transactionUrl,
    created: Date.now(),
  };

  // When the request is bound to an access token, the JOSE header MUST also include the following:
  //    ath (string): The hash of the access token. The value MUST be the result of Base64url encoding (with no padding) the SHA-256 digest of the ASCII encoding of the associated access token's value.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-7.2.1
  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  let jws;
  // If the HTTP request has content, such as an HTTP POST or PUT method, the payload of the JWS object is the JSON serialized content of the request, and the object is signed according to JWS and serialized into compact form [RFC7515].
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-8
  if (htm === HTTPMethods.POST || htm === HTTPMethods.PUT) {
    jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
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

  // Prepare the fetch request
  // "The signer presents the JWS as the content of the request along with a content type of application/jose." https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-8
  // "application/jose" vs "application/jose+json" https://www.rfc-editor.org/rfc/rfc7515.html#section-9.2.1
  const headers: HeadersInit = {
    "Content-Type": "application/jose+json", // or should it be "application/jose" ?
  };

  if (access_token) {
    const accessTokenHash = await getSHA256Hash(access_token);
    jwsHeader.ath = accessTokenHash;
  }

  // request calculated by reading Grant Request??
  const jwsRequest: RequestInit = {
    headers: headers,
    body: jws,
    method: htm, // linked in jwsHeader
  };

  return jwsRequest;
}
