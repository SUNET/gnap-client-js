import { CompactSign, JWK, KeyLike } from "jose";
import {
  AccessTokenFlags,
  AccessTokenRequest,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  KeyType,
  ProofMethod,
  StartInteractionMethod,
  SubjectAssertionFormat,
} from "../typescript-client";

/**
 *
 * Prepare and send a GrantRequest
 *
 * @param alg
 * @param publicJwk
 * @param privateKey
 * @param nonce
 * @param random_generated_kid
 * @param transaction_url
 * @param redirect_url
 * @returns
 */
export async function accessRequest(
  alg: string,
  publicJwk: JWK,
  privateKey: KeyLike,
  nonce: string,
  random_generated_kid: string,
  transaction_url: string,
  redirect_url: string
) {
  console.log("LIBRARY: accessRequest");

  // TODO: Hardcoded configuration for now
  const atr: AccessTokenRequest = {
    access: [{ type: "scim-api" }, { type: "maccapi" }],
    flags: [AccessTokenFlags.BEARER],
  };

  const EllipticCurveJSONWebKey: ECJWK = {
    kid: random_generated_kid,
    kty: publicJwk.kty as KeyType,
    crv: publicJwk.crv,
    x: publicJwk.x,
    y: publicJwk.y,
  };

  // TODO: Hardcoded configuration for now
  const gr: GrantRequest = {
    access_token: atr,
    client: {
      key: { proof: { method: ProofMethod.JWS }, jwk: EllipticCurveJSONWebKey },
    },
    subject: {
      assertion_formats: [SubjectAssertionFormat.SAML2],
    },
    interact: {
      start: [StartInteractionMethod.REDIRECT],
      finish: {
        method: FinishInteractionMethod.REDIRECT,
        uri: redirect_url,
        nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
      },
    },
  };

  const jwsHeader = {
    typ: "gnap-binding+jws", // "gnap-binding-jws"? from https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#attached-jws
    alg: alg,
    kid: random_generated_kid,
    htm: "POST",
    uri: transaction_url,
    created: Date.now(),
  };

  const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
    .setProtectedHeader(jwsHeader)
    .sign(privateKey);

  const headers = {
    "Content-Type": "application/jose+json",
  };

  const jwsRequest = {
    headers: headers,
    body: jws,
    method: "POST",
  };

  /**
   * From:
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-requesting-access
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#attached-jws
   *
   * The request MUST be sent as a JSON object in the content of the HTTP POST request with
   * the Content-Type application/json. A key proofing mechanism MAY define an alternative content type,
   * as long as the content is formed from the JSON object. For example, the attached JWS key proofing
   * mechanism (see Section 7.3.4) places the JSON object into the payload of a JWS wrapper,
   * which is in turn sent as the message content.
   */

  const response = await fetch(transaction_url, jwsRequest);

  const responseJson = await response.json();
  return responseJson;
}
