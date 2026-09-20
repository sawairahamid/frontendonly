"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CircleSlash, RotateCw, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Drawer, DrawerSection, KeyValue } from "@/components/ui/Drawer";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import type { Run, RunStep, StepStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const RESULT_LABEL = {
  success: "Success",
  failed: "Failed",
  partial: "Partial",
  running: "Running",
} as const;

function StepMark({ status }: { status: StepStatus }) {
  if (status === "success") {
    return <Check className="size-3.5 text-ok" strokeWidth={2.5} />;
  }
  if (status === "warning") {
    return <TriangleAlert className="size-3.5 text-warn" strokeWidth={2} />;
  }
  if (status === "failed") {
    return <X className="size-3.5 text-err" strokeWidth={2.5} />;
  }
  if (status === "skipped") {
    return <CircleSlash className="size-3.5 text-faint" strokeWidth={2} />;
  }
  return <span className="inline-block size-1.5 rounded-full bg-faint" />;
}

export function RunDetailsDrawer({
  run,
  open,
  onClose,
}: {
  run: Run | null;
  open: boolean;
  onClose: () => void;
}) {
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retried, setRetried] = useState<string[]>([]);
  const { notify } = useToast();

  useEffect(() => {
    if (!open) {
      setRetrying(null);
      setRetried([]);
    }
  }, [open]);

  if (!run) return null;

  // Demo-mode only: simulates the request round-trip so the button has feedback.
  const retry = (key: string) => {
    setRetrying(key);
    window.setTimeout(() => {
      setRetrying(null);
      setRetried((current) => [...current, key]);
      notify({
        title: key === "run" ? "Run queued for retry" : "Step queued for retry",
        detail: "Demo mode — the original execution was not replayed against live connectors.",
        tone: "ok",
      });
    }, 900);
  };

  const failedStep = run.steps.find((step) => step.status === "failed");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={run.id}
      subtitle={`${run.workflowName} · ${run.startedAt}`}
      headerRight={<StatusBadge label={RESULT_LABEL[run.result]} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            icon={RotateCw}
            disabled={retrying === "run"}
            onClick={() => retry("run")}
          >
            {retried.includes("run") ? "Run queued" : retrying === "run" ? "Retrying…" : "Retry Run"}
          </Button>
        </>
      }
    >
      <DrawerSection title="Summary">
        <KeyValue
          items={[
            { label: "Workflow", value: run.workflowName },
            { label: "Entity", value: <span className="font-mono">{run.entity}</span> },
            { label: "Duration", value: run.duration },
            { label: "Steps", value: `${run.stepsCompleted}/${run.stepsTotal}` },
            { label: "Trigger", value: run.trigger },
            { label: "Started", value: run.startedAt },
          ]}
        />
      </DrawerSection>

      {run.failureReason ? (
        <DrawerSection title="Failure">
          <div className="flex gap-2.5 rounded-lg border border-err/25 bg-err/[0.07] p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-err" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-medium text-ink">{run.failureReason}</p>
              {failedStep?.error ? (
                <p className="mt-1 text-[12px] leading-5 text-muted">{failedStep.error}</p>
              ) : null}
            </div>
          </div>
        </DrawerSection>
      ) : null}

      <DrawerSection title="Steps">
        <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {run.steps.map((step: RunStep) => {
            const key = `step-${step.index}`;
            const canRetry = step.status === "failed" || step.status === "skipped";

            return (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5",
                  step.status === "failed" && "bg-err/[0.05]",
                  step.status === "warning" && "bg-warn/[0.04]",
                )}
              >
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-line bg-canvas font-mono text-[10px] text-faint">
                  {step.index}
                </span>
                <ConnectorIcon id={step.connector} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{step.name}</p>
                  {step.error ? (
                    <p className="truncate text-[11px] text-muted">{step.error}</p>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] text-faint tabular">{step.duration}</span>
                <StepMark status={step.status} />
                {canRetry ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={retrying === key || retried.includes(key)}
                    onClick={() => retry(key)}
                  >
                    {retried.includes(key)
                      ? "Queued"
                      : retrying === key
                        ? "Retrying…"
                        : "Retry Step"}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ol>
      </DrawerSection>

      <DrawerSection title="Related">
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/workflows/${run.workflowId}`}>
            <Button size="sm" variant="secondary">
              Open workflow
            </Button>
          </Link>
          {run.entity.startsWith("HZ-") ? (
            <Link href={`/admin/complaints/${run.entity}`}>
              <Button size="sm" variant="secondary">
                Open complaint {run.entity}
              </Button>
            </Link>
          ) : null}
        </div>
      </DrawerSection>
    </Drawer>
  );
}
