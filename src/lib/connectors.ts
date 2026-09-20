import {
  Cpu,
  GitBranch,
  Mail,
  MessageSquare,
  NotebookText,
  Route,
  Sheet,
  ShieldCheck,
  ShoppingBag,
  SquareKanban,
  Waypoints,
  Webhook,
  type LucideIcon,
} from "lucide-react";

import type { ConnectorId } from "@/lib/types";

interface ConnectorMeta {
  label: string;
  short: string;
  icon: LucideIcon;
  /** Tint is used only on the small icon tile, never on large surfaces. */
  tint: string;
}

export const CONNECTORS: Record<ConnectorId, ConnectorMeta> = {
  hanaz: { label: "Hanaz Website", short: "Hanaz", icon: ShoppingBag, tint: "#38BDF8" },
  fastn: { label: "FASTN", short: "FASTN", icon: Waypoints, tint: "#3B82F6" },
  validation: { label: "Validation", short: "Validation", icon: ShieldCheck, tint: "#22C55E" },
  ai: { label: "AI Classification", short: "AI", icon: Cpu, tint: "#6366F1" },
  "google-sheets": { label: "Google Sheets", short: "Sheets", icon: Sheet, tint: "#22C55E" },
  discord: { label: "Discord", short: "Discord", icon: MessageSquare, tint: "#818CF8" },
  github: { label: "GitHub", short: "GitHub", icon: GitBranch, tint: "#94A3B8" },
  notion: { label: "Notion", short: "Notion", icon: NotebookText, tint: "#E2E8F0" },
  clickup: { label: "ClickUp", short: "ClickUp", icon: SquareKanban, tint: "#F59E0B" },
  webhook: { label: "Webhook / API", short: "Webhook", icon: Webhook, tint: "#06B6D4" },
  email: { label: "Email", short: "Email", icon: Mail, tint: "#38BDF8" },
  resolvesync: { label: "ResolveSync", short: "ResolveSync", icon: Route, tint: "#3B82F6" },
};

export function connector(id: ConnectorId): ConnectorMeta {
  return CONNECTORS[id] ?? CONNECTORS.resolvesync;
}
