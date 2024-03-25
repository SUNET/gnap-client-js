/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KeyOptions } from './KeyOptions';
import type { KeyType } from './KeyType';
import type { KeyUse } from './KeyUse';
export type RSAJWK = {
    kty: KeyType;
    use?: (KeyUse | null);
    key_opts?: (Array<KeyOptions> | null);
    alg?: (string | null);
    kid?: (string | null);
    x5u?: (string | null);
    x5c?: (string | null);
    x5t?: (string | null);
    'x5t#S256'?: (string | null);
    'd'?: (string | null);
    'n'?: (string | null);
    'e'?: (string | null);
    'p'?: (string | null);
    'q'?: (string | null);
    dp?: (string | null);
    dq?: (string | null);
    qi?: (string | null);
    oth?: (string | null);
    'r'?: (string | null);
    't'?: (string | null);
};

