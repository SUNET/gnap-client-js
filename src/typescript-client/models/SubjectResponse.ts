/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectAssertion } from "./SubjectAssertion";
import type { SubjectIdentifier } from "./SubjectIdentifier";

/**
 *  3.4. Returning Subject Information
 *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-returning-subject-informati
 */
export type SubjectResponse = {
  sub_ids?: Array<SubjectIdentifier>;
  assertions?: Array<SubjectAssertion>;
  updated_at?: string; // Timestamp as an [RFC3339] date string
};
