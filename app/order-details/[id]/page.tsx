"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  QrCode,
  Plus,
  Check,
  X,
  Loader2,
  Download,
  Printer,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  PackagePlus,
  ZoomIn,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { InvoiceResponse, QrCodeResponse, Product } from "@/lib/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { showToast } from "@/components/ui/Toast";

/* ── local types ── */
interface ApiOrderItem {
  id: number | string;
  officine_order?: { id?: string };
  product?: { id?: string; name?: string; dci?: string; galenic?: string };
  product_name?: string;
  quantity: number | string;
  unit_price?: string | number;
  price?: string | number;
  line_total?: string | number;
  total_price?: string | number;
  status?: string;
  [key: string]: unknown;
}

interface OrderItem {
  id: number | string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  status: "PENDING" | "RESERVED" | "CANCELLED" | "PICKED" | "COMPLETED";
}

interface OrderData {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  status: string;
  payment_status: string;
  prescription: string | null;
  total_amount: number;
}

interface SubItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

/* ── modal wrapper ── */
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
          <h3 className="text-[15px] font-semibold text-[#1E293B]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {/* footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E2E8F0] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── info card ── */
function InfoCard({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[#94A3B8]">
        <Icon size={14} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-[14px] font-semibold text-[#1E293B]">{value}</div>
    </div>
  );
}

/* ── main page ── */
export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const orderId = id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [addedProducts, setAddedProducts] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [itemsUpdating, setItemsUpdating] = useState<Set<number | string>>(new Set());

  // Products for prescription cases
  const [pharmacyProducts, setPharmacyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Invoice
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // QR Code modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Prescription lightbox
  const [showPrescriptionLightbox, setShowPrescriptionLightbox] = useState(false);

  // Sub-order modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [subItems, setSubItems] = useState<SubItem[]>([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);
  const [subLoading, setSubLoading] = useState(false);
  const [subMsg, setSubMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // officine id
  const [officineId, setOfficineId] = useState("");
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("officine") : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setOfficineId(p?.id || p?.uuid || String(p) || "");
      } catch {
        setOfficineId(raw);
      }
    }
  }, []);

  // Load pharmacy products when officineId is known
  useEffect(() => {
    if (!officineId) return;
    setProductsLoading(true);
    api
      .getProducts(officineId)
      .then((data) => setPharmacyProducts(Array.isArray(data) ? data : []))
      .catch(() => setPharmacyProducts([]))
      .finally(() => setProductsLoading(false));
  }, [officineId]);

  // Load order details
  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrderDetails(orderId);
      if (data.order) {
        const p = data.order.patient;
        setOrder({
          id: data.order.id as string,
          patientName: `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "Client",
          patientPhone: p?.phone ?? "",
          date: data.order.created_at
            ? new Date(data.order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
            : "—",
          status: data.order.status ?? "",
          payment_status: data.order.payment_status ?? "",
          prescription: data.order.prescription ?? null,
          total_amount: parseFloat(String(data.order.total_amount)) || 0,
        });
      }
      if (data.items) {
        const mapped: OrderItem[] = (data.items as unknown as ApiOrderItem[]).map((item) => ({
          id: item.id,
          name: item.product
            ? `${item.product.name ?? ""} — ${item.product.dci ?? ""}`.replace(/ — $/, "")
            : item.product_name || "Produit",
          quantity: parseFloat(String(item.quantity)),
          price: parseFloat(String(item.unit_price ?? item.price ?? 0)),
          total: parseFloat(String(item.line_total ?? item.total_price ?? 0)),
          status: (item.status?.toUpperCase() || "PENDING") as OrderItem["status"],
        }));
        setItems(mapped);
      }
    } catch {
      showToast("Erreur lors du chargement de la commande.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Determine case
  const orderCase =
    items.length > 0 && !order?.prescription
      ? 1
      : !items.length && order?.prescription
        ? 2
        : 3;

  // PATCH /api/v1/order-item/{item.id}/ — body: { status }
  const toggleItem = async (itemId: number | string, newStatus: "RESERVED" | "CANCELLED") => {
    if (itemsUpdating.has(itemId)) return;
    const previousItems = items;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } as OrderItem : i)));
    setItemsUpdating((s) => new Set(s).add(itemId));
    try {
      await api.updateOrderItemStatus(String(itemId), {
        id: itemId,
        status: newStatus,
      });
    } catch (err) {
      setItems(previousItems);
      showToast(err instanceof Error ? err.message : "Erreur lors de la mise à jour du produit.", "error");
    } finally {
      setItemsUpdating((s) => { const next = new Set(s); next.delete(itemId); return next; });
    }
  };

  // Add product (case 2 & 3)
  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const p = pharmacyProducts.find((p) => p.id === selectedProductId);
    if (!p) return;
    const unitPrice = p.sale_price ?? 0;
    const label = [p.name, p.dci, p.dosage].filter(Boolean).join(" — ");
    setAddedProducts((prev) => [
      ...prev,
      { id: Date.now(), name: label, quantity, price: unitPrice, total: unitPrice * quantity, status: "RESERVED" as const },
    ]);
    setSelectedProductId("");
    setQuantity(1);
  };

  // Validate order
  const validateOrder = async () => {
    const all = [...items, ...addedProducts];
    if (all.every((i) => i.status === "PENDING")) {
      showToast("Marquez la disponibilité d'au moins un produit.", "warning");
      return;
    }
    const hasReserved = all.some((i) => i.status === "RESERVED");
    const finalStatus = hasReserved ? "RESERVED" : "REJECTED";
    setIsValidating(true);
    try {
      await api.validateOrder(orderId, { status: finalStatus });
      showToast(
        hasReserved ? "Commande validée avec succès !" : "Commande rejetée.",
        hasReserved ? "success" : "error"
      );
      router.push("/orders");
    } catch {
      showToast("Erreur lors de la validation.", "error");
    } finally {
      setIsValidating(false);
    }
  };

  // Invoice
  const handleGetInvoice = async () => {
    setInvoiceLoading(true);
    setInvoiceError(null);
    try {
      const res = await api.getInvoice({ order_id: orderId });
      setInvoice(res);
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Erreur lors de la récupération de la facture.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice?.id) return;
    setPdfLoading(true);
    try {
      const blob = await api.getInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setInvoiceError("Erreur lors du téléchargement du PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  // QR Code
  const handleGetQrCode = async () => {
    setShowQrModal(true);
    setQrLoading(true);
    setQrError(null);
    setQrData(null);
    try {
      const res = await api.getOrderQrCode(orderId);
      setQrData(res);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Erreur lors de la récupération du QR code.");
    } finally {
      setQrLoading(false);
    }
  };

  // Sub-order
  const addSubItem = () => setSubItems((p) => [...p, { product_id: "", quantity: 1, unit_price: 0 }]);
  const removeSubItem = (i: number) => setSubItems((p) => p.filter((_, idx) => idx !== i));
  const updateSubItem = (i: number, field: keyof SubItem, value: string | number) => {
    setSubItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  };

  const handleSubmitSubOrder = async () => {
    setSubMsg(null);
    const valid = subItems.filter((it) => it.product_id.trim());
    if (!valid.length) {
      setSubMsg({ text: "Ajoutez au moins un produit.", ok: false });
      return;
    }
    setSubLoading(true);
    try {
      await api.generateSubOrder({ order_id: orderId, officine_id: officineId, items: valid });
      setSubMsg({ text: "Sous-commande générée avec succès.", ok: true });
      setSubItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
    } catch (err) {
      setSubMsg({ text: err instanceof Error ? err.message : "Erreur.", ok: false });
    } finally {
      setSubLoading(false);
    }
  };

  /* ── computed ── */
  const allItems = [...items, ...addedProducts];
  const reservedTotal = items
    .filter((i) => i.status !== "CANCELLED")
    .reduce((s, i) => s + i.total, 0);
  const addedTotal = addedProducts.reduce((s, i) => s + i.total, 0);
  const finalTotal = reservedTotal + addedTotal;
  const hasReserved = allItems.some((i) => i.status === "RESERVED");
  const allPending = allItems.every((i) => i.status === "PENDING");

  /* ── loading ── */
  if (isLoading) {
    return (
      <DashboardLayout title="Détails commande">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={32} className="animate-spin text-[#22C55E]" />
          <p className="text-[14px] text-[#94A3B8]">Chargement de la commande…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Détails commande">
      <div className="space-y-5 animate-fade-in-up">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B] hover:border-[#1E293B] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-[16px] font-semibold text-[#1E293B]">
                Commande{" "}
                <span className="font-mono text-[#22C55E]">#{orderId.slice(0, 8)}</span>
              </h2>
              <nav className="flex items-center gap-1 text-[12px] text-[#94A3B8] mt-0.5">
                <Link href="/orders" className="hover:text-[#22C55E]">Commandes</Link>
                <span>/</span>
                <span>Détails</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGetInvoice}
              disabled={invoiceLoading}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-[#E2E8F0] rounded-xl text-[#1E293B] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors disabled:opacity-50"
            >
              {invoiceLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Facture
            </button>
            <button
              onClick={handleGetQrCode}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-[#E2E8F0] rounded-xl text-[#1E293B] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors"
            >
              <QrCode size={14} />
              QR Code
            </button>
            {order?.prescription && (
              <button
                onClick={() => setShowSubModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors"
              >
                <PackagePlus size={14} />
                Sous-commande
              </button>
            )}
          </div>
        </div>

        {/* ── Invoice banner ── */}
        {invoiceError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl">
            <AlertCircle size={15} />
            {invoiceError}
          </div>
        )}
        {invoice && (
          <div className="flex items-center justify-between gap-3 flex-wrap bg-[#F0FDF4] border border-green-200 text-[#1E293B] px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-[13px]">
              <FileText size={15} className="text-[#22C55E]" />
              <span className="font-semibold">Facture #{invoice.id.slice(0, 8)}</span>
              <span className="text-[#94A3B8]">
                — {invoice.total ?? invoice.total_amount ?? "—"} XAF
              </span>
              {invoice.created_at && (
                <span className="text-[#94A3B8]">
                  · {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              PDF
            </button>
          </div>
        )}

        {/* ── Case badge ── */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border border-green-200 rounded-full text-[12px] font-semibold text-[#22C55E]">
          CAS {orderCase} :{" "}
          {orderCase === 1
            ? "Produits uniquement"
            : orderCase === 2
              ? "Ordonnance uniquement"
              : "Ordonnance + Produits"}
        </div>

        {/* ── Info cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoCard label="Patient" value={order?.patientName || "—"} icon={User} />
          <InfoCard label="Date" value={order?.date || "—"} icon={Calendar} />
          <InfoCard label="Statut" value={<StatusBadge status={order?.status || ""} />} icon={CheckCircle2} />
          <InfoCard label="Paiement" value={<StatusBadge status={order?.payment_status || ""} />} icon={FileText} />
        </div>

        {/* ── Main content ── */}
        <div className={`grid gap-5 ${orderCase === 1 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-3"}`}>

          {/* Left: prescription + items */}
          <div className="lg:col-span-2 space-y-5">

            {/* Prescription image */}
            {order?.prescription && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                  <h3 className="text-[14px] font-semibold text-[#1E293B] flex items-center gap-2">
                    <FileText size={15} className="text-[#22C55E]" />
                    Ordonnance patient
                  </h3>
                  <a
                    href={order.prescription}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#F0FDF4] transition-colors"
                    title="Télécharger"
                  >
                    <Download size={14} />
                  </a>
                </div>
                {/* Thumbnail — cliquer pour ouvrir la lightbox */}
                <button
                  type="button"
                  onClick={() => setShowPrescriptionLightbox(true)}
                  className="w-full p-4 flex flex-col items-center gap-2 group cursor-zoom-in"
                  title="Cliquer pour agrandir"
                >
                  <div className="relative w-full max-w-[360px]">
                    <Image
                      src={order.prescription}
                      alt="Ordonnance"
                      width={360}
                      height={500}
                      className="rounded-lg shadow-sm object-contain w-full max-h-[320px] group-hover:opacity-90 transition-opacity"
                    />
                    {/* Overlay hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-white text-[12px] font-semibold">
                        <ZoomIn size={14} />
                        Agrandir
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Cliquez pour afficher en plein écran</p>
                </button>
              </div>
            )}

            {/* Items table */}
            {(orderCase === 1 || orderCase === 3) && items.length > 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E2E8F0]">
                  <h3 className="text-[14px] font-semibold text-[#1E293B]">Produits de la commande</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">Produit</th>
                        <th className="text-center px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">Qté</th>
                        <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">P.U.</th>
                        <th className="text-left px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">Total</th>
                        <th className="text-right px-4 py-3 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">Disponibilité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#1E293B]">{item.name}</td>
                          <td className="px-4 py-3 text-center text-[#64748B]">{item.quantity}</td>
                          <td className="px-4 py-3 text-[#64748B]">{item.price.toLocaleString("fr-FR")} XAF</td>
                          <td className="px-4 py-3 font-semibold text-[#1E293B]">{item.total.toLocaleString("fr-FR")} XAF</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {itemsUpdating.has(item.id) ? (
                                <Loader2 size={14} className="animate-spin text-[#94A3B8]" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => toggleItem(item.id, "RESERVED")}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${item.status === "RESERVED"
                                      ? "bg-[#22C55E] text-white"
                                      : "border border-[#E2E8F0] text-[#94A3B8] hover:border-[#22C55E] hover:text-[#22C55E]"
                                      }`}
                                  >
                                    <Check size={11} />
                                    Réserver
                                  </button>
                                  <button
                                    onClick={() => toggleItem(item.id, "CANCELLED")}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${item.status === "CANCELLED"
                                      ? "bg-[#EF4444] text-white"
                                      : "border border-[#E2E8F0] text-[#94A3B8] hover:border-[#EF4444] hover:text-[#EF4444]"
                                      }`}
                                  >
                                    <X size={11} />
                                    Indispo
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add product (cases 2 & 3) */}
            {(orderCase === 2 || orderCase === 3) && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] mb-3">Ajouter des produits</h3>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={productsLoading}
                    className="flex-1 min-w-48 px-3 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] cursor-pointer"
                  >
                    <option value="">
                      {productsLoading
                        ? "Chargement…"
                        : pharmacyProducts.length === 0
                          ? "Aucun produit"
                          : "Sélectionner un produit"}
                    </option>
                    {pharmacyProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {[p.name, p.dci, p.dosage].filter(Boolean).join(" — ")}
                        {p.sale_price ? ` (${p.sale_price} XAF)` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] text-center focus:outline-none focus:border-[#22C55E]"
                  />
                  <button
                    onClick={handleAddProduct}
                    disabled={!selectedProductId}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: recap */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sticky top-20">
              <h3 className="text-[14px] font-semibold text-[#1E293B] mb-4 text-center">Récapitulatif</h3>

              {/* Added products list */}
              {addedProducts.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-2">
                    Produits ajoutés
                  </p>
                  <div className="space-y-2">
                    {addedProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-[13px]">
                        <div>
                          <p className="text-[#1E293B] font-medium leading-snug">{p.name}</p>
                          <p className="text-[#94A3B8] text-[11px]">Qté: {p.quantity}</p>
                        </div>
                        <span className="font-semibold text-[#1E293B]">
                          {p.total.toLocaleString("fr-FR")} XAF
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E2E8F0] my-3" />
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Total commande</span>
                  <span className="font-medium">{reservedTotal.toLocaleString("fr-FR")} XAF</span>
                </div>
                {addedProducts.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Total ajouts</span>
                    <span className="font-medium">{addedTotal.toLocaleString("fr-FR")} XAF</span>
                  </div>
                )}
                <div className="border-t border-[#E2E8F0] pt-2 flex justify-between">
                  <span className="text-[15px] font-semibold text-[#1E293B]">Total final</span>
                  <span className="text-[15px] font-bold text-[#22C55E]">
                    {finalTotal.toLocaleString("fr-FR")} XAF
                  </span>
                </div>
              </div>

              {/* Pending warning */}
              {allItems.some((i) => i.status === "PENDING") && allItems.length > 0 && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[12px] px-3 py-2.5 rounded-xl mt-4">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    {allItems.filter((i) => i.status === "PENDING").length} produit(s) non marqué(s) — ignorés.
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 space-y-2">
                {allItems.length > 0 ? (
                  <button
                    onClick={validateOrder}
                    disabled={isValidating || allPending}
                    className={`w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${hasReserved
                      ? "bg-[#22C55E] hover:bg-[#16A34A] text-white"
                      : "bg-[#EF4444] hover:bg-red-600 text-white"
                      }`}
                  >
                    {isValidating ? (
                      <><Loader2 size={16} className="animate-spin" />Traitement…</>
                    ) : hasReserved ? (
                      <><CheckCircle2 size={16} />Valider la commande</>
                    ) : (
                      <><XCircle size={16} />Rejeter la commande</>
                    )}
                  </button>
                ) : (
                  <p className="text-center text-[12px] text-[#94A3B8] py-2">
                    Aucun produit à valider pour cette commande.
                  </p>
                )}
                <button
                  onClick={() => router.push("/orders")}
                  className="w-full py-2.5 rounded-xl text-[13px] font-medium border border-[#E2E8F0] text-[#94A3B8] hover:border-[#1E293B] hover:text-[#1E293B] transition-colors"
                >
                  Retour aux commandes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QR Code Modal ── */}
      <Modal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={<span className="flex items-center gap-2"><QrCode size={16} />QR Code de la commande</span>}
        footer={
          <>
            <button
              onClick={() => setShowQrModal(false)}
              className="px-4 py-2 text-[13px] border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#1E293B] transition-colors"
            >
              Fermer
            </button>
            {(qrData?.qr_code_url || qrData?.qr_code || qrData?.image) && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-[13px] bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors"
              >
                <Printer size={14} />
                Imprimer
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-col items-center py-4 gap-4">
          {qrLoading ? (
            <>
              <Loader2 size={32} className="animate-spin text-[#22C55E]" />
              <p className="text-[13px] text-[#94A3B8]">Génération du QR code…</p>
            </>
          ) : qrError ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl w-full">
              <AlertCircle size={15} />
              {qrError}
            </div>
          ) : qrData ? (
            <>
              {(qrData.qr_code_url || qrData.qr_code || qrData.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrData.qr_code_url ?? qrData.qr_code ?? qrData.image}
                  alt="QR Code commande"
                  className="max-w-[240px] w-full border border-[#E2E8F0] rounded-xl p-3"
                />
              ) : (
                <pre className="text-[11px] text-left bg-[#F8FAFC] p-3 rounded-xl w-full overflow-auto">
                  {JSON.stringify(qrData, null, 2)}
                </pre>
              )}
              <p className="text-[12px] text-[#94A3B8] text-center max-w-xs">
                Ce QR code sera scanné par le livreur lors du retrait en officine.
              </p>
            </>
          ) : (
            <p className="text-[13px] text-[#94A3B8]">Aucun QR code disponible.</p>
          )}
        </div>
      </Modal>

      {/* ── Sub-order Modal ── */}
      <Modal
        open={showSubModal}
        onClose={() => { setShowSubModal(false); setSubMsg(null); }}
        title={<span className="flex items-center gap-2"><PackagePlus size={16} />Générer une sous-commande</span>}
        wide
        footer={
          <>
            <button
              onClick={() => { setShowSubModal(false); setSubMsg(null); }}
              className="px-4 py-2 text-[13px] border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#1E293B] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmitSubOrder}
              disabled={subLoading}
              className="flex items-center gap-2 px-4 py-2 text-[13px] bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors disabled:opacity-50"
            >
              {subLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Générer
            </button>
          </>
        }
      >
        {subMsg && (
          <div
            className={`flex items-center gap-2 text-[13px] px-4 py-3 rounded-xl mb-4 ${subMsg.ok
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-100 text-red-600"
              }`}
          >
            {subMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {subMsg.text}
          </div>
        )}
        <p className="text-[13px] text-[#94A3B8] mb-4">
          Ajoutez les produits à préparer pour le patient en saisissant leur identifiant, quantité et prix unitaire.
        </p>
        <div className="space-y-2">
          {subItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="UUID du produit"
                value={item.product_id}
                onChange={(e) => updateSubItem(idx, "product_id", e.target.value)}
                className="flex-1 px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E]"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateSubItem(idx, "quantity", parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-2 text-[13px] text-center border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E]"
              />
              <input
                type="number"
                min={0}
                value={item.unit_price}
                onChange={(e) => updateSubItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-2 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E]"
                placeholder="Prix"
              />
              <button
                onClick={() => removeSubItem(idx)}
                disabled={subItems.length === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#EF4444] hover:bg-red-50 transition-colors disabled:opacity-30"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSubItem}
          className="flex items-center gap-1.5 mt-3 px-3 py-2 text-[12px] font-medium text-[#22C55E] border border-[#22C55E] rounded-xl hover:bg-[#F0FDF4] transition-colors"
        >
          <Plus size={13} />
          Ajouter un produit
        </button>
      </Modal>

      {/* ── Prescription Lightbox ── */}
      {showPrescriptionLightbox && order?.prescription && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setShowPrescriptionLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowPrescriptionLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Download button */}
          <a
            href={order.prescription}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-16 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Télécharger"
          >
            <Download size={18} />
          </a>

          {/* Image plein écran */}
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.prescription}
              alt="Ordonnance"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="absolute -bottom-8 left-0 right-0 text-center text-[12px] text-white/50">
              Cliquez en dehors de l&apos;image pour fermer
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
