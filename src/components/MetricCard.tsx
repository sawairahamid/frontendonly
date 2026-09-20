import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import type { OverviewMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

const TREND_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

export function MetricCard({ metric }: { metric: OverviewMetric }) {
  const TrendIcon = metric.trend ? TREND_ICON[metric.trend] : null;
  const intent = metric.intent ?? "neutral";

  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3.5 transition-colors duration-150 hover:border-[#31405c]">
      <p className="text-xs font-medium text-muted">{metric.label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[26px] leading-8 font-semibold text-ink tabular">
          {metric.value}
        </span>
        {metric.delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              intent === "positive" && "text-ok",
              intent === "negative" && "text-err",
              intent === "neutral" && "text-muted",
            )}
          >
            {TrendIcon ? <TrendIcon className="size-3.5" strokeWidth={2} /> : null}
            {metric.delta}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-faint">{metric.hint}</p>
    </div>
  );
}
