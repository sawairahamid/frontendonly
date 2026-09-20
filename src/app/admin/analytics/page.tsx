import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { AreaChart, BarList, DonutChart, StackedBarChart } from "@/components/charts/Charts";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { mockAnalytics } from "@/data";
import { formatMs, formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const analytics = mockAnalytics;

  const metrics = [
    {
      id: "total-runs",
      label: "Total workflow runs",
      value: formatNumber(analytics.totalRuns),
      delta: "+6.2%",
      trend: "up" as const,
      intent: "positive" as const,
      hint: "last 7 days",
    },
    {
      id: "success-rate",
      label: "Success rate",
      value: `${analytics.successRate}%`,
      delta: "+0.3pt",
      trend: "up" as const,
      intent: "positive" as const,
      hint: "target 99.0%",
    },
    {
      id: "avg-execution",
      label: "Avg execution time",
      value: formatMs(analytics.avgExecutionMs),
      delta: "-180 ms",
      trend: "down" as const,
      intent: "positive" as const,
      hint: "p95 4.8 s",
    },
    {
      id: "complaints",
      label: "Complaints processed",
      value: formatNumber(analytics.complaintsProcessed),
      delta: "+94",
      trend: "up" as const,
      intent: "neutral" as const,
      hint: "since 14 Sep",
    },
    {
      id: "failures",
      label: "Failures",
      value: formatNumber(analytics.failures),
      delta: "-11",
      trend: "down" as const,
      intent: "positive" as const,
      hint: "1.6% of all runs",
    },
    {
      id: "resolved",
      label: "Resolved complaints",
      value: formatNumber(analytics.resolvedComplaints),
      delta: "85.8%",
      trend: "flat" as const,
      intent: "neutral" as const,
      hint: "resolution rate",
    },
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Throughput, reliability and connector behaviour across all workflows."
        actions={
          <>
            <Button variant="secondary">Last 7 days</Button>
            <Button variant="secondary">Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Runs over time"
            subtitle="Executions per day across every workflow"
            actions={<span className="text-[12px] text-muted tabular">7 days</span>}
          />
          <CardBody>
            <AreaChart data={analytics.runsOverTime} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Success vs failure"
            subtitle="Daily outcome split"
            actions={
              <span className="flex items-center gap-3 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-accent" />
                  Success
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-err" />
                  Failed
                </span>
              </span>
            }
          />
          <CardBody>
            <StackedBarChart data={analytics.successVsFailure} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Runs by workflow" subtitle="Today" />
          <CardBody>
            <BarList data={analytics.runsByWorkflow} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Connector failure frequency" subtitle="Last 7 days" />
          <CardBody>
            <BarList data={analytics.connectorFailures} tone="err" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Complaint categories" subtitle="Distribution by AI classification" />
          <CardBody>
            <DonutChart data={analytics.complaintCategories} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
