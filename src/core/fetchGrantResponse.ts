import { setStorageGrantResponse, setStorageInteractionExpirationTime } from "../redirect/sessionStorage";
import { GrantResponse } from "typescript-client";

/**
 *
 * Send a GrantRequest, manage Response errors and route to the right flow based on the type of GrantResponse
 * It will fill the SessionStorage when needed
 *
 * @param transactionUrl
 * @param request
 * @returns
 */
export async function fetchGrantResponse(transactionUrl: string, requestInit: RequestInit): Promise<GrantResponse> {
  try {
    // always a POST to a fixed url transactionUrl?
    const finalRequestInit: RequestInit = {
      ...requestInit,
      method: "POST",
    };

    const response = await fetch(transactionUrl, finalRequestInit);

    // Error management / definitions
    // Back-end seems to answer with http 400 and "details" in the body when there is an error
    // Response format seems to differ from GNAP Error Response
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#response-error

    // It is a given that the server will always answer with http 4xx when there is an error? Sometime servers answer 2xx and a error json as a payload
    if (!response.ok) {
      // Sometimes the backend response is pure text (no json), for example "JWS could not be deserialized"
      const errorResponse = await response.json();
      console.error("fetchGrantResponse Error", errorResponse);
      throw new Error(errorResponse.details);
    }

    const grantResponse: GrantResponse = await response.json();

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
    if (grantResponse.interact?.redirect) {
      // expires_in: The number of integer seconds after which this set of interaction responses will expire
      // and no longer be usable by the client instance.
      // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-3.3-2.12.1
      setStorageInteractionExpirationTime(grantResponse.interact?.expires_in ?? 0);

      // Save GrantResponse in sessionStorage
      setStorageGrantResponse(grantResponse);

      // RESULT OF THE CONDITION: force browser to redirect
      /**
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
      window.location.href = grantResponse.interact?.redirect;
    }

    // fallback case with access token, when APPROVED?
    /**
     *  3. Grant Response
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-grant-response
     */
    if (grantResponse.access_token) {
      return grantResponse;
    }
    return grantResponse;
  } catch (error) {
    console.error("fetchGrantResponse Error", error);
    throw error;
  }
}
