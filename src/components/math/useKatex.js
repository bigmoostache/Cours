import { useState, useEffect } from "react";

export function useKatex() {
  const [ready, setReady] = useState(!!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    // KaTeX is loaded via index.html <script defer>
    const check = setInterval(() => {
      if (window.katex) { setReady(true); clearInterval(check); }
    }, 50);
    return () => clearInterval(check);
  }, []);
  return ready;
}
