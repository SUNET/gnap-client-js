/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";
import type { ClientKey } from "./ClientKey";
import { Manage } from "./Manage";

/**
 *  3.2.1. Single Access Token
 *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#response-token-single
 *
 *  expires_in (integer): The number of seconds in which the access will expire. The client instance MUST NOT use the access token past this time.
 *                        Note that the access token MAY be revoked by the AS or RS at any point prior to its expiration. OPTIONAL.
 */
export type AccessTokenResponse = {
  value: string;
  label?: string;
  manage?: Manage;
  access?: Array<string | Access>;
  expires_in?: number;
  key?: string | ClientKey;
  flags?: Array<AccessTokenFlags>;
};
