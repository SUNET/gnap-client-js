/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectAssertion } from "./SubjectAssertion";
import type { SubjectIdentifier } from "./SubjectIdentifier";

export type User = {
  sub_ids?: Array<SubjectIdentifier>;
  assertions?: Array<SubjectAssertion>;
};
