/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectAssertion } from "./SubjectAssertion";
import type { SubjectIdentifier } from "./SubjectIdentifier";

export type SubjectResponse = {
  sub_ids?: Array<SubjectIdentifier>;
  assertions?: Array<SubjectAssertion>;
  /**
   * ISO8610 date string
   */
  updated_at?: string;
};
