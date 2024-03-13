/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserCodeURI } from "./UserCodeURI";

export type InteractionResponse = {
  redirect?: string;
  app?: string;
  user_code?: string;
  user_code_uri?: UserCodeURI;
  finish?: string;
  expires_in?: number;
};
