import { setStorageGrantResponse, setStorageInteractionExpirationTime } from "../interact/sessionStorage";
import { GrantResponse } from "typescript-client";

/**
 * Send a GrantRequest, manage Response errors and route to the right flow based on the type of GrantResponse
 * It will fill the SessionStorage when the AS requires an Interaction flow
 *
 * Manage here the lower level:
 *  - get the http response and send back to the other function in the GNAP library only the GrantResponse object
 *  - errors (network errors) and the Grant flow errors
 *
 * @param transactionUrl
 * @param request
 * @returns
 */
export async function fetchGrantResponse(transactionUrl: string, requestInit: RequestInit): Promise<GrantResponse> {
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
    const finalRequestInit: RequestInit = {
      ...requestInit,
      method: "POST",
    };

    const response = await fetch(transactionUrl, finalRequestInit);

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
    if (grantResponse.interact) {
      setStorageGrantResponse(grantResponse);
      const interactObject = grantResponse.interact;
      // expires_in (integer): The number of integer seconds after which this set of interaction responses will expire
      // and no longer be usable by the client instance.
      // ...
      // If omitted, the interaction response modes returned do not expire but MAY be invalidated by the AS at any time.
      // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-3.3-2.12.1
      if (interactObject.expires_in) {
        setStorageInteractionExpirationTime(interactObject.expires_in);
      }

      /**
       *  3.3.1. Redirection to an arbitrary URI
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
      if (interactObject.redirect) {
        window.location.href = interactObject.redirect;
      } else {
        const notImplementedErrorText = "Only Interact Redirect flow has been implemented";
        console.error(notImplementedErrorText);
        throw new Error(notImplementedErrorText);
      }
    }

    // fallback case with access token, when APPROVED?
    /**
     *  3. Grant Response
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-grant-response
     */
    if (grantResponse.access_token) {
      // IF THERE IS A ERROR SHOULD THE SESSION STORAGE BE CLEARED?
    }
    return grantResponse;
  } catch (error) {
    console.error("fetchGrantResponse Error", error);
    throw error;
  }
}
