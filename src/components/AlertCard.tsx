"use client";

import { Check, CircleCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY = {
  critical: { label: "Critical", tone: "err" as const, icon: TriangleAlert, accent: "border-l-err" },
  warning: { label: "Warning", tone: "warn" as const, icon: TriangleAlert, accent: "border-l-warn" },
  resolved: { label: "Resolved", tone: "ok" as const, icon: CircleCheck, accent: "border-l-ok" },
};

export function AlertCard({
  alert,
  onAcknowledge,
  onViewDetails,
}: {
  alert: Alert;
  onAcknowledge?: (alert: Alert) => void;
  onViewDetails?: (alert: Alert) => void;
}) {
  const severity = SEVERITY[alert.severity];
  const Icon = severity.icon;

  return (
    <article
      className={cn(
        "rounded-xl border border-l-2 border-line bg-panel p-4 transition-colors duration-150 hover:border-[#31405c]",
        severity.accent,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border",
              alert.severity === "critical" && "border-err/30 bg-err/10 text-err",
              alert.severity === "warning" && "border-warn/30 bg-warn/10 text-warn",
              alert.severity === "resolved" && "border-ok/30 bg-ok/10 text-ok",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-ink">{alert.title}</h3>
              <StatusBadge label={severity.label} tone={severity.tone} />
              {alert.acknowledged && alert.severity !== "resolved" ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                  <Check className="size-3" strokeWidth={2} />
                  Acknowledged
                </span>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">{alert.description}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <ConnectorIcon id={alert.connector} size="sm" />
                {alert.workflow}
              </span>
              <span className="font-mono">{alert.entity}</span>
              {alert.runId ? <span className="font-mono">{alert.runId}</span> : null}
              <span className="tabular">{alert.ago}</span>
              <span className="font-mono">{alert.id}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onViewDetails?.(alert)}>
            View Details
          </Button>
          {alert.severity !== "resolved" ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={alert.acknowledged}
              onClick={() => onAcknowledge?.(alert)}
            >
              {alert.acknowledged ? "Acknowledged" : "Acknowledge"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
