import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { AuditTimeline } from "@/components/AuditTimeline";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getComplaint, mockComplaints } from "@/data";

export function generateStaticParams() {
  return mockComplaints.map((complaint) => ({ id: complaint.id }));
}

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = getComplaint(id);

  if (!complaint) notFound();

  const facts = [
    { label: "Customer", value: complaint.customer },
    { label: "Email", value: complaint.email },
    { label: "Order reference", value: complaint.orderRef, mono: true },
    { label: "Category", value: complaint.issueType },
    { label: "Source", value: complaint.source },
    { label: "Channel", value: complaint.channel },
    { label: "Created", value: complaint.createdAt },
    { label: "Last update", value: complaint.updatedAgo },
  ];

  return (
    <>
      <PageHeader
        backHref="/admin/complaints"
        breadcrumbs={[
          { label: "Complaints", href: "/admin/complaints" },
          { label: complaint.id },
        ]}
        title={`Complaint ${complaint.id}`}
        subtitle={`${complaint.issueType} reported by ${complaint.customer} from the Hanaz website.`}
        meta={
          <>
            <StatusBadge label={complaint.status} />
            <StatusBadge label={complaint.priority} dot={false} />
            <StatusBadge label={complaint.syncState} />
            <Link
              href="/admin/runs"
              className="font-mono text-[11px] text-accent transition-colors duration-150 hover:text-ink"
            >
              {complaint.runId}
            </Link>
          </>
        }
        actions={
          <>
            <Button variant="secondary">Reassign</Button>
            <Button variant="secondary">Resync systems</Button>
            <Button variant="primary">Mark Resolved</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Complaint" subtitle={`Submitted ${complaint.createdAt}`} />
            <CardBody>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[11px] text-faint">{fact.label}</dt>
                    <dd
                      className={
                        fact.mono
                          ? "truncate font-mono text-[12px] text-ink"
                          : "truncate text-[13px] text-ink"
                      }
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 rounded-lg border border-line bg-canvas p-3.5 text-[13px] leading-6 text-muted">
                {complaint.message}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Automation Journey"
              subtitle="Every action ResolveSync took across connected systems"
              actions={
                <span className="text-[12px] text-muted tabular">
                  {complaint.journey.length} events
                </span>
              }
            />
            <CardBody>
              <AuditTimeline events={complaint.journey} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Connected Records"
              subtitle="Same complaint, every system"
            />
            <ul className="divide-y divide-line">
              {complaint.records.map((record) => (
                <li key={record.connector} className="flex items-center gap-3 px-4 py-3">
                  <ConnectorIcon id={record.connector} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">{record.label}</p>
                    <p className="truncate font-mono text-[11px] text-faint">
                      {record.reference}
                    </p>
                  </div>
                  <a
                    href={record.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line bg-raised px-2 py-1 text-[12px] text-muted transition-colors duration-150 hover:border-[#31405c] hover:text-ink"
                  >
                    {record.action}
                    <ExternalLink className="size-3" strokeWidth={1.75} />
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Sync status" />
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">Overall</span>
                <StatusBadge label={complaint.syncState} />
              </div>
              <p className="text-[12px] leading-5 text-faint">
                {complaint.syncState === "Synced"
                  ? "All connected systems report the same status. The last inbound update came from ClickUp."
                  : complaint.syncState === "Conflict"
                    ? "A connected system reported a status that conflicts with the local record. Resolve the conflict before the next sync."
                    : complaint.syncState === "Failed"
                      ? "One or more systems could not be updated. Retry the failed run to restore consistency."
                      : "A sync is in progress. Systems will converge once the pending step completes."}
              </p>
              <Link href={`/admin/runs`}>
                <Button size="sm" variant="secondary" className="w-full">
                  Inspect run {complaint.runId}
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
