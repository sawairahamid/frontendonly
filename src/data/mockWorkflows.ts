import type { ConnectorId, StepStatus, Workflow, WorkflowStep } from "@/lib/types";

interface StepSeed {
  name: string;
  connector: ConnectorId;
  status: StepStatus;
  durationMs: number;
  description: string;
  timestamp: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
}

function humanDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
}

function buildSteps(workflowId: string, seeds: StepSeed[]): WorkflowStep[] {
  return seeds.map((seed, i) => ({
    id: `${workflowId}-step-${i + 1}`,
    index: i + 1,
    name: seed.name,
    connector: seed.connector,
    status: seed.status,
    duration: humanDuration(seed.durationMs),
    durationMs: seed.durationMs,
    description: seed.description,
    timestamp: seed.timestamp,
    input: seed.input,
    output: seed.output,
    error: seed.error,
  }));
}

const complaintSteps = buildSteps("wf-complaint-resolution", [
  {
    name: "Complaint Received",
    connector: "hanaz",
    status: "success",
    durationMs: 120,
    description: "Hanaz storefront posts the complaint form payload to the FASTN webhook.",
    timestamp: "15:31:02.114",
    input: {
      source: "hanaz.storefront",
      form: "complaint_form_v2",
      payload: {
        customer: "Ayesha Khan",
        email: "ayesha.khan@example.com",
        order: "HZ-ORD-77412",
        message: "Order marked delivered but nothing arrived.",
      },
    },
    output: { complaintId: "HZ-1042", accepted: true, receivedAt: "2026-09-20T15:31:02Z" },
  },
  {
    name: "FASTN Trigger",
    connector: "fastn",
    status: "success",
    durationMs: 54,
    description: "FASTN authenticates the source and fans the event into the Complaint Resolution workflow.",
    timestamp: "15:31:02.168",
    input: {
      event: "hanaz.complaint.created",
      source: "hanaz.storefront",
      complaintId: "HZ-1042",
    },
    output: {
      runId: "RUN-1049",
      workflowId: "wf-complaint-resolution",
      queued: true,
      fanout: ["google-sheets", "discord", "github", "notion", "clickup"],
    },
  },
  {
    name: "Validate Complaint",
    connector: "validation",
    status: "success",
    durationMs: 38,
    description: "Schema, duplicate and order-ownership checks before any connector is touched.",
    timestamp: "15:31:02.196",
    input: { complaintId: "HZ-1042", rules: ["schema", "duplicate_window_24h", "order_exists"] },
    output: { valid: true, duplicate: false, orderMatched: "HZ-ORD-77412" },
  },
  {
    name: "AI Classification",
    connector: "ai",
    status: "success",
    durationMs: 840,
    description: "Assigns issue category, priority and suggested owning team.",
    timestamp: "15:31:03.061",
    input: { text: "Order marked delivered but nothing arrived.", taxonomy: "hanaz.support.v3" },
    output: {
      category: "Delivery Issue",
      priority: "High",
      confidence: 0.94,
      routeTo: "logistics",
    },
  },
  {
    name: "Update Google Sheets",
    connector: "google-sheets",
    status: "success",
    durationMs: 210,
    description: "Appends the complaint to the shared operations tracker.",
    timestamp: "15:31:03.284",
    input: { spreadsheet: "Hanaz Complaints 2026", sheet: "Inbound", mode: "append" },
    output: { rowId: 1042, range: "Inbound!A1042:H1042", updated: true },
  },
  {
    name: "Send Discord Alert",
    connector: "discord",
    status: "success",
    durationMs: 190,
    description: "Notifies the #support-escalations channel with an actionable card.",
    timestamp: "15:31:03.480",
    input: { channel: "#support-escalations", template: "complaint_high_priority" },
    output: { messageId: "1287349021938", delivered: true },
  },
  {
    name: "Create GitHub Record",
    connector: "github",
    status: "success",
    durationMs: 430,
    description: "Opens a tracking issue in the operations repository.",
    timestamp: "15:31:03.921",
    input: { repo: "hanaz/operations", labels: ["complaint", "delivery", "priority:high"] },
    output: { issueNumber: 482, url: "https://github.com/hanaz/operations/issues/482" },
  },
  {
    name: "Sync Notion",
    connector: "notion",
    status: "warning",
    durationMs: 1800,
    description: "Creates the customer-facing case page in the Notion support database.",
    timestamp: "15:31:05.742",
    input: { database: "Support Cases", properties: ["Customer", "Category", "Priority"] },
    output: { pageId: "9f2c41ab", created: true, retries: 2, latencyMs: 1800 },
    error: "Notion API responded in 1.8 s — above the 1.2 s latency budget. Retried twice.",
  },
  {
    name: "Create ClickUp Task",
    connector: "clickup",
    status: "success",
    durationMs: 380,
    description: "Creates the task the logistics team works from, and subscribes to status changes.",
    timestamp: "15:31:06.135",
    input: { list: "Logistics / Delivery Issues", assignee: "ops-rotation", watchStatus: true },
    output: { taskId: "86by4x2p", url: "https://app.clickup.com/t/86by4x2p", subscribed: true },
  },
]);

const feedbackSteps = buildSteps("wf-customer-feedback", [
  {
    name: "Feedback Submitted",
    connector: "hanaz",
    status: "success",
    durationMs: 96,
    description: "Post-delivery survey response captured on the storefront.",
    timestamp: "14:12:41.002",
    input: { form: "post_delivery_survey", rating: 4 },
    output: { feedbackId: "FB-3391", accepted: true },
  },
  {
    name: "Sentiment Analysis",
    connector: "ai",
    status: "success",
    durationMs: 610,
    description: "Scores sentiment and extracts product themes.",
    timestamp: "14:12:41.618",
    input: { text: "Packaging was great, delivery was late." },
    output: { sentiment: "mixed", themes: ["packaging", "delivery_speed"] },
  },
  {
    name: "Append to Sheets",
    connector: "google-sheets",
    status: "success",
    durationMs: 175,
    description: "Writes the scored response to the feedback warehouse sheet.",
    timestamp: "14:12:41.796",
    input: { spreadsheet: "Hanaz Voice of Customer", sheet: "2026-Q3" },
    output: { rowId: 3391, updated: true },
  },
  {
    name: "Notion Insight Page",
    connector: "notion",
    status: "success",
    durationMs: 520,
    description: "Rolls the response into the weekly insight database.",
    timestamp: "14:12:42.320",
    input: { database: "VoC Insights" },
    output: { pageId: "c41d90fe", created: true },
  },
]);

const escalationSteps = buildSteps("wf-order-escalation", [
  {
    name: "Order Flagged",
    connector: "hanaz",
    status: "success",
    durationMs: 88,
    description: "Order breaches the delivery SLA and is flagged by the storefront job.",
    timestamp: "13:04:10.410",
    input: { orderId: "HZ-ORD-77102", slaHours: 72 },
    output: { escalationId: "ESC-221", breachedBy: "9h" },
  },
  {
    name: "Severity Scoring",
    connector: "ai",
    status: "success",
    durationMs: 430,
    description: "Scores the escalation against customer value and breach size.",
    timestamp: "13:04:10.855",
    input: { breachedBy: "9h", customerTier: "gold" },
    output: { severity: "high", notify: ["logistics", "cx-lead"] },
  },
  {
    name: "Discord Escalation",
    connector: "discord",
    status: "success",
    durationMs: 205,
    description: "Pings the escalation channel with the order context.",
    timestamp: "13:04:11.070",
    input: { channel: "#order-escalations" },
    output: { messageId: "1287320012344", delivered: true },
  },
  {
    name: "ClickUp Escalation Task",
    connector: "clickup",
    status: "success",
    durationMs: 362,
    description: "Creates the escalation task with an SLA countdown.",
    timestamp: "13:04:11.440",
    input: { list: "Logistics / Escalations" },
    output: { taskId: "86by3k9a", created: true },
  },
  {
    name: "Notify Customer",
    connector: "email",
    status: "success",
    durationMs: 240,
    description: "Sends the proactive delay notice to the customer.",
    timestamp: "13:04:11.690",
    input: { template: "delivery_delay_notice" },
    output: { messageId: "em_92831", delivered: true },
  },
]);

const followUpSteps = buildSteps("wf-support-follow-up", [
  {
    name: "Resolved Case Detected",
    connector: "resolvesync",
    status: "skipped",
    durationMs: 0,
    description: "Watches for complaints that moved to Resolved in the last 24 hours.",
    timestamp: "—",
    input: { window: "24h", status: "Resolved" },
    output: {},
  },
  {
    name: "Compose Follow-up",
    connector: "ai",
    status: "skipped",
    durationMs: 0,
    description: "Drafts a short follow-up message using the case summary.",
    timestamp: "—",
    input: {},
    output: {},
  },
  {
    name: "Send Follow-up Email",
    connector: "email",
    status: "skipped",
    durationMs: 0,
    description: "Sends the follow-up and records the outcome.",
    timestamp: "—",
    input: {},
    output: {},
  },
]);

const refundSteps = buildSteps("wf-refund-verification", [
  {
    name: "Refund Requested",
    connector: "hanaz",
    status: "success",
    durationMs: 110,
    description: "Refund request submitted from the order detail page.",
    timestamp: "15:02:55.010",
    input: { orderId: "HZ-ORD-76880", amount: 7450, currency: "PKR" },
    output: { refundId: "RF-5521", accepted: true },
  },
  {
    name: "Policy Check",
    connector: "validation",
    status: "success",
    durationMs: 64,
    description: "Validates the request against the 14-day refund policy.",
    timestamp: "15:02:55.082",
    input: { policy: "refund_14_day" },
    output: { eligible: true, daysSinceDelivery: 6 },
  },
  {
    name: "GitHub Audit Record",
    connector: "github",
    status: "success",
    durationMs: 390,
    description: "Writes an immutable audit record for finance reconciliation.",
    timestamp: "15:02:55.480",
    input: { repo: "hanaz/finance-audit" },
    output: { issueNumber: 118, created: true },
  },
  {
    name: "Sheets Ledger Row",
    connector: "google-sheets",
    status: "success",
    durationMs: 198,
    description: "Appends the refund to the finance ledger sheet.",
    timestamp: "15:02:55.690",
    input: { spreadsheet: "Hanaz Refund Ledger" },
    output: { rowId: 5521, updated: true },
  },
]);

const digestSteps = buildSteps("wf-ops-digest", [
  {
    name: "Collect Metrics",
    connector: "resolvesync",
    status: "success",
    durationMs: 1250,
    description: "Aggregates run, failure and complaint metrics for the period.",
    timestamp: "09:00:00.240",
    input: { period: "7d" },
    output: { runs: 1684, failures: 21, complaints: 402 },
  },
  {
    name: "Build Digest Page",
    connector: "notion",
    status: "success",
    durationMs: 740,
    description: "Publishes the digest page in the Ops workspace.",
    timestamp: "09:00:01.010",
    input: { database: "Ops Digests" },
    output: { pageId: "a1c93f20", created: true },
  },
  {
    name: "Post to Discord",
    connector: "discord",
    status: "success",
    durationMs: 180,
    description: "Shares the digest summary with the operations channel.",
    timestamp: "09:00:01.205",
    input: { channel: "#ops-weekly" },
    output: { messageId: "1287100093481", delivered: true },
  },
]);

const healthWatchSteps = buildSteps("wf-connector-health", [
  {
    name: "Poll Connectors",
    connector: "resolvesync",
    status: "success",
    durationMs: 640,
    description: "Probes every connected service for latency and auth validity.",
    timestamp: "15:25:00.120",
    input: { connectors: 7, timeoutMs: 4000 },
    output: { healthy: 6, degraded: 1, failed: 0 },
  },
  {
    name: "Evaluate Thresholds",
    connector: "validation",
    status: "warning",
    durationMs: 52,
    description: "Compares probe results against the alerting thresholds.",
    timestamp: "15:25:00.180",
    input: { latencyBudgetMs: 1200 },
    output: { breaches: ["notion"] },
    error: "Notion latency 1.8 s exceeded the 1.2 s budget for 3 consecutive probes.",
  },
  {
    name: "Raise Alert",
    connector: "webhook",
    status: "success",
    durationMs: 130,
    description: "Emits the alert to the on-call webhook endpoint.",
    timestamp: "15:25:00.320",
    input: { endpoint: "https://hooks.resolvesync.io/alerts" },
    output: { alertId: "ALR-3011", accepted: true },
  },
]);

export const mockWorkflows: Workflow[] = [
  {
    id: "wf-complaint-resolution",
    name: "Complaint Resolution",
    description:
      "Handle Hanaz customer complaints from submission to final resolution across every connected system.",
    status: "active",
    trigger: "FASTN webhook · hanaz.complaint.created",
    owner: "Support Operations",
    connectors: [
      "hanaz",
      "google-sheets",
      "discord",
      "github",
      "notion",
      "clickup",
    ],
    runsToday: 248,
    successRate: 98.4,
    avgDuration: "2.8 s",
    lastRun: "2 min ago",
    updatedAt: "Updated 3 days ago",
    steps: complaintSteps,
  },
  {
    id: "wf-customer-feedback",
    name: "Customer Feedback",
    description:
      "Score post-delivery survey responses and route product themes into the weekly insight database.",
    status: "active",
    trigger: "FASTN webhook · hanaz.feedback.submitted",
    owner: "Customer Experience",
    connectors: ["hanaz", "ai", "google-sheets", "notion"],
    runsToday: 96,
    successRate: 99.1,
    avgDuration: "1.4 s",
    lastRun: "9 min ago",
    updatedAt: "Updated 6 days ago",
    steps: feedbackSteps,
  },
  {
    id: "wf-order-escalation",
    name: "Order Escalation",
    description:
      "Escalate orders that breach the delivery SLA to logistics and notify the customer proactively.",
    status: "active",
    trigger: "Schedule · every 15 minutes",
    owner: "Logistics",
    connectors: ["hanaz", "ai", "discord", "clickup", "email"],
    runsToday: 41,
    successRate: 97.2,
    avgDuration: "1.3 s",
    lastRun: "12 min ago",
    updatedAt: "Updated 2 weeks ago",
    steps: escalationSteps,
  },
  {
    id: "wf-refund-verification",
    name: "Refund Verification",
    description:
      "Validate refund requests against policy and write an immutable audit record for finance.",
    status: "active",
    trigger: "FASTN webhook · hanaz.refund.requested",
    owner: "Finance Operations",
    connectors: ["hanaz", "github", "google-sheets"],
    runsToday: 28,
    successRate: 100,
    avgDuration: "0.8 s",
    lastRun: "27 min ago",
    updatedAt: "Updated 9 days ago",
    steps: refundSteps,
  },
  {
    id: "wf-ops-digest",
    name: "Weekly Ops Digest",
    description:
      "Aggregate platform metrics into a published digest for the operations team every Monday.",
    status: "active",
    trigger: "Schedule · Mondays 09:00 PKT",
    owner: "Platform",
    connectors: ["notion", "discord"],
    runsToday: 1,
    successRate: 100,
    avgDuration: "2.2 s",
    lastRun: "6 h ago",
    updatedAt: "Updated 1 month ago",
    steps: digestSteps,
  },
  {
    id: "wf-connector-health",
    name: "Connector Health Watch",
    description:
      "Probe every connected service for latency and expiring credentials, then raise alerts on breach.",
    status: "active",
    trigger: "Schedule · every 5 minutes",
    owner: "Platform",
    connectors: ["webhook", "notion", "clickup", "discord"],
    runsToday: 288,
    successRate: 99.6,
    avgDuration: "0.9 s",
    lastRun: "4 min ago",
    updatedAt: "Updated 5 days ago",
    steps: healthWatchSteps,
  },
  {
    id: "wf-support-follow-up",
    name: "Support Follow-up",
    description:
      "Send a follow-up message 24 hours after a complaint is resolved and record the outcome.",
    status: "paused",
    trigger: "Schedule · daily 10:00 PKT",
    owner: "Support Operations",
    connectors: ["resolvesync", "ai", "email"],
    runsToday: 0,
    successRate: 96.8,
    avgDuration: "1.1 s",
    lastRun: "4 days ago",
    updatedAt: "Paused 4 days ago",
    steps: followUpSteps,
  },
];

export function getWorkflow(id: string): Workflow | undefined {
  const fromMock = mockWorkflows.find((workflow) => workflow.id === id);
  if (fromMock) return fromMock;
  return getLocalWorkflows().find((workflow) => workflow.id === id);
}

const LOCAL_WORKFLOWS_KEY = "resolvesync.demo.workflows";

export function getLocalWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(LOCAL_WORKFLOWS_KEY);
    return raw ? (JSON.parse(raw) as Workflow[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalWorkflow(workflow: Workflow): void {
  if (typeof window === "undefined") return;
  const next = [workflow, ...getLocalWorkflows().filter((item) => item.id !== workflow.id)];
  window.sessionStorage.setItem(LOCAL_WORKFLOWS_KEY, JSON.stringify(next));
}
