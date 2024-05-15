import { generateNonce } from "../cryptoUtils";
import {
  FINISH_NONCE,
  PRIVATE_KEY,
  PROOF_METHOD,
  TRANSACTION_URL,
  setStorageClientKeys,
  getStorageClientKeys,
  JSON_WEB_KEY,
  setStorageCallbackConfig,
  ClientKeysStorage,
  PUBLIC_KEY,
} from "./sessionStorage";
import { fetchGrantResponse } from "../core/fetchGrantResponse";
import {
  Access,
  AccessTokenFlags,
  AccessTokenRequest,
  Client,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  GrantResponse,
  InteractionRequest,
  ProofMethod,
  StartInteractionMethod,
  SubjectAssertionFormat,
  SubjectRequest,
} from "../typescript-client";
import { createJWSRequestInit } from "../core/securedRequestInit";
import { HTTPMethods } from "../utils";
import { createES256ClientKeys } from "../core/client";

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
  transactionUrl: string,
  proofMethod: ProofMethod, // configuration exposed to user
  redirectUrl: string,
  accessArray: Array<string | Access>,
  clientKeys?: ClientKeysStorage // allow the user pass the keys, especially in the case when the keys are already agreed with the server
): Promise<void> {
  // validation required parameters
  if (!transactionUrl || !redirectUrl) {
    throw new Error("Missing required parameters: transactionUrl, redirectUrl");
  }

  /**
   *  2.1. Requesting Access to Resources
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-requesting-access-to-resour
   */
  const atr: AccessTokenRequest = {
    access: accessArray, // the only configuration exposed to the user, for now
    flags: [AccessTokenFlags.BEARER],
  };

  // Client
  /**
   *  2.3. Identifying the Client Instance
   * When sending new grant request to the AS, the client instance MUST identify itself by including its client
   * information in the client field of the request and by signing the request with its unique key as described in
   * Section 7.3. Note that once a grant has been created and is in the pending or accepted states, the AS can
   * determine which client is associated with the grant by dereferencing the continuation access token sent in
   * the continuation request (Section 5).
   *
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-identifying-the-client-inst
   */
  if (clientKeys) {
    setStorageClientKeys(clientKeys);
  } else {
    try {
      // check if clientKeys exist already in storage (re-use)
      clientKeys = getStorageClientKeys();
    } catch {
      // it is thrown an Error if there are no clientKeys in storage, then create and save keys in storage automatically
      const [publicJwk, privateJwk, ellipticCurveJwk] = await createES256ClientKeys();
      clientKeys = {
        [PRIVATE_KEY]: privateJwk,
        [PUBLIC_KEY]: publicJwk,
        [JSON_WEB_KEY]: ellipticCurveJwk as ECJWK,
      };
      setStorageClientKeys(clientKeys);
    }
  }
  const jwk = clientKeys[JSON_WEB_KEY];

  //  7.1.1. Key References
  // Keys in GNAP can also be passed by reference such that the party receiving the reference will
  // be able to determine the appropriate keying material for use in that part of the protocol.
  // Key references are a single opaque string.
  //
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-key-references
  // const client: Client = { key: "eduid_managed_accounts_1" };

  // 7.3. Proving Possession of a Key with a Request
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-proving-possession-of-a-key
  const client: Client = {
    key: {
      proof: { method: proofMethod },
      jwk: jwk,
    },
  };

  /**
   *  2.2. Requesting Subject Information
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-requesting-subject-informati
   */
  // Pre-configuration. Always valid?
  const subject: SubjectRequest = {
    assertion_formats: [SubjectAssertionFormat.SAML2],
  };

  /**
   *  2.5. Interacting with the User
   *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interacting-with-the-user
   */
  const finishNonce = generateNonce(32);

  const interact: InteractionRequest = {
    //  2.5.1. Start Mode Definitions
    // If the client instance is capable of starting interaction with the end user, the client instance indicates
    // this by sending an array of start modes under the start key
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-start-mode-definitions
    //  2.5.1.1. Redirect to an Arbitrary URI
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-redirect-to-an-arbitrary-ur
    start: [StartInteractionMethod.REDIRECT],
    //  2.5.2.2. Receive an HTTP Direct Callback
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-receive-an-http-callback-th
    finish: {
      method: FinishInteractionMethod.REDIRECT,
      uri: redirectUrl,
      nonce: finishNonce,
      //  hash_method (string):
      // An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3,
      // as defined in the IANA Named Information Hash Algorithm Registry [HASH-ALG]. If absent,
      // the default value is sha-256. OPTIONAL.
      // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-2.5.2-2.8.1
      // https://www.iana.org/assignments/named-information/named-information.xhtml#hash-alg
      // hash_method: HashMethod.SHA_256,
    },
  };

  /**
   *  2. Requesting Access
   *
   * The request MUST be sent as a JSON object in the content of the HTTP POST request with
   * the Content-Type application/json. A key proofing mechanism MAY define an alternative content type,
   * as long as the content is formed from the JSON object. For example, the attached JWS key proofing
   * mechanism (see Section 7.3.4) places the JSON object into the payload of a JWS wrapper,
   * which is in turn sent as the message content.
   *
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-2-7
   */
  const gr: GrantRequest = {
    access_token: atr,
    client: client,
    subject: subject,
    interact: interact,
  };

  const requestInit: RequestInit = await createJWSRequestInit(
    proofMethod,
    gr,
    clientKeys[JSON_WEB_KEY],
    clientKeys[PRIVATE_KEY] ?? "",
    HTTPMethods.POST,
    transactionUrl
  );

  setStorageCallbackConfig({
    [FINISH_NONCE]: finishNonce,
    [PROOF_METHOD]: proofMethod,
    [TRANSACTION_URL]: transactionUrl,
  });

  const grantResponse: GrantResponse = await fetchGrantResponse(transactionUrl, requestInit);
}
