import { getStorageClientPrivateJWK } from "../core/sessionStorage";
import { fetchGrantResponse } from "../core/fetchGrantResponse";
import { Access, GrantRequest, GrantResponse, ProofMethod } from "../typescript-client";
import { createClientKeysPairES256, createClientPublicJWK } from "../core/clientJWK";
import { JWK } from "jose";
import { createInteractRedirectURIGrantRequest } from "./createGrantRequest";

/**
 *  1.6.2. Redirect-based Interaction
 *
 * In this example flow, the client instance is a web application that wants access to resources on behalf of
 * the current user, who acts as both the end user and the resource owner (RO). Since the client instance is
 * capable of directing the user to an arbitrary URI and receiving responses from the user's browser, interaction
 * here is handled through front-channel redirects using the user's browser. The redirection URI used for interaction
 * is a service hosted by the AS in this example. The client instance uses a persistent session with the user to ensure
 * the same user that is starting the interaction is the user that returns from the interaction.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-redirect-based-interaction
 *
 *  C.1. Redirect-Based User Interaction
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-redirect-based-user-interac
 *
 * Implementation wrapper for Redirect-based Interaction
 * To be used only in web browsers
 */

/**
 *  2. Requesting Access
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-requesting-access
 */

export async function redirectURIStart(
  // redirect-based interaction configuration
  redirectUrl: string,
  // object of GrantRequest
  accessArray: Array<string | Access>,
  // from here configuration related to generic GNAP protocol
  transactionUrl: string,
  proofMethod: ProofMethod, // configuration exposed to user?
  clientPrivateJWK?: JWK // allow the user pass the keys, especially in the case when the keys are already agreed with the server
): Promise<void> {
  // validation required parameters
  if (!transactionUrl || !redirectUrl) {
    throw new Error("Missing required parameters: transactionUrl, redirectUrl");
  }

  // if external application does not manage its client keys, then create/save/reuse the keys in storage automatically
  if (!clientPrivateJWK) {
    try {
      // check if clientKeys exist already in storage (re-use)
      clientPrivateJWK = getStorageClientPrivateJWK();
    } catch {
      // if it is thrown an Error if there are no clientKeys in storage, then create and save keys in storage automatically
      const [publicJWK, privateJWK] = await createClientKeysPairES256();
      // fetchGrantResponse() will take care of saving the Private key and the JWK for the GrantResponse that contains the public key
      clientPrivateJWK = privateJWK;
    }
  }
  // PrivateJWK seems always a extension of the PublicJWK. So it could necessary to save are reuse only clientPrivateJWK
  // PublicJWK + alg + kid is saved in GrantRequest
  const clientPublicJWK = createClientPublicJWK(clientPrivateJWK);
  if (!clientPublicJWK) {
    throw new Error("JWK is not defined");
  }

  const grantRequest: GrantRequest = createInteractRedirectURIGrantRequest(
    redirectUrl,
    accessArray,
    proofMethod,
    clientPublicJWK
  );

  const grantResponse: GrantResponse = await fetchGrantResponse(transactionUrl, grantRequest, clientPrivateJWK);

  // Nothing to return because it is expected to forward the browser to the redirect URI (in fetchGrantResponse())
}
