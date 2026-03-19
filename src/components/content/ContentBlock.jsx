import D from "../math/D";
import Box from "../math/Box";
import DataTable from "./DataTable";
import { parseInlineContent } from "./parseInline";

// Widget registry — imported dynamically
import BayesUpdateWidget from "../widgets/BayesUpdateWidget";
import InteractionWidget from "../widgets/InteractionWidget";
import SparseUpdateWidget from "../widgets/SparseUpdateWidget";

const WIDGETS = {
  BayesUpdateWidget,
  InteractionWidget,
  SparseUpdateWidget,
};

export default function ContentBlock({ block }) {
  switch (block.type) {
    case "p":
      return <p>{parseInlineContent(block.text)}</p>;

    case "h3":
      return <h3>{parseInlineContent(block.text)}</h3>;

    case "math":
      return <D label={block.label}>{block.tex}</D>;

    case "box":
      return <Box title={block.title}>{block.tex}</Box>;

    case "callout":
      return (
        <div className="callout" style={block.style}>
          <strong>{block.title} </strong>
          {parseInlineContent(block.text)}
        </div>
      );

    case "table":
      return <DataTable headers={block.headers} rows={block.rows} />;

    case "widget":
      const Widget = WIDGETS[block.name];
      if (!Widget) return <div>Widget "{block.name}" not found</div>;
      return <Widget />;

    case "rule":
      return <hr className="rule" />;

    default:
      return null;
  }
}
