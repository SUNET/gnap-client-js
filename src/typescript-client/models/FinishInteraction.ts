/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinishInteractionMethod } from "./FinishInteractionMethod";
import type { HashMethod } from "./HashMethod";

/**
 *  2.5.2. Interaction Finish Methods
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-interaction-finish-methods
 */
export type FinishInteraction = {
  method: FinishInteractionMethod;
  uri: string;
  nonce: string;
  hash_method?: HashMethod;
};
