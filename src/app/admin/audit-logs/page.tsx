"use client";

import { useMemo, useState } from "react";
import { ScrollText } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockAuditLogs } from "@/data";
import { connector } from "@/lib/connectors";
import type { AuditLogEntry } from "@/lib/types";

const DATE_OPTIONS = [
  { label: "All dates", value: "all" },
  { label: "20 Sep 2026", value: "20 Sep 2026" },
  { label: "19 Sep 2026", value: "19 Sep 2026" },
];

const ACTOR_OPTIONS = [
  { label: "All actors", value: "all" },
  { label: "System", value: "System" },
  { label: "ResolveSync", value: "ResolveSync" },
  { label: "ClickUp", value: "ClickUp" },
  { label: "Admin", value: "Admin" },
  { label: "API", value: "API" },
];

const RESULT_OPTIONS = [
  { label: "All results", value: "all" },
  { label: "Success", value: "Success" },
  { label: "Warning", value: "Warning" },
  { label: "Failed", value: "Failed" },
];

export default function AuditLogsPage() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("all");
  const [actor, setActor] = useState("all");
  const [integration, setIntegration] = useState("all");
  const [result, setResult] = useState("all");

  const integrationOptions = useMemo(() => {
    const ids = Array.from(new Set(mockAuditLogs.map((entry) => entry.connector)));
    return [
      { label: "All integrations", value: "all" },
      ...ids.map((id) => ({ label: connector(id).label, value: id })),
    ];
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return mockAuditLogs.filter((entry) => {
      const matchesTerm =
        term.length === 0 ||
        entry.action.toLowerCase().includes(term) ||
        entry.entity.toLowerCase().includes(term) ||
        entry.detail.toLowerCase().includes(term) ||
        entry.actorDetail.toLowerCase().includes(term);

      return (
        matchesTerm &&
        (date === "all" || entry.date === date) &&
        (actor === "all" || entry.actor === actor) &&
        (integration === "all" || entry.connector === integration) &&
        (result === "all" || entry.result === result)
      );
    });
  }, [query, date, actor, integration, result]);

  const columns: Array<Column<AuditLogEntry>> = [
    {
      key: "time",
      header: "Time",
      width: "132px",
      render: (entry) => (
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-ink tabular">{entry.time}</p>
          <p className="text-[11px] text-faint">{entry.date}</p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      width: "168px",
      render: (entry) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">{entry.actor}</p>
          <p className="truncate font-mono text-[11px] text-faint">{entry.actorDetail}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (entry) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">{entry.action}</p>
          <p className="truncate text-[11px] text-faint">{entry.detail}</p>
        </div>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      width: "156px",
      render: (entry) => (
        <span className="truncate font-mono text-[12px] text-muted">{entry.entity}</span>
      ),
    },
    {
      key: "integration",
      header: "Integration",
      width: "150px",
      hideBelowLg: true,
      render: (entry) => (
        <span className="flex items-center gap-2">
          <ConnectorIcon id={entry.connector} size="sm" />
          <span className="truncate text-[12px] text-muted">
            {connector(entry.connector).short}
          </span>
        </span>
      ),
    },
    {
      key: "result",
      header: "Result",
      width: "108px",
      render: (entry) => <StatusBadge label={entry.result} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="Who or what changed something, across every workflow and integration."
        meta={
          <span className="text-[12px] text-muted tabular">
            Retention 90 days · {mockAuditLogs.length} entries in range
          </span>
        }
        actions={<Button variant="secondary">Export log</Button>}
      />

      <Card>
        <FilterBar
          search={{ value: query, onChange: setQuery, placeholder: "Search action, entity, actor" }}
          filters={[
            { id: "date", label: "Date", value: date, options: DATE_OPTIONS, onChange: setDate },
            { id: "actor", label: "Actor", value: actor, options: ACTOR_OPTIONS, onChange: setActor },
            {
              id: "integration",
              label: "Integration",
              value: integration,
              options: integrationOptions,
              onChange: setIntegration,
            },
            {
              id: "result",
              label: "Result",
              value: result,
              options: RESULT_OPTIONS,
              onChange: setResult,
            },
          ]}
          resultCount={`${filtered.length} of ${mockAuditLogs.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(entry) => entry.id}
          stickyHeader
          maxHeight="calc(100dvh - 320px)"
          empty={
            <EmptyState
              icon={ScrollText}
              title="No audit entries match these filters"
              description="Widen the date range or clear the actor and integration filters."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setDate("all");
                    setActor("all");
                    setIntegration("all");
                    setResult("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          }
        />
      </Card>
    </>
  );
}
