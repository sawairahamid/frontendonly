/**
 * Single entry point for demo data.
 *
 * Components import from here only. When the backend is wired up, each export
 * below can be swapped for a fetcher with the same return type.
 */
export { mockAlerts } from "./mockAlerts";
export { mockAnalytics } from "./mockAnalytics";
export { mockAuditLogs } from "./mockAuditLogs";
export { getComplaint, mockComplaints } from "./mockComplaints";
export { getIntegration, mockIntegrations } from "./mockIntegrations";
export {
  currentEnvironment,
  currentUser,
  organization,
  overviewMetrics,
  recentActivity,
} from "./mockOverview";
export { getRun, mockRuns } from "./mockRuns";
export { getLocalWorkflows, getWorkflow, mockWorkflows, saveLocalWorkflow } from "./mockWorkflows";
