import { GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { generateNonce } from "../cryptoUtils";
import {
  GRANT_RESPONSE,
  NONCE,
  PRIVATE_KEY,
  PUBLIC_KEY,
  RANDOM_GENERATED_KID,
  setSessionStorage,
} from "./sessionStorage";
import { accessRequest } from "../core/accessRequest";
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
import { attachedJWSRequest } from "../core/securedRequest";

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
    // Pre-configuration. Always valid?
    // Pre-configured to use alg="ES256"
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

    // prepare an Attached JWS Request
    // it should be triggered when grantRequest has client: {key: {proof: "jws"}}
    const jwsRequest: RequestInit = await attachedJWSRequest(gr, alg, privateKey, random_generated_kid, transactionUrl);

    const response = await accessRequest(transactionUrl, jwsRequest);

    // ROUTING the flow: There there should be controls to check which kind of response is returned.
    // If there is fields that signify "Interact", then go for it
    if (response && Object.keys(response).length > 0) {
      // Save in sessionStorage and redirect
      setSessionStorage({
        [GRANT_RESPONSE]: response,
        [NONCE]: nonce,
        [RANDOM_GENERATED_KID]: random_generated_kid,
        [PRIVATE_KEY]: publicJwk,
        [PUBLIC_KEY]: privateJwk,
      });
      return response?.interact?.redirect; // TODO: if redirect flow, return redirect url. Or always return the whole GrantResponse?
    }
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
}
