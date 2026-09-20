"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";

import { ComplaintDetailsDrawer } from "@/components/drawers/ComplaintDetailsDrawer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockComplaints } from "@/data";
import type { Complaint } from "@/lib/types";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "Open" },
  { label: "Investigating", value: "Investigating" },
  { label: "Resolved", value: "Resolved" },
  { label: "Closed", value: "Closed" },
];

const PRIORITY_OPTIONS = [
  { label: "All priorities", value: "all" },
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const SYNC_OPTIONS = [
  { label: "All sync states", value: "all" },
  { label: "Synced", value: "Synced" },
  { label: "Pending", value: "Pending" },
  { label: "Conflict", value: "Conflict" },
  { label: "Failed", value: "Failed" },
];

export default function ComplaintsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sync, setSync] = useState("all");
  const [preview, setPreview] = useState<Complaint | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return mockComplaints.filter((complaint) => {
      const matchesTerm =
        term.length === 0 ||
        complaint.id.toLowerCase().includes(term) ||
        complaint.customer.toLowerCase().includes(term) ||
        complaint.issueType.toLowerCase().includes(term) ||
        complaint.orderRef.toLowerCase().includes(term);

      return (
        matchesTerm &&
        (status === "all" || complaint.status === status) &&
        (priority === "all" || complaint.priority === priority) &&
        (sync === "all" || complaint.syncState === sync)
      );
    });
  }, [query, status, priority, sync]);

  const columns: Array<Column<Complaint>> = [
    {
      key: "id",
      header: "Complaint ID",
      width: "116px",
      render: (complaint) => (
        <span className="font-mono text-[12px] text-ink">{complaint.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (complaint) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">{complaint.customer}</p>
          <p className="truncate font-mono text-[11px] text-faint">{complaint.orderRef}</p>
        </div>
      ),
    },
    {
      key: "issue",
      header: "Issue Type",
      render: (complaint) => <span className="text-[13px] text-muted">{complaint.issueType}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      width: "104px",
      render: (complaint) => <StatusBadge label={complaint.priority} dot={false} />,
    },
    {
      key: "status",
      header: "Status",
      width: "128px",
      render: (complaint) => <StatusBadge label={complaint.status} />,
    },
    {
      key: "sync",
      header: "Sync State",
      width: "112px",
      render: (complaint) => <StatusBadge label={complaint.syncState} />,
    },
    {
      key: "created",
      header: "Created",
      width: "96px",
      hideBelowLg: true,
      render: (complaint) => (
        <span className="text-[12px] text-faint tabular">{complaint.createdAgo}</span>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      width: "96px",
      hideBelowLg: true,
      render: (complaint) => (
        <span className="text-[12px] text-faint tabular">{complaint.updatedAgo}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      align: "right",
      render: (complaint) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              setPreview(complaint);
            }}
          >
            Quick view
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/admin/complaints/${complaint.id}`);
            }}
          >
            Open
          </Button>
        </div>
      ),
    },
  ];

  const openCount = mockComplaints.filter(
    (complaint) => complaint.status === "Open" || complaint.status === "Investigating",
  ).length;
  const unsynced = mockComplaints.filter((complaint) => complaint.syncState !== "Synced").length;

  return (
    <>
      <PageHeader
        title="Complaints"
        subtitle="Customer complaints processed by ResolveSync."
        meta={
          <span className="text-[12px] text-muted tabular">
            {mockComplaints.length} total · {openCount} needing attention · {unsynced} not fully
            synced
          </span>
        }
        actions={<Button variant="secondary">Export CSV</Button>}
      />

      <Card>
        <FilterBar
          search={{
            value: query,
            onChange: setQuery,
            placeholder: "Search ID, customer, order",
          }}
          filters={[
            { id: "status", label: "Status", value: status, options: STATUS_OPTIONS, onChange: setStatus },
            {
              id: "priority",
              label: "Priority",
              value: priority,
              options: PRIORITY_OPTIONS,
              onChange: setPriority,
            },
            { id: "sync", label: "Sync state", value: sync, options: SYNC_OPTIONS, onChange: setSync },
          ]}
          resultCount={`${filtered.length} of ${mockComplaints.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(complaint) => complaint.id}
          onRowClick={(complaint) => router.push(`/admin/complaints/${complaint.id}`)}
          stickyHeader
          empty={
            <EmptyState
              icon={Inbox}
              title="No complaints match these filters"
              description="Try a different search term, or clear the status, priority and sync filters."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setPriority("all");
                    setSync("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          }
        />
      </Card>

      <ComplaintDetailsDrawer
        complaint={preview}
        open={preview !== null}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
