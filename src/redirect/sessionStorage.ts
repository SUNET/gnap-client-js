import { JWK } from "jose";
import { GrantResponse, ProofMethod } from "typescript-client";

export const GRANT_RESPONSE = "GrantResponse";
export const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const FINISH_NONCE = "FinishNonce";
export const KEYS = "Keys";
export const KEY_ID = "KeyID";
export const ALGORITHM = "Algorithm"; // it will be set to JWT key "alg"
export const PRIVATE_KEY = "PrivateKey";
export const PUBLIC_KEY = "PublicKey";
export const PROOF_METHOD = "ProofMethod";
export const TRANSACTION_URL = "TransactionURL";

export type KeysStorage = {
  [KEY_ID]: string;
  [ALGORITHM]: string;
  [PRIVATE_KEY]: JWK;
  [PUBLIC_KEY]: JWK;
};

export type SessionStorage = {
  [GRANT_RESPONSE]?: GrantResponse;
  [INTERACTION_EXPIRATION_TIME]?: string; // number?
  [FINISH_NONCE]: string;
  [KEYS]: KeysStorage;
  [PROOF_METHOD]: ProofMethod;
  [TRANSACTION_URL]: string;
};

/**
 * 13.26. Storage of Information During Interaction and Continuation
 * ...
 * If the security protocol elements are stored on the end user's device, such as in browser storage or in local
 * application data stores, capture and exfiltration of this information could allow an attacker to continue a pending
 * transaction instead of the client instance. Client software can make use of secure storage mechanisms, including
 * hardware-based key and data storage, to prevent such exfiltration.
 * ...
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#name-storage-of-information-duri
 *
 * @param sessionStorageObject
 */
export function setSessionStorage(sessionStorageObject: SessionStorage) {
  clearSessionStorage();
  try {
    // GRANT_RESPONSE and INTERACTION_EXPIRATION_TIME are saved in fetchGrantResponse base on which answer is received
    sessionStorage.setItem(FINISH_NONCE, sessionStorageObject[FINISH_NONCE]);
    sessionStorage.setItem(KEYS, JSON.stringify(sessionStorageObject[KEYS]));
    sessionStorage.setItem(PROOF_METHOD, sessionStorageObject[PROOF_METHOD]);
    sessionStorage.setItem(TRANSACTION_URL, sessionStorageObject[TRANSACTION_URL]);
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
  const interactionExpirationTime = sessionStorage.getItem(INTERACTION_EXPIRATION_TIME) ?? "";
  const finishNonce = sessionStorage.getItem(FINISH_NONCE) ?? "";
  const keysStorage = sessionStorage.getItem(KEYS) ?? "";
  const proofMethod = sessionStorage.getItem(PROOF_METHOD) ?? "";
  const transactionUrl = sessionStorage.getItem(TRANSACTION_URL) ?? "";

  const sessionStorageObject = {
    [GRANT_RESPONSE]: grantResponse as GrantResponse,
    [INTERACTION_EXPIRATION_TIME]: interactionExpirationTime,
    [FINISH_NONCE]: finishNonce,
    [KEYS]: JSON.parse(keysStorage),
    [PROOF_METHOD]: proofMethod as ProofMethod,
    [TRANSACTION_URL]: transactionUrl,
  };
  return sessionStorageObject;
}

export function clearSessionStorage() {
  const keysInSessionStorage = [
    GRANT_RESPONSE,
    INTERACTION_EXPIRATION_TIME,
    FINISH_NONCE,
    KEYS,
    PROOF_METHOD,
    TRANSACTION_URL,
  ];
  keysInSessionStorage.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}
