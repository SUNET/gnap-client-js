/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Display } from "./Display";
import type { Key } from "./Key";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#IANA-client-instance
 */

export type Client = {
  key: string | Key;
  class_id?: string;
  display?: Display;
};
