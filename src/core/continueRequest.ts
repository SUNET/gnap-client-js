import { GrantResponse, ContinueRequest, Continue, ProofMethod } from "../typescript-client";
import { PRIVATE_KEY, JSON_WEB_KEY, getStorageClientKeys } from "../interact/sessionStorage";
import { createJWSRequestInit } from "./securedRequestInit";
import { HTTPMethods } from "../utils";
import { fetchGrantResponse } from "./fetchGrantResponse";

/**
 * 5. Continuing a Grant Request
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-continuing-a-grant-request
 *
 * Comment: similar to fetchGrantResponse but:
 * - the continueUrl is not fixes, it is decided by the AS, and comes from GrantResponse.continue.uri
 * - (if request is bound to an access token) jwsHeader needs to have one more felt "ath" access token header calculated hashing with GrantResponse.continue.access_token.value
 *
 *
 * To enable this ongoing negotiation, the AS provides a continuation API to the client software. The AS returns
 * a continue field in the response (Section 3.1) that contains information the client instance needs to access
 * this API, including a URI to access as well as a special access token to use during the requests, called the
 * continuation access token.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-5-3
 *
 *
 * All requests to the continuation API are protected by a bound continuation access token. The continuation access
 * token is bound to the same key and method the client instance used to make the initial request (or its most recent rotation).
 * As a consequence, when the client instance makes any calls to the continuation URI, the client instance MUST present the
 * continuation access token as described in Section 7.2 and present proof of the client instance's key (or its most recent rotation)
 * by signing the request as described in Section 7.3.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-5-4
 *
 *
 * @param continueObject
 * @param proofMethod
 * @param interactRef
 * @returns
 */
export async function continueRequest(
  continueObject: Continue,
  proofMethod: ProofMethod,
  interactRef: string
): Promise<GrantResponse> {
  // in a continue request it is expected that the data is saved

  if (!continueObject.uri || !continueObject.access_token?.value) {
    throw new Error("continueObject.uri or continueObject.access_token.value is missing");
  }

  const continueUrl = continueObject.uri;

  // A unique access token for continuing the request, called the "continuation access token".
  // ...
  // This access token MUST be bound to the client instance's key used in the request and MUST NOT be a bearer token.
  // As a consequence, the flags array of this access token MUST NOT contain the string bearer and the key field MUST be omitted.
  // This access token MUST NOT have a manage field. The client instance MUST present the continuation access token in all requests
  // to the continuation URI as described in Section 7.2.
  //
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-3.1-2.6.1

  // If the bearer flag and the key field in this response are omitted, the token is bound the key used by the client instance (Section 2.3) in its request for access.
  //
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-3.2.1-10
  const continuationAccessToken = continueObject.access_token.value;

  const continueRequestBody: ContinueRequest = {
    interact_ref: interactRef,
  };

  const grantResponse: GrantResponse = await fetchGrantResponse(
    continueUrl,
    continueRequestBody,
    proofMethod,
    continuationAccessToken
  );

  return grantResponse;
}
