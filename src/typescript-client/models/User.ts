/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectAssertion } from "./SubjectAssertion";
import type { SubjectIdentifier } from "./SubjectIdentifier";

/**
 *  2.4. Identifying the User
 *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#request-token
 */
export type User = {
  sub_ids?: Array<SubjectIdentifier>; // https://www.rfc-editor.org/rfc/rfc9493
  assertions?: Array<SubjectAssertion>;
};
