/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ECJWK } from "./ECJWK";
import type { Proof } from "./Proof";
import type { RSAJWK } from "./RSAJWK";
import type { SymmetricJWK } from "./SymmetricJWK";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#key-format
 */

export type Key = {
  proof: Proof;
  jwk?: ECJWK | RSAJWK | SymmetricJWK;
  cert?: string;
  "cert#S256"?: string;
};
