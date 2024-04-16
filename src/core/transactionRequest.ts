import { GrantResponse } from "typescript-client";

/**
 *
 * Send a GrantRequest and manage Response errors
 *
 * @param transactionUrl
 * @param request
 * @returns
 */
export async function transactionRequest(
  transactionUrl: string,
  requestInit: RequestInit
): Promise<GrantResponse | undefined> {
  try {
    // always a POST to a fixed url transactionUrl
    const finalRequestInit: RequestInit = {
      ...requestInit,
      method: "POST",
    };

    const response = await fetch(transactionUrl, finalRequestInit);

    // Error management / definitions
    // Back-end seems to answer with http 400 and "details" in the body when there is an error
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("transactionRequest Error", errorResponse);
      throw new Error(errorResponse.details);
    }

    return await response.json();
  } catch (error) {
    console.error("transactionRequest Error", error);
    throw error;
  }
}
