/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectAssertionFormat } from "./SubjectAssertionFormat";
import type { SubjectIdentifierFormat } from "./SubjectIdentifierFormat";

export type SubjectRequest = {
  sub_id_formats?: Array<SubjectIdentifierFormat>;
  assertion_formats?: Array<SubjectAssertionFormat>;
};
