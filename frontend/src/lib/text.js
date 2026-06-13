// Capitalize the first letter of each word, e.g. "nausea, dizziness" → "Nausea".
export function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
