"use client";

import { useMemo, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { RunDetailsDrawer } from "@/components/drawers/RunDetailsDrawer";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockRuns, mockWorkflows } from "@/data";
import type { Run } from "@/lib/types";

const RESULT_OPTIONS = [
  { label: "All results", value: "all" },
  { label: "Success", value: "success" },
  { label: "Partial", value: "partial" },
  { label: "Failed", value: "failed" },
];

const WORKFLOW_OPTIONS = [
  { label: "All workflows", value: "all" },
  ...mockWorkflows.map((workflow) => ({ label: workflow.name, value: workflow.id })),
];

const RESULT_LABEL = {
  success: "Success",
  failed: "Failed",
  partial: "Partial",
  running: "Running",
} as const;

export default function RunsPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("all");
  const [workflowId, setWorkflowId] = useState("all");
  const [selected, setSelected] = useState<Run | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return mockRuns.filter((run) => {
      const matchesTerm =
        term.length === 0 ||
        run.id.toLowerCase().includes(term) ||
        run.entity.toLowerCase().includes(term) ||
        run.workflowName.toLowerCase().includes(term);

      return (
        matchesTerm &&
        (result === "all" || run.result === result) &&
        (workflowId === "all" || run.workflowId === workflowId)
      );
    });
  }, [query, result, workflowId]);

  const failed = mockRuns.filter((run) => run.result === "failed").length;
  const partial = mockRuns.filter((run) => run.result === "partial").length;

  const columns: Array<Column<Run>> = [
    {
      key: "id",
      header: "Run ID",
      width: "112px",
      render: (run) => <span className="font-mono text-[12px] text-ink">{run.id}</span>,
    },
    {
      key: "workflow",
      header: "Workflow",
      render: (run) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">{run.workflowName}</p>
          <p className="truncate text-[11px] text-faint">{run.trigger}</p>
        </div>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      width: "116px",
      render: (run) => <span className="font-mono text-[12px] text-muted">{run.entity}</span>,
    },
    {
      key: "duration",
      header: "Duration",
      width: "92px",
      align: "right",
      render: (run) => <span className="text-[12px] text-muted tabular">{run.duration}</span>,
    },
    {
      key: "steps",
      header: "Steps",
      width: "84px",
      align: "right",
      render: (run) => (
        <span
          className={
            run.stepsCompleted === run.stepsTotal
              ? "text-[12px] text-muted tabular"
              : "text-[12px] text-warn tabular"
          }
        >
          {run.stepsCompleted}/{run.stepsTotal}
        </span>
      ),
    },
    {
      key: "result",
      header: "Result",
      width: "112px",
      render: (run) => <StatusBadge label={RESULT_LABEL[run.result]} />,
    },
    {
      key: "timestamp",
      header: "Timestamp",
      width: "150px",
      hideBelowLg: true,
      render: (run) => (
        <div className="min-w-0">
          <p className="truncate text-[12px] text-muted tabular">{run.ago}</p>
          <p className="truncate text-[11px] text-faint tabular">{run.startedAt}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "88px",
      align: "right",
      render: (run) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            setSelected(run);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Runs"
        subtitle="Every workflow execution, with per-step timing and failure detail."
        actions={
          <>
            <Button icon={RefreshCw} variant="secondary">
              Refresh
            </Button>
            <Button variant="secondary">Export</Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          metric={{
            id: "runs-total",
            label: "Runs (24h)",
            value: "702",
            delta: "+4.1%",
            trend: "up",
            intent: "positive",
            hint: "across 6 active workflows",
          }}
        />
        <MetricCard
          metric={{
            id: "runs-failed",
            label: "Failed",
            value: String(failed),
            delta: "-2",
            trend: "down",
            intent: "positive",
            hint: "connector + timeout errors",
          }}
        />
        <MetricCard
          metric={{
            id: "runs-partial",
            label: "Partial",
            value: String(partial),
            delta: "+1",
            trend: "up",
            intent: "negative",
            hint: "completed with warnings",
          }}
        />
        <MetricCard
          metric={{
            id: "runs-duration",
            label: "Avg duration",
            value: "2.1 s",
            delta: "-0.2 s",
            trend: "down",
            intent: "positive",
            hint: "p95 4.8 s",
          }}
        />
      </div>

      <Card>
        <FilterBar
          search={{ value: query, onChange: setQuery, placeholder: "Search run or entity ID" }}
          filters={[
            {
              id: "workflow",
              label: "Workflow",
              value: workflowId,
              options: WORKFLOW_OPTIONS,
              onChange: setWorkflowId,
            },
            { id: "result", label: "Result", value: result, options: RESULT_OPTIONS, onChange: setResult },
          ]}
          resultCount={`${filtered.length} of ${mockRuns.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(run) => run.id}
          onRowClick={setSelected}
          selectedKey={selected?.id}
          stickyHeader
          empty={
            <EmptyState
              icon={Activity}
              title="No runs match these filters"
              description="Executions appear here as soon as a workflow is triggered."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setResult("all");
                    setWorkflowId("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          }
        />
      </Card>

      <RunDetailsDrawer run={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </>
  );
}
