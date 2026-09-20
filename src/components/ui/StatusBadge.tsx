import { cn } from "@/lib/utils";

export type Tone = "ok" | "warn" | "err" | "info" | "accent" | "neutral" | "muted";

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
  info: "text-info",
  accent: "text-accent",
  neutral: "text-ink",
  muted: "text-faint",
};

const TONE_DOT: Record<Tone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
  info: "bg-info",
  accent: "bg-accent",
  neutral: "bg-muted",
  muted: "bg-faint",
};

const TONE_SURFACE: Record<Tone, string> = {
  ok: "bg-ok/10 border-ok/25",
  warn: "bg-warn/10 border-warn/25",
  err: "bg-err/10 border-err/25",
  info: "bg-info/10 border-info/25",
  accent: "bg-accent/10 border-accent/25",
  neutral: "bg-white/[0.04] border-line",
  muted: "bg-white/[0.03] border-line",
};

/** Maps every status vocabulary in the product onto a single tone scale. */
export function toneFor(value: string): Tone {
  const key = value.toLowerCase();
  switch (key) {
    case "healthy":
    case "success":
    case "connected":
    case "active":
    case "resolved":
    case "synced":
    case "closed":
    case "low":
      return "ok";
    case "degraded":
    case "warning":
    case "delayed":
    case "pending":
    case "partial":
    case "investigating":
    case "medium":
      return "warn";
    case "failed":
    case "error":
    case "conflict":
    case "critical":
    case "disconnected":
      return "err";
    case "running":
    case "live":
    case "open":
    case "high":
      return "info";
    case "waiting":
    case "skipped":
    case "inactive":
    case "paused":
    case "draft":
      return "muted";
    default:
      return "neutral";
  }
}

export function StatusDot({
  tone,
  pulse = false,
  className,
}: {
  tone: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        TONE_DOT[tone],
        pulse && "animate-pulse-dot",
        className,
      )}
    />
  );
}

export function StatusBadge({
  label,
  tone,
  dot = true,
  pulse = false,
  uppercase = false,
  className,
}: {
  label: string;
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  uppercase?: boolean;
  className?: string;
}) {
  const resolved = tone ?? toneFor(label);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-5 font-medium whitespace-nowrap",
        TONE_SURFACE[resolved],
        TONE_TEXT[resolved],
        uppercase && "tracking-[0.06em] uppercase",
        className,
      )}
    >
      {dot ? <StatusDot tone={resolved} pulse={pulse} /> : null}
      {label}
    </span>
  );
}

/** Priority uses the same scale but always renders without a dot. */
export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge label={priority} dot={false} />;
}
