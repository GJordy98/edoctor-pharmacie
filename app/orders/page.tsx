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
  FileImage,
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
      className={`w-full text-left p-4 rounded-xl border transition-all ${active
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
const ITEMS_PER_PAGE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  // Track which orders have a prescription
  const [prescriptionOrders, setPrescriptionOrders] = useState<Set<string>>(new Set());

  // Pharmacy ID — needed for the per-status endpoint
  const [officineId, setOfficineId] = useState("");
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("officine") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setOfficineId(parsed?.id || parsed?.uuid || String(parsed) || "");
      } catch {
        setOfficineId(raw);
      }
    } else {
      // No officine in storage — stop the initial spinner
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!officineId) return;
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // Fetch every status bucket in parallel via the confirmed per-status endpoint
      const raw = await api.getAllOrdersByOfficine(officineId);

      // Pour chaque officine-order, on récupère les items afin de calculer
      // le total spécifique à cette pharmacie (et non le total global de la commande).
      const itemsResults = await Promise.allSettled(
        raw.map((item) => api.getOrderItems(item.id))
      );

      const mapped: OrderUI[] = raw.map((item, idx) => {
        const patient = item.patient ?? item.order?.patient;
        const patientName = patient
          ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim() || "Client"
          : "Client";

        // Calcul du total pharmacie à partir des items (comme dans la page de détail)
        let pharmacyTotal: number | undefined;
        const itemsResult = itemsResults[idx];
        if (itemsResult.status === "fulfilled") {
          const itemsData = itemsResult.value;
          const itemsArray: Record<string, unknown>[] = Array.isArray(itemsData)
            ? (itemsData as Record<string, unknown>[])
            : Array.isArray((itemsData as { items?: unknown[] })?.items)
              ? ((itemsData as unknown as { items: Record<string, unknown>[] }).items)
              : [];

          if (itemsArray.length > 0) {
            pharmacyTotal = itemsArray
              .filter((i) => {
                const st = String(i.status ?? "").toUpperCase();
                return st !== "CANCELLED";
              })
              .reduce((sum, i) => {
                const lineTotal = parseFloat(
                  String(i.line_total ?? i.total_price ?? 0)
                );
                return sum + (isNaN(lineTotal) ? 0 : lineTotal);
              }, 0);
          }
        }

        // Fallback sur total_amount uniquement si on n'a pas pu calculer depuis les items
        const totalSource =
          pharmacyTotal !== undefined
            ? pharmacyTotal
            : (item.total_amount ?? item.order?.total_amount);

        // Normalize status to uppercase to prevent case mismatches
        const rawStatus = item.status ?? item.order?.status ?? "PENDING";
        const normalizedStatus = String(rawStatus).toUpperCase();

        // Detect prescription: check inner order.prescription field
        const itemAsUnknown = item as unknown as Record<string, unknown>;
        const innerOrder = itemAsUnknown.order as Record<string, unknown> | undefined;
        const hasPrescription = !!((innerOrder?.prescription) || itemAsUnknown.prescription);

        return {
          id: item.id,
          patient: patientName,
          date: fmtDate(item.created_at ?? item.order?.created_at),
          total: fmt(totalSource),
          payment: String(item.payment_status ?? item.order?.payment_status ?? "UNPAID").toUpperCase(),
          status: normalizedStatus,
          _rawDate: item.created_at ?? item.order?.created_at ?? "",
          _hasPrescription: hasPrescription,
        } as OrderUI & { _rawDate: string; _hasPrescription: boolean };
      });

      // Trier du plus récent au plus ancien
      (mapped as (OrderUI & { _rawDate: string })[]).sort(
        (a, b) => new Date(b._rawDate).getTime() - new Date(a._rawDate).getTime()
      );

      // Collect prescription order IDs
      const prescriptionSet = new Set<string>();
      mapped.forEach((o) => {
        if ((o as unknown as { _hasPrescription: boolean })._hasPrescription) {
          prescriptionSet.add(o.id);
        }
      });
      setPrescriptionOrders(prescriptionSet);

      // Nettoyer les champs temporaires
      mapped.forEach((o) => {
        delete (o as unknown as Record<string, unknown>)._rawDate;
        delete (o as unknown as Record<string, unknown>)._hasPrescription;
      });

      setOrders(mapped);
      setLastRefresh(new Date());
    } catch {
      // Silencieux — erreur réseau ou serveur temporairement indisponible
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [officineId]);

  /* initial load — fires once officineId is known */
  useEffect(() => {
    if (officineId) fetchOrders(false);
  }, [officineId, fetchOrders]);

  /* polling every 30 s */
  useEffect(() => {
    if (!officineId) return;
    const interval = setInterval(() => fetchOrders(true), 30_000);
    return () => clearInterval(interval);
  }, [officineId, fetchOrders]);

  /**
   * Maps the real backend status enum to one of the 5 dashboard groups.
   * Backend enum: PENDING | PENDING_PATIENT | APPROVED | REJECTED |
   *               READY_FOR_PICKUP | PICKED_UP | CANCELLED | COMPLETED
   */
  function statusGroup(status: string): string {
    switch (status) {
      // ── En attente (pharmacie n'a pas encore traité) ───────────────────────────────
      case "PENDING":
        return "PENDING";

      // ── Acceptées (pharmacie validée, patient doit confirmer ou déjà confirmé) ──
      case "PENDING_PATIENT":   // pharmacie validée, en attente confirmation patient
      case "APPROVED":          // validé des deux côtés
        return "ACCEPTED";

      // ── Prêt collecte (livreur vient récupérer) ──────────────────────────────

      // ── En livraison (livreur a collecté le colis) ───────────────────────────


      // ── Terminées avec succès ─────────────────────────────────────────────
      case "COMPLETED":
        return "COMPLETED";

      // ── Rejetées / Annulées ───────────────────────────────────────────────
      case "REJECTED":
      case "CANCELLED":
        return "REJECTED";

      default:
        return "PENDING";
    }
  }

  /* derived stats */
  const stats = [
    { key: "all", label: "Toutes", count: orders.length, icon: ClipboardList, color: "bg-[#F0FDF4] text-[#22C55E]" },
    { key: "PENDING", label: "En attente", count: orders.filter((o) => statusGroup(o.status) === "PENDING").length, icon: Clock, color: "bg-orange-50 text-orange-500" },
    { key: "ACCEPTED", label: "Acceptées", count: orders.filter((o) => statusGroup(o.status) === "ACCEPTED").length, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
    { key: "REJECTED", label: "Rejetées", count: orders.filter((o) => statusGroup(o.status) === "REJECTED").length, icon: XCircle, color: "bg-red-50 text-red-500" },
    { key: "COMPLETED", label: "Terminées", count: orders.filter((o) => statusGroup(o.status) === "COMPLETED").length, icon: CheckCircle2, color: "bg-teal-50 text-teal-600" },
  ];

  const filtered = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = o.patient.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || statusGroup(o.status) === statusFilter;
    const matchPayment = paymentFilter === "all" || o.payment === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1); };
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setCurrentPage(1); };
  const handlePaymentFilter = (v: string) => { setPaymentFilter(v); setCurrentPage(1); };

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
              />
            </div>

            {/* Payment filter */}
            <select
              value={paymentFilter}
              onChange={(e) => handlePaymentFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="all">Tous les paiements</option>
              <option value="PAID">Payé</option>
              <option value="UNPAID">Non payé</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptée (APPROVED)</option>
              <option value="IN_PICKUP">Prêt collecte (READY_FOR_PICKUP)</option>
              <option value="IN_DELIVERY">En livraison (PICKED_UP)</option>
              <option value="COMPLETED">Terminée</option>
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
                  paginated.map((order) => {
                    const isNew = order.status === "PENDING";
                    return (
                    <tr key={order.id} className={`transition-colors border-l-4 ${isNew ? 'bg-orange-50/50 hover:bg-orange-100/50 border-orange-400' : 'border-transparent hover:bg-[#F8FAFC]'}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono text-[12px] text-[#22C55E] font-semibold">
                            #{order.id.slice(0, 8)}
                          </span>
                          {isNew && (
                            <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600 uppercase tracking-widest shadow-sm border border-orange-200">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                              </span>
                              À traiter
                            </span>
                          )}
                          {prescriptionOrders.has(order.id) && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-widest border border-blue-200">
                              <FileImage size={9} />
                              Ordonnance
                            </span>
                          )}
                        </div>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
              <p className="text-[12px] text-[#94A3B8]">
                {filtered.length} commande{filtered.length > 1 ? "s" : ""}&nbsp;
                {statusFilter !== "all" || paymentFilter !== "all" || searchTerm
                  ? "filtrée" + (filtered.length > 1 ? "s" : "")
                  : "au total"}
                &nbsp;— Page {currentPage}/{totalPages}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:border-[#22C55E] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[#94A3B8]">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[12px] font-medium transition-colors ${
                            currentPage === item
                              ? 'border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]'
                              : 'border-[#E2E8F0] text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:border-[#22C55E] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
