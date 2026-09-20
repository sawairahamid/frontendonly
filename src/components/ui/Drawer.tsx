"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered next to the close button in the drawer header. */
  headerRight?: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  footer,
  width = "md",
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-black/55"
      />
      <aside
        className={cn(
          "animate-slide-in relative flex h-full w-full flex-col border-l border-line bg-panel",
          width === "lg" ? "sm:w-[640px]" : "sm:w-[520px]",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-ink">{title}</h2>
            {subtitle ? (
              <div className="mt-0.5 text-xs text-muted">{subtitle}</div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted transition-colors duration-150 hover:border-line hover:bg-raised hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export function DrawerSection({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-line px-5 py-4 last:border-b-0", className)}>
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
            {title}
          </h3>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function KeyValue({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 1 | 2;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-4 gap-y-3",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd className="mt-0.5 truncate text-[13px] text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function JsonPreview({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
        {label}
      </div>
      <pre className="scroll-thin max-h-64 overflow-auto rounded-lg border border-line bg-canvas p-3 font-mono text-[12px] leading-5 text-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
