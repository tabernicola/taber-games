export interface ClueTextSegment {
  text: string;
  highlight: boolean;
}

/**
 * Escapes regular expression metacharacters in a literal string.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits clue text into plain and highlighted segments for matching parts of a character name
 * without producing raw HTML, preventing XSS when rendered by React.
 */
export function splitHighlightedClueText(text: string, characterName?: string): ClueTextSegment[] {
  if (!characterName) return [{ text, highlight: false }];

  const parts = characterName
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .map(escapeRegExp);

  if (parts.length === 0) return [{ text, highlight: false }];

  const regex = new RegExp(`(${parts.join("|")})`, "gi");
  const tokens = text.split(regex);
  const matchRegex = new RegExp(`^(?:${parts.join("|")})$`, "i");

  return tokens
    .filter((token) => token.length > 0)
    .map((token) => ({
      text: token,
      highlight: matchRegex.test(token),
    }));
}