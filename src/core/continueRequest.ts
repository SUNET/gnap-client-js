import { importJWK, KeyLike } from "jose";
import { GrantResponse, ContinueRequest } from "../typescript-client";
import { GRANT_RESPONSE, PRIVATE_KEY, RANDOM_GENERATED_KID, SessionStorage } from "../redirect/sessionStorage";
import { attachedJWSRequest } from "./securedRequest";
import { HTTPMethods } from "../utils";

/**
 * 5. Continuing a Grant Request
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-continuing-a-grant-request
 *
 * Comment: similar to accessRequest but:
 * - the continueUrl is not fixed, and comes from GrantResponse.continue.uri
 * - (if request is bound to an access token)jwsHeader has one more filed "ath" access token header calculated hashing with GrantResponse.continue?.access_token.value
 *
 * @param sessionStorageObject
 * @param interactRef
 * @returns
 */
export async function continueRequest(
  sessionStorageObject: SessionStorage,
  interactRef: string
): Promise<GrantResponse | undefined> {
  try {
    const grantResponse = sessionStorageObject[GRANT_RESPONSE];
    if (!grantResponse) {
      throw new Error("No grant response found");
    }

    // Prepare request body continueRequest
    const continueRequest: ContinueRequest = {
      interact_ref: interactRef,
    };

    // prepare alg and retrieve privateKey
    const alg = "ES256"; // TODO: Hardcoded configuration for now
    const privateJwk = sessionStorageObject[PRIVATE_KEY];
    const privateKey = await importJWK(privateJwk, alg);

    // prepare jwsHeader
    const random_generated_kid = sessionStorageObject[RANDOM_GENERATED_KID];
    const continueUrl = grantResponse?.continue?.uri ?? "";
    const access_token = grantResponse?.continue?.access_token?.value ?? "";

    const request = await attachedJWSRequest(
      continueRequest,
      alg,
      privateKey as KeyLike,
      random_generated_kid,
      HTTPMethods.POST,
      continueUrl,
      access_token
    );

    // add Authorization header, as required from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.2-4
    request.headers = { ...request.headers, ...{ Authorization: `GNAP ${access_token}` } };

    const response: Response = await fetch(continueUrl, request);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to fetch SCIM data");
    }
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}
