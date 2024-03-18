/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";

export type AccessTokenRequest = {
  access: Array<string | Access>;
  label?: string;
  // flags:
  // (array of strings)? https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-requesting-a-single-access-
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#IANA-token-flags-contents
  // Flag values MUST NOT be included more than once. https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-requesting-a-single-access-
  flags?: Array<AccessTokenFlags>;
};
