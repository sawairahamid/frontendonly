"use client";

import { useState } from "react";
import Link from "next/link";
import { EllipsisVertical, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Workflow } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-faint">{label}</p>
      <p className="truncate text-[13px] font-medium text-ink tabular">{value}</p>
    </div>
  );
}

export function WorkflowCard({
  workflow,
  onToggle,
}: {
  workflow: Workflow;
  onToggle?: (workflow: Workflow) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const paused = workflow.status === "paused";

  return (
    <article className="rounded-xl border border-line bg-panel transition-colors duration-150 hover:border-[#31405c]">
      <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/workflows/${workflow.id}`}
              className="text-[15px] font-semibold text-ink transition-colors duration-150 hover:text-accent"
            >
              {workflow.name}
            </Link>
            <StatusBadge
              label={
                workflow.status === "active"
                  ? "Active"
                  : workflow.status === "draft"
                    ? "Draft"
                    : "Paused"
              }
              pulse={workflow.status === "active"}
            />
          </div>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
            {workflow.description}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="flex items-center -space-x-1.5">
              {workflow.connectors.slice(0, 6).map((id) => (
                <ConnectorIcon key={id} id={id} size="sm" className="ring-2 ring-panel" />
              ))}
            </span>
            <span className="text-[11px] text-faint">
              {workflow.connectors.length} connected apps · {workflow.trigger}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 xl:w-[430px] xl:shrink-0">
          <Stat label="Runs today" value={workflow.runsToday.toLocaleString("en-US")} />
          <Stat label="Success" value={`${workflow.successRate}%`} />
          <Stat label="Avg duration" value={workflow.avgDuration} />
          <Stat label="Last run" value={workflow.lastRun} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/admin/workflows/${workflow.id}`}>
            <Button size="sm">View Flow</Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            icon={paused || workflow.status === "draft" ? Play : Pause}
            onClick={() => onToggle?.(workflow)}
          >
            {workflow.status === "draft" ? "Activate" : paused ? "Resume" : "Pause"}
          </Button>
          <div className="relative">
            <button
              type="button"
              aria-label="More actions"
              onClick={() => setMenuOpen((open) => !open)}
              onBlur={() => window.setTimeout(() => setMenuOpen(false), 120)}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg border transition-colors duration-150",
                menuOpen
                  ? "border-line bg-raised text-ink"
                  : "border-transparent text-muted hover:border-line hover:bg-raised hover:text-ink",
              )}
            >
              <EllipsisVertical className="size-4" strokeWidth={1.75} />
            </button>
            {menuOpen ? (
              <div className="animate-fade-in absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-line bg-panel py-1">
                {["Duplicate workflow", "Export definition", "View run history", "Archive"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-[13px] text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-ink"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
