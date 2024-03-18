/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProofMethod } from "./ProofMethod";

/**
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#binding-keys
 * 
 * 
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol/#name-proving-possession-of-a-key
 * Proof methods MAY be defined as both an object and a string. For example, the httpsig method can be specified as an object with its parameters explicitly declared, such as:

{
    "proof": {
        "method": "httpsig",
        "alg": "ecdsa-p384-sha384",
        "content-digest-alg": "sha-256"
    }
}

 */
export type Proof = {
  method: ProofMethod;
};
