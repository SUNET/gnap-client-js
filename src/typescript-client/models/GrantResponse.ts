/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessTokenResponse } from './AccessTokenResponse';
import type { Continue } from './Continue';
import type { InteractionResponse } from './InteractionResponse';
import type { SubjectResponse } from './SubjectResponse';
export type GrantResponse = {
    continue?: (Continue | null);
    access_token?: (AccessTokenResponse | null);
    interact?: (InteractionResponse | null);
    subject?: (SubjectResponse | null);
    instance_id?: (string | null);
    user_handle?: (string | null);
};

