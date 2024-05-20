import {
  clearStorageGrantRequest,
  clearStorageGrantResponse,
  clearStorageInteractionExpirationTime,
  clearTransactionURL,
  getStorageGrantRequest,
  getStorageGrantResponse,
  getTransactionURL,
} from "./sessionStorage";
import { continueRequest } from "../core/continueRequest";
import { Continue, GrantResponse } from "../typescript-client";
import { getInteractionHash } from "./utils";

/**
 *  4.2.1. Completing Interaction with a Browser Redirect to the Callback URI
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-completing-interaction-with
 *
 * The main goal for this function is to validate the URL parameters before the Continue Request
 *
 * @returns
 */
export async function redirectURICallback(): Promise<GrantResponse> {
  // if the flow comes here, the interaction is finished
  clearStorageInteractionExpirationTime();

  // TODO: by reading the firstGrantRequest (how the client configure the Grant process) (and based on what)
  // the client could self-configuring, by reading the values of GrantRequest and GrantResponse

  // read the configuration from the GrantRequest
  const grantRequest = getStorageGrantRequest();
  const requestFinishNonce = grantRequest.interact?.finish?.nonce;
  if (!requestFinishNonce) {
    throw new Error("Error reading finishNonce or proofMethod");
  }

  const transactionUrl = getTransactionURL();

  // Expected to find SessionStorage because it is a Redirect-based Interaction flow
  const previousGrantResponse = getStorageGrantResponse();
  const responseFinishNonce = previousGrantResponse.interact?.finish;
  if (!responseFinishNonce) {
    throw new Error("Error reading GrantResponse or missing finish");
  }
  if (!previousGrantResponse.continue) {
    throw new Error("Invalid previousGrantResponse Continue object");
  }
  const continueObject: Continue = previousGrantResponse.continue;

  // When receiving the request, the client instance MUST parse the query parameters
  // to extract the hash and interaction reference values.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.1-7
  const searchParams = new URLSearchParams(window.location.search);
  const hashURL = searchParams.get("hash");
  const interactRef = searchParams.get("interact_ref");

  if (!hashURL || !interactRef) {
    throw new Error("Error reading hash or interact_ref query parameters");
  }

  // The client instance calculates a hash (Section 4.2.3) based on this information and continues only if the hash validates.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-1.6.2-3.7.1

  // The client instance MUST calculate and validate the hash value as described in Section 4.2.3.
  // If the hash validates, the client instance sends a continuation request to the AS as described in Section 5.1
  // using the interaction reference value received here. If the hash does not validate, the client instance
  // MUST NOT send the interaction reference to the AS.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.1-7
  const interactionHash = await getInteractionHash(
    requestFinishNonce,
    responseFinishNonce,
    interactRef,
    transactionUrl
  );
  if (interactionHash !== hashURL) {
    throw new Error("Invalid hash value");
  }

  const grantResponse: GrantResponse = await continueRequest(continueObject, interactRef);

  // Keep the specific interaction flow logic in the "outer" function layer (not in core)

  // TODO: Verify that GrantResponse contains the access token, to consider successful the flow
  /**
   * If the AS has successfully granted one or more access tokens to the client instance, the AS responds
   * with the access_token field. This field contains either a single access token as described in Section 3.2.1
   * or an array of access tokens as described in Section 3.2.2.
   *
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

  // specific for the Interaction Flow
  clearTransactionURL();
  clearStorageGrantRequest();
  // GR is cleared here because there are other flows where the AS can answer directly with the access_token without
  //needing an Interaction flow. For example:  1.6.5. Software-only Authorization, or pre-agreed keys?
  clearStorageGrantResponse();

  return grantResponse;
}
