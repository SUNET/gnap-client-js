import { CompactSign, importJWK } from "jose";
import { getSHA256Hash } from "./CryptoUtils";
import { GrantResponse, ContinueRequest } from "./typescript-client";

interface InteractionsTypes {
  interact: {
    access_token: {
      value: string;
    };
  };
  continue: {
    access_token: {
      value: string;
    };
    uri: string;
  };
}

export async function isHashValid(
  nonce: string,
  finish: string,
  interactRef: string,
  transaction_url: string,
  hashURL: string
) {
  console.log("LIBRARY: isHashValid");
  try {
    const hashBaseString = `${nonce}\n${finish}\n${interactRef}\n${transaction_url}`;
    const hashCalculated = await getSHA256Hash(hashBaseString);
    if (hashCalculated === hashURL) {
      return true;
    } else return false;
  } catch (error) {
    console.error("testHash error", error);
  }
}

export async function continueRequest(
  interactions: InteractionsTypes,
  interactRef: string,
  random_generated_kid: string
): Promise<GrantResponse | undefined> {
  try {
    if (interactions) {
      const access_token_calculated = await getSHA256Hash(interactions.continue.access_token.value);
      const continue_request: ContinueRequest = {
        interact_ref: interactRef,
      };
      const alg = "ES256"; // TODO: Hardcoded configuration for now
      const privateJwk = JSON.parse(sessionStorage.getItem("privateKey") ?? "");
      const privateKey = await importJWK(privateJwk, alg);

      const jwsHeader = {
        typ: "gnap-binding+jws",
        alg: alg,
        kid: random_generated_kid,
        htm: "POST",
        uri: interactions.continue.uri,
        created: Date.now(),
        ath: access_token_calculated,
      };

      const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(continue_request)))
        .setProtectedHeader(jwsHeader)
        .sign(privateKey);

      const request = {
        method: "POST",
        headers: {
          Authorization: `GNAP ${interactions.continue.access_token.value}`,
          "Content-Type": "application/jose+json",
        },
        body: jws,
      };
      const response: Response = await fetch(interactions.continue.uri, {
        ...request,
      });
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    throw new Error("error");
  }
}
