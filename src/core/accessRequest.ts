import { GrantResponse } from "typescript-client";

/**
 *
 * Prepare and send a GrantRequest
 *
 * @param alg
 * @param privateKey
 * @param random_generated_kid
 * @param transactionUrl
 * @returns
 */
export async function accessRequest(
  // gr: GrantRequest,
  // alg: string,
  // privateKey: KeyLike,
  // random_generated_kid: string,
  transactionUrl: string,
  request: RequestInit
): Promise<GrantResponse | undefined> {
  // Create the Attache JWS
  // - https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-attached-jws
  // - https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-10#name-attached-jws

  // Prepare the JWS Header by reading from the Grant Request??
  // const jwsHeader: CompactJWSHeaderParameters = {
  //   typ: "gnap-binding+jws", // "gnap-binding-jws"? from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#attached-jws
  //   alg: alg,
  //   kid: random_generated_kid,
  //   htm: "POST",
  //   uri: transactionUrl,
  //   created: Date.now(),
  // };

  // const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
  //   .setProtectedHeader(jwsHeader)
  //   .sign(privateKey);

  // // Prepare the fetch request
  // const headers = {
  //   "Content-Type": "application/jose+json",
  // };

  // request calculated by reading Grant Request??
  // const jwsRequest: RequestInit = {
  //   headers: headers,
  //   body: jws,
  //   method: "POST",
  // };

  // always a POST to a fixed url transactionUrl
  const finalRequest: RequestInit = {
    ...request,
    method: "POST",
  };

  const response = await fetch(transactionUrl, finalRequest);

  return await response.json();
}
