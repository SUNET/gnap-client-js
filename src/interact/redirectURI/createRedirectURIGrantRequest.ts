import { generateNonce } from "../../core/cryptoUtils";
import {
  Access,
  AccessTokenFlags,
  AccessTokenRequest,
  Client,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  InteractionRequest,
  ProofMethod,
  RSAJWK,
  StartInteractionMethod,
  SubjectAssertionFormat,
  SubjectRequest,
  SymmetricJWK,
} from "../../typescript-client";

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

export function createRedirectURIGrantRequest(
  redirectUrl: string,
  accessArray: Array<string | Access>,
  proofMethod: ProofMethod,
  publicJWK: ECJWK | RSAJWK | SymmetricJWK
): GrantRequest {
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
      jwk: publicJWK,
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
    //   2.5.2.1. Receive an HTTP Callback Through the Browser
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

  const grantRequest: GrantRequest = {
    access_token: atr,
    client: client,
    subject: subject,
    interact: interact,
  };

  return grantRequest;
}
