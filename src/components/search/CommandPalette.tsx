"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { searchWorkspace, type SearchHit } from "@/lib/search";
import { cn } from "@/lib/utils";

const GROUP_ORDER: SearchHit["group"][] = [
  "Pages",
  "Workflows",
  "Complaints",
  "Runs",
  "Integrations",
  "Alerts",
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const hits = useMemo(() => searchWorkspace(query), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter" && hits[active]) {
        event.preventDefault();
        router.push(hits[active].href);
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, hits, active, onClose, router]);

  if (!open) return null;

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: hits.filter((hit) => hit.group === group),
  })).filter((entry) => entry.items.length > 0);

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-black/60"
      />
      <div className="animate-fade-in relative w-full max-w-xl overflow-hidden rounded-xl border border-line bg-panel">
        <div className="relative border-b border-line">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint"
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workflows, complaints, runs, integrations"
            className="h-12 w-full bg-transparent pr-4 pl-10 text-[14px] text-ink outline-none placeholder:text-faint"
          />
        </div>

        <div className="scroll-thin max-h-[420px] overflow-y-auto py-2">
          {hits.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">
              No matches for “{query}”.
            </p>
          ) : (
            grouped.map((entry) => (
              <div key={entry.group} className="mb-1">
                <p className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-faint uppercase">
                  {entry.group}
                </p>
                <ul>
                  {entry.items.map((hit) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    return (
                      <li key={hit.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => {
                            router.push(hit.href);
                            onClose();
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 px-4 py-2 text-left transition-colors duration-150",
                            index === active ? "bg-accent/12" : "hover:bg-white/[0.03]",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] text-ink">{hit.title}</span>
                            <span className="block truncate text-[11px] text-faint">{hit.subtitle}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[11px] text-faint">
          <span>
            <kbd className="rounded border border-line bg-raised px-1 font-mono">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-line bg-raised px-1 font-mono">Enter</kbd> open
          </span>
          <span>
            <kbd className="rounded border border-line bg-raised px-1 font-mono">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
