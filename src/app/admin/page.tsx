import Link from "next/link";
import { ArrowRight, CalendarDays, Plus, TriangleAlert } from "lucide-react";

import { ActivityFeed } from "@/components/ActivityFeed";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge, StatusDot, toneFor } from "@/components/ui/StatusBadge";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import {
  getWorkflow,
  mockIntegrations,
  mockRuns,
  overviewMetrics,
  recentActivity,
} from "@/data";
import type { ConnectorId } from "@/lib/types";

const HEALTH_LABEL = {
  healthy: "Healthy",
  degraded: "Warning",
  failed: "Failed",
  inactive: "Inactive",
} as const;

const PIPELINE_LABEL: Partial<Record<ConnectorId, string>> = {
  hanaz: "Hanaz Website",
  fastn: "FASTN",
  validation: "Validation",
  ai: "AI Classification",
  "google-sheets": "Google Sheets",
  discord: "Discord",
  github: "GitHub",
  notion: "Notion",
  clickup: "ClickUp",
};

export default function OverviewPage() {
  const complaintWorkflow = getWorkflow("wf-complaint-resolution");
  const pipeline =
    complaintWorkflow?.steps.map((step) => ({
      id: step.id,
      index: step.index,
      name: PIPELINE_LABEL[step.connector] ?? step.name,
      connector: step.connector,
      status: step.status,
      duration: step.duration,
    })) ?? [];

  const failures = mockRuns
    .filter((run) => run.result === "failed" || run.result === "partial")
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Live state of every automation workflow, connector and execution in this workspace."
        actions={
          <>
            <Button icon={CalendarDays} variant="secondary">
              Last 24 hours
            </Button>
            <Link href="/admin/workflows?create=1">
              <Button icon={Plus} variant="primary">
                New Workflow
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Complaint Resolution"
          subtitle="Hanaz complaint automation"
          actions={
            <>
              <StatusBadge label="Live" tone="ok" pulse uppercase />
              <Link href="/admin/workflows/wf-complaint-resolution">
                <Button size="sm" iconRight={ArrowRight}>
                  View Workflow
                </Button>
              </Link>
            </>
          }
        />

        <div className="scroll-thin overflow-x-auto p-4">
          <WorkflowCanvas nodes={pipeline} compact className="min-w-max" />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-4 py-2.5 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <StatusDot tone="ok" pulse />
            Live
          </span>
          <span>
            Last run <span className="text-ink tabular">2 min ago</span>
          </span>
          <span>
            Success rate <span className="text-ink tabular">98.4%</span>
          </span>
          <span>
            Avg duration <span className="text-ink tabular">2.8 s</span>
          </span>
          <span className="font-mono text-faint">{complaintWorkflow?.trigger}</span>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Recent Activity"
            actions={
              <Link
                href="/admin/audit-logs"
                className="text-[12px] font-medium text-accent transition-colors duration-150 hover:text-ink"
              >
                Audit log
              </Link>
            }
          />
          <ActivityFeed events={recentActivity.slice(0, 8)} />
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader
            title="Integration Health"
            actions={
              <Link
                href="/admin/integrations"
                className="text-[12px] font-medium text-accent transition-colors duration-150 hover:text-ink"
              >
                Manage
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {mockIntegrations.map((integration) => (
              <li key={integration.id} className="flex items-center gap-3 px-4 py-2.5">
                <ConnectorIcon id={integration.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{integration.name}</p>
                  <p className="truncate text-[11px] text-faint">{integration.lastEvent}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <StatusBadge
                    label={HEALTH_LABEL[integration.health]}
                    tone={toneFor(integration.health)}
                  />
                  <span className="text-[11px] text-faint tabular">
                    {integration.lastEventAt}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader
            title="Recent Failures"
            actions={
              <Link
                href="/admin/alerts"
                className="text-[12px] font-medium text-accent transition-colors duration-150 hover:text-ink"
              >
                View Alerts
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {failures.map((run) => (
              <li key={run.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={
                    run.result === "failed"
                      ? "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-err/30 bg-err/10 text-err"
                      : "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-warn/30 bg-warn/10 text-warn"
                  }
                >
                  <TriangleAlert className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{run.failureReason}</p>
                  <p className="truncate text-[11px] text-faint">
                    <span className="font-mono">{run.id}</span> · {run.workflowName}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-faint tabular">{run.ago}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-2.5">
            <Link
              href="/admin/runs"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:text-ink"
            >
              Inspect run history
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
