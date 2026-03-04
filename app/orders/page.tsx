"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  ClipboardList,
  Clock,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Eye,
  QrCode,
  Truck,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { OrderUI } from "@/lib/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";

/* ── helpers ── */
function fmt(raw: string | number | undefined): string {
  if (!raw) return "0 XAF";
  const n = parseFloat(String(raw));
  return isNaN(n) ? "0 XAF" : `${Math.round(n).toLocaleString("fr-FR")} XAF`;
}

function fmtDate(raw: string | undefined): string {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("fr-FR", {
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
export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const raw = await api.getAllPharmacyOrders();

      const mapped: OrderUI[] = raw.map((item) => {
        const patient = item.patient ?? item.order?.patient;
        const patientName = patient
          ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim() || "Client"
          : "Client";

        return {
          id: item.id,
          patient: patientName,
          date: fmtDate(item.created_at ?? item.order?.created_at),
          total: fmt(item.total_amount ?? item.order?.total_amount),
          payment: item.payment_status ?? item.order?.payment_status ?? "UNPAID",
          status: item.status ?? item.order?.status ?? "PENDING",
        };
      });

      setOrders(mapped);
      setLastRefresh(new Date());
    } catch {
      // Silencieux — erreur réseau ou serveur temporairement indisponible
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /* initial load */
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  /* polling every 30 s */
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  /* derived stats */
  const stats = [
    { key: "all",        label: "Toutes",      count: orders.length,                                                                                icon: ClipboardList, color: "bg-[#F0FDF4] text-[#22C55E]" },
    { key: "PENDING",    label: "En attente",  count: orders.filter((o) => o.status === "PENDING").length,                                         icon: Clock,         color: "bg-orange-50 text-orange-500" },
    { key: "ACCEPTED",   label: "Acceptées",   count: orders.filter((o) => o.status === "ACCEPTED" || o.status === "RESERVED").length,              icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
    { key: "IN_PICKUP",  label: "Prêt collecte", count: orders.filter((o) => o.status === "IN_PICKUP").length,                                     icon: PackageCheck,  color: "bg-blue-50 text-blue-600" },
    { key: "IN_DELIVERY",label: "En livraison", count: orders.filter((o) => o.status === "IN_DELIVERY").length,                                    icon: Truck,         color: "bg-purple-50 text-purple-600" },
    { key: "REJECTED",   label: "Rejetées",    count: orders.filter((o) => o.status === "REJECTED" || o.status === "CANCELLED").length,             icon: XCircle,       color: "bg-red-50 text-red-500" },
  ];

  const filtered = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = o.patient.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    // ACCEPTED regroupe ACCEPTED et RESERVED (même statut côté backend selon version)
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "ACCEPTED" && (o.status === "ACCEPTED" || o.status === "RESERVED")) ||
      (statusFilter === "REJECTED" && (o.status === "REJECTED" || o.status === "CANCELLED")) ||
      (statusFilter !== "ACCEPTED" && statusFilter !== "REJECTED" && o.status === statusFilter);
    const matchPayment = paymentFilter === "all" || o.payment === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <DashboardLayout title="Commandes">
      <div className="space-y-5 animate-fade-in-up">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Tableau de bord</h2>
            {lastRefresh && (
              <p className="text-[12px] text-[#94A3B8] mt-0.5">
                Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#22C55E] border border-[#22C55E] rounded-xl hover:bg-[#F0FDF4] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            Actualiser
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
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Rechercher un patient, ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
              />
            </div>

            {/* Payment filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="all">Tous les paiements</option>
              <option value="PAID">Payé</option>
              <option value="UNPAID">Non payé</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptée</option>
              <option value="IN_PICKUP">Prêt collecte</option>
              <option value="IN_DELIVERY">En livraison</option>
              <option value="REJECTED">Rejetée / Annulée</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    ID Commande
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Paiement
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <ClipboardList size={32} className="text-[#E2E8F0] mx-auto mb-3" />
                      <p className="text-[14px] font-medium text-[#94A3B8]">
                        {orders.length === 0 ? "Aucune commande" : "Aucun résultat"}
                      </p>
                      {orders.length === 0 && (
                        <p className="text-[12px] text-[#94A3B8] mt-1">
                          Les nouvelles commandes apparaîtront ici automatiquement.
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[12px] text-[#22C55E] font-semibold">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#1E293B]">
                        {order.patient}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">{order.date}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#1E293B]">
                        {order.total}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.payment} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/order-details/${order.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F0FDF4] hover:text-[#22C55E] transition-colors"
                            title="Voir les détails"
                          >
                            <Eye size={15} />
                          </Link>
                          {(order.status === "ACCEPTED" || order.status === "RESERVED" || order.status === "IN_PICKUP") && (
                            <Link
                              href={`/order-details/${order.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Scanner QR pickup"
                            >
                              <QrCode size={15} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E2E8F0] text-[12px] text-[#94A3B8]">
              {filtered.length} commande{filtered.length > 1 ? "s" : ""}{" "}
              {statusFilter !== "all" || paymentFilter !== "all" || searchTerm
                ? "filtrée" + (filtered.length > 1 ? "s" : "")
                : "au total"}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
