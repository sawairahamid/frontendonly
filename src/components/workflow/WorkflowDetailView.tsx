"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Pause, Play, Radio, ScrollText, Square } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge, StatusDot } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { StepDetailsDrawer } from "@/components/drawers/StepDetailsDrawer";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { connector } from "@/lib/connectors";
import type { Run, StepStatus, Workflow } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LogLine {
  id: number;
  time: string;
  text: string;
  tone: "info" | "ok" | "warn" | "err" | "muted";
}

const LOG_TONE = {
  info: "text-info",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
  muted: "text-faint",
} as const;

const STATUS_LABEL: Record<StepStatus, string> = {
  waiting: "Waiting",
  running: "Running",
  success: "Success",
  warning: "Warning",
  failed: "Failed",
  skipped: "Skipped",
};

/** Keeps every simulated step visible without making the demo drag. */
function scaledDuration(ms: number): number {
  return Math.min(Math.max(ms, 220), 900);
}

export function WorkflowDetailView({
  workflow,
  runs,
}: {
  workflow: Workflow;
  runs: Run[];
}) {
  const [paused, setPaused] = useState(workflow.status === "paused");
  const [confirmPause, setConfirmPause] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [tracing, setTracing] = useState(false);
  const [traceStatuses, setTraceStatuses] = useState<Record<string, StepStatus> | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const timers = useRef<number[]>([]);
  const logId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const appendLog = useCallback((text: string, tone: LogLine["tone"]) => {
    logId.current += 1;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds(),
    ).padStart(2, "0")}`;
    setLog((current) => [...current.slice(-80), { id: logId.current, time, text, tone }]);
  }, []);

  const stopTrace = useCallback(() => {
    clearTimers();
    setTracing(false);
    appendLog("Trace stopped by operator.", "muted");
  }, [appendLog, clearTimers]);

  const startTrace = useCallback(
    (mode: "live" | "test") => {
      clearTimers();
      setTracing(true);
      setLog([]);
      logId.current = 0;
      setTraceStatuses(
        Object.fromEntries(workflow.steps.map((step) => [step.id, "waiting" as StepStatus])),
      );
      appendLog(
        mode === "test"
          ? `Test run started · ${workflow.name} (no external calls)`
          : `Live trace started · ${workflow.name}`,
        "info",
      );

      let elapsed = 260;

      workflow.steps.forEach((step) => {
        const duration = scaledDuration(step.durationMs || 300);

        timers.current.push(
          window.setTimeout(() => {
            setTraceStatuses((current) => ({ ...current, [step.id]: "running" }));
            appendLog(
              `[${step.index}/${workflow.steps.length}] ${step.name} → ${connector(step.connector).label}`,
              "muted",
            );
          }, elapsed),
        );

        elapsed += duration;

        timers.current.push(
          window.setTimeout(() => {
            const finalStatus: StepStatus = step.status === "skipped" ? "success" : step.status;
            setTraceStatuses((current) => ({ ...current, [step.id]: finalStatus }));
            appendLog(
              finalStatus === "warning"
                ? `[${step.index}/${workflow.steps.length}] ${step.name} completed with warning · ${step.duration}`
                : `[${step.index}/${workflow.steps.length}] ${step.name} ${finalStatus} · ${step.duration}`,
              finalStatus === "warning" ? "warn" : finalStatus === "failed" ? "err" : "ok",
            );
          }, elapsed),
        );

        elapsed += 140;
      });

      timers.current.push(
        window.setTimeout(() => {
          setTracing(false);
          appendLog(
            `Run finished · ${workflow.steps.length}/${workflow.steps.length} steps · ${workflow.avgDuration}`,
            "ok",
          );
        }, elapsed + 200),
      );
    },
    [appendLog, clearTimers, workflow],
  );

  const nodes = useMemo(
    () =>
      workflow.steps.map((step) => ({
        id: step.id,
        index: step.index,
        name: step.name,
        connector: step.connector,
        status: traceStatuses?.[step.id] ?? step.status,
        duration: step.duration,
      })),
    [workflow.steps, traceStatuses],
  );

  const selectedStep = workflow.steps.find((step) => step.id === selectedStepId) ?? null;
  const completed = nodes.filter((node) => node.status === "success" || node.status === "warning").length;

  return (
    <>
      <PageHeader
        backHref="/admin/workflows"
        breadcrumbs={[{ label: "Workflows", href: "/admin/workflows" }, { label: workflow.name }]}
        title={workflow.name}
        subtitle={workflow.description}
        meta={
          <>
            <StatusBadge
              label={paused ? "PAUSED" : workflow.status === "draft" ? "DRAFT" : "ACTIVE"}
              tone={paused || workflow.status === "draft" ? "muted" : "ok"}
              pulse={!paused && workflow.status !== "draft"}
              uppercase
            />
            <span className="font-mono text-[11px] text-faint">{workflow.trigger}</span>
            <span className="text-[11px] text-muted">Owner · {workflow.owner}</span>
            <span className="text-[11px] text-muted tabular">Last run {workflow.lastRun}</span>
          </>
        }
        actions={
          <>
            <Button
              icon={paused ? Play : Pause}
              variant="secondary"
              onClick={() => setConfirmPause(true)}
            >
              {paused ? "Resume Workflow" : "Pause Workflow"}
            </Button>
            <Button
              icon={FlaskConical}
              variant="secondary"
              disabled={tracing}
              onClick={() => startTrace("test")}
            >
              Run Test
            </Button>
            <Link href="/admin/runs">
              <Button icon={ScrollText} variant="secondary">
                View Logs
              </Button>
            </Link>
            <Button
              icon={tracing ? Square : Radio}
              variant="primary"
              onClick={() => (tracing ? stopTrace() : startTrace("live"))}
            >
              {tracing ? "Stop Trace" : "Live Trace"}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Pipeline"
          subtitle="Select any step to inspect its input, output and timing."
          actions={
            <span className="text-[12px] text-muted tabular">
              {completed}/{workflow.steps.length} steps
            </span>
          }
        />
        <div className="scroll-thin overflow-x-auto p-4">
          <WorkflowCanvas
            nodes={nodes}
            selectedId={selectedStepId ?? undefined}
            onSelect={setSelectedStepId}
            className="min-w-max"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-4 py-2.5 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <StatusDot tone={tracing ? "info" : paused ? "muted" : "ok"} pulse={tracing || !paused} />
            {tracing ? "Executing" : paused ? "Paused" : "Live"}
          </span>
          <span>
            Success rate <span className="text-ink tabular">{workflow.successRate}%</span>
          </span>
          <span>
            Avg duration <span className="text-ink tabular">{workflow.avgDuration}</span>
          </span>
          <span>
            Runs today <span className="text-ink tabular">{workflow.runsToday}</span>
          </span>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Trace console"
            subtitle="Demo mode · simulated execution, no external calls are made"
            actions={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px]",
                  tracing ? "text-info" : "text-faint",
                )}
              >
                <StatusDot tone={tracing ? "info" : "muted"} pulse={tracing} />
                {tracing ? "Streaming" : "Idle"}
              </span>
            }
          />
          <div
            ref={logRef}
            className="scroll-thin h-64 overflow-y-auto bg-canvas p-3 font-mono text-[12px] leading-6"
          >
            {log.length === 0 ? (
              <p className="text-faint">
                No active trace. Press{" "}
                <span className="text-accent">Live Trace</span> to replay this workflow step by
                step.
              </p>
            ) : (
              log.map((line) => (
                <div key={line.id} className="flex gap-3">
                  <span className="shrink-0 text-faint tabular">{line.time}</span>
                  <span className={LOG_TONE[line.tone]}>{line.text}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Configuration" />
          <dl className="divide-y divide-line">
            {[
              { label: "Trigger", value: workflow.trigger },
              { label: "Owner", value: workflow.owner },
              { label: "Environment", value: "Demo workspace" },
              { label: "Retry policy", value: "2 attempts · exponential backoff" },
              { label: "Timeout", value: "30 s per step" },
              { label: "Last updated", value: workflow.updatedAt },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                <dt className="text-[12px] text-muted">{item.label}</dt>
                <dd className="truncate text-right text-[12px] text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
              Connected apps
            </p>
            <div className="flex flex-wrap gap-1.5">
              {workflow.connectors.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-1.5 py-1 text-[11px] text-muted"
                >
                  <ConnectorIcon id={id} size="sm" />
                  {connector(id).short}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Steps" subtitle="Definition order with last recorded execution" />
          <ul className="divide-y divide-line">
            {workflow.steps.map((step) => {
              const status = traceStatuses?.[step.id] ?? step.status;

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStepId(step.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.025]"
                  >
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-line bg-canvas font-mono text-[10px] text-faint">
                      {step.index}
                    </span>
                    <ConnectorIcon id={step.connector} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">{step.name}</span>
                      <span className="block truncate text-[11px] text-faint">
                        {step.description}
                      </span>
                    </span>
                    <span className="hidden font-mono text-[11px] text-faint tabular sm:block">
                      {step.duration}
                    </span>
                    <StatusBadge label={STATUS_LABEL[status]} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Recent runs"
            actions={
              <Link
                href="/admin/runs"
                className="text-[12px] font-medium text-accent transition-colors duration-150 hover:text-ink"
              >
                All runs
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {runs.slice(0, 6).map((run) => (
              <li key={run.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] text-ink">{run.id}</p>
                  <p className="truncate text-[11px] text-faint">
                    {run.entity} · {run.duration}
                  </p>
                </div>
                <StatusBadge
                  label={run.result === "partial" ? "Partial" : run.result === "failed" ? "Failed" : "Success"}
                />
                <span className="shrink-0 text-[11px] text-faint tabular">{run.ago}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <StepDetailsDrawer
        step={selectedStep}
        status={selectedStep ? traceStatuses?.[selectedStep.id] : undefined}
        open={selectedStep !== null}
        onClose={() => setSelectedStepId(null)}
      />

      <ConfirmModal
        open={confirmPause}
        tone={paused ? "default" : "danger"}
        title={paused ? `Resume ${workflow.name}?` : `Pause ${workflow.name}?`}
        description={
          paused
            ? "Queued trigger events will start executing again from the next event."
            : "New trigger events will be queued instead of executed. In-flight runs finish normally."
        }
        confirmLabel={paused ? "Resume workflow" : "Pause workflow"}
        onCancel={() => setConfirmPause(false)}
        onConfirm={() => {
          setPaused((current) => !current);
          setConfirmPause(false);
          notify({
            title: paused ? `${workflow.name} resumed` : `${workflow.name} paused`,
            tone: "info",
          });
        }}
      />
    </>
  );
}
