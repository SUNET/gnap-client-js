import { JWK } from "jose";
import { ECJWK, GrantRequest, GrantResponse, ProofMethod, RSAJWK, SymmetricJWK } from "typescript-client";

export const GRANT_REQUEST = "GrantRequest";
export const GRANT_RESPONSE = "GrantResponse";
export const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const FINISH_NONCE = "FinishNonce";
export const CLIENT_KEYS = "ClientKeys";
export const JSON_WEB_KEY = "JSONWebKey";
export const KEY_ID = "KeyID";
export const ALGORITHM = "Algorithm"; // it will be set to JWT key "alg"
export const PRIVATE_KEY = "PrivateKey";
export const PUBLIC_KEY = "PublicKey";
export const PROOF_METHOD = "ProofMethod";
export const TRANSACTION_URL = "TransactionURL";
export const CALLBACK_CONFIG = "CallbackConfig";

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
 */

export type ClientKeysStorage = {
  [PRIVATE_KEY]: JWK;
  [PUBLIC_KEY]: JWK;
  [JSON_WEB_KEY]: ECJWK | RSAJWK | SymmetricJWK;
};

// Interaction SessionStorage?
export type SessionStorage = {
  [CLIENT_KEYS]: ClientKeysStorage;
  [TRANSACTION_URL]: string;
  [GRANT_REQUEST]: GrantRequest;
  [GRANT_RESPONSE]: GrantResponse;
  [INTERACTION_EXPIRATION_TIME]: string; // number?
};

// ClientKeys
export function setStorageClientKeys(clientKeysStorage: ClientKeysStorage) {
  console.log("ClientKeys saved in SessionStorage");
  sessionStorage.setItem(CLIENT_KEYS, JSON.stringify(clientKeysStorage));
}
export function getStorageClientKeys() {
  const clientKeysString = sessionStorage.getItem(CLIENT_KEYS);
  if (!clientKeysString) {
    console.log("ClientKeys not found");
    throw new Error("no clientKeysStorage found");
  }
  console.log("ClientKeys found");
  const clientKeysStorage: ClientKeysStorage = JSON.parse(clientKeysString);
  return clientKeysStorage;
}
export function clearStorageClientKeys() {
  sessionStorage.removeItem(CLIENT_KEYS);
}

// TRANSACTION_URL
export function setTransactionURL(transactionURL: string) {
  sessionStorage.setItem(TRANSACTION_URL, transactionURL);
}
export function getTransactionURL() {
  const transactionURL = sessionStorage.getItem(TRANSACTION_URL);
  if (!transactionURL) {
    throw new Error("no callbackConfig found");
  }
  return transactionURL;
}
export function clearTransactionURL() {
  sessionStorage.removeItem(TRANSACTION_URL);
}

// Grant Request
export function setStorageGrantRequest(grantRequest: GrantRequest) {
  sessionStorage.setItem(GRANT_REQUEST, JSON.stringify(grantRequest));
}
export function getStorageGrantRequest() {
  const grantRequestString = sessionStorage.getItem(GRANT_REQUEST);
  if (!grantRequestString) {
    throw new Error("no grantRequest found");
  }
  const grantRequest: GrantRequest = JSON.parse(grantRequestString);
  return grantRequest;
}
export function clearStorageGrantRequest() {
  sessionStorage.removeItem(GRANT_REQUEST);
}

// Grant Response
export function setStorageGrantResponse(grantResponse: GrantResponse) {
  sessionStorage.setItem(GRANT_RESPONSE, JSON.stringify(grantResponse));
}
export function getStorageGrantResponse() {
  const grantResponseString = sessionStorage.getItem(GRANT_RESPONSE);
  if (!grantResponseString) {
    throw new Error("no grantResponse found");
  }
  const grantResponse: GrantResponse = JSON.parse(grantResponseString);
  return grantResponse;
}
export function clearStorageGrantResponse() {
  sessionStorage.removeItem(GRANT_RESPONSE);
}

// Interaction Expiration Time
export function setStorageInteractionExpirationTime(expires_in: number) {
  // expires_in is in seconds
  const now = new Date();
  const expiresInMilliseconds = expires_in * 1000;
  const interactionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
  sessionStorage.setItem(INTERACTION_EXPIRATION_TIME, interactionExpirationTime.toString());
}
export function getStorageInteractionExpirationTime() {
  return sessionStorage.getItem(INTERACTION_EXPIRATION_TIME);
}
export function clearStorageInteractionExpirationTime() {
  return sessionStorage.removeItem(INTERACTION_EXPIRATION_TIME);
}
