import { getStorageGrantRequest, getStorageGrantResponse, getStorageTransactionURL } from "../../core/sessionStorage";
import {
  Client,
  ClientKey,
  Continue,
  ContinueRequestAfterInteraction,
  GrantResponse,
  ProofMethod,
} from "../../typescript-client";
import { getInteractionHash } from "../interactionHash";
import { continueGrantRequest } from "../../core/continueGrantRequest";

/**
 *  4.2.1. Completing Interaction with a Browser Redirect to the Callback URI
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-completing-interaction-with
 *
 * The main goal for this function is to validate the URL parameters before the Continue Request
 *
 * @returns
 */
export async function redirectURIFinish(): Promise<GrantResponse> {
  // the client can self-configure, by reading the values of GrantRequest and GrantResponse
  // Expected to find SessionStorage because it is a Redirect-based Interaction flow
  const grantRequest = getStorageGrantRequest();
  const requestFinishNonce = grantRequest.interact?.finish?.nonce;
  if (!requestFinishNonce) {
    throw new Error("Error reading finishNonce or proofMethod");
  }

  const previousGrantResponse = getStorageGrantResponse();
  const responseFinishNonce = previousGrantResponse.interact?.finish;
  if (!responseFinishNonce) {
    throw new Error("Error reading GrantResponse or missing finish");
  }
  if (!previousGrantResponse.continue) {
    throw new Error("Invalid previousGrantResponse Continue object");
  }

  // When receiving the request, the client instance MUST parse the query parameters
  // to extract the hash and interaction reference values.
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.1-7
  const searchParams = new URLSearchParams(window.location.search);
  const hashURL = searchParams.get("hash");
  const interactRef = searchParams.get("interact_ref");

  if (!hashURL || !interactRef) {
    throw new Error("Error reading hash or interact_ref query parameters");
  }

  const transactionUrl = getStorageTransactionURL();

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

  /**
   * 5.1. Continuing After a Completed Interaction
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-continuing-after-a-complete
   */
  const continueRequestAfterInteractionBody: ContinueRequestAfterInteraction = {
    interact_ref: interactRef,
  };

  const proofMethod: ProofMethod = ((grantRequest.client as Client).key as ClientKey).proof.method;

  const continueObject: Continue = previousGrantResponse.continue;

  const grantResponse: GrantResponse = await continueGrantRequest(
    proofMethod,
    continueObject,
    continueRequestAfterInteractionBody
  );

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

  return grantResponse;
}
