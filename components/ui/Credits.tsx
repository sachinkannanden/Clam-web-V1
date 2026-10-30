"use client";
import { useState } from "react";

/** Photo credits, folded away: the table is only built once someone opens it. */
export default function Credits({ rows }: { rows: [string, string][] }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="credits__more" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="small">Every photo, credited</summary>
      {open && (
        <table className="credits tnum small">
          <thead>
            <tr>
              <th scope="col">Where</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([where, src]) => (
              <tr key={where + src}>
                <td>{where}</td>
                <td>{src}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </details>
  );
}
