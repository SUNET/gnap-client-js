/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectAssertionFormat } from "./SubjectAssertionFormat";
import type { SubjectIdentifierFormat } from "./SubjectIdentifierFormat";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#IANA-subject-request
 */
export type SubjectRequest = {
  sub_id_formats?: Array<SubjectIdentifierFormat>;
  assertion_formats?: Array<SubjectAssertionFormat>;
  sub_ids?: Array<string>; // https://www.rfc-editor.org/rfc/rfc9493
};
