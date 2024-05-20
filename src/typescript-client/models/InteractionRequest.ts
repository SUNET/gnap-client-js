/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinishInteraction } from "./FinishInteraction";
import type { Hints } from "./Hints";
import type { StartInteractionMethod } from "./StartInteractionMethod";

/**
 *  2.5. Interacting with the User
 *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interacting-with-the-user
 */
export type InteractionRequest = {
  start: Array<StartInteractionMethod>;
  finish?: FinishInteraction;
  hints?: Hints;
};
