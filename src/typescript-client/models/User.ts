/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubjectAssertion } from "./SubjectAssertion";
import type { SubjectIdentifier } from "./SubjectIdentifier";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-identifying-the-user
 */

export type User = {
  sub_ids?: Array<SubjectIdentifier>;
  assertions?: Array<SubjectAssertion>;
};
