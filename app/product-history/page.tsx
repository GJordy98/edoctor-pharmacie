"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  History,
  Clock,
  Package,
  PackageCheck,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { OfficineProductHistory } from "@/lib/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";

const PAGE_SIZE = 15;

/* ── helpers ── */
function fmt(raw: string | number | undefined): string {
  if (!raw) return "0 XAF";
  const n = parseFloat(String(raw));
  return isNaN(n) ? "0 XAF" : `${Math.round(n).toLocaleString("fr-FR")} XAF`;
}

function fmtDate(raw: string | undefined, lang = "fr-FR"): string {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── skeleton ── */
function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ── stat card ── */
interface StatCardProps {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  active: boolean;
  onClick: () => void;
}

function StatCard({ label, count, icon: Icon, color, active, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        active
          ? "border-[#22C55E] bg-[#F0FDF4] shadow-sm"
          : "border-[#E2E8F0] bg-white hover:border-[#22C55E] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[12px] text-[#94A3B8] font-medium">{label}</p>
          <p className="text-[22px] font-bold text-[#1E293B] leading-tight">{count}</p>
        </div>
      </div>
    </button>
  );
}

/* ── main page ── */
export default function ProductHistoryPage() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<OfficineProductHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await api.getAllProductHistory();
      data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(data);
      setLastRefresh(new Date());
    } catch {
      // Silencieux
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHistory(false); }, [fetchHistory]);

  useEffect(() => {
    const interval = setInterval(() => fetchHistory(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  /* Remise à la page 1 dès que les filtres changent */
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  /* ── stat cards ── */
  const stats = [
    { key: "all",       label: t("product_history.filter_all"),       count: items.length,                                              icon: History,      color: "bg-[#F0FDF4] text-[#22C55E]" },
    { key: "PENDING",   label: t("product_history.filter_pending"),   count: items.filter((i) => i.status === "PENDING").length,   icon: Clock,        color: "bg-orange-50 text-orange-500" },
    { key: "RESERVED",  label: t("product_history.filter_reserved"),  count: items.filter((i) => i.status === "RESERVED").length,  icon: Package,      color: "bg-blue-50 text-blue-600" },
    { key: "PICKED",    label: t("product_history.filter_picked"),    count: items.filter((i) => i.status === "PICKED").length,    icon: PackageCheck, color: "bg-indigo-50 text-indigo-600" },
    { key: "CANCELLED", label: t("product_history.filter_cancelled"), count: items.filter((i) => i.status === "CANCELLED").length, icon: XCircle,      color: "bg-red-50 text-red-500" },
    { key: "COMPLETED", label: t("product_history.filter_completed"), count: items.filter((i) => i.status === "COMPLETED").length, icon: CheckCircle2, color: "bg-teal-50 text-teal-600" },
  ];

  /* ── filtrage ── */
  const filtered = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      item.product_name.toLowerCase().includes(q) ||
      item.product_cdi.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Page number pills helper */
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <DashboardLayout title={t("product_history.title")}>
      <div className="space-y-5 animate-fade-in-up">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">{t("product_history.title")}</h2>
            {lastRefresh && (
              <p className="text-[12px] text-[#94A3B8] mt-0.5">
                {t("product_history.last_update", { time: lastRefresh.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US") })}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchHistory(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#22C55E] border border-[#22C55E] rounded-xl hover:bg-[#F0FDF4] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            {t("product_history.refresh")}
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              count={s.count}
              icon={s.icon}
              color={s.color}
              active={statusFilter === s.key}
              onClick={() => setStatusFilter(s.key)}
            />
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">

          {/* Filters */}
          <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={t("product_history.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="all">{t("product_history.filter_status_all")}</option>
              <option value="PENDING">{t("product_history.filter_pending")}</option>
              <option value="RESERVED">{t("product_history.filter_reserved")}</option>
              <option value="PICKED">{t("product_history.filter_picked")}</option>
              <option value="CANCELLED">{t("product_history.filter_cancelled")}</option>
              <option value="COMPLETED">{t("product_history.filter_completed")}</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_product")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_dci")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_qty")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_unit_price")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_total")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_status")}</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">{t("product_history.table_date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <History size={32} className="text-[#E2E8F0] mx-auto mb-3" />
                      <p className="text-[14px] font-medium text-[#94A3B8]">
                        {items.length === 0 ? t("product_history.no_history") : t("product_history.no_results")}
                      </p>
                      {items.length === 0 && (
                        <p className="text-[12px] text-[#94A3B8] mt-1">
                          {t("product_history.no_history_desc")}
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-[#1E293B] line-clamp-2 max-w-[200px] block">
                          {item.product_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B] max-w-[180px]">
                        <span className="line-clamp-2 block">{item.product_cdi || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#1E293B]">
                        {parseFloat(item.quantity) % 1 === 0
                          ? parseInt(item.quantity).toString()
                          : parseFloat(item.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">{fmt(item.unit_price)}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#1E293B]">{fmt(item.line_total)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3.5 text-[#64748B]">{fmtDate(item.created_at, language === "fr" ? "fr-FR" : "en-US")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Footer : info + pagination ── */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E2E8F0] flex items-center justify-between gap-4 flex-wrap">
              {/* Info */}
              <p className="text-[12px] text-[#94A3B8]">
                {filtered.length > 1 ? t("product_history.footer_count_plural", { count: filtered.length }) : t("product_history.footer_count_singular", { count: filtered.length })}
                {statusFilter !== "all" || searchTerm ? (filtered.length > 1 ? t("product_history.footer_filtered_plural") : t("product_history.footer_filtered")) : t("product_history.footer_total")}
                {" — "}
                {t("product_history.footer_page_info", { page: safePage, total: totalPages })}
              </p>

              {/* Pagination controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-[12px] text-[#94A3B8]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium border transition-colors ${
                        safePage === p
                          ? "border-[#22C55E] bg-[#22C55E] text-white"
                          : "border-[#E2E8F0] text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
