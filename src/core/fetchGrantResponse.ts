import {
  StorageKeysJWK,
  clearStorageGrantRequest,
  clearStorageGrantResponse,
  clearStorageInteractionExpirationTime,
  clearStorageTransactionURL,
  getStorageGrantResponse,
  setStorageClientKeysJWK,
  setStorageGrantRequest,
  setStorageGrantResponse,
  setStorageInteractionExpirationTime,
  setStorageTransactionURL,
} from "./sessionStorage";
import { ContinueRequestAfterInteraction, GrantRequest, ProofMethod, GrantResponse } from "../typescript-client";
import { createJWSRequestInit } from "./securedRequestInit";
import { HTTPMethods } from "./utils";
import { validateClientKeysJWK } from "./clientKeys";

/**
 * Send a GrantRequest, manage Response errors and route to the right flow based on the type of GrantResponse
 * It will fill the SessionStorage when the AS requires an Interaction flow
 *
 * Manage here the lower level:
 *  - get the http response and send back to the other function in the GNAP library only the GrantResponse object
 *  - errors (network errors) and the Grant flow errors
 *
 * @param transactionUrl
 * @param requestInit
 * @returns
 */
export async function fetchGrantResponse(
  htm: HTTPMethods, // POST for new GrantRequest/Continue, PATCH for modify previous GrantRequests
  url: string,
  body: GrantRequest | ContinueRequestAfterInteraction,
  proofMethod: ProofMethod,
  clientKeysJWK: StorageKeysJWK,
  boundAccessToken?: string
): Promise<GrantResponse> {
  try {
    /**
     * To start a request, the client instance sends an HTTP POST with a JSON [RFC8259] document to the grant endpoint of the AS.
     * The grant endpoint is a URI that uniquely identifies the AS to client instances and serves as the identifier for the AS.
     * The document is a JSON object where each field represents a different aspect of the client instance's request.
     * Each field is described in detail in a section below.
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-2-1
     *
     *
     * Sending a request to the grant endpoint creates a grant request in the *processing* state.
     * The AS processes this request to determine whether interaction or authorization are necessary
     * (moving to the *pending* state), or if access can be granted immediately (moving to the *approved* state).
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-2-6
     */

    // validation works for also for externally generated keys
    validateClientKeysJWK(clientKeysJWK);

    /**
     * GrantRequest
     */

    // sign the request with the client's private key
    let requestInit: RequestInit;
    if (proofMethod === ProofMethod.JWS || proofMethod === ProofMethod.JWSD) {
      requestInit = await createJWSRequestInit(proofMethod, body, clientKeysJWK.privateJWK, htm, url, boundAccessToken);
    } else {
      throw new Error("ProofMethod not supported");
    }

    const response = await fetch(url, requestInit);

    /**
     * 3.6. Error Response
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-error-response
     */

    // Error management / definitions
    // Back-end seems to answer with http 400 and "details" in the body when there is an error
    // Response format seems to differ from GNAP Error Response
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#response-error

    // It is a given that the server will always answer with http 4xx when there is an error? Sometime servers answer 2xx and a error json as a payload
    if (!response.ok) {
      // Sometimes the backend response is pure text (no json), for example "JWS could not be deserialized"
      const errorResponse = await response.json();
      console.error("fetchGrantResponse Error", errorResponse);
      // TODO: IF THERE IS A ERROR SHOULD THE SESSION STORAGE BE CLEARED?
      throw new Error(errorResponse.details);
    }

    const grantResponse: GrantResponse = await response.json();

    /**
     * NOTE: It seems not possible for fetchGrantResponse() to distinguish different GrantRequest flows
     *
     * (OR MAYBE "interactRef" in GrantResponse helps?)
     *
     * fetchGrantResponse() can react based on what type of GrantResponse it gets (PENDING/APPROVED/FINALIZED)
     *
     * It can react in the form of save the GrantResponse (that contains Continue and Interaction objects) useful
     * for the Interact Flow.
     *
     */

    /**
     * There are 3 states, based on server response:
     *
     * - PENDING: approval is required. AS returns Continue and Interaction. A grant request in this state is always associated with
     *            a continuation access token bound to the client instance's key
     *            https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-1.5-5.4.1
     *
     * - APPROVED: no approval is required. AS return Access Token and Subject Information.
     *             If continuation and updates are allowed for this grant request, the AS can include the continuation response (Section 3.1).
     *             The client instance can send an update continuation request (Section 5.3)
     *             https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-1.5-5.6.1
     *
     * - FINALIZED: no further processing can happen. For example "error". The Grant flow is terminated
     *              https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-1.5-5.8.1
     */

    /**
     *  1.5. Protocol Flow
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-protocol-flow
     *
     */

    /**
     *  4. Determining Authorization and Consent
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-determining-authorization-a
     */

    // Check for which kind of response has been received from the AS.
    // What if there could be a response from AS that the client is not prepared to handle?

    // ROUTING the flow: There there should be controls to check which kind of response is returned.
    // If there is fields that signify "Interact", then go for it

    // Would be here the control of the Protocol Flow?
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-protocol-flow

    // Get the response and check if the AS is following the Redirect-based Interaction flow
    /**
     *
     * 3.1. Request Continuation
     * If the AS determines that the grant request can be continued by the client instance, the AS responds with the continue field.
     * This field contains a JSON object with the following properties.
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-request-continuation
     */

    // Read the server answer to check what the AS is allowing or requesting
    // Can GrantResponse contains only "continue" or only "interact"?
    /**
     * 2.5. Interacting with the User
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interacting-with-the-user
     *
     * 5. Continuing a Grant Request
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-continuing-a-grant-request
     */

    /**
     * If the AS determines that the client instance can make further requests to the continuation API, the AS MUST include a
     * new "continue" response (Section 3.1). The new continue response MUST include a continuation access token as well, and
     * this token SHOULD be a new access token, invalidating the previous access token. If the AS does not return a new continue
     * response, the client instance MUST NOT make an additional continuation request. If a client instance does so, the AS MUST
     * return an invalid_continuation error (Section 3.6).
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-5-16
     *
     *
     *   5.1. Continuing After a Completed Interaction
     *
     * Since the interaction reference is a one-time-use value as described in Section 4.2.1, if the client instance needs to make
     * additional continuation calls after this request, the client instance MUST NOT include the interaction reference in subsequent
     * calls. If the AS detects a client instance submitting an interaction reference when the request is not in the pending state,
     * the AS MUST return a too_many_attempts error (Section 3.6) and SHOULD invalidate the ongoing request by moving it to the finalized state.
     *
     * If the grant request is in the approved state, the grant response (Section 3) MAY contain any newly-created access tokens (Section 3.2)
     * or newly-released subject information (Section 3.4). The response MAY contain a new "continue" response (Section 3.1) as described above.
     * The response SHOULD NOT contain any interaction responses (Section 3.3).
     *
     * If the grant request is in the pending state, the grant response (Section 3) MUST NOT contain access tokens or subject information,
     * and MAY contain a new interaction responses (Section 3.3) to any interaction methods that have not been exhausted at the AS.
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-continuing-after-a-complete
     *
     *
     *  5.2. Continuing During Pending Interaction (Polling)
     *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-continuing-during-pending-i
     *
     *
     *  5.3. Modifying an Existing Request
     *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-modifying-an-existing-reque
     *
     */

    /**
     * MANAGE STORAGE and possible browser actions, based on which type of Grant Flow and which state in the flow
     */

    // Continue object should be there to reconnect to the AS after the interaction
    // If not "Continue" in the GrantResponse => FINALIZED status
    //if (grantResponse.continue && grantResponse.interact) {
    if (grantResponse.interact) {
      // save necessary data for interaction and continue - in all flows? or this is only for web browser flows?
      //  1.6.2. Redirect-based Interaction
      //    2.5.1.1. Redirect to an Arbitrary URI
      //  1.6.3. User-code Interaction
      //   2.5.1.4. Display a Short User Code and URI
      //  2.5.2.1. Receive an HTTP Callback Through the Browser
      // START: "redirect",
      // FINISH: "redirect"

      /**
       *  4.1.1. Interaction at a Redirected URI
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interaction-at-a-redirected
       *
       * 4.2.1. Completing Interaction with a Browser Redirect to the Callback URI
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-completing-interaction-with
       */
      setStorageTransactionURL(url);
      setStorageGrantRequest(body as GrantRequest);
      setStorageGrantResponse(grantResponse);
      setStorageClientKeysJWK(clientKeysJWK);
      /**
       *  3.3. Interaction Modes
       *
       * If the client instance has indicated a capability to interact with the RO in its request (Section 2.5),
       * and the AS has determined that interaction is both supported and necessary, the AS responds to the client instance with
       * any of the following values in the interact field of the response. There is no preference order for interaction modes in
       * the response, and it is up to the client instance to determine which ones to use. All supported interaction methods are
       * included in the same interact object
       *
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interaction-modes
       */

      const interactObject = grantResponse.interact;

      /**
       *  3.3.1. Redirection to an arbitrary URI
       *
       * If the client instance indicates that it can redirect to an arbitrary URI (Section 2.5.1.1) and the AS supports
       * this mode for the client instance's request, the AS responds with the "redirect" field, which is a string containing
       * the URI for the end user to visit.
       *
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-redirection-to-an-arbitrary
       *
       *
       *  13.29. Front-channel URIs
       * ...
       * Ultimately, all protocols that use redirect-based communication through the user's browser are
       * susceptible to having an attacker try to co-opt one or more of those URIs in order to harm the user.
       * It is the responsibility of the AS and the client software to provide appropriate warnings, education,
       * and mitigation to protect end users
       * ...
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-front-channel-uris
       *
       */

      // INTERACT - Type REDIRECT
      // TODO: should it be here verified (or choose) between what the server allows and what the client could prefer
      // among the methods the client listed in the GrantRequest interact.start?
      if (interactObject.redirect) {
        // expires_in (integer): The number of integer seconds after which this set of interaction responses will expire
        //                       and no longer be usable by the client instance.
        // ...
        // If omitted, the interaction response modes returned do not expire but MAY be invalidated by the AS at any time.
        // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-3.3-2.12.1
        if (interactObject.expires_in) {
          setStorageInteractionExpirationTime(interactObject.expires_in);
        }
        // Force the browser redirect
        window.location.href = interactObject.redirect;
      } else {
        const notImplementedErrorText = "Only Interact Redirect flow has been implemented";
        console.error(notImplementedErrorText);
        throw new Error(notImplementedErrorText);
      }
    }
    // specific for the Interaction Flow
    // if there has been stored some information before in Session and the state is APPROVED/FINALIZED, then clean the Storage
    else if (getStorageGrantResponse() && (grantResponse.access_token || grantResponse.subject)) {
      /**
       *  3.2. Access Tokens
       *
       * If the AS has successfully granted one or more access tokens to the client instance,
       * the AS responds with the access_token field. This field contains either a single access token
       * as described in Section 3.2.1 or an array of access tokens as described in Section 3.2.2.
       *
       * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-access-tokens
       */
      // IF THERE IS A ERROR SHOULD THE SESSION STORAGE BE CLEARED?

      /**
       * if the state is FINALIZED => clear the GrantRequest and grantResponse
       * if the state is APPROVED => clear all but keep what is needed for renew the token
       */

      clearStorageTransactionURL();
      clearStorageGrantRequest();
      // GrantResponse is cleared here because there are other flows where the AS can answer directly with the access_token without
      // needing an Interaction flow. For example:  1.6.5. Software-only Authorization, or pre-agreed keys?
      clearStorageGrantResponse();

      // if the flow comes here, the interaction is finished
      clearStorageInteractionExpirationTime();

      // Keep always the clientKeys in the sessionStorage
      // clientKeys has its own lifecycle separated from the GrantRequest lifecycle
    }
    return grantResponse;
  } catch (error) {
    console.error("fetchGrantResponse Error", error);
    throw error;
  }
}
