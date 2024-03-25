/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Access } from "./Access";
import type { AccessTokenFlags } from "./AccessTokenFlags";
export type AccessTokenRequest = {
  access?: Array<string | Access>;
  label?: string | null;
  flags?: Array<AccessTokenFlags> | null;
};
