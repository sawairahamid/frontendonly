"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Waypoints } from "lucide-react";

import { currentEnvironment, currentUser } from "@/data";
import { navGroups } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex h-14 items-center gap-2.5 border-b border-line px-4"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-md border border-accent/30 bg-accent/15">
          <Waypoints className="size-4 text-accent" strokeWidth={2} />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          ResolveSync
        </span>
      </Link>

      <nav className="scroll-thin flex-1 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-[0.1em] text-faint uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors duration-150",
                        active
                          ? "bg-accent/12 font-medium text-ink"
                          : "text-muted hover:bg-white/[0.04] hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn("size-4 shrink-0", active ? "text-accent" : "text-faint group-hover:text-muted")}
                        strokeWidth={1.75}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "rounded-full border px-1.5 text-[10px] leading-4 font-medium tabular",
                            item.badgeTone === "err" && "border-err/30 bg-err/10 text-err",
                            item.badgeTone === "warn" && "border-warn/30 bg-warn/10 text-warn",
                            (!item.badgeTone || item.badgeTone === "neutral") &&
                              "border-line bg-raised text-muted",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-2.5">
        <div className="mb-2 flex items-center justify-between rounded-lg border border-line bg-canvas px-2.5 py-2">
          <div>
            <p className="text-[10px] tracking-[0.08em] text-faint uppercase">Environment</p>
            <p className="text-[13px] font-medium text-ink">{currentEnvironment}</p>
          </div>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              currentEnvironment === "Production"
                ? "border-ok/30 bg-ok/10 text-ok"
                : "border-info/30 bg-info/10 text-info",
            )}
          >
            {currentEnvironment === "Production" ? "LIVE" : "DEMO"}
          </span>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-white/[0.04]"
        >
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-[11px] font-semibold text-muted">
            {initials(currentUser.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">
              {currentUser.name}
            </span>
            <span className="block truncate text-[11px] text-faint">{currentUser.role}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-faint" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
