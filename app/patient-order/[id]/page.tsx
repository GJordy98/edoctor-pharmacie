"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Building2,
    Phone,
    MapPin,
    ShoppingBag,
    CreditCard,
    QrCode,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Printer,
    X,
    Smartphone,
    Banknote,
    ThumbsUp,
    ThumbsDown,
    PackagePlus,
    Clock,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { PatientOrder, PatientOrderItem, QrCodeResponse, ScheduleDayPayload } from "@/lib/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { showToast } from "@/components/ui/Toast";

/* ─── helpers ─── */
function fmt(v: number | string | undefined, currency = "XAF"): string {
    const n = parseFloat(String(v ?? 0));
    if (isNaN(n)) return `0 ${currency}`;
    return `${Math.round(n).toLocaleString("fr-FR")} ${currency}`;
}

/* ─── modal ─── */
function Modal({
    open,
    onClose,
    title,
    children,
    footer,
}: {
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
                    <h3 className="text-[15px] font-semibold text-[#1E293B]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E2E8F0] shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── payment method option ─── */
type PayMethod = "MOMO" | "CASH" | "OM";

interface PayMethodOption {
    value: PayMethod;
    label: string;
    desc: string;
    icon: React.ElementType;
    color: string;
}

const PAY_METHODS: PayMethodOption[] = [
    {
        value: "MOMO",
        label: "Mobile Money",
        desc: "MTN Mobile Money",
        icon: Smartphone,
        color: "border-yellow-400 bg-yellow-50 text-yellow-700",
    },
    {
        value: "OM",
        label: "Orange Money",
        desc: "Orange Money",
        icon: Smartphone,
        color: "border-orange-400 bg-orange-50 text-orange-700",
    },
    {
        value: "CASH",
        label: "Espèces",
        desc: "Paiement à la collecte",
        icon: Banknote,
        color: "border-green-400 bg-green-50 text-green-700",
    },
];

/* ─── page ─── */
export default function PatientOrderDetailPage() {
    const { t } = useLanguage();
    const { id } = useParams();
    const router = useRouter();
    const orderId = id as string;

    const payMethods = [
        {
            value: "MOMO" as const,
            label: t("patient_order.pay_momo"),
            desc: t("patient_order.pay_momo_desc"),
            icon: Smartphone,
            color: "border-yellow-400 bg-yellow-50 text-yellow-700",
        },
        {
            value: "OM" as const,
            label: t("patient_order.pay_om"),
            desc: t("patient_order.pay_om_desc"),
            icon: Smartphone,
            color: "border-orange-400 bg-orange-50 text-orange-700",
        },
        {
            value: "CASH" as const,
            label: t("patient_order.pay_cash"),
            desc: t("patient_order.pay_cash_desc"),
            icon: Banknote,
            color: "border-green-400 bg-green-50 text-green-700",
        },
    ];

    const [order, setOrder] = useState<PatientOrder | null>(null);
    const [items, setItems] = useState<PatientOrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sub-order proposals from pharmacist
    const [subOrderItems, setSubOrderItems] = useState<{ id: string; name?: string; product?: { name?: string; dci?: string }; quantity?: number | string; unit_price?: number | string; [key: string]: unknown }[]>([]);

    // Patient validation state
    const [isValidating, setIsValidating] = useState(false);

    // QR Code
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    // Payment
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMethod, setPayMethod] = useState<PayMethod>("MOMO");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    // Schedule (Horaires)
    const [schedule, setSchedule] = useState<ScheduleDayPayload[] | null>(null);

    /* ── load order + items in parallel ── */
    const loadOrder = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [orderData, orderItems] = await Promise.all([
                api.getPatientOrderById(orderId),
                api.getPatientOrderItems(orderId),
            ]);
            setOrder(orderData);
            setItems(orderItems);

            if (orderData?.officine) {
                sessionStorage.setItem('viewing_officine', JSON.stringify(orderData.officine));
            }

            // Load sub-order proposals from pharmacist
            try {
                const sub = await api.getPatientSubOrderItems(orderId);
                setSubOrderItems(sub as typeof subOrderItems);
            } catch {
                // silencieux
            }

            // Load pharmacy schedules
            if (orderData?.officine?.id) {
                try {
                    const schedRes = await api.getSchedule(orderData.officine.id);
                    if (schedRes && Array.isArray(schedRes.schedules)) {
                        setSchedule(schedRes.schedules);
                    }
                } catch {
                    // silencieux
                }
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("patient_order.error_loading")
            );
        } finally {
            setIsLoading(false);
        }
    }, [orderId, t]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    /* ── computed values ── */
    const currency = order?.currency ?? "XAF";

    const subtotal = items.reduce((sum, item) => {
        const unitPrice = parseFloat(
            String(item.sale_price ?? item.unit_price ?? item.price ?? 0)
        );
        const qty = parseFloat(String(item.quantity ?? 1));
        return sum + unitPrice * qty;
    }, 0);

    const deliveryFee = parseFloat(String(order?.delivery_fee ?? 0));
    const total = parseFloat(String(order?.total_amount ?? 0)) || subtotal + deliveryFee;

    /* ── status logic ── */
    const status = order?.status ?? "";
    const isAccepted = status === "ACCEPTED" || status === "RESERVED";
    const isInPickup = status === "IN_PICKUP";
    const isPaid = order?.payment_status === "PAID";

    /* ── QR Code handler ── */
    const handleGetQrCode = async () => {
        setShowQrModal(true);
        setQrLoading(true);
        setQrError(null);
        setQrData(null);
        try {
            const res = await api.getOrderQrCode(orderId);
            setQrData(res);
        } catch (err) {
            setQrError(
                err instanceof Error ? err.message : t("patient_order.qr_modal_error")
            );
        } finally {
            setQrLoading(false);
        }
    };

    /* ── Payment handler ── */
    const handlePay = async () => {
        if ((payMethod === "MOMO" || payMethod === "OM") && !phoneNumber.trim()) {
            showToast(t("patient_order.toast_phone_required"), "warning");
            return;
        }

        setIsPaying(true);
        try {
            await api.payOrder({
                order_id: orderId,
                payment_method: payMethod,
                phone_number: phoneNumber.trim() || undefined,
            });
            showToast(t("patient_order.toast_pay_success"), "success");
            setShowPayModal(false);
            // Reload to get updated status
            await loadOrder();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : t("patient_order.toast_pay_error"),
                "error"
            );
        } finally {
            setIsPaying(false);
        }
    };

    /* ── officine helpers ── */
    const officine = order?.officine;
    const officineAddress = [officine?.adresse?.rue, officine?.adresse?.city]
        .filter(Boolean)
        .join(", ");

    /* ── loading state ── */
    if (isLoading) {
        return (
            <DashboardLayout title={t("patient_order.title")}>
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-[#22C55E]" />
                    </div>
                    <p className="text-[14px] text-[#94A3B8]">{t("patient_order.loading")}</p>
                </div>
            </DashboardLayout>
        );
    }

    /* ── error state ── */
    if (error || !order) {
        return (
            <DashboardLayout title={t("patient_order.title")}>
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <p className="text-[14px] font-medium text-[#1E293B]">
                        {error ?? t("patient_order.not_found")}
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="text-[13px] text-[#22C55E] hover:underline"
                    >
                        {t("patient_order.back")}
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={t("patient_order.title")}>
            <div className="space-y-5 animate-fade-in-up max-w-3xl mx-auto">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B] hover:border-[#1E293B] transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h2 className="text-[16px] font-semibold text-[#1E293B]">
                                {t("patient_order.order_number")}{" "}
                                <span className="font-mono text-[#22C55E]">
                                    #{orderId.slice(0, 8)}
                                </span>
                            </h2>
                            <nav className="flex items-center gap-1 text-[12px] text-[#94A3B8] mt-0.5">
                                <Link href="/orders" className="hover:text-[#22C55E]">
                                    {t("patient_order.breadcrumb_orders")}
                                </Link>
                                <span>/</span>
                                <span>{t("patient_order.breadcrumb_details")}</span>
                            </nav>
                        </div>
                    </div>
                    <StatusBadge status={status} />
                </div>

                {/* ═══════════════════════════════ */}
                {/* A. PHARMACIE (OFFICINE)         */}
                {/* ═══════════════════════════════ */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    {/* gradient header */}
                    <div className="bg-gradient-to-r from-[#22C55E]/10 to-transparent px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
                            <Building2 size={20} className="text-[#22C55E]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wide">
                                {t("patient_order.validating_pharmacy")}
                            </p>
                            <h3 className="text-[15px] font-bold text-[#1E293B]">
                                {officine?.name ?? "—"}
                            </h3>
                        </div>
                    </div>

                    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                        {/* Téléphone */}
                        {officine?.telephone && (
                            <a
                                href={`tel:${officine.telephone}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#22C55E] hover:bg-[#F0FDF4] transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                    <Phone size={14} className="text-[#22C55E]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">
                                        {t("patient_order.contact")}
                                    </p>
                                    <p className="font-semibold text-[#1E293B] group-hover:text-[#22C55E] transition-colors">
                                        {officine.telephone}
                                    </p>
                                </div>
                            </a>
                        )}

                        {/* Adresse */}
                        {officineAddress && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <MapPin size={14} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">
                                        {t("patient_order.location")}
                                    </p>
                                    <p className="font-semibold text-[#1E293B]">{officineAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Horaires d'ouverture */}
                    {schedule && schedule.length > 0 && (
                        <div className="px-5 pb-5 pt-4 border-t border-[#F1F5F9] bg-[#F8FAFC]/50">
                            <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Clock size={13} className="text-[#22C55E]" />
                                {t("patient_order.schedules")}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                {schedule.map((s, idx) => {
                                    const dayName = t("schedule.days." + s.day).slice(0, 3);
                                    return (
                                        <div key={idx} className={`p-2 rounded-xl border text-center transition-all ${
                                            s.is_guard 
                                                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                                : 'bg-white border-[#E2E8F0] text-[#64748B]'
                                        }`}>
                                            <p className="text-[11px] font-bold text-[#1E293B]">{dayName}</p>
                                            <p className="text-[10px] mt-0.5 font-medium">{s.open_time} - {s.close_time}</p>
                                            {s.is_guard && (
                                                <span className="inline-block text-[8px] font-extrabold bg-amber-200 text-amber-900 px-1 py-0.5 rounded mt-1 uppercase tracking-wide">
                                                    {t("schedule.guard_badge")}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════ */}
                {/* B*. PROPOSITION PHARMACIEN      */}
                {/* ═══════════════════════════════ */}
                {subOrderItems.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <PackagePlus size={16} className="text-blue-600" />
                            </div>
                            <h3 className="text-[14px] font-semibold text-[#1E293B]">
                                {t("patient_order.pharmacist_proposal")}
                            </h3>
                            <span className="ml-auto text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                {subOrderItems.length} {subOrderItems.length > 1 ? t("patient_order.articles") : t("patient_order.article")}
                            </span>
                        </div>
                        <div className="divide-y divide-[#F1F5F9]">
                            {subOrderItems.map((item, idx) => (
                                <div key={String(item.id ?? idx)} className="flex items-center gap-4 px-5 py-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-blue-600">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[13px] font-semibold text-[#1E293B]">
                                            {item.product?.name ?? item.name ?? `Produit ${idx + 1}`}
                                        </p>
                                        {item.product?.dci && (
                                            <p className="text-[11px] text-[#94A3B8]">{t("recuperation_colis.dci")} : {item.product.dci}</p>
                                        )}
                                    </div>
                                    <span className="text-[12px] font-medium text-[#64748B]">x{item.quantity ?? 1}</span>
                                </div>
                            ))}
                        </div>
                        {/* Validation buttons: patient accepts or rejects pharmacist proposal */}
                        {(status === 'PENDING_PATIENT' || status === 'PENDING') && (
                            <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
                                <button
                                    onClick={async () => {
                                        setIsValidating(true);
                                        try {
                                            await api.validateOrderByPatient(orderId, 'VALIDATED');
                                            showToast(t("patient_order.toast_accept_success"), 'success');
                                            await loadOrder();
                                        } catch (err) {
                                            showToast(err instanceof Error ? err.message : t("validate_order.invalid_code_error"), 'error');
                                        } finally {
                                            setIsValidating(false);
                                        }
                                    }}
                                    disabled={isValidating}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isValidating ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                                    {t("patient_order.accept")}
                                </button>
                                <button
                                    onClick={async () => {
                                        setIsValidating(true);
                                        try {
                                            await api.validateOrderByPatient(orderId, 'REJECTED');
                                            showToast(t("patient_order.toast_reject_success"), 'error');
                                            await loadOrder();
                                        } catch (err) {
                                            showToast(err instanceof Error ? err.message : t("validate_order.invalid_code_error"), 'error');
                                        } finally {
                                            setIsValidating(false);
                                        }
                                    }}
                                    disabled={isValidating}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isValidating ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                                    {t("patient_order.reject")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════ */}
                {/* B. PANIER VALIDÉ               */}
                {/* ═══════════════════════════════ */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                            <ShoppingBag size={16} className="text-[#22C55E]" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-[#1E293B]">
                            {t("patient_order.items_to_deliver")}
                        </h3>
                        {items.length > 0 && (
                            <span className="ml-auto text-[11px] font-semibold bg-[#F0FDF4] text-[#22C55E] px-2 py-0.5 rounded-full">
                                {items.length} {items.length > 1 ? t("patient_order.articles") : t("patient_order.article")}
                            </span>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="px-5 py-8 text-center text-[13px] text-[#94A3B8]">
                            {t("patient_order.no_items")}
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F1F5F9]">
                            {items.map((item, idx) => {
                                const name =
                                    item.product?.name ??
                                    item.product_name ??
                                    `Produit ${idx + 1}`;
                                const unitPrice = parseFloat(
                                    String(item.sale_price ?? item.unit_price ?? item.price ?? 0)
                                );
                                const qty = parseFloat(String(item.quantity ?? 1));
                                const qtyAvail =
                                    item.quantity_available != null
                                        ? parseFloat(String(item.quantity_available))
                                        : null;
                                const lineTot =
                                    parseFloat(String(item.line_total ?? item.total_price ?? 0)) ||
                                    unitPrice * qty;
                                const qtyDiffers = qtyAvail != null && qtyAvail !== qty;

                                return (
                                    <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                                        {/* Bullet */}
                                        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[11px] font-bold text-[#22C55E]">
                                                {idx + 1}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-[#1E293B] leading-snug">
                                                {name}
                                            </p>
                                            {item.product?.dci && (
                                                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                                    {t("recuperation_colis.dci")} : {item.product.dci}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className="text-[12px] text-[#64748B]">
                                                    {fmt(unitPrice, currency)} / {t("patient_order.article")}
                                                </span>
                                                <span className="text-[12px] text-[#94A3B8]">×</span>
                                                <span className="text-[12px] font-medium text-[#1E293B]">
                                                    {t("patient_order.qty_label")}{qty}
                                                </span>

                                                {/* Warning si quantité disponible ≠ demandée */}
                                                {qtyDiffers && (
                                                    <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                        <AlertCircle size={10} />
                                                        {t("patient_order.dispo")}{qtyAvail}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-[14px] font-bold text-[#1E293B]">
                                                {fmt(lineTot, currency)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════ */}
                {/* C. RÉCAPITULATIF PAIEMENT      */}
                {/* ═══════════════════════════════ */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <CreditCard size={16} className="text-purple-500" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-[#1E293B]">
                            {t("patient_order.financial_summary")}
                        </h3>
                    </div>

                    <div className="px-5 py-5 space-y-3 text-[13px]">
                        <div className="flex justify-between items-center">
                            <span className="text-[#64748B]">{t("patient_order.subtotal")}</span>
                            <span className="font-semibold text-[#1E293B]">
                                {fmt(subtotal, currency)}
                            </span>
                        </div>

                        {deliveryFee > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#64748B]">{t("patient_order.delivery_fee")}</span>
                                <span className="font-semibold text-[#1E293B]">
                                    {fmt(deliveryFee, currency)}
                                </span>
                            </div>
                        )}

                        <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-center">
                            <span className="text-[15px] font-bold text-[#1E293B]">{t("patient_order.total_to_pay")}</span>
                            <span className="text-[17px] font-extrabold text-[#22C55E]">
                                {fmt(total, currency)}
                            </span>
                        </div>

                        {/* Payment status */}
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-[#94A3B8]">{t("patient_order.payment_status_title")}</span>
                            <StatusBadge status={order.payment_status ?? "UNPAID"} />
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════ */}
                {/* D. ACTIONS SELON STATUT        */}
                {/* ═══════════════════════════════ */}
                <div className="space-y-3">

                    {/* ACCEPTED → Procéder au paiement */}
                    {isAccepted && !isPaid && (
                        <button
                            onClick={() => setShowPayModal(true)}
                            className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 bg-[#22C55E] hover:bg-[#16A34A] text-white transition-colors shadow-lg shadow-green-200"
                        >
                            <CreditCard size={20} />
                            {t("patient_order.pay_now")}
                        </button>
                    )}

                    {/* Already paid confirmation */}
                    {isAccepted && isPaid && (
                        <div className="flex items-center gap-3 px-5 py-4 bg-[#F0FDF4] border border-green-200 rounded-2xl text-[#16A34A]">
                            <CheckCircle2 size={20} className="shrink-0" />
                            <span className="text-[14px] font-semibold">
                                {t("patient_order.payment_confirmed_waiting")}
                            </span>
                        </div>
                    )}

                    {/* IN_PICKUP → Afficher QR Code */}
                    {isInPickup && (
                        <button
                            onClick={handleGetQrCode}
                            className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-200"
                        >
                            <QrCode size={20} />
                            {t("patient_order.show_qr_code")}
                        </button>
                    )}

                    {/* Other statuses — info */}
                    {!isAccepted && !isInPickup && status !== "" && (
                        <div className="px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[13px] text-[#64748B] text-center">
                            {status === "PENDING" &&
                                t("patient_order.status_pending_desc")}
                            {status === "DELIVERED" &&
                                t("patient_order.status_delivered_desc")}
                            {(status === "REJECTED" || status === "CANCELLED") &&
                                t("patient_order.status_cancelled_desc")}
                            {status === "IN_DELIVERY" &&
                                t("patient_order.status_in_delivery_desc")}
                        </div>
                    )}

                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="w-full py-3 rounded-2xl text-[13px] font-medium border border-[#E2E8F0] text-[#94A3B8] hover:border-[#1E293B] hover:text-[#1E293B] transition-colors"
                    >
                        {t("patient_order.back")}
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* MODAL — QR CODE                        */}
            {/* ═══════════════════════════════════════ */}
            <Modal
                open={showQrModal}
                onClose={() => setShowQrModal(false)}
                title={
                    <span className="flex items-center gap-2">
                        <QrCode size={16} className="text-blue-600" />
                        {t("patient_order.qrcode_title")}
                    </span>
                }
                footer={
                    <>
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="px-4 py-2 text-[13px] border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#1E293B] transition-colors"
                        >
                            {t("patient_order.close")}
                        </button>
                        {(qrData?.qr_code_url ?? qrData?.qr_code ?? qrData?.image) && (
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 text-[13px] bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                <Printer size={14} />
                                {t("patient_order.print")}
                            </button>
                        )}
                    </>
                }
            >
                <div className="flex flex-col items-center py-4 gap-5">
                    {qrLoading ? (
                        <>
                            <Loader2 size={36} className="animate-spin text-blue-500" />
                            <p className="text-[13px] text-[#94A3B8]">
                                {t("patient_order.qr_modal_loading")}
                            </p>
                        </>
                    ) : qrError ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl w-full">
                            <AlertCircle size={15} />
                            {qrError}
                        </div>
                    ) : qrData ? (
                        <>
                            {qrData.qr_code_url ?? qrData.qr_code ?? qrData.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={
                                        (qrData.qr_code_url ??
                                            qrData.qr_code ??
                                            qrData.image) as string
                                    }
                                    alt="QR Code retrait"
                                    className="max-w-[220px] w-full border-2 border-[#E2E8F0] rounded-2xl p-4 shadow-sm"
                                />
                            ) : (
                                <pre className="text-[11px] text-left bg-[#F8FAFC] p-3 rounded-xl w-full overflow-auto">
                                    {JSON.stringify(qrData, null, 2)}
                                </pre>
                            )}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center max-w-xs">
                                <p className="text-[12px] text-blue-700 font-medium">
                                    {t("patient_order.qrcode_desc")}
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-[13px] text-[#94A3B8]">{t("patient_order.no_qr_available")}</p>
                    )}
                </div>
            </Modal>

            {/* ═══════════════════════════════════════ */}
            {/* MODAL — PAIEMENT                       */}
            {/* ═══════════════════════════════════════ */}
            <Modal
                open={showPayModal}
                onClose={() => !isPaying && setShowPayModal(false)}
                title={
                    <span className="flex items-center gap-2">
                        <CreditCard size={16} className="text-[#22C55E]" />
                        {t("patient_order.payment_method")}
                    </span>
                }
                footer={
                    <>
                        <button
                            onClick={() => setShowPayModal(false)}
                            disabled={isPaying}
                            className="px-4 py-2 text-[13px] border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#1E293B] transition-colors disabled:opacity-40"
                        >
                            {t("patient_order.cancel")}
                        </button>
                        <button
                            onClick={handlePay}
                            disabled={isPaying}
                            className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors disabled:opacity-50"
                        >
                            {isPaying ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <CreditCard size={14} />
                            )}
                            {isPaying ? t("patient_order.processing") : `${t("patient_order.pay")} ${fmt(total, currency)}`}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Order summary recap */}
                    <div className="bg-[#F0FDF4] border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-[13px] text-[#64748B]">{t("patient_order.total_due")}</span>
                        <span className="text-[16px] font-extrabold text-[#22C55E]">
                            {fmt(total, currency)}
                        </span>
                    </div>

                    {/* Method selection */}
                    <div className="space-y-2">
                        <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                            {t("patient_order.payment_mode")}
                        </p>
                        {payMethods.map((m) => {
                            const Icon = m.icon;
                            const active = payMethod === m.value;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => setPayMethod(m.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${active
                                        ? m.color + " border-current"
                                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1]"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <div>
                                        <p className="text-[13px] font-bold">{m.label}</p>
                                        <p className="text-[11px] opacity-75">{m.desc}</p>
                                    </div>
                                    {active && (
                                        <CheckCircle2
                                            size={16}
                                            className="ml-auto shrink-0 text-current"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Phone field for MOMO / OM */}
                    {(payMethod === "MOMO" || payMethod === "OM") && (
                        <div className="space-y-1.5">
                            <label
                                htmlFor="phone-pay"
                                className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide"
                            >
                                {t("patient_order.phone_number_title")} {payMethod === "MOMO" ? "MTN MoMo" : "Orange Money"}
                            </label>
                            <div className="relative">
                                <Phone
                                    size={14}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                                />
                                <input
                                    id="phone-pay"
                                    type="tel"
                                    placeholder={t("patient_order.phone_placeholder")}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* CASH info */}
                    {payMethod === "CASH" && (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[12px] text-green-700">
                            {t("patient_order.cash_payment_desc")}
                        </div>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}
