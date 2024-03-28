import { CompactJWSHeaderParameters, CompactSign, KeyLike } from "jose";
import { GrantRequest } from "typescript-client";

/**
 * 7. Securing Requests from the Client Instance
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-securing-requests-from-the-
 *
 */

export async function attachedJWSRequest(
  gr: GrantRequest, // can this woek for any string? GrantRequest or ContinueRequest
  alg: string,
  privateKey: KeyLike,
  random_generated_kid: string,
  transactionUrl: string
): Promise<RequestInit> {
  /**
   * From:
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-requesting-access
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#attached-jws
   *
   * The request MUST be sent as a JSON object in the content of the HTTP POST request with
   * the Content-Type application/json. A key proofing mechanism MAY define an alternative content type,
   * as long as the content is formed from the JSON object. For example, the attached JWS key proofing
   * mechanism (see Section 7.3.4) places the JSON object into the payload of a JWS wrapper,
   * which is in turn sent as the message content.
   */

  // Create the Attache JWS
  // - https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-attached-jws
  // - https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10#name-attached-jws

  // Prepare the JWS Header by reading from the Grant Request??
  const jwsHeader: CompactJWSHeaderParameters = {
    typ: "gnap-binding+jws", // "gnap-binding-jws"? from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#attached-jws
    alg: alg,
    kid: random_generated_kid,
    htm: "POST", // "POST" linked in jwsRequest method
    uri: transactionUrl,
    created: Date.now(),
  };

  const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
    .setProtectedHeader(jwsHeader)
    .sign(privateKey);

  // Prepare the fetch request
  const headers = {
    "Content-Type": "application/jose+json",
  };

  // request calculated by reading Grant Request??
  const jwsRequest: RequestInit = {
    headers: headers,
    body: jws,
    method: "POST", // "POST" linked in jwsHeader
  };

  return jwsRequest;
}
