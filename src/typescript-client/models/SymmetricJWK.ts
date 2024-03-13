/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { KeyOptions } from "./KeyOptions";
import type { KeyType } from "./KeyType";
import type { KeyUse } from "./KeyUse";

export type SymmetricJWK = {
  kty: KeyType;
  use?: KeyUse;
  key_opts?: Array<KeyOptions>;
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string;
  x5t?: string;
  "x5t#S256"?: string;
  k?: string;
};
