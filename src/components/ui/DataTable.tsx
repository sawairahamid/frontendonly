"use client";

import type { ReactNode } from "react";

import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  width?: string;
  /** Hides the column below the lg breakpoint so dense tables stay readable. */
  hideBelowLg?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  loading?: boolean;
  empty?: ReactNode;
  /** Keeps the header visible while the table body scrolls. */
  stickyHeader?: boolean;
  maxHeight?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  loading = false,
  empty,
  stickyHeader = false,
  maxHeight,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div
      className={cn("scroll-thin w-full overflow-auto", maxHeight && "overflow-y-auto")}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  "bg-panel px-4 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-faint uppercase",
                  column.align === "right" ? "text-right" : "text-left",
                  column.hideBelowLg && "hidden lg:table-cell",
                  stickyHeader && "sticky top-0 z-10",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey === key;

            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-line/70 transition-colors duration-150 last:border-b-0",
                  onRowClick && "cursor-pointer hover:bg-white/[0.025]",
                  selected && "bg-accent/[0.07]",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-2.5 align-middle text-ink",
                      column.align === "right" ? "text-right" : "text-left",
                      column.hideBelowLg && "hidden lg:table-cell",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
