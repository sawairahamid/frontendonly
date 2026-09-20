"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Drawer, DrawerSection, JsonPreview, KeyValue } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { connector } from "@/lib/connectors";
import type { StepStatus, WorkflowStep } from "@/lib/types";
import { toJson } from "@/lib/utils";

const STATUS_LABEL: Record<StepStatus, string> = {
  waiting: "Waiting",
  running: "Running",
  success: "Success",
  warning: "Warning",
  failed: "Failed",
  skipped: "Skipped",
};

export function StepDetailsDrawer({
  step,
  status,
  open,
  onClose,
}: {
  step: WorkflowStep | null;
  /** Live-trace status overrides the stored status while a demo run plays. */
  status?: StepStatus;
  open: boolean;
  onClose: () => void;
}) {
  const { notify } = useToast();
  if (!step) return null;

  const effectiveStatus = status ?? step.status;
  const meta = connector(step.connector);
  const showError = effectiveStatus === "warning" || effectiveStatus === "failed";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Step ${step.index} · ${step.name}`}
      subtitle={meta.label}
      headerRight={<StatusBadge label={STATUS_LABEL[effectiveStatus]} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(
                toJson({ input: step.input, output: step.output }),
              );
              notify({ title: "Payload copied", tone: "ok" });
            }}
          >
            Copy payload
          </Button>
        </>
      }
    >
      <DrawerSection>
        <p className="text-[13px] leading-5 text-muted">{step.description}</p>
      </DrawerSection>

      <DrawerSection title="Execution">
        <KeyValue
          items={[
            { label: "Status", value: STATUS_LABEL[effectiveStatus] },
            { label: "Execution time", value: step.duration },
            { label: "Timestamp", value: step.timestamp },
            { label: "Connector", value: meta.label },
          ]}
        />
      </DrawerSection>

      {showError && step.error ? (
        <DrawerSection title="Message">
          <div className="flex gap-2.5 rounded-lg border border-warn/25 bg-warn/[0.07] p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" strokeWidth={1.75} />
            <p className="text-[12px] leading-5 text-ink">{step.error}</p>
          </div>
        </DrawerSection>
      ) : null}

      <DrawerSection title="Payload">
        <div className="space-y-3">
          <JsonPreview label="Input" value={step.input} />
          <JsonPreview label="Output" value={step.output} />
        </div>
      </DrawerSection>
    </Drawer>
  );
}
