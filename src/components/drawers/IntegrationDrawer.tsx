"use client";

import { useEffect, useState } from "react";
import { Lock, RotateCw, TriangleAlert, Unplug } from "lucide-react";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Drawer, DrawerSection, KeyValue } from "@/components/ui/Drawer";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import type { Integration } from "@/lib/types";

export function IntegrationDrawer({
  integration,
  open,
  onClose,
}: {
  integration: Integration | null;
  open: boolean;
  onClose: () => void;
}) {
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!open) {
      setReconnecting(false);
      setReconnected(false);
      setConfirmDisconnect(false);
    }
  }, [open]);

  if (!integration) return null;

  // Demo-mode only: no credentials are exchanged in the frontend build.
  const reconnect = () => {
    setReconnecting(true);
    window.setTimeout(() => {
      setReconnecting(false);
      setReconnected(true);
      notify({ title: `${integration.name} reconnected`, detail: "Demo only — credentials were not rotated.", tone: "ok" });
    }, 1000);
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2">
            <ConnectorIcon id={integration.id} size="sm" />
            {integration.name}
          </span>
        }
        subtitle={integration.category}
        headerRight={<StatusBadge label={integration.statusLabel} />}
        footer={
          <>
            <Button
              variant="danger"
              icon={Unplug}
              onClick={() => setConfirmDisconnect(true)}
            >
              Disconnect
            </Button>
            <Button
              variant="primary"
              icon={RotateCw}
              disabled={reconnecting}
              onClick={reconnect}
            >
              {reconnected ? "Reconnected" : reconnecting ? "Reconnecting…" : "Reconnect"}
            </Button>
          </>
        }
      >
        {integration.note ? (
          <DrawerSection>
            <div className="flex gap-2.5 rounded-lg border border-warn/25 bg-warn/[0.07] p-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" strokeWidth={1.75} />
              <p className="text-[12px] leading-5 text-ink">{integration.note}</p>
            </div>
          </DrawerSection>
        ) : null}

        <DrawerSection title="Connection">
          <KeyValue
            items={[
              { label: "Connection name", value: integration.name },
              { label: "Status", value: integration.statusLabel },
              { label: "Connected since", value: integration.connectedSince },
              { label: "Last sync", value: integration.lastEventAt },
              { label: "Events today", value: integration.eventsToday.toLocaleString("en-US") },
              { label: "Error rate", value: integration.errorRate },
            ]}
          />
        </DrawerSection>

        <DrawerSection title="Account">
          <p className="text-[13px] text-ink">{integration.account}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {integration.scopes.map((scope) => (
              <span
                key={scope}
                className="rounded-md border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-muted"
              >
                {scope}
              </span>
            ))}
          </div>
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-faint">
            <Lock className="size-3" strokeWidth={1.75} />
            Credentials are stored in the platform vault and never rendered here.
          </p>
        </DrawerSection>

        {integration.endpoint ? (
          <DrawerSection title="Endpoint">
            <code className="block truncate rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[12px] text-muted">
              {integration.endpoint}
            </code>
          </DrawerSection>
        ) : null}

        <DrawerSection title={`Used by ${integration.workflowsUsing} workflows`}>
          <ul className="space-y-1.5">
            {integration.workflowNames.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-ink"
              >
                {name}
              </li>
            ))}
          </ul>
        </DrawerSection>
      </Drawer>

      <ConfirmModal
        open={confirmDisconnect}
        tone="danger"
        title={`Disconnect ${integration.name}?`}
        description={
          <>
            {integration.workflowsUsing} active workflows use this connection. Their runs will
            start failing at the first step that calls {integration.name}.
          </>
        }
        confirmLabel="Disconnect"
        onCancel={() => setConfirmDisconnect(false)}
        onConfirm={() => {
          setConfirmDisconnect(false);
          onClose();
          notify({
            title: `${integration.name} stays connected`,
            detail: "Disconnect is simulated in demo mode so existing FASTN integrations stay intact.",
            tone: "warn",
          });
        }}
      />
    </>
  );
}
