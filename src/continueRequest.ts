import { CompactSign, importJWK } from "jose";
import { getSHA256Hash } from "./CryptoUtils";
import { ContinueAccessToken, ContinueRequest, SubjectAssertion } from "./typescript-client";

export interface PostContinueRequestResponse {
  access_token: ContinueAccessToken;
  subject: { assertions: Array<SubjectAssertion> };
}

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

export async function continueRequest(
  interactions: InteractionsTypes,
  interactRef: string,
  random_generated_kid: string
): Promise<PostContinueRequestResponse | undefined> {
  try {
    if (interactions) {
      const access_token_calculated = await getSHA256Hash(interactions.continue.access_token.value);
      const continue_request: ContinueRequest = {
        interact_ref: interactRef,
      };
      const alg = "ES256";
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
      const response = await fetch(interactions.continue.uri, {
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
