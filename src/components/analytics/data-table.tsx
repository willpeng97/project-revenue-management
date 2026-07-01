import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T, index: number) => string;
}) {
  const alignCls = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  alignCls(c.align)
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : row.id ?? i}
              className="border-b border-border/40 transition-colors last:border-0 hover:bg-slate-50/70"
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-2.5 text-foreground", alignCls(c.align), c.className)}>
                  {c.render ? c.render(row, i) : (row as Record<string, React.ReactNode>)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
