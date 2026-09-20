import type { ActivityEvent, Environment, OverviewMetric } from "@/lib/types";

export const overviewMetrics: OverviewMetric[] = [
  {
    id: "active-workflows",
    label: "Active Workflows",
    value: "6",
    delta: "+1",
    trend: "up",
    intent: "neutral",
    hint: "1 paused · 7 total",
  },
  {
    id: "connected-apps",
    label: "Connected Apps",
    value: "7",
    delta: "1 warning",
    trend: "flat",
    intent: "neutral",
    hint: "6 healthy · 1 degraded",
  },
  {
    id: "runs-today",
    label: "Runs Today",
    value: "248",
    delta: "+7.4%",
    trend: "up",
    intent: "positive",
    hint: "vs. 231 yesterday",
  },
  {
    id: "failed-events",
    label: "Failed Events",
    value: "3",
    delta: "-2",
    trend: "down",
    intent: "positive",
    hint: "2 connector · 1 timeout",
  },
  {
    id: "success-rate",
    label: "Success Rate",
    value: "98.4%",
    delta: "+0.3pt",
    trend: "up",
    intent: "positive",
    hint: "7-day rolling average",
  },
];

export const recentActivity: ActivityEvent[] = [
  {
    id: "act-1",
    label: "ClickUp task created",
    connector: "clickup",
    entity: "HZ-1042",
    ago: "1 min ago",
    status: "success",
  },
  {
    id: "act-2",
    label: "Notion page created after retry",
    connector: "notion",
    entity: "HZ-1042",
    ago: "2 min ago",
    status: "warning",
  },
  {
    id: "act-3",
    label: "Discord alert sent",
    connector: "discord",
    entity: "HZ-1042",
    ago: "2 min ago",
    status: "success",
  },
  {
    id: "act-4",
    label: "Google Sheet row created",
    connector: "google-sheets",
    entity: "HZ-1042",
    ago: "2 min ago",
    status: "success",
  },
  {
    id: "act-5",
    label: "FASTN received complaint event",
    connector: "fastn",
    entity: "HZ-1042",
    ago: "2 min ago",
    status: "success",
  },
  {
    id: "act-5b",
    label: "Complaint HZ-1042 submitted",
    connector: "hanaz",
    entity: "HZ-1042",
    ago: "2 min ago",
    status: "success",
  },
  {
    id: "act-6",
    label: "Connector health probe completed",
    connector: "resolvesync",
    entity: "PROBE-2211",
    ago: "4 min ago",
    status: "warning",
  },
  {
    id: "act-7",
    label: "Feedback FB-3391 processed",
    connector: "hanaz",
    entity: "FB-3391",
    ago: "9 min ago",
    status: "success",
  },
  {
    id: "act-8",
    label: "Order escalation raised",
    connector: "clickup",
    entity: "ESC-221",
    ago: "12 min ago",
    status: "success",
  },
  {
    id: "act-9",
    label: "Complaint HZ-1041 resolved",
    connector: "resolvesync",
    entity: "HZ-1041",
    ago: "18 min ago",
    status: "success",
  },
  {
    id: "act-10",
    label: "Notion sync failed",
    connector: "notion",
    entity: "HZ-1041",
    ago: "18 min ago",
    status: "failed",
  },
];

export const currentEnvironment: Environment = "Demo";

export const currentUser = {
  name: "Sawaira Rauf",
  email: "sawaira@resolvesync.io",
  role: "Platform Admin",
};

export const organization = {
  name: "ResolveSync",
  workspace: "Hanaz Operations",
  region: "asia-south1",
  timezone: "Asia/Karachi (PKT)",
};
