/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ECJWK } from './ECJWK';
import type { RSAJWK } from './RSAJWK';
import type { SymmetricJWK } from './SymmetricJWK';
export type JWKS = {
    keys: Array<(ECJWK | RSAJWK | SymmetricJWK)>;
};

