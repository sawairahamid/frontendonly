import {
  mockAlerts,
  mockComplaints,
  mockIntegrations,
  mockRuns,
  mockWorkflows,
} from "@/data";
import { connector } from "@/lib/connectors";

export interface SearchHit {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  group: "Pages" | "Workflows" | "Complaints" | "Runs" | "Integrations" | "Alerts";
}

const PAGES: SearchHit[] = [
  { id: "page-overview", href: "/admin", title: "Overview", subtitle: "Control center", group: "Pages" },
  { id: "page-workflows", href: "/admin/workflows", title: "Workflows", subtitle: "Automation definitions", group: "Pages" },
  { id: "page-complaints", href: "/admin/complaints", title: "Complaints", subtitle: "Hanaz cases", group: "Pages" },
  { id: "page-integrations", href: "/admin/integrations", title: "Integrations", subtitle: "Connected services", group: "Pages" },
  { id: "page-runs", href: "/admin/runs", title: "Runs", subtitle: "Execution history", group: "Pages" },
  { id: "page-audit", href: "/admin/audit-logs", title: "Audit Logs", subtitle: "Who changed what", group: "Pages" },
  { id: "page-alerts", href: "/admin/alerts", title: "Alerts", subtitle: "Failures and warnings", group: "Pages" },
  { id: "page-analytics", href: "/admin/analytics", title: "Analytics", subtitle: "Throughput and reliability", group: "Pages" },
  { id: "page-settings", href: "/admin/settings", title: "Settings", subtitle: "Workspace configuration", group: "Pages" },
];

function haystack(hit: SearchHit): string {
  return `${hit.title} ${hit.subtitle} ${hit.group}`.toLowerCase();
}

export function buildSearchIndex(): SearchHit[] {
  const workflows: SearchHit[] = mockWorkflows.map((workflow) => ({
    id: `wf-${workflow.id}`,
    href: `/admin/workflows/${workflow.id}`,
    title: workflow.name,
    subtitle: `${workflow.status} · ${workflow.trigger}`,
    group: "Workflows",
  }));

  const complaints: SearchHit[] = mockComplaints.map((complaint) => ({
    id: `c-${complaint.id}`,
    href: `/admin/complaints/${complaint.id}`,
    title: complaint.id,
    subtitle: `${complaint.customer} · ${complaint.issueType} · ${complaint.status}`,
    group: "Complaints",
  }));

  const runs: SearchHit[] = mockRuns.map((run) => ({
    id: `r-${run.id}`,
    href: "/admin/runs",
    title: run.id,
    subtitle: `${run.workflowName} · ${run.entity} · ${run.result}`,
    group: "Runs",
  }));

  const integrations: SearchHit[] = mockIntegrations.map((integration) => ({
    id: `i-${integration.id}`,
    href: "/admin/integrations",
    title: integration.name,
    subtitle: `${integration.statusLabel} · ${connector(integration.id).label}`,
    group: "Integrations",
  }));

  const alerts: SearchHit[] = mockAlerts.map((alert) => ({
    id: `a-${alert.id}`,
    href: "/admin/alerts",
    title: alert.title,
    subtitle: `${alert.severity} · ${alert.workflow} · ${alert.entity}`,
    group: "Alerts",
  }));

  return [...PAGES, ...workflows, ...complaints, ...runs, ...integrations, ...alerts];
}

export function searchWorkspace(query: string, limit = 12): SearchHit[] {
  const term = query.trim().toLowerCase();
  const index = buildSearchIndex();
  if (!term) {
    return PAGES;
  }

  return index
    .filter((hit) => haystack(hit).includes(term) || hit.title.toLowerCase().includes(term))
    .slice(0, limit);
}
