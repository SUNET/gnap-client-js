import { JWK } from "jose";
import { GrantResponse } from "typescript-client";

export const GRANT_RESPONSE = "GrantResponse";
export const NONCE = "Nonce";
export const RANDOM_GENERATED_KID = "random_generated_kid";
export const ALGORITHM = "Algorithm"; // key alg
export const PRIVATE_KEY = "PrivateKey";
export const PUBLIC_KEY = "PublicKey";
export const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";

export type SessionStorage = {
  [GRANT_RESPONSE]: GrantResponse;
  [NONCE]: string;
  [RANDOM_GENERATED_KID]: string;
  [ALGORITHM]: string;
  [PRIVATE_KEY]: JWK;
  [PUBLIC_KEY]: JWK;
  [INTERACTION_EXPIRATION_TIME]?: string; // number?
};

/**
 * Storage of Information During Interaction and Continuation
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-19#name-storage-of-information-duri
 *
 * @param sessionStorageObject
 */
export function setSessionStorage(sessionStorageObject: SessionStorage) {
  clearSessionStorage();
  try {
    const now = new Date();
    const expiresIn = sessionStorageObject[GRANT_RESPONSE].interact?.expires_in ?? 0; // The number of seconds in which the access will expire
    const expiresInMilliseconds = expiresIn * 1000;
    const InteractionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
    sessionStorage.setItem(GRANT_RESPONSE, JSON.stringify(sessionStorageObject[GRANT_RESPONSE]));
    sessionStorage.setItem(NONCE, sessionStorageObject[NONCE]);
    sessionStorage.setItem(RANDOM_GENERATED_KID, sessionStorageObject[RANDOM_GENERATED_KID]);
    sessionStorage.setItem(ALGORITHM, sessionStorageObject[ALGORITHM]);
    sessionStorage.setItem(PUBLIC_KEY, JSON.stringify(sessionStorageObject[PUBLIC_KEY]));
    sessionStorage.setItem(PRIVATE_KEY, JSON.stringify(sessionStorageObject[PRIVATE_KEY]));
    sessionStorage.setItem(INTERACTION_EXPIRATION_TIME, InteractionExpirationTime.toString());
  } catch (error) {
    console.error("error:", error);
    throw new Error("Error while saving interaction response in SessionStorage");
  }
}

// SessionStorage can read only strings
// TODO: validate the data in the session storage
// TODO: manage the case when JSON.parse() respond with "undefined"
export function getSessionStorage() {
  const grantResponse = JSON.parse(sessionStorage.getItem(GRANT_RESPONSE) ?? "");
  const nonce = sessionStorage.getItem(NONCE) ?? "";
  const random_generated_kid = sessionStorage.getItem(RANDOM_GENERATED_KID) ?? "";
  const algorithm = sessionStorage.getItem(ALGORITHM) ?? "";
  const publicKey = JSON.parse(sessionStorage.getItem(PUBLIC_KEY) ?? "");
  const privateKey = JSON.parse(sessionStorage.getItem(PRIVATE_KEY) ?? "");
  const interactionExpirationTime = sessionStorage.getItem(INTERACTION_EXPIRATION_TIME) ?? "";

  const sessionStorageObject = {
    [GRANT_RESPONSE]: grantResponse as GrantResponse,
    [NONCE]: nonce,
    [RANDOM_GENERATED_KID]: random_generated_kid,
    [ALGORITHM]: algorithm,
    [PRIVATE_KEY]: publicKey,
    [PUBLIC_KEY]: privateKey,
    [INTERACTION_EXPIRATION_TIME]: interactionExpirationTime,
  };
  return sessionStorageObject;
}

export function clearSessionStorage() {
  const keysInSessionStorage = [
    GRANT_RESPONSE,
    NONCE,
    RANDOM_GENERATED_KID,
    ALGORITHM,
    PUBLIC_KEY,
    PRIVATE_KEY,
    INTERACTION_EXPIRATION_TIME,
  ];
  keysInSessionStorage.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}
