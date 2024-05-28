import { ECJWK, KeyType } from "../typescript-client";
import { generateNonce } from "../cryptoUtils";
import { GenerateKeyPairOptions, JWK, exportJWK, generateKeyPair } from "jose";
import { ClientKeysJWK } from "./sessionStorage";

/**
 *  13.5. Protection of Client Instance Key Material
 *
 * Client instances are identified by their unique keys, and anyone with access to a client instance's key material
 * will be able to impersonate that client instance to all parties. This is true for both calls to the AS as well
 * as calls to an RS using an access token bound to the client instance's unique key. As a consequence, it is of
 * utmost importance for a client instance to protect its private key material.
 * ...
 * Finally, if multiple instances of client software each have the same key, then from GNAP's perspective, these
 * are functionally the same client instance as GNAP has no reasonable way to differentiate between them. This
 * situation could happen if multiple instances within a cluster can securely share secret information among themselves.
 * Even though there are multiple copies of the software, the shared key makes these copies all present as a single instance.
 * It is considered bad practice to share keys between copies of software unless they are very tightly integrated with each
 * other and can be closely managed. It is particularly bad practice to allow an end user to copy keys between client instances
 * and to willingly use the same key in multiple instances.
 *
 *  https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-protection-of-client-instan
 *
 *
 *  13.21. Key Distribution
 *
 * GNAP does not define ways for the client instances keys to be provided to the client instances, particularly
 * in light of how those keys are made known to the AS. These keys could be generated dynamically on the client
 * software or pre-registered at the AS in a static developer portal. The keys for client instances could also be
 * distributed as part of the deployment process of instances of the client software. For example, an application
 * installation framework could generate a keypair for each copy of client software, then both install it into the
 * client software upon installation and registering that instance with the AS.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-key-distribution
 *
 */

/**
 * This is a wrap function to configure JOSE generateKeyPair() for ES256 and returns keys in JWK format
 *
 * @returns publicJWK, privateJWK
 */
export async function createClientKeysJWKPair(alg: string = "ES256"): Promise<ClientKeysJWK> {
  if (alg !== "ES256") {
    throw new Error("Invalid algorithm");
  }
  //const alg = "ES256";
  const gpo: GenerateKeyPairOptions = {
    crv: "25519",
    extractable: true,
  };
  const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

  const privateJWK = await exportJWK(privateKey);
  const publicJWK = await exportJWK(publicKey);

  return { publicJWK, privateJWK };
}

/**
 * RFC 7517 - JSON Web Key (JWK)
 *
 * 4.  JSON Web Key (JWK) Format
 * 
   A JWK is a JSON object that represents a cryptographic key.  The
   members of the object represent properties of the key, including its
   value.

 * https://datatracker.ietf.org/doc/html/rfc7517#section-4
 * 
 * 
 * 4.4.  "alg" (Algorithm) Parameter

   The "alg" (algorithm) parameter identifies the algorithm intended for
   use with the key.  The values used should either be registered in the
   IANA "JSON Web Signature and Encryption Algorithms" registry
   established by [JWA] or be a value that contains a Collision-
   Resistant Name.  The "alg" value is a case-sensitive ASCII string.
   Use of this member is OPTIONAL.

   https://datatracker.ietf.org/doc/html/rfc7517#section-4.4


4.5.  "kid" (Key ID) Parameter

   The "kid" (key ID) parameter is used to match a specific key.  This
   is used, for instance, to choose among a set of keys within a JWK Set
   during key rollover.  The structure of the "kid" value is
   unspecified.  When "kid" values are used within a JWK Set, different
   keys within the JWK Set SHOULD use distinct "kid" values.  (One
   example in which different keys might use the same "kid" value is if
   they have different "kty" (key type) values but are considered to be
   equivalent alternatives by the application using them.)  The "kid"
   value is a case-sensitive string.  Use of this member is OPTIONAL.
   When used with JWS or JWE, the "kid" value is used to match a JWS or
   JWE "kid" Header Parameter value.

   https://datatracker.ietf.org/doc/html/rfc7517#section-4.5

*/

/**
 * 7.1. Key Formats
 *
 *  jwk (object): The public key and its properties represented as a JSON Web Key [RFC7517].
 *                A JWK MUST contain the alg (Algorithm) and kid (Key ID) parameters. The alg parameter MUST NOT be "none".
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.1-5.2.1
 *
 *
 * @param clientKeysJWK
 * @returns
 */
export function normalizeClientKeysJWK(clientKeysJWK: ClientKeysJWK): ClientKeysJWK {
  const { publicJWK, privateJWK } = clientKeysJWK;
  /**
   * RFC 7518 - JSON Web Algorithms (JWA)
   *
   * 6.  Cryptographic Algorithms for Keys
   * https://datatracker.ietf.org/doc/html/rfc7518#section-6
   */
  if (publicJWK.kty !== KeyType.EC || privateJWK.kty !== KeyType.EC) {
    throw new Error("Not supported key type");
  }

  // alg is required by JWS/JWSD signature
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.3-5.4.1
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-5.4.1
  if (!publicJWK.alg || !privateJWK.alg) {
    let alg;
    /**
     * 3.1.  "alg" (Algorithm) Header Parameter Values for JWS
     * https://www.rfc-editor.org/rfc/rfc7518#section-3.1
     */
    switch (publicJWK.crv) {
      case "P-256":
        alg = "ES256";
        break;
      case "P-384":
        alg = "ES384";
        break;
      case "P-521":
        alg = "ES512";
        break;
      default:
        throw new Error("Not supported curve");
    }

    privateJWK.alg = alg;
    publicJWK.alg = alg;
  }

  // kid is required by JWS/JWSD signature
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.3-5.2.1
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.3.4-5.2.1
  if (!publicJWK.kid || !privateJWK.kid) {
    const kid = generateNonce(32);

    privateJWK.kid = kid;
    publicJWK.kid = kid;
  }

  return { publicJWK, privateJWK };
}
