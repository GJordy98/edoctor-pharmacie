"use client";

import { useEffect, useState, useCallback } from "react";
import Toast, { ToastData, ToastType } from "./Toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastType }>).detail;
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
    };
    window.addEventListener("pharma:toast", handler);
    return () => window.removeEventListener("pharma:toast", handler);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={remove} />
      ))}
    </div>
  );
}
