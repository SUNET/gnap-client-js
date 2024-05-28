import { ClientKeysJWK, getStorageClientKeysJWK } from "../core/sessionStorage";
import { fetchGrantResponse } from "../core/fetchGrantResponse";
import { Access, ECJWK, GrantRequest, GrantResponse, ProofMethod } from "../typescript-client";
import { createClientKeysJWKPair, normalizeClientKeysJWK } from "../core/clientJWK";
import { createRedirectURIGrantRequest } from "./createRedirectURIGrantRequest";

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
 *
 *  C.1. Redirect-Based User Interaction
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-redirect-based-user-interac
 */

export async function redirectURIStart(
  redirectUrl: string, // redirect-based interaction configuration
  accessArray: Array<string | Access>, // scope to access, that will be passed to GrantRequest
  // from here configuration related to generic GNAP protocol
  transactionUrl: string,
  proofMethod: ProofMethod, // technical configuration exposed to user. Is it necessary? Use a default value?
  clientKeysJWK?: ClientKeysJWK // allow the external application to pass the keys, it could be needed in the case when the keys are already agreed with the server
): Promise<void> {
  if (!transactionUrl || !redirectUrl) {
    throw new Error("Missing required parameters: transactionUrl, redirectUrl");
  }

  // if external application does not pass its client keys, then create/save/reuse the keys in storage automatically
  if (!clientKeysJWK) {
    try {
      // check if clientKeys exist already in storage then re-use them
      clientKeysJWK = getStorageClientKeysJWK();
    } catch {
      // if getStorageClientKeysJWK() throws an Error then there are no clientKeys in storage, so create new keys
      // fetchGrantResponse() will take care of saving the clientKeys in the Storage.
      // clientKeysJWK.publicJWK will be also part of GrantResponse, which will be also saved in GrantRequest
      clientKeysJWK = await createClientKeysJWKPair("ES256");
    }
  }
  // alg and kid are required in the clientKeysJWK. If they are not present, generate them
  // Should normalizeClientKeysJWK() moved to fetchGrantResponse() to be more general?
  clientKeysJWK = normalizeClientKeysJWK(clientKeysJWK);

  const grantRequest: GrantRequest = createRedirectURIGrantRequest(
    redirectUrl,
    accessArray,
    proofMethod,
    clientKeysJWK.publicJWK as ECJWK
  );

  const grantResponse: GrantResponse = await fetchGrantResponse(transactionUrl, grantRequest, clientKeysJWK);

  // Nothing to return because it is expected to forward the browser to the redirect URI (in fetchGrantResponse())
}
