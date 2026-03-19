import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useKatex } from "../math/useKatex";

function DefinitionCard({ def, ready, currentChapter, currentSectionIndex }) {
  const texRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (texRef.current && def.tex) {
      try {
        window.katex.render(def.tex, texRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {}
    }
  }, [ready, def.tex]);

  // Parse inline math in term and description
  const renderInline = (text) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        const span = <InlineMath key={i} tex={part.slice(1, -1)} ready={ready} />;
        return span;
      }
      return part;
    });
  };

  // Determine relationship: defined here, or forward reference
  const origin = def.defined_in;
  const isDefinedHere = origin &&
    origin.chapter === currentChapter &&
    (origin.section - 1) === currentSectionIndex;
  const isForwardRef = !isDefinedHere && origin &&
    origin.chapter === currentChapter &&
    (origin.section - 1) > currentSectionIndex;

  const handleGotoDefinition = () => {
    if (!origin) return;
    const chapterSlug = `chapitre-${origin.chapter}`;
    const sectionId = `section-${origin.section - 1}`;
    // Navigate to the chapter, then scroll to section
    navigate(`/${chapterSlug}`);
    // Small delay to let the page render if navigating to a different chapter
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className={`def-card ${isDefinedHere ? "def-defined-here" : ""} ${isForwardRef ? "def-forward" : ""}`}>
      <div className="def-header">
        <div className="def-term">{renderInline(def.term)}</div>
        {origin && (
          <button
            className={`def-origin ${isDefinedHere ? "def-origin-here" : ""}`}
            onClick={isDefinedHere ? undefined : handleGotoDefinition}
            title={isDefinedHere ? "Définie ici" : `Définie au Ch. ${origin.chapter}, § ${origin.section}`}
            style={isDefinedHere ? { cursor: "default" } : undefined}
          >
            {isDefinedHere && <span className="def-here-icon">✦</span>}
            {isForwardRef && <span className="def-forward-icon" title="Référence en avant — définie plus loin">⚠</span>}
            {isDefinedHere ? "Définie ici" : `Ch.${origin.chapter} §${origin.section}`}
          </button>
        )}
      </div>
      {def.tex && <div ref={texRef} className="def-tex" />}
      {def.rows && (
        <table className="def-cheatsheet">
          <tbody>
            {def.rows.map((row, ri) => (
              <tr key={ri}>
                <td className="def-cs-label">{renderInline(row[0])}</td>
                <td className="def-cs-value">{renderInline(row[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {def.description && <div className="def-desc">{renderInline(def.description)}</div>}
    </div>
  );
}

function InlineMath({ tex, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ready && ref.current) {
      try {
        window.katex.render(tex, ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {}
    }
  }, [ready, tex]);
  return <span ref={ref} />;
}

export default function DefinitionsPanel({ definitions, activeIds, visible, onToggle, currentChapter, currentSectionIndex }) {
  const ready = useKatex();
  const activeDefs = (definitions || []).filter(d => (activeIds || []).includes(d.id));

  // Sort: "defined here" first, then the rest
  const sortedDefs = [...activeDefs].sort((a, b) => {
    const aHere = a.defined_in && a.defined_in.chapter === currentChapter && (a.defined_in.section - 1) === currentSectionIndex;
    const bHere = b.defined_in && b.defined_in.chapter === currentChapter && (b.defined_in.section - 1) === currentSectionIndex;
    if (aHere && !bHere) return -1;
    if (!aHere && bHere) return 1;
    return 0;
  });

  return (
    <>
      {/* Toggle button */}
      <button
        className={`defs-toggle ${visible ? "active" : ""}`}
        onClick={onToggle}
        title={visible ? "Masquer les définitions" : "Afficher les définitions"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        {activeDefs.length > 0 && (
          <span className="defs-count">{activeDefs.length}</span>
        )}
      </button>

      {/* Panel */}
      <div className={`defs-panel ${visible ? "open" : ""}`}>
        <div className="defs-panel-header">
          <span className="defs-panel-title">Définitions</span>
          <span className="defs-panel-subtitle">
            {activeDefs.length} concept{activeDefs.length !== 1 ? "s" : ""} actif{activeDefs.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="defs-panel-content">
          {activeDefs.length === 0 ? (
            <div className="defs-empty">
              Aucune définition pour cette section.
            </div>
          ) : (
            sortedDefs.map(def => (
              <DefinitionCard
                key={def.id}
                def={def}
                ready={ready}
                currentChapter={currentChapter}
                currentSectionIndex={currentSectionIndex}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
