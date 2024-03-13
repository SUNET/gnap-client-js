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
} from "./typescript-client";

export async function requestAccess(
  alg: string,
  publicJwk: JWK,
  privateKey: KeyLike,
  nonce: string,
  random_generated_kid: string,
  transaction_url: string,
  redirect_url: string
) {
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
    typ: "gnap-binding+jws",
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

  const response = await fetch(transaction_url, jwsRequest);

  const responseJson = await response.json();
  return responseJson;
}
