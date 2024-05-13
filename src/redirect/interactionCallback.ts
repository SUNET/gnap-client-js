import {
  FINISH_NONCE,
  PROOF_METHOD,
  TRANSACTION_URL,
  clearStorageCallbackConfig,
  clearStorageGrantResponse,
  clearStorageInteractionExpirationTime,
  getStorageCallbackConfig,
  getStorageGrantResponse,
} from "./sessionStorage";
import { continueRequest } from "../core/continueRequest";
import { Continue, GrantResponse, ProofMethod } from "../typescript-client";
import { getEncodedHash } from "../cryptoUtils";

/**
 *  4.2.3. Calculating the interaction hash
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-calculating-the-interaction
 *
 *
 *  13.25. Calculating Interaction Hash
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-calculating-interaction-has
 *
 */

export async function getInteractionHash(
  finishNonce: string,
  finish: string,
  interactRef: string,
  transactionUrl: string
): Promise<string> {
  try {
    const hashBaseString = `${finishNonce}\n${finish}\n${interactRef}\n${transactionUrl}`;
    return await getEncodedHash(hashBaseString);
  } catch (error) {
    console.error("getInteractionHash error", error);
    throw new Error("getInteractionHash error");
  }
}

/**
 *  4.2.1. Completing Interaction with a Browser Redirect to the Callback URI
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-completing-interaction-with
 *
 * To be used only in a web browser flow
 *
 * The main goal for this function is to validate the URL parameters before the Continue Request
 *
 * @returns
 */
export async function interactionCallback(): Promise<GrantResponse> {
  // if the flow comes here, the interaction is finished
  clearStorageInteractionExpirationTime();

  // Expected to find SessionStorage because it is a Redirect-based Interaction flow
  const previousGrantResponse = getStorageGrantResponse();
  // Get "finish" token from the Interact object in the GrantResponse
  const finish = previousGrantResponse.interact?.finish ?? "";

  // Get transaction URL from the CallbackConfig object
  const callbackConfig = getStorageCallbackConfig();
  const transactionUrl = callbackConfig[TRANSACTION_URL] ?? "";

  // When receiving the request, the client instance MUST parse the query parameters
  // to extract the hash and interaction reference values.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.1-7
  const searchParams = new URLSearchParams(window.location.search);
  const hashURL = searchParams.get("hash") ?? "";
  const interactRef = searchParams.get("interact_ref") ?? "";

  if (!hashURL || !interactRef) {
    throw new Error("Error reading GrandResponse or missing interactRef");
  }

  // The client instance calculates a hash (Section 4.2.3) based on this information and continues only if the hash validates.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-1.6.2-3.7.1

  // The client instance MUST calculate and validate the hash value as described in Section 4.2.3.
  // If the hash validates, the client instance sends a continuation request to the AS as described in Section 5.1
  // using the interaction reference value received here. If the hash does not validate, the client instance
  // MUST NOT send the interaction reference to the AS.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.1-7
  const interactionHash = await getInteractionHash(callbackConfig[FINISH_NONCE], finish, interactRef, transactionUrl);
  if (interactionHash !== hashURL) {
    throw new Error("Invalid hash value");
  }

  if (!previousGrantResponse.continue || !callbackConfig[PROOF_METHOD]) {
    throw new Error("Invalid previousGrantResponse or ProofMethod");
  }
  const continueObject: Continue = previousGrantResponse.continue;
  const proofMethod: ProofMethod = callbackConfig[PROOF_METHOD];

  const grantResponse: GrantResponse = await continueRequest(continueObject, proofMethod, interactRef);

  // Keep the specific flow logic in the "outer" function

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

  // Keep always the clientKeys in the sessionStorage
  // clientKeys has its own lifecycle separated from the GrantRequest lifecycle

  /**
   * if the state is FINALIZED => clear the callbackConfig and grantResponse
   * if the state is APPROVED => clear all but keep what is needed for renew the token
   */
  clearStorageCallbackConfig();
  clearStorageGrantResponse();

  return grantResponse;
}
