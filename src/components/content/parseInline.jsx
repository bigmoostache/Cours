import M from "../math/M";

/**
 * Parses lightweight markdown in text:
 * - *text* → <em>text</em>
 * - $tex$ → <M>tex</M>
 */
export function parseInlineContent(text) {
  if (!text) return null;
  // Split on $...$ and *...*
  const parts = [];
  let remaining = text;
  let key = 0;

  const regex = /(\$[^$]+\$|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[1];
    if (token.startsWith("$") && token.endsWith("$")) {
      parts.push(<M key={key++}>{token.slice(1, -1)}</M>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}
