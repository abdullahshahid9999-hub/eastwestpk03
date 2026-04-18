/**
 * Generates a unique booking reference: EW-YYYYMMDD-XXXXXX
 * e.g. EW-20241215-A3F9K2
 */
export function generateReferenceNumber(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let randomPart = "";
  const array = new Uint32Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < 6; i++) {
    randomPart += chars[array[i] % chars.length];
  }

  return `EW-${datePart}-${randomPart}`;
}