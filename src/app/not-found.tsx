import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[12px] tracking-[0.1em] text-faint uppercase">404</p>
      <h1 className="mt-2 text-[24px] font-semibold text-ink">This page does not exist</h1>
      <p className="mt-1.5 max-w-sm text-[13px] text-muted">
        The record or route you followed is not part of this workspace.
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-flex h-9 items-center rounded-lg border border-accent bg-accent px-3.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[#2f74e8]"
      >
        Back to Overview
      </Link>
    </div>
  );
}
