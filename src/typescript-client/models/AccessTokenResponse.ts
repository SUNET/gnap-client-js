/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";
import type { Key } from "./Key";

export type AccessTokenResponse = {
  value: string;
  label?: string;
  manage?: string;
  access?: Array<string | Access>;
  /**
   * seconds until expiry
   */
  expires_in?: number;
  key?: string | Key;
  flags?: Array<AccessTokenFlags>;
};
