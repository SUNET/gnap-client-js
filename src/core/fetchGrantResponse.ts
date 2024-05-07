import { GRANT_RESPONSE, INTERACTION_EXPIRATION_TIME } from "../redirect/sessionStorage";
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
     *  4. Determining Authorization and Consent
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-determining-authorization-a
     */

    // Check for which kind of response has been received from the AS.
    // What if there could be a response from AS that the client is not prepared to handle?

    // ROUTING the flow: There there should be controls to check which kind of response is returned.
    // If there is fields that signify "Interact", then go for it
    if (grantResponse.interact?.redirect) {
      // calculate the expiration time for the interaction
      const now = new Date();
      const expiresIn = grantResponse.interact?.expires_in ?? 0; // The number of seconds in which the access will expire
      const expiresInMilliseconds = expiresIn * 1000;
      const InteractionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
      sessionStorage.setItem(INTERACTION_EXPIRATION_TIME, InteractionExpirationTime.toString());
      // Save GrantResponse in sessionStorage
      sessionStorage.setItem(GRANT_RESPONSE, JSON.stringify(grantResponse));

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
    return grantResponse;
  } catch (error) {
    console.error("fetchGrantResponse Error", error);
    throw error;
  }
}
