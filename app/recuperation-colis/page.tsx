'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    PackageSearch, AlertCircle, CheckCircle2, Loader2,
    Camera, X, Upload, Pill, Building2, Truck,
    FlaskConical, Layers, Hash, Info, Eye, MapPin, RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api-client';

// ── Types ─────────────────────────────────────────────────
interface PickupItem {
    id: string;
    name: string;
    dci: string;
    galenic: string;
}

interface PickupResult {
    message?: string;
    officine?: string;
    mission_status?: string;
    items?: PickupItem[];
    [key: string]: unknown;
}

interface PickupOfficine {
    id: string;
    name?: string;
    officine_name?: string;
    telephone?: string;
    address?: string;
    adresse?: { rue?: string; city?: string };
    orders_count?: number;
    [key: string]: unknown;
}

// ── Status badge ──────────────────────────────────────────
function MissionStatusBadge({ status }: { status?: string }) {
    if (!status) return null;

    const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
        IN_TRANSIT: { label: 'En transit', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
        PENDING: { label: 'En attente', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
        DELIVERED: { label: 'Livré', bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
        CANCELLED: { label: 'Annulé', bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
    };

    const config = map[status] ?? { label: status, bg: '#F8FAFC', text: '#475569', dot: '#94A3B8' };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
            style={{ backgroundColor: config.bg, color: config.text }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
            {config.label}
        </span>
    );
}

// ── Item card ─────────────────────────────────────────────
function MedicamentCard({ item, index }: { item: PickupItem; index: number }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#22C55E]/40 hover:shadow-sm transition-all">
            {/* Number */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[11px] font-bold text-white">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
                {/* Name */}
                <p className="text-[13px] font-semibold text-[#1E293B] leading-snug">{item.name}</p>

                {/* DCI */}
                <div className="flex items-center gap-1.5">
                    <FlaskConical size={11} className="text-[#94A3B8] shrink-0" />
                    <span className="text-[11px] text-[#64748B]">
                        <span className="font-medium text-[#475569]">DCI :</span> {item.dci}
                    </span>
                </div>

                {/* Galenic */}
                <div className="flex items-center gap-1.5">
                    <Layers size={11} className="text-[#94A3B8] shrink-0" />
                    <span className="text-[11px] text-[#64748B]">
                        <span className="font-medium text-[#475569]">Forme :</span> {item.galenic}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Pickup Officine Card ───────────────────────────────────
function PickupOfficineCard({ officine }: { officine: PickupOfficine }) {
    const name = officine.name || officine.officine_name || 'Pharmacie';
    const address = [
        officine.adresse?.rue,
        officine.adresse?.city,
        officine.address,
    ].filter(Boolean).join(', ');
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#22C55E]/40 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shrink-0 shadow-sm">
                <Building2 size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1E293B]">{name}</p>
                {address && (
                    <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-[#94A3B8] shrink-0" />
                        <span className="text-[11px] text-[#64748B]">{address}</span>
                    </div>
                )}
                {officine.telephone && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <Truck size={11} className="text-[#94A3B8] shrink-0" />
                        <span className="text-[11px] text-[#64748B]">{String(officine.telephone)}</span>
                    </div>
                )}
            </div>
            {officine.orders_count != null && Number(officine.orders_count) > 0 && (
                <span className="shrink-0 bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {officine.orders_count} colis
                </span>
            )}
        </div>
    );
}

// ── Pickup Result card ────────────────────────────────────
function PickupResultCard({ data }: { data: PickupResult }) {
    const items = data.items ?? [];
    const knownKeys = new Set(['message', 'officine', 'mission_status', 'items']);
    const extraEntries = Object.entries(data).filter(([k, v]) => !knownKeys.has(k) && v != null);

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
            {/* Success header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] p-5 text-white shadow-lg">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/5" />
                <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[16px] font-bold">Récupération validée !</p>
                        {data.message && (
                            <p className="text-[12px] text-white/80 mt-0.5">{data.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Mission info */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                        Informations de la mission
                    </p>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Officine */}
                    {data.officine && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                                <Building2 size={14} className="text-[#3B82F6]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">Officine</p>
                                <p className="text-[13px] font-semibold text-[#1E293B] truncate" title={data.officine}>
                                    {data.officine}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mission status */}
                    {data.mission_status && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
                                <Truck size={14} className="text-[#22C55E]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">Statut mission</p>
                                <MissionStatusBadge status={data.mission_status} />
                            </div>
                        </div>
                    )}

                    {/* Extra fields */}
                    {extraEntries.map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                                <Info size={13} className="text-[#94A3B8]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">{key}</p>
                                <p className="text-[12px] font-medium text-[#1E293B] truncate">{String(value)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Products to hand over */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Pill size={14} className="text-[#22C55E]" />
                        <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                            Produits à récupérer
                        </p>
                    </div>
                    {items.length > 0 && (
                        <span className="bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {items.length} article{items.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="p-4">
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E2E8F0] p-8 text-center">
                            <Pill size={28} className="text-[#CBD5E1] mx-auto mb-2" />
                            <p className="text-[12px] text-[#94A3B8]">Aucun article retourné par le serveur.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <MedicamentCard key={item.id ?? idx} item={item} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────
type Tab = 'validate' | 'officines';

export default function RecuperationColisPage() {
    const [otpCode, setOtpCode] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PickupResult | null>(null);
    const [loadedItems, setLoadedItems] = useState<PickupItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    // Parse code and fetch medicines (Step 1 -> Step 2)
    const loadPackageDetails = async () => {
        const trimmed = otpCode.trim();
        if (!trimmed) {
            setError('Veuillez saisir ou scanner un code.');
            return;
        }

        setLoadingItems(true);
        setError(null);
        setLoadedItems([]);

        let orderId = '';
        try {
            // Tenter d'analyser comme du JSON (QR code du livreur)
            const parsed = JSON.parse(trimmed);
            orderId = parsed.officine_order_id || parsed.pickup_id || '';
        } catch {
            // Pas un JSON, vérifier si c'est un UUID valide
            if (trimmed.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
                orderId = trimmed;
            }
        }

        if (orderId) {
            try {
                const items = await api.getPatientSubOrderItems(orderId);
                const formatted: PickupItem[] = (items ?? []).map((it: any) => ({
                    id: String(it.id ?? ''),
                    name: String(it.product_name ?? it.product?.name ?? 'Médicament'),
                    dci: String(it.product?.dci ?? '—'),
                    galenic: String(it.product?.galenic_detail?.name ?? it.product?.dosage ?? '—')
                }));
                setLoadedItems(formatted);
                setStep(2);
            } catch (err: any) {
                setError("Impossible de charger les médicaments associés à ce code. Assurez-vous qu'il s'agit d'une commande valide.");
            } finally {
                setLoadingItems(false);
            }
        } else {
            // Code OTP numérique classique
            setLoadingItems(false);
            setStep(2);
        }
    };

    // ── Photo handling ───────────────────────────
    const handlePhotoChange = useCallback((file: File | null) => {
        if (!file) {
            setPhoto(null);
            setPhotoPreview(null);
            return;
        }
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        handlePhotoChange(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file && file.type.startsWith('image/')) {
            handlePhotoChange(file);
        }
    };

    // ── Submit ────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo) {
            setError('La photo/vidéo du colis est obligatoire.');
            return;
        }
        if (!otpCode.trim()) {
            setError('Le code de récupération est manquant.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.validatePickupByDriver(
                otpCode.trim(),
                photo
            );
            setResult(data);
            // Réinitialisation après succès
            setOtpCode('');
            setPhoto(null);
            setPhotoPreview(null);
            setLoadedItems([]);
            setStep(1);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur de validation ou code incorrect.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetAll = useCallback(() => {
        setResult(null);
        setError(null);
        setOtpCode('');
        setPhoto(null);
        setPhotoPreview(null);
        setLoadedItems([]);
        setStep(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                resetAll();
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [result, resetAll]);

    return (
        <DashboardLayout title="Récupération de colis">
            <div className="space-y-6 max-w-2xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-green-200">
                        <PackageSearch size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-[#1E293B]">Récupération de colis</h2>
                        <p className="text-[12px] text-[#94A3B8] mt-0.5">
                            Validez la prise en charge des commandes par les livreurs.
                        </p>
                    </div>
                </div>

                {result ? (
                    <div className="space-y-4">
                        <PickupResultCard data={result} />
                        <div className="flex items-center justify-center py-2">
                            <p className="text-[12px] text-[#94A3B8] flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Redirection automatique dans 7 secondes...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* ── Form Card ── */}
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-[#F8FAFC] to-white border-b border-[#E2E8F0] flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] font-semibold text-[#1E293B]">
                                        {step === 1 ? 'Étape 1 : Identification du colis' : 'Étape 2 : Validation de la collecte'}
                                    </p>
                                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                        {step === 1 
                                            ? 'Saisissez ou scannez le QR code de récupération du colis.' 
                                            : 'Vérifiez les médicaments puis prenez obligatoirement une photo/vidéo.'
                                        }
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold bg-[#F0FDF4] text-[#22C55E] px-2 py-0.5 rounded-full">
                                    Étape {step}/2
                                </span>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* ── Étape 1 : Saisie / Scan ── */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Hash size={14} className="text-[#22C55E]" />
                                                    Code QR ou OTP livreur
                                                    <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    id="otpInput"
                                                    className="w-full px-4 py-3 text-[14px] border-2 border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#CBD5E1] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all font-mono min-h-[80px]"
                                                    placeholder="Saisissez le code OTP ou collez le contenu du QR Code..."
                                                    value={otpCode}
                                                    onChange={e => {
                                                        setOtpCode(e.target.value);
                                                        setError(null);
                                                    }}
                                                    disabled={loadingItems}
                                                    autoComplete="off"
                                                />
                                                {otpCode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setOtpCode('')}
                                                        className="absolute right-3 top-3 w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center hover:bg-[#CBD5E1] transition-colors"
                                                    >
                                                        <X size={12} className="text-[#64748B]" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                                    <AlertCircle size={16} className="text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-red-700">Erreur</p>
                                                    <p className="text-[12px] text-red-600 mt-0.5">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={loadPackageDetails}
                                            disabled={loadingItems || !otpCode.trim()}
                                            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            {loadingItems ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Chargement du colis...
                                                </>
                                            ) : (
                                                <>
                                                    <PackageSearch size={18} />
                                                    Vérifier le code et continuer
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* ── Étape 2 : Médicaments + Photo Obligatoire ── */}
                                {step === 2 && (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        
                                        {/* Code Summary */}
                                        <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                                            <div className="min-w-0">
                                                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wide">Code saisi</span>
                                                <p className="text-[12px] font-mono text-[#1E293B] truncate max-w-sm">{otpCode}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStep(1);
                                                    setError(null);
                                                }}
                                                className="text-[12px] font-bold text-[#22C55E] hover:underline shrink-0"
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                        {/* Médicaments à récupérer */}
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1E293B] mb-3">
                                                Médicaments à remettre au livreur
                                            </label>
                                            
                                            {loadedItems.length === 0 ? (
                                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px] flex items-start gap-2.5">
                                                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-semibold">Code OTP Détecté</p>
                                                        <p className="text-amber-700 mt-0.5">
                                                            Les détails de la commande ne peuvent pas être pré-chargés pour ce type de code. Confirmez la commande physique avec le livreur.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                                    {loadedItems.map((item, idx) => (
                                                        <MedicamentCard key={item.id ?? idx} item={item} index={idx} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Capture de la photo (Obligatoire) */}
                                        <div className="border-t border-[#F1F5F9] pt-5">
                                            <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Camera size={14} className="text-[#22C55E]" />
                                                    Prendre en photo / Filmer le colis
                                                    <span className="text-red-500">* (Obligatoire)</span>
                                                </span>
                                            </label>

                                            {photoPreview ? (
                                                <div className="relative rounded-xl overflow-hidden border-2 border-[#22C55E] bg-black">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={photoPreview}
                                                        alt="Aperçu du colis"
                                                        className="w-full object-contain max-h-52"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-2 bg-white text-[#1E293B] text-[12px] font-semibold rounded-lg shadow"
                                                        >
                                                            <Camera size={13} />
                                                            Prendre une autre photo
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => uploadInputRef.current?.click()}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-2 bg-white text-[#1E293B] text-[12px] font-semibold rounded-lg shadow"
                                                        >
                                                            <Upload size={13} />
                                                            Importer un autre fichier
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePhotoChange(null)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-[12px] font-semibold rounded-lg shadow"
                                                        >
                                                            <X size={13} />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                                        <p className="text-[10px] text-white/90 truncate">{photo?.name}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Option 1 : Appareil photo */}
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]/50 transition-all group text-center"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] group-hover:border-[#22C55E]/30 flex items-center justify-center shadow-sm transition-all">
                                                            <Camera size={18} className="text-[#94A3B8] group-hover:text-[#22C55E] transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-semibold text-[#1E293B] group-hover:text-[#22C55E] transition-colors">
                                                                Prendre une photo
                                                            </p>
                                                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                                                                Ouvrir la caméra du téléphone
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Option 2 : Import de fichier */}
                                                    <div
                                                        onClick={() => uploadInputRef.current?.click()}
                                                        onDrop={handleDrop}
                                                        onDragOver={e => e.preventDefault()}
                                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]/50 transition-all group text-center"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] group-hover:border-[#22C55E]/30 flex items-center justify-center shadow-sm transition-all">
                                                            <Upload size={18} className="text-[#94A3B8] group-hover:text-[#22C55E] transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-semibold text-[#1E293B] group-hover:text-[#22C55E] transition-colors">
                                                                Importer un fichier
                                                            </p>
                                                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                                                                PC, Galerie ou glisser-déposer
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,video/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handleFileInput}
                                                disabled={loading}
                                            />
                                            <input
                                                ref={uploadInputRef}
                                                type="file"
                                                accept="image/*,video/*"
                                                className="hidden"
                                                onChange={handleFileInput}
                                                disabled={loading}
                                            />
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                                    <AlertCircle size={16} className="text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-red-700">Erreur de validation</p>
                                                    <p className="text-[12px] text-red-600 mt-0.5">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStep(1);
                                                    setError(null);
                                                }}
                                                disabled={loading}
                                                className="flex-1 py-3.5 border border-[#E2E8F0] hover:border-[#1E293B] text-[#94A3B8] hover:text-[#1E293B] text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-40"
                                            >
                                                Retour
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!photo || loading}
                                                className="flex-[2] flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Validation en cours…
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={18} />
                                                        Valider la récupération
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}

                            </div>
                        </div>

                        {/* ── Instructions card ── */}
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
                            <p className="text-[13px] font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
                                <Info size={15} className="text-[#22C55E]" />
                                Instructions de récupération
                            </p>
                            <ol className="space-y-3">
                                {[
                                    'Scannez le QR Code de retrait ou saisissez le code OTP fourni par le livreur.',
                                    'Vérifiez la liste des médicaments affichés à l&apos;écran avec le contenu du colis physique.',
                                    'Prenez une photo ou filmez le colis de façon visible (étape obligatoire pour valider la prise en charge).',
                                    'Validez la récupération pour changer le statut de la livraison en transit.',
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                            {i + 1}
                                        </span>
                                        <span className="text-[12px] text-[#64748B] leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
