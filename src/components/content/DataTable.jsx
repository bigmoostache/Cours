import { parseInlineContent } from "./parseInline";
import M from "../math/M";

export default function DataTable({ headers, rows }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{parseInlineContent(h)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => {
              // Cell can be string or object { text, class }
              if (typeof cell === "object" && cell !== null && cell.text !== undefined) {
                return (
                  <td key={ci} className={cell.class || ""}>
                    {parseInlineContent(cell.text)}
                  </td>
                );
              }
              return <td key={ci}>{parseInlineContent(String(cell))}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
