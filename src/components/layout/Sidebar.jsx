import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CHAPTERS = [
  { num: 4, slug: "chapitre-4", title: "Le Prior Conjugué dans les Familles Exponentielles" },
  { num: 5, slug: "chapitre-5", title: "Interactions entre Familles Exponentielles" },
  { num: 6, slug: "chapitre-6", title: "Observations Éparses, Non Appariées, Mixtes" },
];

export default function Sidebar({ open, onClose, chapters }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(null);

  // Auto-expand the active chapter
  useEffect(() => {
    const active = CHAPTERS.find(c => location.pathname.includes(c.slug));
    if (active) setExpanded(active.slug);
  }, [location.pathname]);

  const handleChapterClick = (ch) => {
    if (expanded === ch.slug) {
      setExpanded(null);
    } else {
      setExpanded(ch.slug);
    }
  };

  const handleNavigate = (slug) => {
    navigate(`/${slug}`);
    onClose();
  };

  const handleSectionClick = (slug, sectionId) => {
    navigate(`/${slug}`);
    onClose();
    // Scroll after navigation
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

        {CHAPTERS.map((ch) => {
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
        })}
      </nav>
    </>
  );
}
