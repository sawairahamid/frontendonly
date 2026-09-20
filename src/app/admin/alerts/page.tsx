"use client";

import { useMemo, useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";

import { AlertCard } from "@/components/AlertCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Drawer, DrawerSection, KeyValue } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockAlerts } from "@/data";
import { connector } from "@/lib/connectors";
import type { Alert, AlertSeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: AlertSeverity | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "resolved", label: "Resolved" },
];

export default function AlertsPage() {
  const [tab, setTab] = useState<AlertSeverity | "all">("all");
  const [query, setQuery] = useState("");
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [detail, setDetail] = useState<Alert | null>(null);

  const alerts = useMemo(
    () =>
      mockAlerts.map((alert) => ({
        ...alert,
        acknowledged: alert.acknowledged || acknowledged.includes(alert.id),
      })),
    [acknowledged],
  );

  const counts = useMemo(
    () => ({
      all: alerts.length,
      critical: alerts.filter((alert) => alert.severity === "critical").length,
      warning: alerts.filter((alert) => alert.severity === "warning").length,
      resolved: alerts.filter((alert) => alert.severity === "resolved").length,
    }),
    [alerts],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return alerts.filter((alert) => {
      const matchesTab = tab === "all" || alert.severity === tab;
      const matchesTerm =
        term.length === 0 ||
        alert.title.toLowerCase().includes(term) ||
        alert.entity.toLowerCase().includes(term) ||
        alert.workflow.toLowerCase().includes(term);
      return matchesTab && matchesTerm;
    });
  }, [alerts, tab, query]);

  const openCritical = counts.critical;

  return (
    <>
      <PageHeader
        title="Alerts"
        subtitle="Failures, degradations and conflicts raised by the platform."
        meta={
          <>
            <StatusBadge label={`${openCritical} critical`} tone="err" />
            <StatusBadge label={`${counts.warning} warning`} tone="warn" />
            <StatusBadge label={`${counts.resolved} resolved`} tone="ok" />
          </>
        }
        actions={
          <>
            <Button variant="secondary">Alert rules</Button>
            <Button
              variant="primary"
              onClick={() =>
                setAcknowledged(
                  alerts.filter((alert) => alert.severity !== "resolved").map((alert) => alert.id),
                )
              }
            >
              Acknowledge all
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors duration-150",
                  tab === item.id
                    ? "border-line bg-raised font-medium text-ink"
                    : "border-transparent text-muted hover:bg-white/[0.04] hover:text-ink",
                )}
              >
                {item.label}
                <span className="rounded-full border border-line bg-canvas px-1.5 text-[10px] text-faint tabular">
                  {counts[item.id]}
                </span>
              </button>
            ))}
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search alerts"
            className="w-full lg:w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            title="No alerts in this view"
            description="Nothing needs attention here. Switch tabs or clear the search to see other alerts."
          />
        ) : (
          <div className="space-y-3 p-3">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onViewDetails={setDetail}
                onAcknowledge={(item) =>
                  setAcknowledged((current) =>
                    current.includes(item.id) ? current : [...current, item.id],
                  )
                }
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="Alert rules"
          subtitle="Conditions that raise the alerts above"
        />
        <ul className="divide-y divide-line">
          {[
            {
              name: "Connector latency budget",
              condition: "Response time > 1.2 s for 3 consecutive probes",
              severity: "Warning",
            },
            {
              name: "Step failure",
              condition: "Any step returns a non-retryable error",
              severity: "Critical",
            },
            {
              name: "Outbound delivery timeout",
              condition: "Webhook delivery exceeds 5 s",
              severity: "Critical",
            },
            {
              name: "Status conflict",
              condition: "Inbound status differs from the local record",
              severity: "Warning",
            },
            {
              name: "Credential expiry",
              condition: "OAuth token expires within 24 hours",
              severity: "Critical",
            },
          ].map((rule) => (
            <li key={rule.name} className="flex items-center gap-4 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink">{rule.name}</p>
                <p className="truncate text-[11px] text-faint">{rule.condition}</p>
              </div>
              <StatusBadge label={rule.severity} />
              <Button size="sm" variant="ghost">
                Edit
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Drawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ""}
        subtitle={detail ? `${detail.workflow} · ${detail.timestamp}` : undefined}
        headerRight={
          detail ? (
            <StatusBadge
              label={detail.severity === "resolved" ? "Resolved" : detail.severity === "critical" ? "Critical" : "Warning"}
            />
          ) : null
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Close
            </Button>
            {detail && detail.severity !== "resolved" ? (
              <Button
                variant="primary"
                onClick={() => {
                  setAcknowledged((current) =>
                    current.includes(detail.id) ? current : [...current, detail.id],
                  );
                  setDetail(null);
                }}
              >
                Acknowledge
              </Button>
            ) : null}
          </>
        }
      >
        {detail ? (
          <>
            <DrawerSection>
              <div className="flex gap-2.5 rounded-lg border border-line bg-canvas p-3">
                <TriangleAlert
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    detail.severity === "critical" ? "text-err" : "text-warn",
                  )}
                  strokeWidth={1.75}
                />
                <p className="text-[13px] leading-5 text-muted">{detail.description}</p>
              </div>
            </DrawerSection>

            <DrawerSection title="Context">
              <KeyValue
                items={[
                  { label: "Alert ID", value: <span className="font-mono">{detail.id}</span> },
                  { label: "Workflow", value: detail.workflow },
                  { label: "Entity", value: <span className="font-mono">{detail.entity}</span> },
                  { label: "Integration", value: connector(detail.connector).label },
                  { label: "Raised", value: detail.timestamp },
                  {
                    label: "Run",
                    value: detail.runId ? <span className="font-mono">{detail.runId}</span> : "—",
                  },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Suggested action">
              <p className="text-[13px] leading-5 text-muted">
                {detail.severity === "resolved"
                  ? "No action required. This alert closed automatically once the connector recovered."
                  : "Inspect the failing run, retry the affected step, then confirm every connected system reports the same status."}
              </p>
            </DrawerSection>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
