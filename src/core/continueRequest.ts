import { CompactJWSHeaderParameters, CompactSign, importJWK } from "jose";
import { getSHA256Hash } from "../cryptoUtils";
import { GrantResponse, ContinueRequest } from "../typescript-client";
import { GRANT_RESPONSE, PRIVATE_KEY, RANDOM_GENERATED_KID, SessionStorage } from "../redirect/sessionStorage";
import { attachedJWSRequest } from "./securingRequest";
import { accessRequest } from "./accessRequest";

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

    // prepare alg and privateKey
    const alg = "ES256"; // TODO: Hardcoded configuration for now
    const privateJwk = sessionStorageObject[PRIVATE_KEY];
    const privateKey = await importJWK(privateJwk, alg);

    // prepare jwsHeader
    const random_generated_kid = sessionStorageObject[RANDOM_GENERATED_KID];
    const accessTokenHash = await getSHA256Hash(grantResponse?.continue?.access_token?.value ?? "");

    const continueUrl = grantResponse?.continue?.uri ?? "";

    const jwsHeader: CompactJWSHeaderParameters = {
      typ: "gnap-binding+jws",
      alg: alg,
      kid: random_generated_kid,
      htm: "POST",
      uri: continueUrl,
      created: Date.now(),
      // if there is GrantResponse.continue.access_token.value ?
      // When the request is bound to an access token, the JOSE header MUST also include the following "ath": https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#section-7.3.3-6
      ath: accessTokenHash,
    };

    const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(continueRequest)))
      .setProtectedHeader(jwsHeader)
      .sign(privateKey);

    const request = {
      method: "POST",
      headers: {
        Authorization: `GNAP ${grantResponse?.continue?.access_token.value}`, // ** SPECIFIC FOR continueRequest **
        "Content-Type": "application/jose+json",
      },
      body: jws,
    };

    //// const jwsRequest = await attachedJWSRequest(continueRequest, alg, privateKey, random_generated_kid, continueUrl);

    // const response: Response = await fetch(grantResponse?.continue?.uri ?? "", {
    //   ...request,
    // });

    const response: Response = await fetch(continueUrl, request);

    // const response: Response = await accessRequest(continueUrl, jwsRequest);

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
