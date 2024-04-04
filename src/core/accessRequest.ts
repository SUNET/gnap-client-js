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
export async function accessRequest(transactionUrl: string, request: RequestInit): Promise<GrantResponse | undefined> {
  // always a POST to a fixed url transactionUrl
  const finalRequest: RequestInit = {
    ...request,
    method: "POST",
  };

  const response = await fetch(transactionUrl, finalRequest);

  return await response.json();
}
