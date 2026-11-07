import { useState, type ReactNode } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/primitives";

export interface TableSpec {
  columns: string[];
  rows: (string | number)[][];
}

export function ChartCard({
  title,
  note,
  children,
  table,
  height = 220,
  className,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  table: TableSpec;
  height?: number;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-2 border-b border-ink-700 px-3 py-2">
        <div>
          <div className="text-[12px] font-semibold text-ink-100">{title}</div>
          {note && <div className="text-[10px] text-ink-400">{note}</div>}
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-ink-400 hover:text-ink-100"
          title={showTable ? "Show chart" : "Show data table"}
          aria-label={showTable ? "Show chart" : "Show data table"}
        >
          {showTable ? <BarChart3 className="size-3.5" /> : <Table2 className="size-3.5" />}
        </button>
      </div>
      <div className="p-2" style={{ height }}>
        {showTable ? (
          <div className="h-full overflow-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} className="border-b border-ink-700 px-1.5 py-1 text-left font-semibold text-ink-300">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-ink-800">
                    {r.map((c, j) => (
                      <td key={j} className="mono px-1.5 py-0.5 text-ink-200">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export const AXIS = { stroke: "#3a3f45", tick: { fill: "#8a9098", fontSize: 10 }, tickLine: false } as const;
export const GRID = { stroke: "#2a2e33", strokeDasharray: "2 4", vertical: false } as const;
export const TOOLTIP = {
  contentStyle: { background: "#15171a", border: "1px solid #3a3f45", borderRadius: 2, fontSize: 11, color: "#e8eaed" },
  labelStyle: { color: "#aeb4bb", fontSize: 10 },
  itemStyle: { color: "#e8eaed" },
  cursor: { fill: "#ffffff0d" },
} as const;
export const LEGEND = { wrapperStyle: { fontSize: 10, color: "#aeb4bb" }, iconSize: 8 } as const;
