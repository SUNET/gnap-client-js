import { generateNonce } from "../cryptoUtils";
import { GenerateKeyPairOptions, JWK, exportJWK, generateKeyPair } from "jose";

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
 * Generate key pair and jwt
 * Pre-configuration/hardcoded to use alg="ES256". Always valid?
 * @returns publicJwk, privateJwk, ellipticCurveJwk
 */
export async function createES256ClientKeys(): Promise<Array<JWK>> {
  const alg = "ES256";
  const gpo: GenerateKeyPairOptions = {
    crv: "25519",
    extractable: true,
  };
  const { publicKey, privateKey } = await generateKeyPair(alg, gpo);
  const privateJwk = await exportJWK(privateKey);
  const publicJwk = await exportJWK(publicKey);

  const randomKid = generateNonce(32);

  // jwk (object): The public key and its properties represented as a JSON Web Key [RFC7517].
  //               A JWK MUST contain the alg (Algorithm) and kid (Key ID) parameters. The alg parameter MUST NOT be "none".
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-7.1-5.2.1
  const ellipticCurveJwk: JWK = {
    alg: alg,
    kid: randomKid,
    kty: publicJwk.kty,
    crv: publicJwk.crv,
    x: publicJwk.x,
    y: publicJwk.y,
  };

  return [publicJwk, privateJwk, ellipticCurveJwk];
}
