import { useRef, useEffect } from "react";
import { useKatex } from "./useKatex";

export default function M({ children }) {
  const ref = useRef(null);
  const ready = useKatex();
  useEffect(() => {
    if (ready && ref.current) {
      try {
        window.katex.render(children, ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {}
    }
  }, [ready, children]);
  return <span ref={ref} />;
}
