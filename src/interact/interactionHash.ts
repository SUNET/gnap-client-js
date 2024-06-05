import { getEncodedHash } from "../core/cryptoUtils";

/**
 *  4.2.3. Calculating the interaction hash
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-calculating-the-interaction
 *
 *
 *  13.25. Calculating Interaction Hash
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#name-calculating-interaction-has
 *
 */

export async function getInteractionHash(
  finishNonce: string,
  finish: string,
  interactRef: string,
  transactionUrl: string
): Promise<string> {
  try {
    const hashBaseString = `${finishNonce}\n${finish}\n${interactRef}\n${transactionUrl}`;
    return await getEncodedHash(hashBaseString);
  } catch (error) {
    console.error("getInteractionHash error", error);
    throw new Error("getInteractionHash error");
  }
}
