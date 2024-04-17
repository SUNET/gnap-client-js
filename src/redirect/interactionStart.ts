import { GenerateKeyPairOptions, JWK, exportJWK, generateKeyPair, importJWK } from "jose";
import { generateNonce } from "../cryptoUtils";
import { ALGORITHM, GRANT_RESPONSE, NONCE, PRIVATE_KEY, PUBLIC_KEY, KEY_ID, setSessionStorage } from "./sessionStorage";
import { transactionRequest } from "../core/transactionRequest";
import {
  Access,
  AccessTokenFlags,
  AccessTokenRequest,
  Client,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  InteractionRequest,
  KeyType,
  ProofMethod,
  StartInteractionMethod,
  SubjectAssertionFormat,
  SubjectRequest,
} from "../typescript-client";
import { JWSRequestInit } from "../core/securedRequest";
import { HTTPMethods } from "../utils";

/**
 * Implementation wrapper for Redirect-based Interaction
 * To be used only in web browsers
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-redirect-based-interaction
 */

export async function interactionStart(
  transactionUrl: string,
  redirectUrl: string,
  accessArray: Array<string | Access>
) {
  // validation required parameters
  if (!transactionUrl || !redirectUrl) {
    throw new Error("Missing required parameters: transactionUrl, redirectUrl");
  }
  try {
    // Configure object to be saved in SessionStorage. Is it same as the Client object?

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

    /**
     *  configuration for an Attached JWS
     */
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

    //  7.3. Proving Possession of a Key with a Request
    //  7.3.4. Attached JWS
    const client: Client = {
      key: {
        proof: { method: ProofMethod.JWS },
        jwk: ellipticCurveJwk,
      },
    };

    // /**
    //  *  configuration for an Detached JWS
    //  * - test account in config.
    //  */
    // const publicKeyDetached: ECJWK = {
    //   alg: alg,
    //   kty: KeyType.EC,
    //   kid: "eduid_managed_accounts_1",
    //   crv: "P-256",
    //   x: "dCxVL9thTTc-ZtiL_CrPpMp1Vqo2p_gUVqiVBRwqjq8",
    //   y: "P3dAvr2IYy7DQEf4vA5bPN8gCg41M1oA5993vHr9peE",
    //   //d: "i9hH9BeErxtI40b0_1P4XR6CXra4itKvg8ccLrxXrhQ",
    // };

    // const privateKeyDetached: ECJWK = { ...publicKeyDetached, d: "i9hH9BeErxtI40b0_1P4XR6CXra4itKvg8ccLrxXrhQ" };
    // const key = await importJWK(privateKeyDetached as JWK, alg);

    // // configuration for a Detached JWS
    // const client: Client = {
    //   key: {
    //     proof: { method: ProofMethod.JWSD },
    //     jwk: publicKeyDetached,
    //   },
    // };

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
    // Generate Nonce
    const nonce = generateNonce(32);

    //  2.5.2.2. Receive an HTTP Direct Callback
    // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-receive-an-http-callback-th
    const interact: InteractionRequest = {
      start: [StartInteractionMethod.REDIRECT],
      finish: {
        method: FinishInteractionMethod.REDIRECT,
        uri: redirectUrl,
        nonce: nonce, // to be verified with "hash" query parameter from redirect
        //  hash_method (string):
        // An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3,
        // as defined in the IANA Named Information Hash Algorithm Registry [HASH-ALG]. If absent,
        // the default value is sha-256. OPTIONAL.
        // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-2.5.2-2.8.1
        // https://www.iana.org/assignments/named-information/named-information.xhtml#hash-alg
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
      ProofMethod.JWS,
      gr,
      alg,
      privateKey,
      random_generated_kid,
      HTTPMethods.POST,
      transactionUrl
    );

    const response = await transactionRequest(transactionUrl, requestInit);

    // TODO: possibly here there should be a check for which kind of response has been received from the AS.
    // there could be error or there could be a request from AS that the client is not prepared to handle.

    // ROUTING the flow: There there should be controls to check which kind of response is returned.
    // If there is fields that signify "Interact", then go for it
    if (response?.interact?.redirect) {
      // Save in sessionStorage and redirect
      setSessionStorage({
        [GRANT_RESPONSE]: response,
        [NONCE]: nonce,
        [KEY_ID]: random_generated_kid,
        [ALGORITHM]: alg, // is it necessary if "alg" is mandatory in the JWT?
        [PRIVATE_KEY]: privateJwk,
        [PUBLIC_KEY]: publicJwk,
      });
      return response?.interact?.redirect; // TODO: if redirect flow, return redirect url. Or always return the whole GrantResponse?
    } else {
      throw Error("Error: No redirect url found in response");
    }
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
}
