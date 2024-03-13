/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";

export type AccessTokenRequest = {
  access?: Array<string | Access>;
  label?: string;
  flags?: Array<AccessTokenFlags>;
};
