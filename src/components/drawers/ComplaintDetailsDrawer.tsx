"use client";

import Link from "next/link";

import { AuditTimeline } from "@/components/AuditTimeline";
import { Button } from "@/components/ui/Button";
import { Drawer, DrawerSection, KeyValue } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Complaint } from "@/lib/types";

export function ComplaintDetailsDrawer({
  complaint,
  open,
  onClose,
}: {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!complaint) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={`Complaint ${complaint.id}`}
      subtitle={`${complaint.customer} · ${complaint.createdAt}`}
      headerRight={<StatusBadge label={complaint.status} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Link href={`/admin/complaints/${complaint.id}`}>
            <Button variant="primary">Open full detail</Button>
          </Link>
        </>
      }
    >
      <DrawerSection title="Details">
        <KeyValue
          items={[
            { label: "Customer", value: complaint.customer },
            { label: "Email", value: complaint.email },
            { label: "Order", value: <span className="font-mono">{complaint.orderRef}</span> },
            { label: "Category", value: complaint.issueType },
            { label: "Priority", value: <StatusBadge label={complaint.priority} dot={false} /> },
            { label: "Sync state", value: <StatusBadge label={complaint.syncState} /> },
            { label: "Source", value: complaint.source },
            { label: "Run", value: <span className="font-mono">{complaint.runId}</span> },
          ]}
        />
      </DrawerSection>

      <DrawerSection title="Complaint">
        <p className="rounded-lg border border-line bg-canvas p-3 text-[13px] leading-5 text-muted">
          {complaint.message}
        </p>
      </DrawerSection>

      <DrawerSection title="Automation journey">
        <AuditTimeline events={complaint.journey} />
      </DrawerSection>
    </Drawer>
  );
}
