/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ECJWK } from "./ECJWK";
import type { Proof } from "./Proof";
import type { RSAJWK } from "./RSAJWK";
import type { SymmetricJWK } from "./SymmetricJWK";

/**
 * 7.1. Key Formats
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#key-format
 *
 *  jwk (object): The public key and its properties represented as a JSON Web Key [RFC7517].
 *      A JWK MUST contain the alg (Algorithm) and kid (Key ID) parameters. The alg parameter MUST NOT be "none".
 *      The x5c (X.509 Certificate Chain) parameter MAY be used to provide the X.509 representation of the provided public key. OPTIONAL.
 */
export type ClientKey = {
  proof: Proof;
  jwk?: ECJWK | RSAJWK | SymmetricJWK; // https://www.rfc-editor.org/rfc/rfc7517
  cert?: string;
  "cert#S256"?: string;
};
