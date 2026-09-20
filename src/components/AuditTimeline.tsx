import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { connector } from "@/lib/connectors";
import type { JourneyEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE = {
  success: "ok",
  warning: "warn",
  failed: "err",
  pending: "muted",
} as const;

const LABEL = {
  success: "Success",
  warning: "Warning",
  failed: "Failed",
  pending: "Pending",
} as const;

/**
 * Vertical, connector-aware timeline used for the complaint automation journey
 * and anywhere an ordered history of integration events is shown.
 */
export function AuditTimeline({ events }: { events: JourneyEvent[] }) {
  return (
    <ol className="relative">
      {events.map((event, index) => {
        const last = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!last ? (
              <span
                className="absolute top-8 bottom-0 left-4 w-px bg-line"
                aria-hidden
              />
            ) : null}

            <ConnectorIcon id={event.connector} size="md" className="relative z-10 shrink-0" />

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium text-ink">{event.label}</p>
                <StatusBadge label={LABEL[event.status]} tone={TONE[event.status]} dot={false} />
              </div>
              {event.detail ? (
                <p className="mt-0.5 text-[12px] leading-5 text-muted">{event.detail}</p>
              ) : null}
              <p
                className={cn(
                  "mt-1 font-mono text-[11px] text-faint tabular",
                  event.detail ? "" : "mt-0.5",
                )}
              >
                {event.timestamp} · {connector(event.connector).label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
