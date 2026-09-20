import {
  Activity,
  ChartColumn,
  Inbox,
  LayoutDashboard,
  Plug,
  ScrollText,
  Settings,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Small count rendered on the right of the nav row. */
  badge?: string;
  badgeTone?: "warn" | "err" | "neutral";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Monitor",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Workflows", href: "/admin/workflows", icon: Workflow },
      { label: "Complaints", href: "/admin/complaints", icon: Inbox },
      { label: "Integrations", href: "/admin/integrations", icon: Plug, badge: "1", badgeTone: "warn" },
    ],
  },
  {
    label: "Observe",
    items: [
      { label: "Runs", href: "/admin/runs", icon: Activity },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "Alerts", href: "/admin/alerts", icon: TriangleAlert, badge: "3", badgeTone: "err" },
      { label: "Analytics", href: "/admin/analytics", icon: ChartColumn },
    ],
  },
  {
    label: "Configure",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

/** Page titles shown in the topbar, keyed by route prefix (longest match wins). */
export const routeTitles: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin/workflows", title: "Workflows" },
  { prefix: "/admin/complaints", title: "Complaints" },
  { prefix: "/admin/integrations", title: "Integrations" },
  { prefix: "/admin/runs", title: "Runs" },
  { prefix: "/admin/audit-logs", title: "Audit Logs" },
  { prefix: "/admin/alerts", title: "Alerts" },
  { prefix: "/admin/analytics", title: "Analytics" },
  { prefix: "/admin/settings", title: "Settings" },
  { prefix: "/admin", title: "Overview" },
];

export function titleForPath(pathname: string): string {
  return routeTitles.find((entry) => pathname.startsWith(entry.prefix))?.title ?? "Overview";
}
