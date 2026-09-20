import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusDot } from "@/components/ui/StatusBadge";
import type { ActivityEvent } from "@/lib/types";

const TONE = {
  success: "ok",
  warning: "warn",
  failed: "err",
} as const;

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ul className="divide-y divide-line">
      {events.map((event) => (
        <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
          <ConnectorIcon id={event.connector} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-ink">{event.label}</p>
            <p className="truncate font-mono text-[11px] text-faint">{event.entity}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusDot tone={TONE[event.status]} />
            <span className="text-[11px] whitespace-nowrap text-faint tabular">{event.ago}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
