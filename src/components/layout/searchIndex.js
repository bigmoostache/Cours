import chapitre4 from "../../content/chapitre_4.yaml";
import chapitre5 from "../../content/chapitre_5.yaml";
import chapitre6 from "../../content/chapitre_6.yaml";

const CHAPTERS = [
  { slug: "chapitre-4", data: chapitre4 },
  { slug: "chapitre-5", data: chapitre5 },
  { slug: "chapitre-6", data: chapitre6 },
];

/**
 * Extracts searchable text from a content block.
 */
function blockText(block) {
  switch (block.type) {
    case "p":
    case "h3":
      return block.text || "";
    case "math":
    case "box":
      return [block.label || "", block.tex || ""].join(" ");
    case "callout":
      return [block.title || "", block.text || ""].join(" ");
    case "table":
      return [
        ...(block.headers || []),
        ...(block.rows || []).flat().map(c =>
          typeof c === "object" && c !== null ? c.text || "" : String(c)
        ),
      ].join(" ");
    default:
      return "";
  }
}

/**
 * Strips $ and * markdown from text for cleaner display.
 */
function stripMarkdown(text) {
  return text.replace(/\$/g, "").replace(/\*/g, "").replace(/\\\\/g, "\\");
}

/**
 * Builds a flat search index: array of { chapterSlug, chapterLabel,
 * sectionIndex, sectionNumber, sectionTitle, text, snippet }
 */
let _index = null;

export function getSearchIndex() {
  if (_index) return _index;
  _index = [];

  for (const { slug, data } of CHAPTERS) {
    // Index chapter header
    const headerText = [data.label, data.title, data.subtitle].filter(Boolean).join(" ");
    _index.push({
      chapterSlug: slug,
      chapterLabel: data.label,
      sectionIndex: -1,
      sectionNumber: "",
      sectionTitle: data.title.replace(/\n/g, " "),
      text: stripMarkdown(headerText).toLowerCase(),
      snippet: stripMarkdown(data.subtitle || data.title).slice(0, 120),
    });

    // Index each section
    (data.sections || []).forEach((section, si) => {
      const parts = [section.number, section.title];
      (section.content || []).forEach(block => {
        parts.push(blockText(block));
      });
      const fullText = parts.join(" ");
      // Build a snippet from the first paragraph
      const firstP = (section.content || []).find(b => b.type === "p");
      const snippet = firstP
        ? stripMarkdown(firstP.text).slice(0, 140)
        : stripMarkdown(section.title);

      _index.push({
        chapterSlug: slug,
        chapterLabel: data.label,
        sectionIndex: si,
        sectionNumber: section.number,
        sectionTitle: section.title,
        text: stripMarkdown(fullText).toLowerCase(),
        snippet,
      });
    });
  }

  return _index;
}

/**
 * Search the index. Returns top matches with highlighted context.
 */
export function search(query, maxResults = 12) {
  if (!query || query.trim().length < 2) return [];
  const index = getSearchIndex();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  if (terms.length === 0) return [];

  const scored = [];
  for (const entry of index) {
    let score = 0;
    let allMatch = true;
    for (const term of terms) {
      const idx = entry.text.indexOf(term);
      if (idx === -1) {
        allMatch = false;
        break;
      }
      // Bonus for match in title
      const inTitle = entry.sectionTitle.toLowerCase().includes(term);
      score += inTitle ? 10 : 1;
      // Bonus for earlier match
      score += Math.max(0, 5 - idx / 200);
    }
    if (allMatch && score > 0) {
      scored.push({ ...entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults);
}
