import { GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { generateNonce } from "../cryptoUtils";
import { INTERACTION_RESPONSE, NONCE, RANDOM_GENERATED_KID, initSessionStorage } from "./initSessionStorage";
import { accessRequest } from "../core/accessRequest";
import { continueRequest, isHashValid } from "../core/continueRequest";
import { GrantResponse } from "../typescript-client";

export const REDIRECT_PATH = "/callback";

export async function interactionStart(transaction_url: string, redirect_url: string) {
  if (transaction_url && redirect_url) {
    try {
      // configure request, generate key pair, generate nonce
      const alg = "ES256";
      const gpo: GenerateKeyPairOptions = {
        crv: "25519",
        extractable: true,
      };
      const { publicKey, privateKey } = await generateKeyPair(alg, gpo);
      const privateJwk = await exportJWK(privateKey);
      const publicJwk = await exportJWK(publicKey);

      const nonce = generateNonce(24);
      const random_generated_kid = generateNonce(32);

      const response = await accessRequest(
        alg,
        publicJwk,
        privateKey,
        nonce,
        random_generated_kid,
        transaction_url,
        redirect_url
      );

      if (response && Object.keys(response).length > 0) {
        // Save in sessionStorage and redirect
        initSessionStorage(response, nonce, random_generated_kid, publicJwk, privateJwk);
        return response.interact.redirect; // return redirect url
      }
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  }
}

export async function interactionCallback(auth_server_url: string): Promise<GrantResponse | undefined> {
  // Get "InteractionResponse" from sessionStorage
  const value = sessionStorage.getItem(INTERACTION_RESPONSE) ?? "";
  const interactions = JSON.parse(value) ? JSON.parse(value) : {};
  // Get "finish", "nonce" and "random_generated_kid" from sessionStorage
  const finish = interactions.interact.finish;
  const nonce = sessionStorage.getItem(NONCE) ?? "";
  const random_generated_kid = sessionStorage.getItem(RANDOM_GENERATED_KID) ?? "";

  // Get "hash" and "interact_ref" from URL query parameters
  const params = new URLSearchParams(window.location.search);
  const hashURL = params.get("hash") ?? "";
  const interactRef = params.get("interact_ref") ?? "";
  const transaction_url = `${auth_server_url}/transaction`;

  if (interactions && interactRef) {
    try {
      const hashResult = await isHashValid(nonce, finish, interactRef, transaction_url, hashURL);
      if (!hashResult) {
        throw new Error("Invalid hash");
      }
      const response = await continueRequest(interactions, interactRef, random_generated_kid);
      sessionStorage.clear(); // TODO: it should remove only the keys related to GNAP
      return response;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  }
}
