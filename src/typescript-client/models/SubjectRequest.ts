/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectAssertionFormat } from './SubjectAssertionFormat';
import type { SubjectIdentifierFormat } from './SubjectIdentifierFormat';
export type SubjectRequest = {
    sub_id_formats?: (Array<SubjectIdentifierFormat> | null);
    assertion_formats?: (Array<SubjectAssertionFormat> | null);
    authentication_context?: (Array<string> | null);
};

