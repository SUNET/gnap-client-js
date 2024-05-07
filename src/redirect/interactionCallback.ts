import {
  GRANT_RESPONSE,
  FINISH_NONCE,
  TRANSACTION_URL,
  clearSessionStorage,
  getSessionStorage,
} from "./sessionStorage";
import { continueRequest } from "../core/continueRequest";
import { GrantResponse } from "../typescript-client";
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
 * To be used only in a web browser flow
 * It has to read from browser URL parameters
 *
 * @returns
 */
export async function interactionCallback(): Promise<GrantResponse | undefined> {
  try {
    //TODO: if sessionStorageObject is empty, throw error
    // Expected to find SessionStorage because it is a Redirect-based Interaction flow
    const sessionStorageObject = getSessionStorage();
    // Get "finish" from sessionStorage
    const finish = sessionStorageObject[GRANT_RESPONSE].interact?.finish ?? "";
    const transactionUrl = sessionStorageObject[TRANSACTION_URL] ?? "";

    // Get "hash" and "interact_ref" from URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const hashURL = searchParams.get("hash") ?? "";
    const interactRef = searchParams.get("interact_ref") ?? "";

    if (!sessionStorageObject[GRANT_RESPONSE] || !interactRef) {
      throw new Error("Error reading GrandResponse or missing interactRef");
    }

    // The client instance calculates a hash (Section 4.2.3) based on this information and continues only if the hash validates.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-1.6.2-3.7.1
    const interactionHash = await getInteractionHash(
      sessionStorageObject[FINISH_NONCE],
      finish,
      interactRef,
      transactionUrl
    );
    if (interactionHash !== hashURL) {
      throw new Error("Invalid hash");
    }

    // Return here AccessTokenResponse and also the whole GrantResponse because it might contain extra information as "subject"
    const grantResponse: GrantResponse = await continueRequest(sessionStorageObject, interactRef);
    console.log("CONTINUE REQUEST grantResponse: ", grantResponse);

    clearSessionStorage();
    return grantResponse;
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
}
