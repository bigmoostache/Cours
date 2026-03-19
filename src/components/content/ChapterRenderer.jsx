import { useState, useEffect, useRef, useCallback } from "react";
import Section from "../layout/Section";
import ChapterFooter from "../layout/ChapterFooter";
import ContentBlock from "./ContentBlock";
import { parseInlineContent } from "./parseInline";
import DefinitionsPanel from "../layout/DefinitionsPanel";
import allDefinitions from "../../content/definitions.yaml";

export default function ChapterRenderer({ data }) {
  const [defsVisible, setDefsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  // Scroll spy — track which section is currently visible
  useEffect(() => {
    if (!data?.sections) return;
    const observers = [];
    sectionRefs.current = sectionRefs.current.slice(0, data.sections.length);

    const handleIntersect = (index) => (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(index);
        }
      });
    };

    // Use a small timeout to let DOM render
    const timer = setTimeout(() => {
      data.sections.forEach((_, i) => {
        const el = document.getElementById(`section-${i}`);
        if (el) {
          const obs = new IntersectionObserver(handleIntersect(i), {
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0,
          });
          obs.observe(el);
          observers.push(obs);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observers.forEach(obs => obs.disconnect());
    };
  }, [data]);

  if (!data) return null;

  // Get active definition IDs from current section's `uses` field
  const currentSection = data.sections?.[activeSection];
  const activeDefIds = currentSection?.uses || [];
  const defs = allDefinitions?.definitions || [];

  return (
    <div className={`page ${defsVisible ? "with-defs" : ""}`}>
      <div className="page-content">
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

      <DefinitionsPanel
        definitions={defs}
        activeIds={activeDefIds}
        visible={defsVisible}
        onToggle={() => setDefsVisible(v => !v)}
        currentChapter={data.chapter}
        currentSectionIndex={activeSection}
      />
    </div>
  );
}
