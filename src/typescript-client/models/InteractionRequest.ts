/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinishInteraction } from './FinishInteraction';
import type { Hints } from './Hints';
import type { StartInteractionMethod } from './StartInteractionMethod';
export type InteractionRequest = {
    start: Array<StartInteractionMethod>;
    finish?: (FinishInteraction | null);
    hints?: (Hints | null);
};

