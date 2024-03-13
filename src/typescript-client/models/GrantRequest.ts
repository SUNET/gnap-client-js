/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessTokenRequest } from "./AccessTokenRequest";
import type { Client } from "./Client";
import type { InteractionRequest } from "./InteractionRequest";
import type { SubjectRequest } from "./SubjectRequest";
import type { User } from "./User";

export type GrantRequest = {
  access_token: AccessTokenRequest | Array<AccessTokenRequest>;
  subject?: SubjectRequest;
  client: string | Client;
  user?: string | User;
  interact?: InteractionRequest;
};
