export const INTERACTION_RESPONSE = "InteractionResponse";
const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const NONCE = "Nonce";
const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";
export const RANDOM_GENERATED_KID = "random_generated_kid";

export function initSessionStorage(
  response: any,
  nonce: string,
  random_generated_kid: string,
  publicJwk: any,
  privateJwk: any
) {
  sessionStorage.clear();
  try {
    const now = new Date();
    const expiresIn = response.interact.expires_in; // The number of seconds in which the access will expire
    const expiresInMilliseconds = expiresIn * 1000;
    const InteractionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
    sessionStorage.setItem(INTERACTION_RESPONSE, JSON.stringify(response));
    sessionStorage.setItem(NONCE, nonce);
    sessionStorage.setItem(RANDOM_GENERATED_KID, random_generated_kid);
    sessionStorage.setItem(INTERACTION_EXPIRATION_TIME, InteractionExpirationTime.toString());
    sessionStorage.setItem(PUBLIC_KEY, JSON.stringify(publicJwk));
    sessionStorage.setItem(PRIVATE_KEY, JSON.stringify(privateJwk));
  } catch (error) {
    console.error("error:", error);
  }
}
