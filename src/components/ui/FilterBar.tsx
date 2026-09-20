"use client";

import type { ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectFilter {
  id: string;
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-line bg-canvas pr-3 pl-8 text-[13px] text-ink transition-colors duration-150 placeholder:text-faint hover:border-[#31405c] focus:border-accent focus:outline-none"
      />
    </div>
  );
}

export function Select({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-line bg-canvas pr-8 pl-3 text-[13px] text-ink transition-colors duration-150 hover:border-[#31405c] focus:border-accent focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-panel">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-faint"
        strokeWidth={1.75}
      />
    </div>
  );
}

export function FilterBar({
  search,
  filters = [],
  right,
  resultCount,
  className,
}: {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  filters?: SelectFilter[];
  right?: ReactNode;
  resultCount?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {search ? (
          <SearchInput
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
            className="w-full sm:w-64"
          />
        ) : null}
        {filters.map((filter) => (
          <Select
            key={filter.id}
            label={filter.label}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
            className="w-[calc(50%-4px)] sm:w-40"
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {resultCount ? (
          <span className="text-xs whitespace-nowrap text-muted tabular">{resultCount}</span>
        ) : null}
        {right}
      </div>
    </div>
  );
}
