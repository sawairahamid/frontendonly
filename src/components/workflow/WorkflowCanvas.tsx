"use client";

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import type { ConnectorId, StepStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface CanvasNode {
  id: string;
  index?: number;
  name: string;
  connector: ConnectorId;
  status: StepStatus;
  duration?: string;
}

/**
 * Renders the pipeline as a wrapping left-to-right chain. Nodes keep a fixed
 * width so the chain stays readable when it wraps onto a second row.
 */
export function WorkflowCanvas({
  nodes,
  compact = false,
  selectedId,
  onSelect,
  className,
}: {
  nodes: CanvasNode[];
  compact?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-stretch gap-y-3", className)}>
      {nodes.map((node, index) => (
        <Fragment key={node.id}>
          <WorkflowNode
            index={node.index ?? index + 1}
            name={node.name}
            connectorId={node.connector}
            status={node.status}
            duration={node.duration}
            compact={compact}
            selected={selectedId === node.id}
            onClick={onSelect ? () => onSelect(node.id) : undefined}
          />
          {index < nodes.length - 1 ? (
            <span
              className="flex w-6 shrink-0 items-center justify-center text-faint"
              aria-hidden
            >
              <ChevronRight className={compact ? "size-3.5" : "size-4"} strokeWidth={2} />
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
