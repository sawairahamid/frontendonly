"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastTone = "ok" | "warn" | "err" | "info";

export interface ToastInput {
  title: string;
  detail?: string;
  tone?: ToastTone;
}

interface ToastItem extends Required<Pick<ToastInput, "title" | "tone">> {
  id: number;
  detail?: string;
}

interface ToastContextValue {
  notify: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON = {
  ok: Check,
  warn: CircleAlert,
  err: CircleAlert,
  info: Info,
} as const;

const TONE_CLASS = {
  ok: "text-ok border-ok/25",
  warn: "text-warn border-warn/25",
  err: "text-err border-err/25",
  info: "text-info border-info/25",
} as const;

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: ToastInput) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current.slice(-3), { id, title: toast.title, detail: toast.detail, tone: toast.tone ?? "info" }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), 3200),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-80 flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto animate-fade-in rounded-xl border border-line bg-panel px-3 py-2.5"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border bg-canvas",
                    TONE_CLASS[toast.tone],
                  )}
                >
                  <Icon className="size-3" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{toast.title}</p>
                  {toast.detail ? (
                    <p className="mt-0.5 text-[12px] leading-4 text-muted">{toast.detail}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismiss(toast.id)}
                  className="inline-flex size-6 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:text-ink"
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
