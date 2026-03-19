import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { search } from "./searchIndex";

const CHAPTERS = [
  { num: 4, slug: "chapitre-4", title: "Le Prior Conjugué dans les Familles Exponentielles" },
  { num: 5, slug: "chapitre-5", title: "Interactions entre Familles Exponentielles" },
  { num: 6, slug: "chapitre-6", title: "Observations Éparses, Non Appariées, Mixtes" },
  { num: 7, slug: "chapitre-7", title: "EM : Stabilité et Convergence" },
];

export default function Sidebar({ open, onClose, chapters, focusSearch, onSearchFocused }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const searchRef = useRef(null);

  const isSearching = query.trim().length >= 2;

  // Auto-expand the active chapter
  useEffect(() => {
    const active = CHAPTERS.find(c => location.pathname.includes(c.slug));
    if (active) setExpanded(active.slug);
  }, [location.pathname]);

  // Focus search when requested by parent (Ctrl+F)
  useEffect(() => {
    if (focusSearch && open && searchRef.current) {
      searchRef.current.focus();
      searchRef.current.select();
      onSearchFocused?.();
    }
  }, [focusSearch, open, onSearchFocused]);

  // Clear search when sidebar closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Search on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const r = search(query);
    setResults(r);
    setSelected(0);
  }, [query]);

  const navigateTo = useCallback((result) => {
    const path = `/${result.chapterSlug}`;
    navigate(path);
    onClose();
    if (result.sectionIndex >= 0) {
      setTimeout(() => {
        const el = document.getElementById(`section-${result.sectionIndex}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [navigate, onClose]);

  const handleSearchKeyDown = (e) => {
    if (!isSearching || results.length === 0) {
      if (e.key === "Escape") { setQuery(""); }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigateTo(results[selected]);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  // Highlight matching terms in snippet
  const highlight = (text, q) => {
    if (!q || q.length < 2) return text;
    const terms = q.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (terms.length === 0) return text;
    const pattern = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const re = new RegExp(`(${pattern})`, "gi");
    const parts = text.split(re);
    return parts.map((part, i) =>
      re.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
  };

  const handleChapterClick = (ch) => {
    if (expanded === ch.slug) {
      setExpanded(null);
    } else {
      setExpanded(ch.slug);
    }
  };

  const handleNavigate = (slug) => {
    navigate(`/${slug}`);
  };

  const handleSectionClick = (slug, sectionId) => {
    navigate(`/${slug}`);
    onClose();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <nav className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Inférence Bayésienne</span>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>

        {/* Search bar */}
        <div className="sidebar-search">
          <svg className="sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            className="sidebar-search-input"
            placeholder="Rechercher… (Ctrl+F)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {query && (
            <button className="sidebar-search-clear" onClick={() => setQuery("")}>×</button>
          )}
        </div>

        {/* Search results — replace chapter list when searching */}
        {isSearching ? (
          <div className="sidebar-search-results">
            {results.length === 0 ? (
              <div className="sidebar-search-empty">Aucun résultat pour « {query} »</div>
            ) : (
              results.map((r, i) => (
                <div
                  key={i}
                  className={`sidebar-search-result ${i === selected ? "selected" : ""}`}
                  onClick={() => navigateTo(r)}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div className="sidebar-search-result-chapter">{r.chapterLabel}</div>
                  <div className="sidebar-search-result-title">
                    {r.sectionNumber ? `${r.sectionNumber} — ` : ""}
                    {r.sectionTitle}
                  </div>
                  <div className="sidebar-search-result-snippet">
                    {highlight(r.snippet, query)}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Normal chapter navigation */
          CHAPTERS.map((ch) => {
            const isActive = location.pathname.includes(ch.slug);
            const isExpanded = expanded === ch.slug;
            const chData = chapters?.[ch.slug];
            const sections = chData?.sections || [];

            return (
              <div className="sidebar-chapter" key={ch.slug}>
                <button
                  className={`sidebar-chapter-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleChapterClick(ch);
                    handleNavigate(ch.slug);
                  }}
                >
                  <span className={`arrow ${isExpanded ? "expanded" : ""}`}>▶</span>
                  <span>Ch. {ch.num} — {ch.title}</span>
                </button>
                <div className={`sidebar-sections ${isExpanded ? "expanded" : ""}`}>
                  {sections.map((sec, i) => (
                    <a
                      key={i}
                      className="sidebar-section-link"
                      onClick={() => handleSectionClick(ch.slug, `section-${i}`)}
                    >
                      {sec.number} {sec.title}
                    </a>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </nav>
    </>
  );
}
