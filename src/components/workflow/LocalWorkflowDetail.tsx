"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { WorkflowDetailView } from "@/components/workflow/WorkflowDetailView";
import { getLocalWorkflows } from "@/data";
import type { Workflow } from "@/lib/types";

export function LocalWorkflowDetail({ id }: { id: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null | undefined>(undefined);

  useEffect(() => {
    setWorkflow(getLocalWorkflows().find((item) => item.id === id) ?? null);
  }, [id]);

  if (workflow === undefined) {
    return (
      <div className="grid gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!workflow) notFound();

  return <WorkflowDetailView workflow={workflow} runs={[]} />;
}
