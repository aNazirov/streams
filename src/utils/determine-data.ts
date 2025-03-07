import crypto from "crypto";
import Constants from "../constants";

export function determineData(value: string) {
  const hash = crypto.createHash("sha256").update(value).digest();
  let result = "";

  for (let i = 0; i < 8; i++) {
    const byte = hash[i];
    const index = byte % Constants.ALPHABET.length;
    result += Constants.ALPHABET[index];
  }

  return result;
}
