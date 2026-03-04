"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const STYLES = {
  success: "border-l-[#22C55E] bg-white",
  error:   "border-l-[#EF4444] bg-white",
  warning: "border-l-[#F97316] bg-white",
  info:    "border-l-[#3B82F6] bg-white",
};

const ICON_COLORS = {
  success: "text-[#22C55E]",
  error:   "text-[#EF4444]",
  warning: "text-[#F97316]",
  info:    "text-[#3B82F6]",
};

export default function Toast({ toast, onClose }: ToastProps) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  return (
    <div
      className={`animate-slide-in-right flex items-start gap-3 w-80 p-4 rounded-xl shadow-lg border border-[#E2E8F0] border-l-4 ${STYLES[toast.type]}`}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} />
      <p className="flex-1 text-[13px] text-[#1E293B] leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Call this from anywhere to trigger a toast */
export function showToast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("pharma:toast", { detail: { message, type } })
  );
}
