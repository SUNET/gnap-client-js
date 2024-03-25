/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectAssertion } from './SubjectAssertion';
import type { SubjectIdentifier } from './SubjectIdentifier';
export type User = {
    sub_ids?: (Array<SubjectIdentifier> | null);
    assertions?: (Array<SubjectAssertion> | null);
};

