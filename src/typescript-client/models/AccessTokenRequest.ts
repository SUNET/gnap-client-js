/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";

/**
 *  2.1. Requesting Access to Resources
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#request-token
 */
export type AccessTokenRequest = {
  access: Array<string | Access>;
  label?: string;
  flags?: Array<AccessTokenFlags>;
};
