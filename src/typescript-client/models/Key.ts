/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ECJWK } from "./ECJWK";
import type { Proof } from "./Proof";
import type { RSAJWK } from "./RSAJWK";
import type { SymmetricJWK } from "./SymmetricJWK";

export type Key = {
  proof: Proof;
  jwk?: ECJWK | RSAJWK | SymmetricJWK;
  cert?: string;
  "cert#S256"?: string;
};
