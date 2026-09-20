import { LocalWorkflowDetail } from "@/components/workflow/LocalWorkflowDetail";
import { WorkflowDetailView } from "@/components/workflow/WorkflowDetailView";
import { getWorkflow, mockRuns, mockWorkflows } from "@/data";

export function generateStaticParams() {
  return mockWorkflows.map((workflow) => ({ id: workflow.id }));
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);

  if (!workflow) {
    return <LocalWorkflowDetail id={id} />;
  }

  const runs = mockRuns.filter((run) => run.workflowId === workflow.id);

  return <WorkflowDetailView workflow={workflow} runs={runs} />;
}
