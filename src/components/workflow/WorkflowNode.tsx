"use client";

import { Check, CircleSlash, LoaderCircle, TriangleAlert, X } from "lucide-react";

import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusDot, type Tone } from "@/components/ui/StatusBadge";
import { connector } from "@/lib/connectors";
import type { ConnectorId, StepStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<StepStatus, Tone> = {
  waiting: "muted",
  running: "info",
  success: "ok",
  warning: "warn",
  failed: "err",
  skipped: "muted",
};

const STATUS_STYLES: Record<StepStatus, { ring: string; label: string; text: string }> = {
  waiting: { ring: "border-line", label: "Waiting", text: "text-faint" },
  running: { ring: "border-info/50", label: "Running", text: "text-info" },
  success: { ring: "border-ok/35", label: "Success", text: "text-ok" },
  warning: { ring: "border-warn/45", label: "Warning", text: "text-warn" },
  failed: { ring: "border-err/50", label: "Failed", text: "text-err" },
  skipped: { ring: "border-line", label: "Skipped", text: "text-faint" },
};

function StatusMark({ status }: { status: StepStatus }) {
  const style = STATUS_STYLES[status];

  if (status === "running") {
    return <LoaderCircle className={cn("size-3.5 animate-spin", style.text)} strokeWidth={2} />;
  }
  if (status === "success") {
    return <Check className={cn("size-3.5", style.text)} strokeWidth={2.5} />;
  }
  if (status === "warning") {
    return <TriangleAlert className={cn("size-3.5", style.text)} strokeWidth={2} />;
  }
  if (status === "failed") {
    return <X className={cn("size-3.5", style.text)} strokeWidth={2.5} />;
  }
  if (status === "skipped") {
    return <CircleSlash className={cn("size-3.5", style.text)} strokeWidth={2} />;
  }
  return <span className="size-1.5 rounded-full bg-faint" />;
}

export function WorkflowNode({
  index,
  name,
  connectorId,
  status,
  duration,
  selected = false,
  onClick,
  compact = false,
}: {
  index?: number;
  name: string;
  connectorId: ConnectorId;
  status: StepStatus;
  duration?: string;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const style = STATUS_STYLES[status];
  const meta = connector(connectorId);
  const interactive = Boolean(onClick);

  if (compact) {
    return (
      <div
        className={cn(
          "flex w-[132px] shrink-0 flex-col items-center gap-1.5 rounded-lg border bg-panel px-2 py-2.5 text-center",
          style.ring,
        )}
      >
        <ConnectorIcon id={connectorId} size="sm" />
        <span className="w-full truncate text-[11px] leading-4 font-medium text-ink">
          {name}
        </span>
        <span className={cn("inline-flex items-center gap-1 text-[10px]", style.text)}>
          <StatusDot tone={STATUS_TONE[status]} pulse={status === "running"} />
          {style.label}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        "flex w-[178px] shrink-0 flex-col gap-2 rounded-xl border bg-panel p-3 text-left transition-colors duration-150",
        style.ring,
        interactive && "hover:border-[#3a4a68] hover:bg-raised",
        selected && "border-accent/60 bg-accent/[0.06]",
        !interactive && "cursor-default",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex size-5 items-center justify-center rounded-md border border-line bg-canvas font-mono text-[10px] text-faint">
            {index}
          </span>
          <ConnectorIcon id={connectorId} size="sm" />
        </span>
        <StatusMark status={status} />
      </div>

      <div>
        <p className="truncate text-[13px] leading-5 font-medium text-ink">{name}</p>
        <p className="truncate text-[11px] text-faint">{meta.label}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("text-[11px] font-medium", style.text)}>{style.label}</span>
        <span className="font-mono text-[11px] text-faint tabular">
          {status === "waiting" || status === "skipped" ? "—" : duration}
        </span>
      </div>
    </button>
  );
}
