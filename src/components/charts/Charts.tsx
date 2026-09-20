import type { SeriesPoint, StackedPoint } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const GRID = "#25324A";

/** Rounds the axis maximum up so gridlines land on readable numbers. */
function axisMax(values: number[]): number {
  const max = Math.max(...values, 1);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
}

export function AreaChart({
  data,
  height = 200,
  unit = "runs",
}: {
  data: SeriesPoint[];
  height?: number;
  unit?: string;
}) {
  const width = 720;
  const padding = { top: 12, right: 8, bottom: 26, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = axisMax(data.map((point) => point.value));

  const x = (index: number) =>
    padding.left + (data.length === 1 ? innerWidth / 2 : (index * innerWidth) / (data.length - 1));
  const y = (value: number) => padding.top + innerHeight - (value / max) * innerHeight;

  const line = data.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${line} ${x(data.length - 1)},${
    padding.top + innerHeight
  }`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${unit} over time`}
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const ty = padding.top + innerHeight - tick * innerHeight;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={ty}
              y2={ty}
              stroke={GRID}
              strokeWidth="1"
            />
            <text x={padding.left - 8} y={ty + 4} textAnchor="end" fill="#64748B" fontSize="11">
              {Math.round(tick * max)}
            </text>
          </g>
        );
      })}

      <polygon points={area} fill="url(#area-fill)" />
      <polyline points={line} fill="none" stroke="#3B82F6" strokeWidth="2" />

      {data.map((point, index) => (
        <g key={point.label}>
          <circle cx={x(index)} cy={y(point.value)} r="3" fill="#0B1020" stroke="#3B82F6" strokeWidth="2" />
          <text x={x(index)} y={height - 8} textAnchor="middle" fill="#64748B" fontSize="11">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function StackedBarChart({ data, height = 200 }: { data: StackedPoint[]; height?: number }) {
  const width = 720;
  const padding = { top: 12, right: 8, bottom: 26, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = axisMax(data.map((point) => point.success + point.failed));
  const slot = innerWidth / data.length;
  const barWidth = Math.min(38, slot * 0.5);
  const ticks = [0, 0.5, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Success versus failure">
      {ticks.map((tick) => {
        const ty = padding.top + innerHeight - tick * innerHeight;
        return (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={ty} y2={ty} stroke={GRID} strokeWidth="1" />
            <text x={padding.left - 8} y={ty + 4} textAnchor="end" fill="#64748B" fontSize="11">
              {Math.round(tick * max)}
            </text>
          </g>
        );
      })}

      {data.map((point, index) => {
        const cx = padding.left + slot * index + slot / 2;
        const successHeight = (point.success / max) * innerHeight;
        const failedHeight = (point.failed / max) * innerHeight;
        const baseY = padding.top + innerHeight;

        return (
          <g key={point.label}>
            <rect
              x={cx - barWidth / 2}
              y={baseY - successHeight}
              width={barWidth}
              height={successHeight}
              fill="#3B82F6"
              opacity="0.85"
              rx="2"
            />
            <rect
              x={cx - barWidth / 2}
              y={baseY - successHeight - failedHeight}
              width={barWidth}
              height={failedHeight}
              fill="#EF4444"
              rx="2"
            />
            <text x={cx} y={height - 8} textAnchor="middle" fill="#64748B" fontSize="11">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function BarList({
  data,
  tone = "accent",
  valueSuffix = "",
}: {
  data: SeriesPoint[];
  tone?: "accent" | "err";
  valueSuffix?: string;
}) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <ul className="space-y-2.5">
      {data.map((point) => (
        <li key={point.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-ink">{point.label}</span>
            <span className="shrink-0 text-[12px] text-muted tabular">
              {formatNumber(point.value)}
              {valueSuffix}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-raised">
            <div
              className={cn("h-full rounded-full", tone === "err" ? "bg-err/70" : "bg-accent/80")}
              style={{ width: `${Math.max((point.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const DONUT_COLORS = ["#3B82F6", "#6366F1", "#06B6D4", "#22C55E", "#F59E0B"];

export function DonutChart({ data }: { data: SeriesPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="size-[140px] shrink-0" role="img" aria-label="Complaint categories">
        <circle cx="70" cy="70" r={radius} fill="none" stroke={GRID} strokeWidth="16" />
        {data.map((point, index) => {
          const length = (point.value / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const element = (
            <circle
              key={point.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += length;
          return element;
        })}
        <text x="70" y="66" textAnchor="middle" fill="#F3F6FB" fontSize="20" fontWeight="600">
          {formatNumber(total)}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#64748B" fontSize="11">
          complaints
        </text>
      </svg>

      <ul className="w-full flex-1 space-y-2">
        {data.map((point, index) => (
          <li key={point.label} className="flex items-center gap-2.5">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="flex-1 truncate text-[13px] text-ink">{point.label}</span>
            <span className="text-[12px] text-muted tabular">{formatNumber(point.value)}</span>
            <span className="w-10 text-right text-[12px] text-faint tabular">
              {((point.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
