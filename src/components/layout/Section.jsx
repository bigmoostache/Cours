import { useRef, useState, useEffect } from "react";

export default function Section({ number, title, id, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={`section ${visible ? "visible" : ""}`}>
      <div className="section-number">{number}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
