import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  meta,
  breadcrumbs,
  backHref,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Status chips or inline facts rendered under the title. */
  meta?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  backHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-muted">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <span className="text-faint">/</span> : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors duration-150 hover:text-ink"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-muted">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Back"
                className="inline-flex size-7 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </Link>
            ) : null}
            <h1 className="truncate text-[28px] leading-9 font-semibold tracking-[-0.02em] text-ink">
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-[13px] text-muted">{subtitle}</p>
          ) : null}
          {meta ? <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function SectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {action}
    </div>
  );
}
