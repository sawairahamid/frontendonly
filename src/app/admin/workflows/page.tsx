"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Workflow as WorkflowIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";
import { NewWorkflowModal } from "@/components/workflow/NewWorkflowModal";
import { WorkflowCard } from "@/components/workflow/WorkflowCard";
import { mockWorkflows, getLocalWorkflows, saveLocalWorkflow } from "@/data";
import type { Workflow } from "@/lib/types";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft", value: "draft" },
];

export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-panel p-6 text-[13px] text-muted">
          Loading workflows…
        </div>
      }
    >
      <WorkflowsPageInner />
    </Suspense>
  );
}

function WorkflowsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [pendingToggle, setPendingToggle] = useState<Workflow | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Workflow["status"]>>({});
  const [created, setCreated] = useState<Workflow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setCreated(getLocalWorkflows());
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const workflows = useMemo(
    () =>
      [...created, ...mockWorkflows].map((workflow) => ({
        ...workflow,
        status: overrides[workflow.id] ?? workflow.status,
      })),
    [overrides, created],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return workflows.filter((workflow) => {
      const matchesStatus = status === "all" || workflow.status === status;
      const matchesQuery =
        term.length === 0 ||
        workflow.name.toLowerCase().includes(term) ||
        workflow.description.toLowerCase().includes(term) ||
        workflow.owner.toLowerCase().includes(term);
      return matchesStatus && matchesQuery;
    });
  }, [workflows, query, status]);

  const activeCount = workflows.filter((workflow) => workflow.status === "active").length;
  const pausedCount = workflows.filter((workflow) => workflow.status === "paused").length;
  const draftCount = workflows.filter((workflow) => workflow.status === "draft").length;

  return (
    <>
      <PageHeader
        title="Workflows"
        subtitle="Create, monitor and manage automation workflows."
        actions={
          <>
            <Button variant="secondary">Import definition</Button>
            <Button icon={Plus} variant="primary" onClick={() => setCreateOpen(true)}>
              New Workflow
            </Button>
          </>
        }
        meta={
          <span className="text-[12px] text-muted tabular">
            {activeCount} active · {pausedCount} paused
            {draftCount ? ` · ${draftCount} draft` : ""} ·{" "}
            {workflows.reduce((sum, workflow) => sum + workflow.runsToday, 0).toLocaleString("en-US")}{" "}
            runs today
          </span>
        }
      />

      <Card>
        <FilterBar
          search={{
            value: query,
            onChange: setQuery,
            placeholder: "Search workflows, owners",
          }}
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: setStatus,
            },
          ]}
          resultCount={`${filtered.length} of ${workflows.length}`}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={WorkflowIcon}
            title="No workflows match these filters"
            description="Adjust the search term or status filter to see more automation workflows."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-3 p-3">
            {filtered.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onToggle={setPendingToggle}
              />
            ))}
          </div>
        )}
      </Card>

      <NewWorkflowModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          if (searchParams.get("create") === "1") {
            router.replace("/admin/workflows");
          }
        }}
        onCreate={(workflow) => {
          saveLocalWorkflow(workflow);
          setCreated((current) => [workflow, ...current]);
          notify({
            title: `${workflow.name} created`,
            detail: "Draft saved in this demo session. It is not connected to live connectors.",
            tone: "ok",
          });
        }}
      />

      <ConfirmModal
        open={pendingToggle !== null}
        tone={pendingToggle?.status === "active" ? "danger" : "default"}
        title={
          pendingToggle?.status === "active"
            ? `Pause ${pendingToggle?.name}?`
            : pendingToggle?.status === "draft"
              ? `Activate ${pendingToggle?.name}?`
              : `Resume ${pendingToggle?.name}?`
        }
        description={
          pendingToggle?.status === "active"
            ? "New trigger events will be queued instead of executed. In-flight runs finish normally."
            : "Queued trigger events will start executing again from the next event."
        }
        confirmLabel={
          pendingToggle?.status === "active"
            ? "Pause workflow"
            : pendingToggle?.status === "draft"
              ? "Activate workflow"
              : "Resume workflow"
        }
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          if (pendingToggle) {
            setOverrides((current) => ({
              ...current,
              [pendingToggle.id]: pendingToggle.status === "active" ? "paused" : "active",
            }));
            notify({
              title:
                pendingToggle.status === "active"
                  ? `${pendingToggle.name} paused`
                  : `${pendingToggle.name} ${pendingToggle.status === "draft" ? "activated" : "resumed"}`,
              tone: "info",
            });
          }
          setPendingToggle(null);
        }}
      />
    </>
  );
}
