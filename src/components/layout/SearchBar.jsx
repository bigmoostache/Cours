import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "./searchIndex";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  // Search on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const r = search(query);
    setResults(r);
    setOpen(r.length > 0);
    setSelected(0);
  }, [query]);

  // Ctrl+K / Cmd+K to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigateTo = useCallback((result) => {
    setOpen(false);
    setQuery("");
    const path = `/${result.chapterSlug}`;
    navigate(path);
    if (result.sectionIndex >= 0) {
      setTimeout(() => {
        const el = document.getElementById(`section-${result.sectionIndex}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigateTo(results[selected]);
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

  return (
    <div className="search-bar-wrap" ref={wrapRef}>
      <div className="search-bar">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Rechercher… (Ctrl+K)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(""); setOpen(false); }}>
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <div
              key={i}
              className={`search-result ${i === selected ? "selected" : ""}`}
              onClick={() => navigateTo(r)}
              onMouseEnter={() => setSelected(i)}
            >
              <div className="search-result-header">
                <span className="search-result-chapter">{r.chapterLabel}</span>
                {r.sectionNumber && (
                  <span className="search-result-section">
                    {r.sectionNumber} — {r.sectionTitle}
                  </span>
                )}
                {!r.sectionNumber && (
                  <span className="search-result-section">{r.sectionTitle}</span>
                )}
              </div>
              <div className="search-result-snippet">
                {highlight(r.snippet, query)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
