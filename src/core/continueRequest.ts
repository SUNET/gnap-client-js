import { importJWK, KeyLike } from "jose";
import { GrantResponse, ContinueRequest } from "../typescript-client";
import {
  ALGORITHM,
  GRANT_RESPONSE,
  PRIVATE_KEY,
  KEY_ID,
  SessionStorage,
  KEYS,
  PROOF_METHOD,
} from "../redirect/sessionStorage";
import { JWSRequestInit } from "./securedRequestInit";
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
): Promise<GrantResponse> {
  try {
    const previousGrantResponse = sessionStorageObject[GRANT_RESPONSE];
    if (!previousGrantResponse) {
      throw new Error("No grant response found");
    }

    // Prepare request body continueRequest
    const continueRequest: ContinueRequest = {
      interact_ref: interactRef,
    };

    // retrieve alg and privateKey
    const alg = sessionStorageObject[KEYS][ALGORITHM];
    const privateJwk = sessionStorageObject[KEYS][PRIVATE_KEY];
    const privateKey = await importJWK(privateJwk, alg);

    // prepare jwsHeader
    const kid = sessionStorageObject[KEYS][KEY_ID];
    const continueUrl = previousGrantResponse?.continue?.uri ?? "";

    // ProofMethod, continuity with the first request
    const proofMethod = sessionStorageObject[PROOF_METHOD] ?? "";

    // if access_token is "bound" then send it to transactionRequest() so that it can be calculate and add "ath" in the jwsHeader

    // A unique access token for continuing the request, called the "continuation access token". ...
    // This access token MUST be bound to the client instance's key used in the request and MUST NOT be a bearer token.
    // As a consequence, the flags array of this access token MUST NOT contain the string bearer and the key field MUST be omitted.
    // This access token MUST NOT have a manage field. The client instance MUST present the continuation access token in all requests
    // to the continuation URI as described in Section 7.2.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-3.1-2.6.1
    const continuationAccessToken = previousGrantResponse?.continue?.access_token?.value ?? "";

    const requestInit: RequestInit = await JWSRequestInit(
      proofMethod, // it is the same as in interactionStart()
      continueRequest,
      alg,
      privateKey as KeyLike,
      kid,
      HTTPMethods.POST, // is it always POST?
      continueUrl,
      continuationAccessToken
    );

    // add Authorization header, as required from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.2-4
    requestInit.headers = { ...requestInit.headers, ...{ Authorization: `GNAP ${continuationAccessToken}` } };

    const grantResponse: GrantResponse = await transactionRequest(continueUrl, requestInit);

    // TODO: Verify that GrantResponse contains the access token, to consider successful the flow
    /**
     * If the AS has successfully granted one or more access tokens to the client instance, the AS responds
     * with the access_token field. This field contains either a single access token as described in Section 3.2.1
     * or an array of access tokens as described in Section 3.2.2.
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-access-tokens
     */
    if (!grantResponse.access_token) {
      throw new Error("continueRequest Error: no access_token in response");
    }

    return grantResponse;
  } catch (error) {
    console.error("continueRequest Error", error);
    throw new Error("continueRequest Error");
  }
}
