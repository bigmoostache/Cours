import Section from "../layout/Section";
import ChapterFooter from "../layout/ChapterFooter";
import ContentBlock from "./ContentBlock";
import { parseInlineContent } from "./parseInline";

export default function ChapterRenderer({ data }) {
  if (!data) return null;

  return (
    <div className="page">
      <div className="chapter-header">
        <div className="chapter-label">{data.label}</div>
        <h1
          className="chapter-title"
          dangerouslySetInnerHTML={{ __html: data.title.replace(/\n/g, "<br />") }}
        />
        <p className="chapter-subtitle">
          {parseInlineContent(data.subtitle)}
        </p>
      </div>

      {data.sections.map((section, i) => (
        <div key={i}>
          {i > 0 && <hr className="rule" />}
          <Section
            number={section.number}
            title={section.title}
            id={`section-${i}`}
          >
            {section.content.map((block, j) => (
              <ContentBlock key={j} block={block} />
            ))}
          </Section>
        </div>
      ))}

      <ChapterFooter label={data.label} right={data.footer_right} />
    </div>
  );
}
