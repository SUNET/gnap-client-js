/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessTokenFlags } from './AccessTokenFlags';
import type { Key_Output } from './Key_Output';
export type AccessTokenResponse = {
    value: string;
    label?: (string | null);
    manage?: (string | null);
    access?: null;
    /**
     * seconds until expiry
     */
    expires_in?: (number | null);
    key?: (string | Key_Output | null);
    flags?: (Array<AccessTokenFlags> | null);
};

