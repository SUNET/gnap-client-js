import { importJWK, KeyLike } from "jose";
import { GrantResponse, ContinueRequest } from "../typescript-client";
import { ALGORITHM, GRANT_RESPONSE, PRIVATE_KEY, KEY_ID, SessionStorage } from "../redirect/sessionStorage";
import { attachedJWSRequestInit } from "./securedRequest";
import { HTTPMethods } from "../utils";
import { transactionRequest } from "./transactionRequest";

/**
 * 5. Continuing a Grant Request
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-continuing-a-grant-request
 *
 * Comment: similar to transactionRequest but:
 * - the continueUrl is not fixes, it is decided by the AS, and comes from GrantResponse.continue.uri
 * - (if request is bound to an access token) jwsHeader needs to have one more felt "ath" access token header calculated hashing with GrantResponse.continue.access_token.value
 *
 * @param sessionStorageObject
 * @param interactRef
 * @returns
 */
export async function continueRequest(
  sessionStorageObject: SessionStorage,
  interactRef: string
): Promise<GrantResponse | undefined> {
  try {
    const grantResponse = sessionStorageObject[GRANT_RESPONSE];
    if (!grantResponse) {
      throw new Error("No grant response found");
    }

    // Prepare request body continueRequest
    const continueRequest: ContinueRequest = {
      interact_ref: interactRef,
    };

    // retrieve alg and privateKey
    const alg = sessionStorageObject[ALGORITHM];
    const privateJwk = sessionStorageObject[PRIVATE_KEY];
    const privateKey = await importJWK(privateJwk, alg);

    // prepare jwsHeader
    const random_generated_kid = sessionStorageObject[KEY_ID];
    const continueUrl = grantResponse?.continue?.uri ?? "";

    // if access_token is "bound" then send it to attachedJWSRequestInit() so that it can be calculate and add "ath" in the jwsHeader
    // if (grantResponse.continue?.access_token.bound) {
    //   attachedJWSRequestInit(..., grantResponse?.continue?.access_token?.value)
    // } else {
    //   attachedJWSRequestInit(...)
    // }
    const access_token = grantResponse?.continue?.access_token?.value ?? "";

    const requestInit: RequestInit = await attachedJWSRequestInit(
      continueRequest,
      alg,
      privateKey as KeyLike,
      random_generated_kid,
      HTTPMethods.POST, // is it always POST?
      continueUrl,
      access_token
    );

    // add Authorization header, as required from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.2-4
    requestInit.headers = { ...requestInit.headers, ...{ Authorization: `GNAP ${access_token}` } };

    const response = await transactionRequest(continueUrl, requestInit);

    return response;
  } catch (error) {
    console.error("continueRequest Error", error);
    throw new Error("continueRequest Error");
  }
}
