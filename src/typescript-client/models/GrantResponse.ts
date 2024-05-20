/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessTokenResponse } from "./AccessTokenResponse";
import type { Continue } from "./Continue";
import type { InteractionResponse } from "./InteractionResponse";
import type { SubjectResponse } from "./SubjectResponse";

/**
 *  3. Grant Response
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-grant-response
 */
export type GrantResponse = {
  continue?: Continue;
  access_token?: AccessTokenResponse;
  interact?: InteractionResponse;
  subject?: SubjectResponse;
  instance_id?: string;
};
