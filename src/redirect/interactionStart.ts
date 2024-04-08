import { GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { generateNonce } from "../cryptoUtils";
import {
  ALGORITHM,
  GRANT_RESPONSE,
  NONCE,
  PRIVATE_KEY,
  PUBLIC_KEY,
  RANDOM_GENERATED_KID,
  setSessionStorage,
} from "./sessionStorage";
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
import { attachedJWSRequestInit } from "../core/securedRequest";
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

    const client: Client = {
      key: {
        proof: { method: ProofMethod.JWS },
        jwk: ellipticCurveJwk,
      },
    };

    // Subject
    // Pre-configuration. Always valid?
    const subject: SubjectRequest = {
      assertion_formats: [SubjectAssertionFormat.SAML2],
    };

    // Interact
    // This is the configuration that in practice implements the interactionStart() function
    // Generate Nonce
    const nonce = generateNonce(32);

    const interact: InteractionRequest = {
      start: [StartInteractionMethod.REDIRECT],
      finish: {
        method: FinishInteractionMethod.REDIRECT,
        uri: redirectUrl,
        nonce: nonce, // to be verified with "hash" query parameter from redirect
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
    const jwsRequestInit: RequestInit = await attachedJWSRequestInit(
      gr,
      alg,
      privateKey,
      random_generated_kid,
      HTTPMethods.POST,
      transactionUrl
    );

    const response = await transactionRequest(transactionUrl, jwsRequestInit);

    // TODO: possibly here there should be a check for which kind of response has been received from the AS.
    // there could be error or there could be a request from AS that the client is not prepared to handle.

    // ROUTING the flow: There there should be controls to check which kind of response is returned.
    // If there is fields that signify "Interact", then go for it
    if (response?.interact?.redirect) {
      // Save in sessionStorage and redirect
      setSessionStorage({
        [GRANT_RESPONSE]: response,
        [NONCE]: nonce,
        [RANDOM_GENERATED_KID]: random_generated_kid,
        [ALGORITHM]: alg,
        [PRIVATE_KEY]: publicJwk,
        [PUBLIC_KEY]: privateJwk,
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
