/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 *  8. Resource Access Rights
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#resource-access-rights
 */
export type Access = {
  type: string;
  actions?: Array<string>;
  locations?: Array<string>;
  datatypes?: Array<string>;
  identifier?: string;
  privileges?: Array<string>;
  scope?: string;
};
