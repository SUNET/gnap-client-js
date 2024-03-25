/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCodeURI } from './UserCodeURI';
export type InteractionResponse = {
    redirect?: (string | null);
    app?: (string | null);
    user_code?: (string | null);
    user_code_uri?: (UserCodeURI | null);
    finish?: (string | null);
    expires_in?: (number | null);
};

