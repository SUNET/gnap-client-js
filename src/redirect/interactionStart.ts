import { GenerateKeyPairOptions, JWK, exportJWK, generateKeyPair, importJWK } from "jose";
import { generateNonce } from "../cryptoUtils";
import {
  ALGORITHM,
  GRANT_RESPONSE,
  FINISH_NONCE,
  PRIVATE_KEY,
  PUBLIC_KEY,
  KEY_ID,
  setSessionStorage,
  KEYS,
  PROOF_METHOD,
  TRANSACTION_URL,
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
  KeyType,
  ProofMethod,
  StartInteractionMethod,
  SubjectAssertionFormat,
  SubjectRequest,
} from "../typescript-client";
import { JWSRequestInit } from "../core/securedRequestInit";
import { HTTPMethods } from "../utils";

/**
 *  1.6.2. Redirect-based Interaction
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-redirect-based-interaction
 *
 *  C.1. Redirect-Based User Interaction
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-redirect-based-user-interac
 *
 * Implementation wrapper for Redirect-based Interaction
 * To be used only in web browsers
 */

export async function interactionStart(
  transactionUrl: string,
  proofMethod: ProofMethod, // configuration exposed to user
  redirectUrl: string,
  accessArray: Array<string | Access>
) {
  // validation required parameters
  if (!transactionUrl || !redirectUrl) {
    throw new Error("Missing required parameters: transactionUrl, redirectUrl");
  }
  try {
    // Prepare Grant Request
    // TODO: many hardcoded configurations for now

    // AccessToken
    // Pre-configuration. Always valid?
    const atr: AccessTokenRequest = {
      access: accessArray, // the only configuration exposed to the user, for now
      // If this flag is included, the access token being requested is a bearer token. If this flag is omitted,
      // the access token is bound to the key used by the client instance in this request (or that key's most
      // recent rotation) and the access token MUST be presented using the same key and proofing method. Methods
      // for presenting bound and bearer access tokens are described in Section 7.2. See Section 13.9 for additional
      // considerations on the use of bearer tokens.
      // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-2.1.1-4.2.1
      flags: [AccessTokenFlags.BEARER],
    };

    // Client
    /**
     *  13.5. Protection of Client Instance Key Material
     *
     * Client instances are identified by their unique keys, and anyone with access to a client instance's key material
     * will be able to impersonate that client instance to all parties. This is true for both calls to the AS as well
     * as calls to an RS using an access token bound to the client instance's unique key. As a consequence, it is of
     * utmost importance for a client instance to protect its private key material.
     * ...
     * Finally, if multiple instances of client software each have the same key, then from GNAP's perspective, these
     * are functionally the same client instance as GNAP has no reasonable way to differentiate between them. This
     * situation could happen if multiple instances within a cluster can securely share secret information among themselves.
     * Even though there are multiple copies of the software, the shared key makes these copies all present as a single instance.
     * It is considered bad practice to share keys between copies of software unless they are very tightly integrated with each
     * other and can be closely managed. It is particularly bad practice to allow an end user to copy keys between client instances
     * and to willingly use the same key in multiple instances.
     *
     *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-protection-of-client-instan
     *
     *
     *  13.21. Key Distribution
     *
     * GNAP does not define ways for the client instances keys to be provided to the client instances, particularly
     * in light of how those keys are made known to the AS. These keys could be generated dynamically on the client
     * software or pre-registered at the AS in a static developer portal. The keys for client instances could also be
     * distributed as part of the deployment process of instances of the client software. For example, an application
     * installation framework could generate a keypair for each copy of client software, then both install it into the
     * client software upon installation and registering that instance with the AS.
     *
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-key-distribution
     *
     */
    // TODO: Check if a key already exists in SessionStorage
    // generate key pair
    // Pre-configuration/hardcoded to use alg="ES256". Always valid?
    const alg = "ES256";
    const gpo: GenerateKeyPairOptions = {
      crv: "25519",
      extractable: true,
    };
    const { publicKey, privateKey } = await generateKeyPair(alg, gpo);
    const privateJwk = await exportJWK(privateKey);
    const publicJwk = await exportJWK(publicKey);

    const random_generated_kid = generateNonce(32);

    // A JWK MUST contain the alg (Algorithm) and kid (Key ID) parameters. The alg parameter MUST NOT be "none".
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-key-formats
    const ellipticCurveJwk: ECJWK = {
      alg: alg,
      kid: random_generated_kid,
      kty: publicJwk.kty as KeyType,
      crv: publicJwk.crv,
      x: publicJwk.x,
      y: publicJwk.y,
    };

    // 7.3. Proving Possession of a Key with a Request

    const client: Client = {
      key: {
        proof: { method: proofMethod },
        jwk: ellipticCurveJwk,
      },
    };

    //  7.1.1. Key References
    // Keys in GNAP can also be passed by reference such that the party receiving the reference will
    // be able to determine the appropriate keying material for use in that part of the protocol.
    // Key references are a single opaque string.
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-key-references
    // const client: Client = { key: "eduid_managed_accounts_1" };

    // Subject
    // Pre-configuration. Always valid?
    const subject: SubjectRequest = {
      assertion_formats: [SubjectAssertionFormat.SAML2],
    };

    // Interact
    // This is the configuration that in practice implements the interactionStart() function

    // Generate Finish Nonce
    const finishNonce = generateNonce(32);

    //  2.5.2.2. Receive an HTTP Direct Callback
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-receive-an-http-callback-th
    const interact: InteractionRequest = {
      start: [StartInteractionMethod.REDIRECT],
      finish: {
        method: FinishInteractionMethod.REDIRECT,
        uri: redirectUrl,
        nonce: finishNonce, // to be verified with "hash" query parameter from redirect
        //  hash_method (string):
        // An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3,
        // as defined in the IANA Named Information Hash Algorithm Registry [HASH-ALG]. If absent,
        // the default value is sha-256. OPTIONAL.
        // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-2.5.2-2.8.1
        // https://www.iana.org/assignments/named-information/named-information.xhtml#hash-alg
        // hash_method: HashMethod.SHA_256,
      },
    };

    // final: Grant Request
    const gr: GrantRequest = {
      access_token: atr,
      client: client,
      subject: subject,
      interact: interact,
    };

    // Secured request with an Attached JWS Request
    // it should be triggered when grantRequest has client: {key: {proof: "jws"}}
    /**
     * From:
     * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-requesting-access
     *
     * The request MUST be sent as a JSON object in the content of the HTTP POST request with
     * the Content-Type application/json. A key proofing mechanism MAY define an alternative content type,
     * as long as the content is formed from the JSON object. For example, the attached JWS key proofing
     * mechanism (see Section 7.3.4) places the JSON object into the payload of a JWS wrapper,
     * which is in turn sent as the message content.
     */
    const requestInit: RequestInit = await JWSRequestInit(
      proofMethod,
      gr,
      alg,
      privateKey,
      random_generated_kid,
      HTTPMethods.POST,
      transactionUrl
    );

    setSessionStorage({
      [FINISH_NONCE]: finishNonce,
      [KEYS]: {
        [KEY_ID]: random_generated_kid,
        [ALGORITHM]: alg, // is it necessary if "alg" is mandatory in the JWT?
        [PRIVATE_KEY]: privateJwk,
        [PUBLIC_KEY]: publicJwk,
      },
      [PROOF_METHOD]: proofMethod,
      [TRANSACTION_URL]: transactionUrl,
    });

    // by filling the GrantRequest with "interact" it is expected the AS to follow the Redirect-based Interaction flow
    const grantResponse: GrantResponse = await fetchGrantResponse(transactionUrl, requestInit);
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
}
