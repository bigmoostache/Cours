import { useRef, useEffect } from "react";
import { useKatex } from "./useKatex";

export default function Box({ children, title }) {
  const ref = useRef(null);
  const ready = useKatex();
  useEffect(() => {
    if (ready && ref.current) {
      try {
        window.katex.render(children, ref.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {}
    }
  }, [ready, children]);
  return (
    <div className="boxed">
      {title && <div className="box-title">{title}</div>}
      <div ref={ref} className="math-display" />
    </div>
  );
}
