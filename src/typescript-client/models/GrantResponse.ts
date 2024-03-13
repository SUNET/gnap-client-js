/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessTokenResponse } from "./AccessTokenResponse";
import type { Continue } from "./Continue";
import type { InteractionResponse } from "./InteractionResponse";
import type { SubjectResponse } from "./SubjectResponse";

export type GrantResponse = {
  continue?: Continue;
  access_token?: AccessTokenResponse;
  interact?: InteractionResponse;
  subject?: SubjectResponse;
  instance_id?: string;
  user_handle?: string;
};
