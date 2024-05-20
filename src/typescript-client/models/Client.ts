/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 2.3. Identifying the Client Instance
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-identifying-the-client-inst
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#IANA-client-instance
 */
import type { Display } from "./Display";
import type { ClientKey } from "./ClientKey";
export type Client = {
  key: string | ClientKey;
  class_id?: string;
  display?: Display;
};
