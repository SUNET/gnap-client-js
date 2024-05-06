import { GRANT_RESPONSE, NONCE, TRANSACTION_URL, clearSessionStorage, getSessionStorage } from "./sessionStorage";
import { continueRequest } from "../core/continueRequest";
import { GrantResponse } from "../typescript-client";
import { getSHA256Hash } from "../cryptoUtils";

/**
 *
 * Calculating the interaction hash
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-calculating-the-interaction
 *
 * @param nonce
 * @param finish
 * @param interactRef
 * @param transactionUrl
 * @param hashURL
 * @returns
 */
export async function isHashValid(
  nonce: string,
  finish: string,
  interactRef: string,
  transactionUrl: string,
  hashURL: string
): Promise<boolean> {
  try {
    const hashBaseString = `${nonce}\n${finish}\n${interactRef}\n${transactionUrl}`;
    const hashCalculated = await getSHA256Hash(hashBaseString);
    if (hashCalculated === hashURL) {
      return true;
    }
  } catch (error) {
    console.error("testHash error", error);
  }
  return false;
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

    const isValid = await isHashValid(sessionStorageObject[NONCE], finish, interactRef, transactionUrl, hashURL);
    if (!isValid) {
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
