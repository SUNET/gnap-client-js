function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}

export function generateNonce(len: number) {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  const result = Array.from(arr, dec2hex).join("");
  return result;
}

export const getSHA256Hash = async (input: string) => {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  const urlSafeBase64 = base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return urlSafeBase64;
};
