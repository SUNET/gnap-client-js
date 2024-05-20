/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 *  2.2. Requesting Subject Information
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-requesting-subject-informati
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#IANA-subject-request
 */
import type { SubjectAssertionFormat } from "./SubjectAssertionFormat";
import { SubjectIdentifier } from "./SubjectIdentifier";
import type { SubjectIdentifierFormat } from "./SubjectIdentifierFormat";
export type SubjectRequest = {
  sub_id_formats?: Array<SubjectIdentifierFormat>;
  assertion_formats?: Array<SubjectAssertionFormat>;
  sub_ids?: Array<SubjectIdentifier>;
};
