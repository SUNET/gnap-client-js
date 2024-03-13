/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { KeyOptions } from "./KeyOptions";
import type { KeyType } from "./KeyType";
import type { KeyUse } from "./KeyUse";

export type RSAJWK = {
  kty: KeyType;
  use?: KeyUse;
  key_opts?: Array<KeyOptions>;
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string;
  x5t?: string;
  "x5t#S256"?: string;
  d?: string;
  n?: string;
  e?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
  oth?: string;
  r?: string;
  t?: string;
};
