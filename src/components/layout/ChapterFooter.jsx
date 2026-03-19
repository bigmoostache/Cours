export default function ChapterFooter({ label, right }) {
  return (
    <div className="chapter-footer">
      <span className="footer-label">{label}</span>
      <span className="footer-label">{right}</span>
    </div>
  );
}
