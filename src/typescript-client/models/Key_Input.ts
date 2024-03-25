/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ECJWK } from './ECJWK';
import type { Proof } from './Proof';
import type { RSAJWK } from './RSAJWK';
import type { SymmetricJWK } from './SymmetricJWK';
export type Key_Input = {
    proof: Proof;
    jwk?: (ECJWK | RSAJWK | SymmetricJWK | null);
    cert?: (string | null);
    'cert#S256'?: (string | null);
};

