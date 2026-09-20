"use client";

import { useState } from "react";
import { Copy, KeyRound, Lock, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConnectorIcon } from "@/components/ui/IntegrationBadge";
import { Select } from "@/components/ui/FilterBar";
import { StatusBadge, toneFor } from "@/components/ui/StatusBadge";
import { Toggle } from "@/components/ui/Toggle";
import { currentUser, mockIntegrations, organization } from "@/data";
import { cn, initials } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const TABS = ["General", "Notifications", "Integrations", "Team", "Security"] as const;
type Tab = (typeof TABS)[number];

const TEAM = [
  { name: "Sawaira Rauf", email: "sawaira@resolvesync.io", role: "Platform Admin", status: "Active" },
  { name: "Hamza Qureshi", email: "hamza@resolvesync.io", role: "Operations Lead", status: "Active" },
  { name: "Bilal Ahmed", email: "bilal@hanaz.pk", role: "Support Agent", status: "Active" },
  { name: "Nida Saeed", email: "nida@hanaz.pk", role: "Analyst", status: "Invited" },
];

const API_KEYS = [
  { label: "Production", value: "pat_live_••••••••••••4d1a", created: "19 Sep 2026", lastUsed: "2 min ago" },
  { label: "Demo", value: "pat_demo_••••••••••••9f2c", created: "02 Aug 2026", lastUsed: "1 h ago" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-muted">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] text-faint">{hint}</p> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  mono = false,
  readOnly = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] text-ink transition-colors duration-150 hover:border-[#31405c] focus:border-accent focus:outline-none",
        mono && "font-mono text-[12px]",
        readOnly && "text-muted",
      )}
    />
  );
}

export default function SettingsPage() {
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>("General");
  const [org, setOrg] = useState(organization.name);
  const [environment, setEnvironment] = useState("Demo");
  const [timezone, setTimezone] = useState("Asia/Karachi (PKT)");
  const [webhook, setWebhook] = useState("https://hooks.resolvesync.io/inbound");
  const [notifications, setNotifications] = useState({
    criticalEmail: true,
    criticalDiscord: true,
    warningDigest: true,
    weeklyReport: false,
    connectorExpiry: true,
  });
  const [security, setSecurity] = useState({
    enforce2fa: true,
    ipAllowlist: false,
    sessionTimeout: true,
  });

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Workspace configuration for ResolveSync."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() =>
                notify({ title: "Changes discarded", detail: "Reverted to the last saved demo values.", tone: "info" })
              }
            >
              Discard
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                notify({
                  title: "Workspace settings saved",
                  detail: "Demo mode only — nothing was written to a backend.",
                  tone: "ok",
                })
              }
            >
              Save changes
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto lg:w-48 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-[13px] whitespace-nowrap transition-colors duration-150",
                tab === item
                  ? "bg-accent/12 font-medium text-ink"
                  : "text-muted hover:bg-white/[0.04] hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {tab === "General" ? (
            <>
              <Card>
                <CardHeader title="Organization" subtitle="Identity used across the portal and exports" />
                <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Organization name">
                    <TextInput value={org} onChange={setOrg} />
                  </Field>
                  <Field label="Workspace">
                    <TextInput value={organization.workspace} readOnly />
                  </Field>
                  <Field
                    label="Environment"
                    hint="Demo uses mock connectors. Production executes against live services."
                  >
                    <Select
                      value={environment}
                      onChange={setEnvironment}
                      options={[
                        { label: "Demo", value: "Demo" },
                        { label: "Production", value: "Production" },
                      ]}
                    />
                  </Field>
                  <Field label="Timezone" hint="Applied to every timestamp in the portal.">
                    <Select
                      value={timezone}
                      onChange={setTimezone}
                      options={[
                        { label: "Asia/Karachi (PKT)", value: "Asia/Karachi (PKT)" },
                        { label: "UTC", value: "UTC" },
                        { label: "Europe/London (BST)", value: "Europe/London (BST)" },
                      ]}
                    />
                  </Field>
                  <Field label="Region">
                    <TextInput value={organization.region} readOnly mono />
                  </Field>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Webhook" subtitle="Where FASTN delivers inbound events" />
                <CardBody className="space-y-4">
                  <Field
                    label="Inbound endpoint"
                    hint="Requests are verified with an HMAC-SHA256 signature header."
                  >
                    <TextInput value={webhook} onChange={setWebhook} mono />
                  </Field>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Copy}
                      onClick={async () => {
                        await navigator.clipboard.writeText(webhook);
                        notify({ title: "Endpoint copied", tone: "ok" });
                      }}
                    >
                      Copy endpoint
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        notify({
                          title: "Test event queued",
                          detail: "A demo payload was marked as delivered. No live webhook was called.",
                          tone: "ok",
                        })
                      }
                    >
                      Send test event
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </>
          ) : null}

          {tab === "Notifications" ? (
            <Card>
              <CardHeader
                title="Notification settings"
                subtitle="Who gets told when something breaks"
              />
              <CardBody className="divide-y divide-line">
                <Toggle
                  label="Critical alerts by email"
                  description="Send an email to platform admins for every critical alert."
                  checked={notifications.criticalEmail}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, criticalEmail: value }))
                  }
                />
                <Toggle
                  label="Critical alerts to Discord"
                  description="Post to #support-escalations as soon as a run fails."
                  checked={notifications.criticalDiscord}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, criticalDiscord: value }))
                  }
                />
                <Toggle
                  label="Warning digest"
                  description="Group non-critical warnings into one message every hour."
                  checked={notifications.warningDigest}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, warningDigest: value }))
                  }
                />
                <Toggle
                  label="Weekly operations report"
                  description="Publish the weekly digest to Notion and share it in Discord."
                  checked={notifications.weeklyReport}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, weeklyReport: value }))
                  }
                />
                <Toggle
                  label="Connector credential expiry"
                  description="Warn 24 hours before any integration token expires."
                  checked={notifications.connectorExpiry}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, connectorExpiry: value }))
                  }
                />
              </CardBody>
            </Card>
          ) : null}

          {tab === "Integrations" ? (
            <Card>
              <CardHeader
                title="Connected services"
                subtitle="Manage credentials from the Integrations page"
                actions={
                  <Button size="sm" variant="secondary" icon={Plus}>
                    Add
                  </Button>
                }
              />
              <ul className="divide-y divide-line">
                {mockIntegrations.map((integration) => (
                  <li key={integration.id} className="flex items-center gap-3 px-4 py-3">
                    <ConnectorIcon id={integration.id} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink">{integration.name}</p>
                      <p className="truncate text-[11px] text-faint">
                        Connected {integration.connectedSince} · {integration.account}
                      </p>
                    </div>
                    <StatusBadge
                      label={integration.statusLabel}
                      tone={toneFor(integration.health)}
                    />
                    <Button size="sm" variant="ghost">
                      Manage
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {tab === "Team" ? (
            <Card>
              <CardHeader
                title="Team members"
                subtitle={`${TEAM.length} people can access this workspace`}
                actions={
                  <Button size="sm" variant="primary" icon={Plus}>
                    Invite member
                  </Button>
                }
              />
              <ul className="divide-y divide-line">
                {TEAM.map((member) => (
                  <li key={member.email} className="flex items-center gap-3 px-4 py-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-[11px] font-semibold text-muted">
                      {initials(member.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink">
                        {member.name}
                        {member.email === currentUser.email ? (
                          <span className="ml-1.5 text-[11px] text-faint">(you)</span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11px] text-faint">{member.email}</p>
                    </div>
                    <span className="hidden text-[12px] text-muted sm:block">{member.role}</span>
                    <StatusBadge label={member.status} />
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {tab === "Security" ? (
            <>
              <Card>
                <CardHeader title="Access" subtitle="Controls applied to every member" />
                <CardBody className="divide-y divide-line">
                  <Toggle
                    label="Require two-factor authentication"
                    description="Members must complete 2FA before reaching the portal."
                    checked={security.enforce2fa}
                    onChange={(value) => setSecurity((current) => ({ ...current, enforce2fa: value }))}
                  />
                  <Toggle
                    label="IP allowlist"
                    description="Restrict portal access to approved office and VPN ranges."
                    checked={security.ipAllowlist}
                    onChange={(value) => setSecurity((current) => ({ ...current, ipAllowlist: value }))}
                  />
                  <Toggle
                    label="Idle session timeout"
                    description="Sign members out after 30 minutes of inactivity."
                    checked={security.sessionTimeout}
                    onChange={(value) =>
                      setSecurity((current) => ({ ...current, sessionTimeout: value }))
                    }
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="API keys"
                  subtitle="Keys are shown masked and can only be revealed once at creation"
                  actions={
                    <Button size="sm" variant="secondary" icon={KeyRound}>
                      Create key
                    </Button>
                  }
                />
                <ul className="divide-y divide-line">
                  {API_KEYS.map((key) => (
                    <li key={key.label} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] text-ink">{key.label}</p>
                        <p className="truncate font-mono text-[12px] text-faint">{key.value}</p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-[11px] text-faint">Created {key.created}</p>
                        <p className="text-[11px] text-faint">Last used {key.lastUsed}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        Rotate
                      </Button>
                      <Button size="sm" variant="danger">
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-[11px] text-faint">
                  <Lock className="size-3" strokeWidth={1.75} />
                  Secrets are stored in the platform vault and are never rendered in this portal.
                </div>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
