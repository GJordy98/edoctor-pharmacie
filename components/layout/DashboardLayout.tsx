"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { api } from "@/lib/api-client";
import { PharmaNotification, PharmaWallet } from "@/lib/types";

import {
  Bell, BellDot, BellOff, RefreshCw,
  ShoppingBag, CreditCard, Megaphone,
  Loader2, X, CheckCheck, Wallet,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PharmaNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Wallet
  const [wallet, setWallet] = useState<PharmaWallet | null>(null);

  const loadWallet = useCallback(async () => {
    try {
      const officineData = typeof window !== 'undefined' ? localStorage.getItem('officine') : null;
      if (!officineData) return;
      const o = JSON.parse(officineData);
      const officineId = o.id || o.officine_id || o.uuid;
      if (!officineId) return;
      const data = await api.getWallet(officineId);
      setWallet(data);
    } catch {
      // silent
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadWallet();
    const interval = setInterval(() => {
      loadNotifications();
      loadWallet();
    }, 60_000);
    return () => clearInterval(interval);
  }, [loadNotifications, loadWallet]);

  /* Fermer en cliquant à l'extérieur */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#notif-panel") && !target.closest("#notif-btn")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotifClick = async (notif: PharmaNotification) => {
    if (!notif.is_read) await handleMarkRead(notif.id);
    if (notif.order_id) {
      setNotifOpen(false);
      router.push(`/patient-order/${notif.order_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => api.markNotificationAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getIcon = (notif: PharmaNotification) => {
    const type = notif.type?.toUpperCase() ?? "";
    if (type.includes("ORDER")) return <ShoppingBag size={14} />;
    if (type.includes("PAYMENT")) return <CreditCard size={14} />;
    return <Megaphone size={14} />;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)} h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Mobile logo + titre */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="#22C55E" />
                <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" fill="none" />
              </svg>
              <span className="text-[14px] font-bold text-[#1E293B]">PharmaCare</span>
            </div>
            {title && (
              <h1 className="hidden lg:block text-[18px] font-semibold text-[#1E293B]">{title}</h1>
            )}
          </div>

          {/* ── Wallet badge + Cloche notifications ── */}
          <div className="flex items-center gap-2">
            <Link
              href="/wallet"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] hover:from-[#DCFCE7] hover:to-[#BBF7D0] hover:border-[#86EFAC] hover:shadow-md hover:shadow-green-100 transition-all duration-200 group"
              title="Voir le portefeuille"
            >
              <div className="w-6 h-6 rounded-lg bg-[#22C55E] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Wallet size={13} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-semibold text-[#16A34A] uppercase tracking-wider">Solde</span>
                <span className="text-[13px] font-bold text-[#15803D] mt-0.5">
                  {wallet
                    ? `${Number(wallet.balance ?? 0).toLocaleString('fr-FR')} ${wallet.currency ?? 'XAF'}`
                    : '— XAF'}
                </span>
              </div>
            </Link>

          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F0FDF4] transition-colors"
              title="Notifications"
            >
              {unreadCount > 0
                ? <BellDot size={20} className="text-[#22C55E]" />
                : <Bell size={20} className="text-[#94A3B8]" />
              }
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-[#EF4444] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* ── Panneau dropdown ── */}
            {notifOpen && (
              <div
                id="notif-panel"
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl z-50 max-h-[500px] overflow-hidden flex flex-col animate-slide-down"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(34,197,94,0.1)" }}
              >
                {/* Header panneau */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F0FDF4] to-transparent shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                      <BellDot size={15} className="text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 leading-none">Notifications</p>
                      {unreadCount > 0 && (
                        <p className="text-[10px] text-[#22C55E] font-semibold mt-0.5">
                          {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#22C55E] hover:bg-[#F0FDF4] flex items-center justify-center transition-all"
                        title="Tout marquer comme lu"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={loadNotifications}
                      disabled={loading}
                      className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#22C55E] hover:bg-[#F0FDF4] flex items-center justify-center transition-all disabled:opacity-50"
                      title="Actualiser"
                    >
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Liste */}
                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-10 flex flex-col items-center gap-3">
                      <Loader2 size={24} className="text-[#22C55E] animate-spin" />
                      <p className="text-[11px] text-gray-400">Chargement…</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-10 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <BellOff size={22} className="text-gray-300" />
                      </div>
                      <p className="text-[12px] text-gray-400">Aucune notification</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`p-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read
                              ? "bg-[#F0FDF4] border-l-[3px] border-l-[#22C55E]"
                              : ""
                            } ${notif.order_id ? "group" : ""}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${!notif.is_read
                                ? "bg-[#22C55E]/15 text-[#22C55E]"
                                : "bg-gray-100 text-gray-400"
                                }`}
                            >
                              {getIcon(notif)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-[12px] font-bold text-gray-900 line-clamp-1">
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                  {formatDate(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* ── Contenu ── */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
