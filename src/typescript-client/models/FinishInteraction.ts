/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinishInteractionMethod } from './FinishInteractionMethod';
import type { HashMethod } from './HashMethod';
export type FinishInteraction = {
    method: FinishInteractionMethod;
    uri: string;
    nonce: string;
    hash_method?: HashMethod;
};

