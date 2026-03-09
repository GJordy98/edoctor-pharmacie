'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    PackageSearch, AlertCircle, CheckCircle2, Loader2,
    Camera, X, Upload, Pill, Building2, Truck,
    ArrowRight, FlaskConical, Layers, Hash, Info, Eye,
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

// ── Main page ─────────────────────────────────────────────
export default function RecuperationColisPage() {
    const [otpCode, setOtpCode] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PickupResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSubmit = otpCode.trim().length >= 4 && !loading;

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
        if (!canSubmit) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.validatePickupByDriver(
                otpCode.trim(),
                photo ?? undefined
            );
            setResult(data);
            // Reset form
            setOtpCode('');
            setPhoto(null);
            setPhotoPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Code invalide ou erreur serveur.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setResult(null);
        setError(null);
        setOtpCode('');
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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
                            Saisissez votre code OTP livreur et prenez une photo du colis pour valider la récupération.
                        </p>
                    </div>
                </div>

                {/* ── Result or Form ── */}
                {result ? (
                    <div className="space-y-4">
                        <PickupResultCard data={result} />
                        <button
                            onClick={resetAll}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#22C55E] text-[#22C55E] text-[14px] font-semibold rounded-xl hover:bg-[#F0FDF4] transition-colors"
                        >
                            <ArrowRight size={16} />
                            Nouvelle récupération
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* ── Form Card ── */}
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-[#F8FAFC] to-white border-b border-[#E2E8F0]">
                                <p className="text-[13px] font-semibold text-[#1E293B]">
                                    Validation de récupération
                                </p>
                                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                    Renseignez les informations demandées pour valider la prise en charge du colis.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                                {/* ── OTP Code ── */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">
                                        <span className="flex items-center gap-2">
                                            <Hash size={14} className="text-[#22C55E]" />
                                            Code OTP livreur
                                            <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="otpInput"
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full px-4 py-4 text-[28px] font-bold tracking-[0.4em] text-center border-2 border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#CBD5E1] placeholder:tracking-normal placeholder:text-[14px] placeholder:font-normal focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all"
                                            placeholder="ex : 649655"
                                            value={otpCode}
                                            onChange={e => {
                                                setOtpCode(e.target.value.replace(/\D/g, ''));
                                                setError(null);
                                            }}
                                            disabled={loading}
                                            maxLength={10}
                                            autoComplete="off"
                                        />
                                        {otpCode && (
                                            <button
                                                type="button"
                                                onClick={() => setOtpCode('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center hover:bg-[#CBD5E1] transition-colors"
                                            >
                                                <X size={12} className="text-[#64748B]" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#94A3B8] mt-1.5 text-center">
                                        Code numérique unique attribué à votre mission par la plateforme.
                                    </p>
                                </div>

                                {/* ── Photo Upload ── */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-2">
                                        <span className="flex items-center gap-2">
                                            <Camera size={14} className="text-[#22C55E]" />
                                            Photo du colis
                                            <span className="text-[11px] text-[#94A3B8] font-normal">(optionnel)</span>
                                        </span>
                                    </label>

                                    {photoPreview ? (
                                        /* Photo preview */
                                        <div className="relative rounded-xl overflow-hidden border-2 border-[#22C55E]/40 bg-black">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photoPreview}
                                                alt="Aperçu du colis"
                                                className="w-full object-contain max-h-52"
                                            />
                                            {/* Overlay controls */}
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-2 bg-white text-[#1E293B] text-[12px] font-semibold rounded-lg shadow"
                                                >
                                                    <Camera size={13} />
                                                    Changer
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
                                            {/* File info */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Eye size={11} className="text-white/80" />
                                                    <p className="text-[10px] text-white/80 truncate">{photo?.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Drop zone */
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={e => e.preventDefault()}
                                            className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]/50 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] group-hover:border-[#22C55E]/30 flex items-center justify-center shadow-sm transition-all">
                                                <Upload size={20} className="text-[#94A3B8] group-hover:text-[#22C55E] transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#22C55E] transition-colors">
                                                    Cliquer ou glisser une photo
                                                </p>
                                                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                                    JPG, PNG, WEBP — max 10 MB
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleFileInput}
                                        disabled={loading}
                                    />
                                </div>

                                {/* ── Error ── */}
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

                                {/* ── Submit ── */}
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Validation en cours…
                                        </>
                                    ) : (
                                        <>
                                            <PackageSearch size={18} />
                                            Valider la récupération
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* ── Instructions card ── */}
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
                            <p className="text-[13px] font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
                                <Info size={15} className="text-[#22C55E]" />
                                Comment ça marche ?
                            </p>
                            <ol className="space-y-3">
                                {[
                                    'Récupérez votre code OTP depuis votre espace de mission.',
                                    'Prenez une photo du colis remis par le pharmacien (recommandé).',
                                    'Saisissez le code et joignez la photo, puis validez.',
                                    "La liste des médicaments à livrer s'affiche et la mission passe en transit.",
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
