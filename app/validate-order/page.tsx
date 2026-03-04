'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────
interface MedicationItem {
    id?: string | number;
    name?: string;
    product_name?: string;
    quantity?: number;
    unit?: string;
    price?: number | string;
    [key: string]: unknown;
}

interface ScanResult {
    // Champs retournés par l'API scan-qrcode-pickup
    message?: string;
    officine?: string;
    mission_status?: string;
    // Liste de médicaments (à venir du backend)
    medications?: MedicationItem[];
    items?: MedicationItem[];
    products?: MedicationItem[];
    // Champs legacy / autres
    order_id?: string;
    patient_name?: string;
    driver_name?: string;
    pharmacy?: string;
    status?: string;
    scanned_at?: string;
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



// ── Helpers ─────────────────────────────────────────────
function formatDate(iso: string) {
    try { return new Date(iso).toLocaleString('fr-FR'); }
    catch { return iso; }
}

// ── Badge statut mission ────────────────────────────────
function MissionStatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    const map: Record<string, { label: string; cls: string; icon: string }> = {
        IN_TRANSIT: { label: 'En transit', cls: 'bg-primary', icon: 'ri-truck-line' },
        DELIVERED: { label: 'Livré', cls: 'bg-success', icon: 'ri-checkbox-circle-line' },
        PENDING: { label: 'En attente', cls: 'bg-warning', icon: 'ri-time-line' },
        PICKUP_DONE: { label: 'Récupéré', cls: 'bg-info', icon: 'ri-hand-coin-line' },
        CANCELLED: { label: 'Annulé', cls: 'bg-danger', icon: 'ri-close-circle-line' },
    };
    const cfg = map[status] ?? { label: status, cls: 'bg-secondary', icon: 'ri-information-line' };
    return (
        <span className={`badge ${cfg.cls} d-inline-flex align-items-center gap-1 fs-12 px-3 py-2`}>
            <i className={cfg.icon}></i>{cfg.label}
        </span>
    );
}

// ── Composant résultat de validation ──────────────────
function ScanResultCard({ data }: { data: ScanResult }) {
    // Résoudre la liste de médicaments depuis plusieurs champs potentiels
    const medications: MedicationItem[] = (
        Array.isArray(data.medications) ? data.medications :
            Array.isArray(data.items) ? data.items :
                Array.isArray(data.products) ? data.products :
                    []
    );

    // Afficher uniquement les champs legacy s'ils existent
    const legacyFields = [
        { label: 'Commande', value: data.order_id, icon: 'ri-shopping-bag-line' },
        { label: 'Patient', value: data.patient_name, icon: 'ri-user-line' },
        { label: 'Livreur', value: data.driver_name, icon: 'ri-truck-line' },
        { label: 'Scanné le', value: data.scanned_at ? formatDate(data.scanned_at) : undefined, icon: 'ri-time-line' },
    ].filter(f => f.value);

    return (
        <div className="card custom-card border-success mt-4">
            {/* En-tête succès */}
            <div className="card-header bg-success text-white d-flex align-items-center gap-2">
                <i className="ri-checkbox-circle-fill fs-5"></i>
                <span className="card-title text-white mb-0">Retrait validé avec succès</span>
            </div>

            <div className="card-body pb-0">
                {/* Infos principales : officine + statut mission */}
                <div className="row g-3 mb-3">
                    {data.officine && (
                        <div className="col-sm-6">
                            <div className="d-flex align-items-start gap-2">
                                <i className="ri-store-2-line text-success fs-5 mt-1"></i>
                                <div>
                                    <div className="text-muted small">Officine</div>
                                    <div className="fw-semibold">{data.officine}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {data.mission_status && (
                        <div className="col-sm-6">
                            <div className="d-flex align-items-start gap-2">
                                <i className="ri-route-line text-success fs-5 mt-1"></i>
                                <div>
                                    <div className="text-muted small mb-1">Statut mission</div>
                                    <MissionStatusBadge status={data.mission_status} />
                                </div>
                            </div>
                        </div>
                    )}
                    {data.message && (
                        <div className="col-12">
                            <div className="alert alert-success py-2 mb-0 d-flex align-items-center gap-2">
                                <i className="ri-information-line"></i>
                                <span className="small">{data.message}</span>
                            </div>
                        </div>
                    )}
                    {legacyFields.map(f => (
                        <div key={f.label} className="col-sm-6">
                            <div className="d-flex align-items-start gap-2">
                                <i className={`${f.icon} text-success fs-5 mt-1`}></i>
                                <div>
                                    <div className="text-muted small">{f.label}</div>
                                    <div className="fw-semibold">{String(f.value)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section médicaments à remettre */}
            <div className="card-footer p-0">
                <div className="px-3 pt-3 pb-2 border-top">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="ri-capsule-line text-primary fs-5"></i>
                        <h6 className="mb-0 fw-semibold">Médicaments à remettre</h6>
                        {medications.length > 0 && (
                            <span className="badge bg-primary-transparent text-primary ms-auto">
                                {medications.length} article{medications.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {medications.length === 0 ? (
                        /* Placeholder : le backend n'envoie pas encore la liste */
                        <div
                            className="rounded-3 border border-dashed d-flex flex-column align-items-center justify-content-center py-4 px-3 mb-3"
                            style={{ borderColor: '#c8d0da', background: '#f8f9fa', minHeight: '120px' }}
                        >
                            <i className="ri-medicine-bottle-line fs-1 text-muted mb-2" style={{ opacity: 0.4 }}></i>
                            <p className="text-muted small mb-1 fw-medium">Liste des médicaments non disponible</p>
                            <p className="text-muted" style={{ fontSize: '12px' }}>
                                Le serveur ne retourne pas encore cette information.
                                Elle s&apos;affichera automatiquement dès qu&apos;elle sera disponible.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive mb-3">
                            <table className="table table-sm table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Médicament</th>
                                        <th className="text-center">Qté</th>
                                        <th className="text-end">Prix unit.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med, idx) => (
                                        <tr key={med.id ?? idx}>
                                            <td className="text-muted small">{idx + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="avatar avatar-xs rounded bg-primary-transparent">
                                                        <i className="ri-capsule-line text-primary"></i>
                                                    </span>
                                                    <span className="fw-medium">
                                                        {med.name ?? med.product_name ?? `Produit ${idx + 1}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-secondary-transparent text-secondary">
                                                    {med.quantity ?? '—'}{med.unit ? ` ${med.unit}` : ''}
                                                </span>
                                            </td>
                                            <td className="text-end fw-semibold">
                                                {med.price != null
                                                    ? `${Number(med.price).toLocaleString('fr-FR')} FCFA`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Page principale ────────────────────────────────────
export default function ValidateOrderOrQrPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scannedData, setScannedData] = useState<ScanResult | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
    const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState<boolean | null>(null);



    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Vérifier si BarcodeDetector est disponible
    useEffect(() => {
        setBarcodeDetectorSupported('BarcodeDetector' in window);
    }, []);



    // Appel API de validation
    const submitQrCode = useCallback(async (code: string) => {
        if (!code.trim()) return;
        setLoading(true);
        setError(null);
        setScannedData(null);
        try {
            const data = await api.scanQrCodePickup(code);
            const result = (data ?? {}) as ScanResult;
            setScannedData(result);
            // Ajouter à l'historique local
            setHistory(prev => [{
                id: Date.now().toString(),
                driver: result.driver_name || result.officine || 'Livreur',
                date: new Date().toISOString(),
                status: 'success',
                orderId: result.order_id,
                officine: result.officine,
            }, ...prev.slice(0, 9)]);
            // Arrêter le scanner après succès
            stopScanner();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Code invalide ou erreur serveur.';
            setError(msg);
            setHistory(prev => [{
                id: Date.now().toString(),
                driver: '—',
                date: new Date().toISOString(),
                status: 'error',
            }, ...prev.slice(0, 9)]);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Scanner QR depuis le flux vidéo (BarcodeDetector)
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

        const detector = new (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (img: HTMLCanvasElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(canvas)
            .then(codes => {
                if (codes.length > 0) {
                    const qrValue = codes[0].rawValue;
                    submitQrCode(qrValue);
                } else {
                    rafRef.current = requestAnimationFrame(scanFrame);
                }
            })
            .catch(() => {
                rafRef.current = requestAnimationFrame(scanFrame);
            });
    }, [submitQrCode]);

    const startScanner = async () => {
        setCameraError(null);
        setError(null);
        setScannedData(null);

        if (!barcodeDetectorSupported) {
            setCameraError('Votre navigateur ne supporte pas le scan QR automatique. Utilisez Chrome ou Edge, ou saisissez le code manuellement.');
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
                setCameraError('Accès à la caméra refusé. Autorisez la caméra dans les paramètres du navigateur.');
            } else if (msg.includes('NotFoundError')) {
                setCameraError('Aucune caméra détectée sur cet appareil.');
            } else {
                setCameraError('Impossible d\'accéder à la caméra : ' + (msg || 'Erreur inconnue'));
            }
        }
    };

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

    // Nettoyage au démontage
    useEffect(() => {
        return () => stopScanner();
    }, [stopScanner]);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitQrCode(manualCode);
        if (!error) setManualCode('');
    };

    return (
        <div className="page">
            <style jsx>{`
                @keyframes scanline {
                    0% { top: 10%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .scan-overlay-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #00ff88, transparent);
                    animation: scanline 2.5s ease-in-out infinite;
                    pointer-events: none;
                }
            `}</style>

            <Header />
            <Sidebar />

            {/* Canvas caché pour la détection QR */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    {/* En-tête */}
                    <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
                        <div>
                            <h1 className="page-title fw-semibold fs-18 mb-0">
                                <i className="ri-scan-line me-2"></i>Validation Retrait Commande
                            </h1>
                            <div className="text-muted small mt-1">
                                Scannez le QR code du livreur pour confirmer la récupération des médicaments
                            </div>
                        </div>
                        <div className="ms-md-1 ms-0 mt-md-0 mt-2">
                            <button
                                className="btn btn-outline-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#historyModal"
                                disabled={history.length === 0}
                            >
                                <i className="ri-history-line me-2"></i>Historique
                                {history.length > 0 && (
                                    <span className="badge bg-primary ms-1">{history.length}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {/* Zone scanner */}
                        <div className="col-lg-8">

                            <div className="card custom-card">
                                <div className="card-header bg-primary text-white">
                                    <div className="card-title text-white">
                                        <i className="ri-qr-scan-line me-2"></i>Scanner QR Code
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {/* Alerte navigateur non supporté */}
                                    {barcodeDetectorSupported === false && (
                                        <div className="alert alert-warning m-3 mb-0">
                                            <i className="ri-error-warning-line me-2"></i>
                                            Scan caméra non disponible sur ce navigateur.
                                            Utilisez <strong>Chrome</strong> ou <strong>Edge</strong> pour cette fonctionnalité,
                                            ou utilisez la saisie manuelle ci-dessous.
                                        </div>
                                    )}

                                    {/* Alerte erreur caméra */}
                                    {cameraError && (
                                        <div className="alert alert-danger m-3 mb-0">
                                            <i className="ri-camera-off-line me-2"></i>{cameraError}
                                        </div>
                                    )}

                                    {/* Zone vidéo / placeholder */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: '420px',
                                        margin: '20px auto',
                                        aspectRatio: '1 / 1',
                                        background: '#000',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {/* Flux vidéo caméra */}
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

                                        {/* Overlay coins + ligne de scan */}
                                        {isScanning && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '210px',
                                                height: '210px',
                                                pointerEvents: 'none',
                                            }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '44px', height: '44px', borderTop: '4px solid #00ff88', borderLeft: '4px solid #00ff88', borderRadius: '8px 0 0 0' }} />
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '44px', height: '44px', borderTop: '4px solid #00ff88', borderRight: '4px solid #00ff88', borderRadius: '0 8px 0 0' }} />
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '44px', height: '44px', borderBottom: '4px solid #00ff88', borderLeft: '4px solid #00ff88', borderRadius: '0 0 0 8px' }} />
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '44px', height: '44px', borderBottom: '4px solid #00ff88', borderRight: '4px solid #00ff88', borderRadius: '0 0 8px 0' }} />
                                                <div className="scan-overlay-line" />
                                            </div>
                                        )}

                                        {/* Placeholder si pas de scan */}
                                        {!isScanning && (
                                            <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                                                <div style={{
                                                    width: '120px', height: '120px',
                                                    border: '3px dashed #555', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto 16px',
                                                }}>
                                                    <i className="ri-qr-code-line" style={{ fontSize: '48px', color: '#666' }}></i>
                                                </div>
                                                <p className="mb-0" style={{ color: '#aaa', fontSize: '14px' }}>
                                                    Appuyez sur Scanner pour démarrer la caméra
                                                </p>
                                            </div>
                                        )}

                                        {/* Spinner validation API en cours */}
                                        {loading && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(0,0,0,0.7)',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center', color: '#fff'
                                            }}>
                                                <div className="spinner-border text-success mb-2"></div>
                                                <small>Validation en cours…</small>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bouton scanner */}
                                    <div className="d-flex gap-3 p-4 pt-0 justify-content-center">
                                        <button
                                            onClick={isScanning ? stopScanner : startScanner}
                                            className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} btn-lg px-5`}
                                            style={{ minWidth: '160px' }}
                                            disabled={loading}
                                        >
                                            <i className={`${isScanning ? 'ri-stop-circle-line' : 'ri-qr-scan-2-line'} me-2`}></i>
                                            {isScanning ? 'Arrêter' : 'Scanner'}
                                        </button>
                                    </div>
                                </div>

                                {/* Saisie manuelle */}
                                <div className="card-footer bg-light">
                                    <form onSubmit={handleManualSubmit} className="row g-2 align-items-center">
                                        <div className="col-auto">
                                            <label htmlFor="manualCode" className="col-form-label fw-medium">
                                                <i className="ri-keyboard-line me-1"></i>Saisie manuelle :
                                            </label>
                                        </div>
                                        <div className="col">
                                            <input
                                                type="text"
                                                id="manualCode"
                                                className="form-control"
                                                placeholder="Coller ou saisir le code QR…"
                                                value={manualCode}
                                                onChange={e => setManualCode(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <button
                                                type="submit"
                                                className="btn btn-secondary"
                                                disabled={loading || !manualCode.trim()}
                                            >
                                                {loading ? (
                                                    <><span className="spinner-border spinner-border-sm me-1"></span>Validation…</>
                                                ) : 'Valider'}
                                            </button>
                                        </div>
                                    </form>
                                    {error && (
                                        <div className="alert alert-danger mt-3 mb-0 py-2">
                                            <i className="ri-error-warning-line me-2"></i>{error}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Résultat formaté */}
                            {scannedData && <ScanResultCard data={scannedData} />}
                        </div>

                        {/* Sidebar info */}
                        <div className="col-lg-4">
                            {/* Statut scanner */}
                            <div className="card custom-card mb-3">
                                <div className="card-body text-center">
                                    <div className="mb-3">
                                        {loading ? (
                                            <span className="avatar avatar-xl avatar-rounded bg-success-transparent">
                                                <i className="ri-checkbox-circle-line fs-2 text-success"></i>
                                            </span>
                                        ) : isScanning ? (
                                            <span className="avatar avatar-xl avatar-rounded bg-warning-transparent">
                                                <i className="ri-loader-4-line ri-spin fs-2 text-warning"></i>
                                            </span>
                                        ) : (
                                            <span className="avatar avatar-xl avatar-rounded bg-light text-muted">
                                                <i className="ri-focus-3-line fs-2"></i>
                                            </span>
                                        )}
                                    </div>
                                    <h6 className="mb-1">
                                        {loading ? 'Validation API…' : isScanning ? 'Scan en cours…' : 'En attente de scan'}
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        {loading
                                            ? 'Le code est transmis au serveur.'
                                            : isScanning
                                                ? 'Alignez le QR code dans le cadre vert.'
                                                : 'Activez le scanner ou saisissez le code.'}
                                    </p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="card custom-card mb-3">
                                <div className="card-header bg-primary-transparent">
                                    <div className="card-title">Instructions</div>
                                </div>
                                <div className="card-body small">
                                    <ol className="ps-3 mb-0">
                                        <li className="mb-2">Cliquez sur <strong>Scanner</strong> pour démarrer la caméra.</li>
                                        <li className="mb-2">Autorisez l&apos;accès à la caméra si demandé.</li>
                                        <li className="mb-2">Le livreur présente son QR code à la caméra.</li>
                                        <li className="mb-2">La validation est automatique à la détection.</li>
                                        <li>Ou saisissez le code manuellement.</li>
                                    </ol>
                                    {barcodeDetectorSupported === false && (
                                        <div className="alert alert-warning mt-3 mb-0 py-2 small">
                                            <i className="ri-information-line me-1"></i>
                                            Scan caméra : utilisez Chrome ou Edge.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dernières validations (session) */}
                            {history.length > 0 && (
                                <div className="card custom-card">
                                    <div className="card-header border-bottom-0">
                                        <div className="card-title">Validations de cette session</div>
                                    </div>
                                    <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <ul className="list-group list-group-flush">
                                            {history.map(h => (
                                                <li key={h.id} className="list-group-item px-3 py-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="flex-fill overflow-hidden">
                                                            <div className="fw-semibold small text-truncate">
                                                                {h.officine ?? (h.orderId ? `Cmd #${h.orderId.slice(0, 8)}` : h.driver)}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>
                                                                {formatDate(h.date)}
                                                            </div>
                                                        </div>
                                                        <span className={`badge bg-${h.status === 'success' ? 'success' : 'danger'}-transparent text-${h.status === 'success' ? 'success' : 'danger'}`}>
                                                            {h.status === 'success' ? 'Validé' : 'Échec'}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal historique de session */}
            <div className="modal fade" id="historyModal" tabIndex={-1}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="ri-history-line me-2"></i>Historique des validations (session)
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-0">
                            {history.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="ri-inbox-line fs-1 d-block mb-2"></i>
                                    Aucune validation effectuée dans cette session.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID Commande</th>
                                                <th>Livreur</th>
                                                <th>Date & Heure</th>
                                                <th>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(h => (
                                                <tr key={h.id}>
                                                    <td className="fw-semibold">
                                                        {h.orderId ? `#${h.orderId.slice(0, 8)}` : '—'}
                                                    </td>
                                                    <td>{h.driver}</td>
                                                    <td>{formatDate(h.date)}</td>
                                                    <td>
                                                        <span className={`badge bg-${h.status === 'success' ? 'success' : 'danger'}`}>
                                                            {h.status === 'success' ? 'Succès' : 'Échec'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
