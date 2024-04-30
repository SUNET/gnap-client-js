function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}

export function generateNonce(len: number) {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  const result = Array.from(arr, dec2hex).join("");
  return result;
}

/**
 * The party then hashes the bytes of the ASCII encoding of this string with the appropriate
 * algorithm based on the "hash_method" parameter under the "finish" key of the interaction finish request
 * (Section 2.5.2). The resulting byte array from the hash function is then encoded using URL-Safe Base64
 * with no padding [RFC4648]. The resulting string is the hash value.
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-20/#section-4.2.3-6
 *
 * @param input
 * @returns
 */
export const getSHA256Hash = async (input: string) => {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  const urlSafeBase64 = base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return urlSafeBase64;
};
