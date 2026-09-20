/**
 * Domain model for the ResolveSync admin portal.
 *
 * These types describe the shape the UI expects. The mock layer in `src/data`
 * implements them today; a real API client can replace that layer without
 * touching any component.
 */

/** Health of a connector, workflow node or service. */
export type Health = "healthy" | "degraded" | "failed" | "inactive";

/** Lifecycle state of a single step inside a workflow execution. */
export type StepStatus =
  | "waiting"
  | "running"
  | "success"
  | "warning"
  | "failed"
  | "skipped";

export type RunResult = "success" | "failed" | "partial" | "running";

export type WorkflowStatus = "active" | "paused" | "draft" | "error";

export type ComplaintStatus = "Open" | "Investigating" | "Resolved" | "Closed";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type SyncState = "Synced" | "Pending" | "Conflict" | "Failed";

export type AlertSeverity = "critical" | "warning" | "resolved";

export type Environment = "Production" | "Demo";

/** Every external system ResolveSync can talk to, plus internal stages. */
export type ConnectorId =
  | "hanaz"
  | "fastn"
  | "validation"
  | "ai"
  | "google-sheets"
  | "discord"
  | "github"
  | "notion"
  | "clickup"
  | "webhook"
  | "email"
  | "resolvesync";

export interface Connector {
  id: ConnectorId;
  label: string;
  /** Short label for dense surfaces such as table cells. */
  short: string;
  /** Hex accent used for the icon tile only — never for large surfaces. */
  tint: string;
}

/* -------------------------------------------------------------------------- */
/* Workflows                                                                   */
/* -------------------------------------------------------------------------- */

export interface WorkflowStep {
  id: string;
  /** 1-based position in the pipeline. */
  index: number;
  name: string;
  connector: ConnectorId;
  status: StepStatus;
  /** Human readable execution time, e.g. "840 ms". */
  duration: string;
  /** Milliseconds — used by the demo-mode trace simulation. */
  durationMs: number;
  description: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: string;
  owner: string;
  connectors: ConnectorId[];
  runsToday: number;
  successRate: number;
  avgDuration: string;
  lastRun: string;
  updatedAt: string;
  steps: WorkflowStep[];
}

/* -------------------------------------------------------------------------- */
/* Runs                                                                        */
/* -------------------------------------------------------------------------- */

export interface RunStep {
  index: number;
  name: string;
  connector: ConnectorId;
  status: StepStatus;
  duration: string;
  error?: string;
}

export interface Run {
  id: string;
  workflowId: string;
  workflowName: string;
  /** The business record this execution acted on, e.g. a complaint id. */
  entity: string;
  duration: string;
  stepsCompleted: number;
  stepsTotal: number;
  result: RunResult;
  startedAt: string;
  ago: string;
  trigger: string;
  steps: RunStep[];
  failureReason?: string;
}

/* -------------------------------------------------------------------------- */
/* Complaints                                                                  */
/* -------------------------------------------------------------------------- */

export interface JourneyEvent {
  id: string;
  label: string;
  detail?: string;
  connector: ConnectorId;
  status: "success" | "warning" | "failed" | "pending";
  timestamp: string;
}

export interface ConnectedRecord {
  connector: ConnectorId;
  label: string;
  reference: string;
  url: string;
  action: string;
}

export interface Complaint {
  id: string;
  customer: string;
  email: string;
  orderRef: string;
  issueType: string;
  priority: Priority;
  status: ComplaintStatus;
  syncState: SyncState;
  createdAgo: string;
  updatedAgo: string;
  createdAt: string;
  source: string;
  channel: string;
  message: string;
  runId: string;
  journey: JourneyEvent[];
  records: ConnectedRecord[];
}

/* -------------------------------------------------------------------------- */
/* Integrations                                                                */
/* -------------------------------------------------------------------------- */

export interface Integration {
  id: ConnectorId;
  name: string;
  category: string;
  health: Health;
  statusLabel: string;
  connectedSince: string;
  lastEvent: string;
  lastEventAt: string;
  workflowsUsing: number;
  workflowNames: string[];
  eventsToday: number;
  errorRate: string;
  account: string;
  scopes: string[];
  endpoint?: string;
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Audit, alerts, activity                                                     */
/* -------------------------------------------------------------------------- */

export type AuditActor = "System" | "ResolveSync" | "ClickUp" | "Admin" | "API";

export interface AuditLogEntry {
  id: string;
  time: string;
  date: string;
  actor: AuditActor;
  actorDetail: string;
  action: string;
  entity: string;
  connector: ConnectorId;
  result: "Success" | "Warning" | "Failed";
  detail: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  workflow: string;
  entity: string;
  connector: ConnectorId;
  ago: string;
  timestamp: string;
  acknowledged: boolean;
  runId?: string;
}

export interface ActivityEvent {
  id: string;
  label: string;
  connector: ConnectorId;
  entity: string;
  ago: string;
  status: "success" | "warning" | "failed";
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                   */
/* -------------------------------------------------------------------------- */

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface StackedPoint {
  label: string;
  success: number;
  failed: number;
}

export interface AnalyticsSummary {
  totalRuns: number;
  successRate: number;
  avgExecutionMs: number;
  complaintsProcessed: number;
  failures: number;
  resolvedComplaints: number;
  runsOverTime: SeriesPoint[];
  successVsFailure: StackedPoint[];
  runsByWorkflow: SeriesPoint[];
  connectorFailures: SeriesPoint[];
  complaintCategories: SeriesPoint[];
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  intent?: "neutral" | "positive" | "negative";
  hint: string;
}
