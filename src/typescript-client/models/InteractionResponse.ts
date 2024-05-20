/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCodeURI } from "./UserCodeURI";

/**
 *  3.3. Interaction Modes
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#response-interact
 */
export type InteractionResponse = {
  redirect?: string;
  app?: string;
  user_code?: string;
  user_code_uri?: UserCodeURI;
  finish?: string;
  expires_in?: number;
};
