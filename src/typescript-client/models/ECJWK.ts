/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KeyOptions } from './KeyOptions';
import type { KeyType } from './KeyType';
import type { KeyUse } from './KeyUse';
export type ECJWK = {
    kty: KeyType;
    use?: (KeyUse | null);
    key_opts?: (Array<KeyOptions> | null);
    alg?: (string | null);
    kid?: (string | null);
    x5u?: (string | null);
    x5c?: (string | null);
    x5t?: (string | null);
    'x5t#S256'?: (string | null);
    crv?: (string | null);
    'x'?: (string | null);
    'y'?: (string | null);
    'd'?: (string | null);
    'n'?: (string | null);
    'e'?: (string | null);
};

