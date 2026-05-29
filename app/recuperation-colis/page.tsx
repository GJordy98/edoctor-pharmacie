'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    PackageSearch, AlertCircle, CheckCircle2, Loader2,
    Camera, X, Upload, Pill, Building2, Truck,
    FlaskConical, Layers, Hash, Info, History,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api-client';
import { useLanguage } from '@/context/LanguageContext';

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

interface ValidationHistoryItem {
    id: string;
    driver: string;
    date: string;
    status: 'success' | 'error';
    orderId?: string;
    officine?: string;
}

// ── Status badge ──────────────────────────────────────────
function MissionStatusBadge({ status }: { status?: string }) {
    const { t } = useLanguage();
    if (!status) return null;

    const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
        IN_TRANSIT: { label: t('recuperation_colis.status_in_transit'), bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
        PENDING: { label: t('recuperation_colis.status_pending'), bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
        DELIVERED: { label: t('recuperation_colis.status_delivered'), bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
        CANCELLED: { label: t('recuperation_colis.status_cancelled'), bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
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
    const { t } = useLanguage();
    return (
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#22C55E]/40 transition-all">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-white">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[13px] font-semibold text-[#1E293B] leading-snug">{item.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <FlaskConical size={11} className="text-[#94A3B8]" />
                        <strong>{t('recuperation_colis.dci')} :</strong> {item.dci}
                    </span>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <Layers size={11} className="text-[#94A3B8]" />
                        <strong>{t('recuperation_colis.form')} :</strong> {item.galenic}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Pickup Result card ────────────────────────────────────
function PickupResultCard({ data }: { data: PickupResult }) {
    const { t } = useLanguage();
    const items = data.items ?? [];
    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] p-5 text-white shadow-lg">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[16px] font-bold">{t('recuperation_colis.validated_title')}</p>
                        {data.message && <p className="text-[12px] text-white/80 mt-0.5">{data.message}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {t('recuperation_colis.mission_info')}
                    </p>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.officine && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                                <Building2 size={14} className="text-[#3B82F6]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">{t('recuperation_colis.officine')}</p>
                                <p className="text-[13px] font-semibold text-[#1E293B] truncate" title={data.officine}>{data.officine}</p>
                            </div>
                        </div>
                    )}
                    {data.mission_status && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
                                <Truck size={14} className="text-[#22C55E]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wide">{t('recuperation_colis.mission_status')}</p>
                                <MissionStatusBadge status={data.mission_status} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Pill size={14} className="text-[#22C55E]" />
                        <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                            {t('recuperation_colis.products_to_pickup')}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <span className="bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {items.length} {items.length === 1 ? t('recuperation_colis.article') : t('recuperation_colis.articles')}
                        </span>
                    )}
                </div>
                <div className="p-4 space-y-2.5">
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E2E8F0] p-8 text-center">
                            <Pill size={28} className="text-[#CBD5E1] mx-auto mb-2" />
                            <p className="text-[12px] text-[#94A3B8]">{t('recuperation_colis.no_products_returned')}</p>
                        </div>
                    ) : (
                        items.map((item, idx) => <MedicamentCard key={item.id ?? idx} item={item} index={idx} />)
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────
export default function RecuperationColisPage() {
    const { t } = useLanguage();
    
    // Core State
    const [otpCode, setOtpCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingValidation, setLoadingValidation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<PickupResult | null>(null);
    
    // Code preloaded state
    const [codeVerified, setCodeVerified] = useState(false);
    const [loadedItems, setLoadedItems] = useState<PickupItem[]>([]);
    
    // Photo upload state
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    // Session history
    const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
    
    // Scanner references and support
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    // Verify barcode detector support on client
    useEffect(() => {
        setBarcodeDetectorSupported('BarcodeDetector' in window);
    }, []);

    // Clean up scanner on unmount
    const stopScanner = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        return () => stopScanner();
    }, [stopScanner]);

    // Code verification API call (fetch sub-orders)
    const verifyCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) {
            setError(t('recuperation_colis.error_no_code'));
            return;
        }

        setLoadingItems(true);
        setError(null);
        setLoadedItems([]);
        setCodeVerified(false);

        let orderId = '';
        try {
            // Check if input is a JSON string (typical for QR codes)
            const parsed = JSON.parse(trimmed);
            orderId = parsed.officine_order_id || parsed.pickup_id || '';
        } catch {
            // If not JSON, check if it's a direct UUID
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
                setCodeVerified(true);
                stopScanner();
            } catch (err: any) {
                setError(t('recuperation_colis.error_load_failed'));
            } finally {
                setLoadingItems(false);
            }
        } else {
            // Standard digital OTP code
            setLoadingItems(false);
            setCodeVerified(true);
            stopScanner();
        }
    }, [t, stopScanner]);

    // Live frame scan logic
    const scanFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        if (video.readyState < 2) {
            rafRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);

        try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            detector.detect(canvas)
                .then((codes: any[]) => {
                    if (codes.length > 0) {
                        const qrValue = codes[0].rawValue;
                        setOtpCode(qrValue);
                        verifyCode(qrValue);
                    } else {
                        rafRef.current = requestAnimationFrame(scanFrame);
                    }
                })
                .catch(() => {
                    rafRef.current = requestAnimationFrame(scanFrame);
                });
        } catch {
            rafRef.current = requestAnimationFrame(scanFrame);
        }
    }, [verifyCode]);

    const startScanner = async () => {
        setCameraError(null);
        setError(null);
        setResult(null);

        if (!barcodeDetectorSupported) {
            setCameraError(t('validate_order.invalid_code_error'));
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsScanning(true);
            rafRef.current = requestAnimationFrame(scanFrame);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
                setCameraError('Accès caméra refusé.');
            } else {
                setCameraError('Erreur caméra.');
            }
        }
    };

    // Photo selection / capture
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

    // Confirm Pickup Submission
    const handleValidationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo) {
            setError(t('recuperation_colis.error_photo_required'));
            return;
        }
        if (!otpCode.trim()) {
            setError(t('recuperation_colis.error_code_missing'));
            return;
        }

        setLoadingValidation(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.validatePickupByDriver(otpCode.trim(), photo);
            const res = (data ?? {}) as PickupResult;
            setResult(res);

            // Add success to session history
            setHistory(prev => [{
                id: Date.now().toString(),
                driver: res.officine || 'Livreur',
                date: new Date().toISOString(),
                status: 'success',
                orderId: otpCode.slice(0, 8),
            }, ...prev.slice(0, 9)]);

            // Reset state
            setOtpCode('');
            setPhoto(null);
            setPhotoPreview(null);
            setLoadedItems([]);
            setCodeVerified(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t('recuperation_colis.error_validation_failed');
            setError(msg);
            setHistory(prev => [{
                id: Date.now().toString(),
                driver: '—',
                date: new Date().toISOString(),
                status: 'error',
            }, ...prev.slice(0, 9)]);
        } finally {
            setLoadingValidation(false);
        }
    };

    const resetAll = useCallback(() => {
        setResult(null);
        setError(null);
        setOtpCode('');
        setPhoto(null);
        setPhotoPreview(null);
        setLoadedItems([]);
        setCodeVerified(false);
        stopScanner();
    }, [stopScanner]);

    // Timer to reset success alert
    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                resetAll();
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [result, resetAll]);

    return (
        <DashboardLayout title={t('recuperation_colis.title')}>
            {/* Hidden canvas for QR reading */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="max-w-6xl mx-auto space-y-5 animate-fade-in-up">
                
                {/* ── Top Bar ── */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
                        <PackageSearch size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-[#1E293B]">{t('recuperation_colis.title')}</h2>
                        <p className="text-[12px] text-[#94A3B8] mt-0.5">{t('recuperation_colis.subtitle')}</p>
                    </div>
                </div>

                {result ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <PickupResultCard data={result} />
                        <div className="flex items-center justify-center py-2">
                            <p className="text-[12px] text-[#94A3B8] flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                {t('recuperation_colis.redirecting_hint')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* ── LEFT COLUMN: Scanner & manual OTP ── */}
                        <div className="lg:col-span-8 space-y-5">
                            
                            {/* Card 1: Scanner */}
                            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-[#22C55E]/10 to-transparent border-b border-[#E2E8F0] flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center shrink-0">
                                        <Camera size={18} className="text-[#22C55E]" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">{t('recuperation_colis.step1_title')}</p>
                                        <p className="text-[13px] font-bold text-[#1E293B]">{t('recuperation_colis.step1_desc')}</p>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col items-center">
                                    {/* Video / Placeholder Box */}
                                    <div 
                                        className="relative w-full max-w-[360px] aspect-square rounded-2xl bg-black overflow-hidden flex items-center justify-center shadow-inner"
                                        style={{ border: '1px solid #E2E8F0' }}
                                    >
                                        <video
                                            ref={videoRef}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: isScanning ? 'block' : 'none',
                                            }}
                                            muted
                                            playsInline
                                        />

                                        {/* Scanner Grid Lines */}
                                        {isScanning && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-[180px] h-[180px] relative">
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#22C55E] rounded-tl-lg" />
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#22C55E] rounded-tr-lg" />
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#22C55E] rounded-bl-lg" />
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#22C55E] rounded-br-lg" />
                                                    <div className="absolute left-0 right-0 h-0.5 bg-[#22C55E] opacity-70 animate-pulse" style={{ top: '50%' }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Static placeholder */}
                                        {!isScanning && (
                                            <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
                                                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center">
                                                    <Camera size={32} className="text-[#CBD5E1]" />
                                                </div>
                                                <p className="text-[12px] font-medium text-[#94A3B8]">{t('validate_order.press_scan_to_start')}</p>
                                            </div>
                                        )}

                                        {/* Verification Loader */}
                                        {loadingItems && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                                                <Loader2 size={28} className="animate-spin text-[#22C55E]" />
                                                <span className="text-[12px] font-medium">{t('recuperation_colis.loading_package')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={isScanning ? stopScanner : startScanner}
                                        disabled={loadingItems || loadingValidation}
                                        className={`mt-4 px-6 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow transition-all ${
                                            isScanning
                                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100'
                                                : 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-green-100'
                                        }`}
                                    >
                                        <Camera size={15} />
                                        {isScanning ? t('validate_order.stop') : t('validate_order.scan')}
                                    </button>

                                    {/* Camera Error Message */}
                                    {cameraError && (
                                        <div className="mt-4 w-full p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-[12px] rounded-xl flex items-start gap-2">
                                            <Info size={14} className="shrink-0 mt-0.5" />
                                            <span>{cameraError}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Manual OTP Form Footer */}
                                <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <label htmlFor="otp-manual" className="text-[13px] font-bold text-[#1E293B] flex items-center gap-1.5">
                                            <Hash size={14} className="text-[#22C55E]" />
                                            {t('validate_order.manual_input')}
                                        </label>
                                        <div className="flex items-center gap-2 flex-1 max-w-md">
                                            <input
                                                id="otp-manual"
                                                type="text"
                                                placeholder={t('validate_order.enter_code_placeholder')}
                                                value={otpCode}
                                                onChange={e => {
                                                    setOtpCode(e.target.value);
                                                    setError(null);
                                                }}
                                                disabled={loadingItems || loadingValidation}
                                                className="flex-1 px-3.5 py-2 text-[13px] border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#22C55E] transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => verifyCode(otpCode)}
                                                disabled={loadingItems || loadingValidation || !otpCode.trim()}
                                                className="px-5 py-2 bg-[#1E293B] hover:bg-[#0f172a] text-white text-[13px] font-bold rounded-xl shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {t('validate_order.validate_btn')}
                                            </button>
                                        </div>
                                    </div>
                                    {error && !codeVerified && (
                                        <div className="mt-3 p-3.5 bg-red-50 border border-red-100 text-red-700 text-[12px] rounded-xl flex items-start gap-2.5">
                                            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Verification, Medicines & Package Capture (Visible post-verification) */}
                            {codeVerified && (
                                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-fade-in-up">
                                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-transparent border-b border-[#E2E8F0] flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <Pill size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">{t('recuperation_colis.step2_title')}</p>
                                            <p className="text-[13px] font-bold text-[#1E293B]">{t('recuperation_colis.step2_desc')}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleValidationSubmit} className="p-5 space-y-5">
                                        
                                        {/* Medicines display */}
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1E293B] mb-2.5">
                                                {t('recuperation_colis.medicines_to_deliver')}
                                            </label>
                                            {loadedItems.length === 0 ? (
                                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px] flex items-start gap-2.5">
                                                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold">{t('recuperation_colis.otp_detected_title')}</p>
                                                        <p className="text-amber-700 mt-0.5">{t('recuperation_colis.otp_detected_desc')}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                                    {loadedItems.map((item, idx) => (
                                                        <MedicamentCard key={item.id ?? idx} item={item} index={idx} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Photo Capture Section */}
                                        <div className="border-t border-[#F1F5F9] pt-4">
                                            <label className="block text-[13px] font-semibold text-[#1E293B] mb-2.5">
                                                <span className="flex items-center gap-2">
                                                    <Camera size={14} className="text-[#22C55E]" />
                                                    {t('recuperation_colis.photo_label')}
                                                    <span className="text-red-500">{t('recuperation_colis.compulsory_marker')}</span>
                                                </span>
                                            </label>

                                            {photoPreview ? (
                                                <div className="relative rounded-xl overflow-hidden border-2 border-[#22C55E] bg-black">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={photoPreview} alt="Aperçu colis" className="w-full object-contain max-h-48" />
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group flex items-center justify-center gap-2.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1E293B] text-[12px] font-semibold rounded-lg shadow"
                                                        >
                                                            <Camera size={13} />
                                                            {t('recuperation_colis.retake_photo')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePhotoChange(null)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[12px] font-semibold rounded-lg shadow"
                                                        >
                                                            <X size={13} />
                                                            {t('common.delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Camera button */}
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]/30 transition-all text-center group"
                                                    >
                                                        <Camera size={20} className="text-[#94A3B8] group-hover:text-[#22C55E] transition-colors" />
                                                        <span className="text-[12px] font-semibold text-[#1E293B] group-hover:text-[#22C55E]">{t('recuperation_colis.take_photo')}</span>
                                                        <span className="text-[10px] text-[#94A3B8]">{t('recuperation_colis.open_camera_desc')}</span>
                                                    </div>
                                                    {/* Gallery upload */}
                                                    <div
                                                        onClick={() => uploadInputRef.current?.click()}
                                                        onDrop={handleDrop}
                                                        onDragOver={e => e.preventDefault()}
                                                        className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]/30 transition-all text-center group"
                                                    >
                                                        <Upload size={20} className="text-[#94A3B8] group-hover:text-[#22C55E] transition-colors" />
                                                        <span className="text-[12px] font-semibold text-[#1E293B] group-hover:text-[#22C55E]">{t('recuperation_colis.upload_file')}</span>
                                                        <span className="text-[10px] text-[#94A3B8]">{t('recuperation_colis.upload_file_desc')}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <input ref={fileInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileInput} disabled={loadingValidation} />
                                            <input ref={uploadInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileInput} disabled={loadingValidation} />
                                        </div>

                                        {error && (
                                            <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-[12px] rounded-xl flex items-start gap-2.5">
                                                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                                                <div>
                                                    <p className="font-bold">{t('recuperation_colis.validation_error_title')}</p>
                                                    <p className="mt-0.5 text-red-600">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCodeVerified(false);
                                                    setError(null);
                                                }}
                                                disabled={loadingValidation}
                                                className="flex-1 py-3 border border-[#E2E8F0] hover:border-[#1E293B] text-[#94A3B8] hover:text-[#1E293B] text-[13px] font-semibold rounded-xl transition-all disabled:opacity-40"
                                            >
                                                {t('common.back')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!photo || loadingValidation}
                                                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-green-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                                            >
                                                {loadingValidation ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        {t('recuperation_colis.scanning')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        {t('recuperation_colis.validate_pickup')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT COLUMN: Instructions & History ── */}
                        <div className="lg:col-span-4 space-y-5">
                            
                            {/* Card 3: Instructions */}
                            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
                                <p className="text-[13px] font-bold text-[#1E293B] flex items-center gap-2 border-b border-[#F1F5F9] pb-3 shrink-0">
                                    <Info size={15} className="text-[#22C55E]" />
                                    {t('recuperation_colis.instructions_title')}
                                </p>
                                <ol className="space-y-3.5">
                                    {[
                                        t('recuperation_colis.instruction1'),
                                        t('recuperation_colis.instruction2'),
                                        t('recuperation_colis.instruction3'),
                                        t('recuperation_colis.instruction4'),
                                    ].map((stepText, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                                {i + 1}
                                            </span>
                                            <span className="text-[12px] text-[#64748B] leading-relaxed">{stepText}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Card 4: Validation Session History */}
                            {history.length > 0 && (
                                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-fade-in-up">
                                    <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-2">
                                        <History size={14} className="text-[#22C55E]" />
                                        <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider">{t('validate_order.recent_validations_title')}</p>
                                    </div>
                                    <div className="divide-y divide-[#F1F5F9] max-h-[300px] overflow-y-auto">
                                        {history.map(h => (
                                            <div key={h.id} className="p-3.5 flex items-center justify-between gap-3 text-[12px] hover:bg-[#F8FAFC] transition-colors">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#1E293B] truncate">
                                                        {h.orderId ? `CMD #${h.orderId}` : h.officine ?? h.driver}
                                                    </p>
                                                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                                                        {new Date(h.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                                                    h.status === 'success'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {h.status === 'success' ? t('validate_order.validated_status') : t('common.error')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
