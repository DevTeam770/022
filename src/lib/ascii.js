export function isAsciiSafe(text) {
  return /^[\x00-\x7F]*$/.test(text ?? "");
}
