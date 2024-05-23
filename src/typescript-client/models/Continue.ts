/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { AccessTokenFlags } from "./AccessTokenFlags";
import { AccessTokenResponse } from "./AccessTokenResponse";

/**
 *  3.1. Request Continuation
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#response-continue
 *
 *  wait (integer): The amount of time in integer seconds the client instance MUST wait after
 *                  receiving this request continuation response and calling the continuation URI.
 *                  The value SHOULD NOT be less than five seconds, and omission of the value MUST be interpreted as five seconds. RECOMMENDED.
 */
export type Continue = {
  uri: string;
  wait?: number;
  access_token: AccessTokenResponse;
  flags?: Array<AccessTokenFlags>;
};
