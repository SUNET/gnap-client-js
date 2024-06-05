import { JWK } from "jose";
import { GrantRequest, GrantResponse } from "typescript-client";

export const GRANT_REQUEST = "GrantRequest";
export const GRANT_RESPONSE = "GrantResponse";
export const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const CLIENT_KEYS = "ClientKeysJWK";
export const TRANSACTION_URL = "TransactionURL";

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

// Can ClientKeysStorage be saved as a JWKS - JWK Set?
// A.2.  Example Private Keys
// https://datatracker.ietf.org/doc/html/rfc7517#appendix-A.2

export type StorageKeysJWK = {
  publicJWK: JWK;
  privateJWK: JWK;
};

// StorageClientKeysJWK
export function setStorageClientKeysJWK(storageKeysJWK: StorageKeysJWK) {
  sessionStorage.setItem(CLIENT_KEYS, JSON.stringify(storageKeysJWK));
}
export function getStorageClientKeysJWK() {
  const storageKeysJWKString = sessionStorage.getItem(CLIENT_KEYS);
  if (!storageKeysJWKString) {
    console.error("clientKeysJWK not found");
    throw new Error("no clientKeysJWK found");
  }
  const storageKeysJWK: StorageKeysJWK = JSON.parse(storageKeysJWKString);
  return storageKeysJWK;
}
export function clearStorageClientKeysJWK() {
  sessionStorage.removeItem(CLIENT_KEYS);
}

// Transaction URL

/**
 * The grant endpoint is a URI that uniquely identifies the AS to client
 * instances and serves as the identifier for the AS.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20#section-2-1
 */
export function setStorageTransactionURL(transactionURL: string) {
  sessionStorage.setItem(TRANSACTION_URL, transactionURL);
}
export function getStorageTransactionURL() {
  const transactionURL = sessionStorage.getItem(TRANSACTION_URL);
  if (!transactionURL) {
    throw new Error("no callbackConfig found");
  }
  return transactionURL;
}
export function clearStorageTransactionURL() {
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
