'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

export default function ValidateOrderOrQrPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scannedData, setScannedData] = useState<Record<string, unknown> | null>(null);

    const toggleScanner = () => {
        setIsScanning(!isScanning);
        // In a real implementation, this would start the camera.
        // For now, we'll just toggle the UI state.
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;

        setLoading(true);
        setError(null);
        setScannedData(null);

        try {
            const data = await api.scanQrCodePickup({ qr_code: manualCode });
            setScannedData(data as Record<string, unknown>);
        } catch (err: unknown) {
            console.error("Validation error:", err);
            const errorMessage = err instanceof Error ? err.message : "Code invalide ou erreur serveur.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <style jsx>{`
                @keyframes scanline {
                    0%, 100% {
                        top: 20%;
                        opacity: 0;
                    }
                    50% {
                        top: 80%;
                        opacity: 1;
                    }
                }
                .scan-overlay-line {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #00ff88, transparent);
                    animation: scanline 2s ease-in-out infinite;
                }
            `}</style>

            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
                        <div>
                            <h1 className="page-title fw-semibold fs-18 mb-0">
                                <i className="ri-scan-line me-2"></i>Validation Retrait Commande
                            </h1>
                            <div className="text-muted small mt-1">
                                Scannez le code QR du livreur pour confirmer la récupération des médicaments
                            </div>
                        </div>
                        <div className="ms-md-1 ms-0 mt-md-0 mt-2">
                            <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#historyModal">
                                <i className="ri-history-line me-2"></i>Historique
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {/* QR Scanner Section */}
                        <div className="col-lg-8">
                            <div className="card custom-card">
                                <div className="card-header bg-primary text-white">
                                    <div className="card-title text-white">
                                        <i className="ri-qr-scan-line me-2"></i>Scanner QR Code
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {/* Scanner Container */}
                                    <div id="qr-scanner-container" style={{
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: '400px',
                                        margin: '20px auto',
                                        aspectRatio: '1 / 1',
                                        background: '#000',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {isScanning ? (
                                            <>
                                                <div style={{ width: '100%', height: '100%', background: '#111' }}></div>
                                                {/* Overlay de scan (corners style iPhone) */}
                                                <div id="scan-overlay" style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '200px',
                                                    height: '200px',
                                                    pointerEvents: 'none'
                                                }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '4px solid #00ff88', borderLeft: '4px solid #00ff88', borderRadius: '8px 0 0 0' }}></div>
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '4px solid #00ff88', borderRight: '4px solid #00ff88', borderRadius: '0 8px 0 0' }}></div>
                                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '4px solid #00ff88', borderLeft: '4px solid #00ff88', borderRadius: '0 0 0 8px' }}></div>
                                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '4px solid #00ff88', borderRight: '4px solid #00ff88', borderRadius: '0 0 8px 0' }}></div>
                                                    <div className="scan-overlay-line"></div>
                                                </div>
                                            </>
                                        ) : (
                                            <div id="scanner-placeholder" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#888',
                                                textAlign: 'center',
                                                padding: '20px'
                                            }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    border: '3px dashed #555',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '16px'
                                                }}>
                                                    <i className="ri-qr-code-line" style={{ fontSize: '48px', color: '#666' }}></i>
                                                </div>
                                                <p className="mb-0" style={{ color: '#aaa', fontSize: '14px' }}>Appuyez sur Scanner pour commencer</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scanner Controls */}
                                    <div className="d-flex gap-3 p-4 pt-0 justify-content-center">
                                        <button 
                                            onClick={toggleScanner}
                                            className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} btn-lg px-5`} 
                                            style={{ minWidth: '160px' }}
                                        >
                                            <i className={`${isScanning ? 'ri-stop-circle-line' : 'ri-qr-scan-2-line'} me-2`}></i>
                                            {isScanning ? 'Arrêter' : 'Scanner'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Manual Input */}
                                <div className="card-footer bg-light">
                                    <form onSubmit={handleManualSubmit} className="row g-3 align-items-center justify-content-center">
                                        <div className="col-auto">
                                            <label htmlFor="manualCode" className="col-form-label">Saisie Manuelle:</label>
                                        </div>
                                        <div className="col-auto">
                                            <input 
                                                type="text" 
                                                id="manualCode" 
                                                className="form-control" 
                                                placeholder="Entrer le code..." 
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <button type="submit" className="btn btn-secondary" disabled={loading || !manualCode}>
                                                {loading ? 'Validation...' : 'Valider'}
                                            </button>
                                        </div>
                                    </form>
                                    {error && <div className="text-danger text-center mt-2">{error}</div>}
                                </div>
                            </div>

                            {/* Scanned Data Display */}
                            {scannedData && (
                                <div id="scanned-data-card" className="card custom-card mt-4 border-success">
                                    <div className="card-header bg-success text-white">
                                        <div className="card-title text-white">Données Récupérées</div>
                                    </div>
                                    <div className="card-body">
                                        {/* Display result dynamically as we don't know the exact structure yet */}
                                        <pre>{JSON.stringify(scannedData, null, 2)}</pre> 
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="col-lg-4">
                            {/* Status Card */}
                            <div className="card custom-card mb-3">
                                <div className="card-body text-center">
                                    <div className="mb-3">
                                        {isScanning ? (
                                            <span className="avatar avatar-xl avatar-rounded bg-warning-transparent">
                                                <i className="ri-loader-4-line ri-spin fs-2"></i>
                                            </span>
                                        ) : (
                                            <span className="avatar avatar-xl avatar-rounded bg-light text-muted">
                                                <i className="ri-focus-3-line fs-2"></i>
                                            </span>
                                        )}
                                    </div>
                                    <h6 className="mb-2">{isScanning ? 'Scan en cours...' : 'En attente de scan'}</h6>
                                    <p className="text-muted small mb-0">
                                        {isScanning ? 'Alignez le code QR dans le cadre.' : 'Activez le scanner pour valider un retrait.'}
                                    </p>
                                </div>
                            </div>

                            {/* Instructions Card */}
                            <div className="card custom-card">
                                <div className="card-header bg-primary-transparent">
                                    <div className="card-title">Instructions</div>
                                </div>
                                <div className="card-body small">
                                    <ol className="ps-3 mb-0">
                                        <li className="mb-2">Cliquez sur le bouton <strong>Scanner</strong> ou saisissez le code manuellement.</li>
                                        <li className="mb-2">Autorisez l accès à la caméra si demandé.</li>
                                        <li className="mb-2">Présentez le QR code face à la caméra.</li>
                                        <li className="mb-2">Le scan se fait automatiquement.</li>
                                        <li>Confirmez la validation.</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Recent Validations (Static for now) */}
                            <div className="card custom-card mt-3">
                                <div className="card-header border-bottom-0">
                                    <div className="card-title">Dernières Validations</div>
                                </div>
                                <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="flex-fill">
                                                    <div className="fw-semibold small">CMD #8821</div>
                                                    <div className="text-muted fs-11">Livreur: Jean Dupont</div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="badge bg-success-transparent">Validé</div>
                                                    <div className="fs-10 text-muted">Il y a 2m</div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal - kept static for now */}
            <div className="modal fade" id="historyModal" tabIndex={-1}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="ri-history-line me-2"></i>Historique des Validations
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-0">
                            <div className="table-responsive">
                                <table className="table text-nowrap">
                                    <thead>
                                        <tr>
                                            <th>ID Commande</th>
                                            <th>Livreur</th>
                                            <th>Date & Heure</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="fw-semibold">#CMD-9021</span></td>
                                            <td>Jean Dupont</td>
                                            <td>05 Feb 2026, 09:15</td>
                                            <td><span className="badge bg-success">Success</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
