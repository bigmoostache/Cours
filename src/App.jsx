import { useState, useEffect, useRef } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/chapter.css";

import Sidebar from "./components/layout/Sidebar";
import ChapterRenderer from "./components/content/ChapterRenderer";

import chapitre1 from "./content/chapitre_1.yaml";
import chapitre4 from "./content/chapitre_4.yaml";
import chapitre5 from "./content/chapitre_5.yaml";
import chapitre6 from "./content/chapitre_6.yaml";
import chapitre7 from "./content/chapitre_7.yaml";

const CHAPTER_DATA = {
  "chapitre-1": chapitre1,
  "chapitre-4": chapitre4,
  "chapitre-5": chapitre5,
  "chapitre-6": chapitre6,
  "chapitre-7": chapitre7
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);

  // Ctrl+F / Cmd+F → open sidebar + focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setSidebarOpen(true);
        setFocusSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <HashRouter>
      <div className="app-layout">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <span /><span /><span />
        </button>

        <Sidebar
          open={sidebarOpen}
          onClose={() => { setSidebarOpen(false); setFocusSearch(false); }}
          chapters={CHAPTER_DATA}
          focusSearch={focusSearch}
          onSearchFocused={() => setFocusSearch(false)}
        />

        <Routes>
          <Route path="/" element={<Navigate to="/chapitre-1" replace />} />
          <Route path="/chapitre-1" element={<ChapterRenderer data={chapitre1} />} />
          <Route path="/chapitre-4" element={<ChapterRenderer data={chapitre4} />} />
          <Route path="/chapitre-5" element={<ChapterRenderer data={chapitre5} />} />
          <Route path="/chapitre-6" element={<ChapterRenderer data={chapitre6} />} />
          <Route path="/chapitre-7" element={<ChapterRenderer data={chapitre7} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
