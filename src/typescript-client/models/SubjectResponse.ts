/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectAssertion } from './SubjectAssertion';
import type { SubjectIdentifier } from './SubjectIdentifier';
export type SubjectResponse = {
    sub_ids?: (Array<SubjectIdentifier> | null);
    assertions?: (Array<SubjectAssertion> | null);
    /**
     * ISO8610 date string
     */
    updated_at?: (string | null);
};

