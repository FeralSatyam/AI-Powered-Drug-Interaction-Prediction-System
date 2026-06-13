// Two-letter uppercase initials from a person's name, e.g. "Anita Verma" → "AV".
export function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
