/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FinishInteraction } from "./FinishInteraction";
import type { Hints } from "./Hints";
import type { InteractionStartMode } from "./InteractionStartMode";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-interacting-with-the-user
 */
export type InteractionRequest = {
  start: Array<string | InteractionStartMode>;
  finish?: FinishInteraction;
  hints?: Hints;
};
