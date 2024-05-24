/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KeyOptions } from "./KeyOptions";
import type { KeyType } from "./KeyType";
import type { KeyUse } from "./KeyUse";
export type ECJWK = {
  kty: KeyType;
  use?: KeyUse;
  key_opts?: Array<KeyOptions>;
  alg: string;
  kid: string;
  x5u?: string;
  x5c?: string;
  x5t?: string;
  "x5t#S256"?: string;
  crv?: string;
  x?: string;
  y?: string;
  d?: string;
  n?: string;
  e?: string;
};
