"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";

import { IntegrationDrawer } from "@/components/drawers/IntegrationDrawer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { StatusBadge, toneFor } from "@/components/ui/StatusBadge";
import { mockIntegrations } from "@/data";
import type { Integration } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

const HEALTH_LABEL = {
  healthy: "Connected",
  degraded: "Warning",
  failed: "Disconnected",
  inactive: "Inactive",
} as const;

export default function IntegrationsPage() {
  const { notify } = useToast();
  const [active, setActive] = useState<Integration | null>(null);

  const healthy = mockIntegrations.filter((item) => item.health === "healthy").length;
  const degraded = mockIntegrations.filter((item) => item.health === "degraded").length;

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Manage services connected to your ResolveSync workflows."
        meta={
          <span className="text-[12px] text-muted tabular">
            {mockIntegrations.length} connected · {healthy} healthy · {degraded} warning
          </span>
        }
        actions={
          <Button
            icon={Plus}
            variant="primary"
            onClick={() =>
              notify({
                title: "Connector catalog is demo-only",
                detail: "Existing Hanaz / FASTN connections stay in place. New connectors can be added after backend wiring.",
                tone: "info",
              })
            }
          >
            Add Integration
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {mockIntegrations.map((integration) => (
          <article
            key={integration.id}
            className="flex flex-col rounded-xl border border-line bg-panel transition-colors duration-150 hover:border-[#31405c]"
          >
            <div className="flex items-start gap-3 p-4">
              <ConnectorIcon id={integration.id} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[14px] font-semibold text-ink">
                    {integration.name}
                  </h3>
                  <StatusBadge
                    label={HEALTH_LABEL[integration.health]}
                    tone={toneFor(integration.health)}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-faint">{integration.category}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line px-4 py-3">
              <div className="col-span-2 min-w-0">
                <dt className="text-[11px] text-faint">Last successful event</dt>
                <dd className="truncate text-[13px] text-ink">{integration.lastEvent}</dd>
                <dd className="text-[11px] text-faint tabular">{integration.lastEventAt}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-faint">Workflows</dt>
                <dd className="text-[13px] text-ink tabular">{integration.workflowsUsing}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-faint">Events today</dt>
                <dd className="text-[13px] text-ink tabular">
                  {integration.eventsToday.toLocaleString("en-US")}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex items-center gap-2 border-t border-line px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => setActive(integration)}>
                Manage
              </Button>
              <Button
                size="sm"
                variant="ghost"
                iconRight={ExternalLink}
                onClick={() =>
                  window.open("https://fastn.ai", "_blank", "noreferrer")
                }
              >
                Open
              </Button>
              <span className="ml-auto text-[11px] text-faint tabular">
                {integration.errorRate} errors
              </span>
            </div>
          </article>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Connector usage"
          subtitle="Which workflows depend on each connected service"
        />
        <ul className="divide-y divide-line">
          {mockIntegrations.map((integration) => (
            <li
              key={integration.id}
              className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="flex w-44 shrink-0 items-center gap-2">
                <ConnectorIcon id={integration.id} size="sm" />
                <span className="truncate text-[13px] text-ink">{integration.name}</span>
              </span>
              <span className="flex flex-1 flex-wrap gap-1.5">
                {integration.workflowNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[11px] text-muted"
                  >
                    {name}
                  </span>
                ))}
              </span>
              <StatusBadge
                label={HEALTH_LABEL[integration.health]}
                tone={toneFor(integration.health)}
              />
            </li>
          ))}
        </ul>
      </Card>

      <IntegrationDrawer
        integration={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </>
  );
}
