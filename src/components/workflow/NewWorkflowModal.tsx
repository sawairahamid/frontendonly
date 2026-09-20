"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { CONNECTORS } from "@/lib/connectors";
import type { ConnectorId, Workflow } from "@/lib/types";
import { cn } from "@/lib/utils";

const SELECTABLE: ConnectorId[] = [
  "google-sheets",
  "discord",
  "github",
  "notion",
  "clickup",
  "webhook",
  "email",
];

const TRIGGERS = [
  { label: "FASTN webhook", value: "FASTN webhook · custom.event" },
  { label: "Schedule", value: "Schedule · every 15 minutes" },
  { label: "Manual", value: "Manual · operator run" },
];

export function NewWorkflowModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (workflow: Workflow) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState(TRIGGERS[0].value);
  const [selected, setSelected] = useState<ConnectorId[]>(["webhook"]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: ConnectorId) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const reset = () => {
    setName("");
    setDescription("");
    setTrigger(TRIGGERS[0].value);
    setSelected(["webhook"]);
  };

  const canCreate = name.trim().length > 1 && selected.length > 0;

  const create = () => {
    if (!canCreate) return;
    const id = `wf-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    onCreate({
      id,
      name: name.trim(),
      description: description.trim() || "Draft workflow created in demo mode.",
      status: "draft",
      trigger,
      owner: "Platform Admin",
      connectors: selected,
      runsToday: 0,
      successRate: 0,
      avgDuration: "—",
      lastRun: "Never",
      updatedAt: "Just now",
      steps: selected.map((connector, index) => ({
        id: `${id}-step-${index + 1}`,
        index: index + 1,
        name: CONNECTORS[connector].label,
        connector,
        status: "waiting",
        duration: "—",
        durationMs: 300,
        description: `Placeholder step for ${CONNECTORS[connector].label}.`,
        timestamp: "—",
        input: {},
        output: {},
      })),
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => {
          reset();
          onClose();
        }}
        className="animate-fade-in absolute inset-0 cursor-default bg-black/60"
      />
      <div className="animate-fade-in relative w-full max-w-lg rounded-xl border border-line bg-panel p-5">
        <h2 className="text-[15px] font-semibold text-ink">New workflow</h2>
        <p className="mt-1 text-[13px] text-muted">
          Creates a draft definition in this demo workspace. No connectors are called.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Inventory sync"
              className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="What this automation should do"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Trigger</span>
            <select
              value={trigger}
              onChange={(event) => setTrigger(event.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink outline-none focus:border-accent"
            >
              {TRIGGERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Connected apps</span>
            <div className="flex flex-wrap gap-1.5">
              {SELECTABLE.map((id) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px] transition-colors duration-150",
                      active
                        ? "border-accent/40 bg-accent/10 text-ink"
                        : "border-line bg-canvas text-muted hover:text-ink",
                    )}
                  >
                    <ConnectorIcon id={id} size="sm" />
                    {CONNECTORS[id].short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" disabled={!canCreate} onClick={create}>
            Create draft
          </Button>
        </div>
      </div>
    </div>
  );
}
