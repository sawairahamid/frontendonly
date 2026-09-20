"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";

import { StatusDot } from "@/components/ui/StatusBadge";
import { currentUser } from "@/data";
import { titleForPath } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";

export function Topbar({
  onOpenSidebar,
  onOpenSearch,
}: {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur"
    >
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 hover:text-ink lg:hidden"
      >
        <Menu className="size-4" strokeWidth={1.75} />
      </button>

      <h1 className="text-[15px] font-semibold text-ink">{titleForPath(pathname)}</h1>

      <div className="ml-auto hidden items-center md:flex">
        <button
          type="button"
          onClick={onOpenSearch}
          className="relative flex h-8 w-72 items-center rounded-lg border border-line bg-panel pr-12 pl-8 text-left text-[13px] text-faint transition-colors duration-150 hover:border-[#31405c]"
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint"
            strokeWidth={1.75}
          />
          Search workflows, runs, complaints
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-faint">
            /
          </kbd>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-3">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted transition-colors duration-150 hover:border-line hover:bg-raised hover:text-ink md:hidden"
        >
          <Search className="size-4" strokeWidth={1.75} />
        </button>
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[11px] text-muted sm:inline-flex">
          <StatusDot tone="ok" pulse />
          All systems operational
        </span>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setProfileOpen(false);
            }}
            className={cn(
              "relative inline-flex size-8 items-center justify-center rounded-lg border transition-colors duration-150",
              notificationsOpen
                ? "border-line bg-raised text-ink"
                : "border-transparent text-muted hover:border-line hover:bg-raised hover:text-ink",
            )}
          >
            <Bell className="size-4" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-err" />
          </button>

          {notificationsOpen ? (
            <div className="animate-fade-in absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-panel">
              <div className="border-b border-line px-3 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
                Notifications
              </div>
              <ul className="divide-y divide-line">
                {[
                  { title: "Notion sync delayed", meta: "Complaint Resolution · 18 min ago", tone: "warn" as const },
                  { title: "Webhook timeout", meta: "RUN-1039 · 42 min ago", tone: "err" as const },
                  { title: "Status conflict detected", meta: "HZ-1037 · 3 h ago", tone: "warn" as const },
                ].map((item) => (
                  <li key={item.title} className="flex gap-2.5 px-3 py-2.5">
                    <StatusDot tone={item.tone} className="mt-1.5" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-ink">{item.title}</p>
                      <p className="truncate text-[11px] text-faint">{item.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/alerts"
                className="block border-t border-line px-3 py-2.5 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-white/[0.03]"
              >
                View all alerts
              </Link>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotificationsOpen(false);
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-1.5 transition-colors duration-150",
              profileOpen
                ? "border-line bg-raised"
                : "border-transparent hover:border-line hover:bg-raised",
            )}
          >
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-line bg-raised text-[10px] font-semibold text-muted">
              {initials(currentUser.name)}
            </span>
            <ChevronDown className="size-3.5 text-faint" strokeWidth={1.75} />
          </button>

          {profileOpen ? (
            <div className="animate-fade-in absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-panel">
              <div className="border-b border-line px-3 py-2.5">
                <p className="text-[13px] font-medium text-ink">{currentUser.name}</p>
                <p className="truncate text-[11px] text-faint">{currentUser.email}</p>
              </div>
              <ul className="py-1">
                {[
                  { label: "Profile", icon: User, href: "/admin/settings" },
                  { label: "Workspace settings", icon: Settings, href: "/admin/settings" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-ink"
                    >
                      <item.icon className="size-4" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-1 border-t border-line pt-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-ink"
                  >
                    <LogOut className="size-4" strokeWidth={1.75} />
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
