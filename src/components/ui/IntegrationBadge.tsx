import { connector } from "@/lib/connectors";
import type { ConnectorId } from "@/lib/types";
import { cn } from "@/lib/utils";

const TILE_SIZES = {
  sm: "size-6 rounded-md",
  md: "size-8 rounded-lg",
  lg: "size-10 rounded-lg",
} as const;

const ICON_SIZES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

export function ConnectorIcon({
  id,
  size = "md",
  className,
}: {
  id: ConnectorId;
  size?: keyof typeof TILE_SIZES;
  className?: string;
}) {
  const meta = connector(id);
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border border-line bg-raised",
        TILE_SIZES[size],
        className,
      )}
      aria-hidden
    >
      <Icon className={ICON_SIZES[size]} strokeWidth={1.75} style={{ color: meta.tint }} />
    </span>
  );
}

export function IntegrationBadge({
  id,
  size = "md",
  showLabel = true,
  subtitle,
  className,
}: {
  id: ConnectorId;
  size?: keyof typeof TILE_SIZES;
  showLabel?: boolean;
  subtitle?: string;
  className?: string;
}) {
  const meta = connector(id);

  return (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <ConnectorIcon id={id} size={size} />
      {showLabel ? (
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink">
            {meta.label}
          </span>
          {subtitle ? (
            <span className="block truncate text-xs text-muted">{subtitle}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
