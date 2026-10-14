/** Convert display dates like "2026.08.01" to ISO dateTime. */
export function toDateTime(date: string) {
  return date.replace(/\./g, "-");
}
