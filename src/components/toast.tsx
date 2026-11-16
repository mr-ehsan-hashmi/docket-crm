"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

type ToastTone = "success" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  tone?: ToastTone;
  action?: ToastAction;
}

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const TOAST_DURATION_MS = 4500;
// long enough to read the message and still reach the button
const ACTION_TOAST_DURATION_MS = 8000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, { tone = "success", action }: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, tone, action }]);
      setTimeout(() => dismiss(id), action ? ACTION_TOAST_DURATION_MS : TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lift animate-[toast-in_180ms_ease-out]",
              toast.tone === "error" ? "bg-danger text-white" : "bg-ink text-paper",
            )}
          >
            <p className="flex-1">{toast.message}</p>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
                className="rounded px-1 font-semibold underline underline-offset-2 focus-visible:outline-white"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 rounded px-1 text-white/70 hover:text-white focus-visible:outline-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}
