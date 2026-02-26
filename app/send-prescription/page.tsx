'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

export default function SendPrescriptionPage() {
    const [pharmacyId, setPharmacyId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pre-fill pharmacy ID from localStorage if available
    useEffect(() => {
        const stored = localStorage.getItem('officine_id');
        if (stored) setPharmacyId(stored);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setSuccess(false);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (!dropped) return;
        setFile(dropped);
        setPreview(URL.createObjectURL(dropped));
        setSuccess(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setError("Veuillez sélectionner un fichier d'ordonnance."); return; }
        if (!pharmacyId.trim()) { setError("L'identifiant de la pharmacie est requis."); return; }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await api.sendPrescriptionOrder(pharmacyId.trim(), file, note.trim() || undefined);
            setSuccess(true);
            setFile(null);
            setPreview(null);
            setNote('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page">
            <Header />
            <Sidebar />

            <main className="main-content app-content">
                <div className="container-fluid page-container main-body-container">

                    {/* Breadcrumb */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h1 className="page-title fw-semibold fs-18 mb-0">
                            <i className="ri-file-medical-line me-2"></i>Envoyer une Ordonnance
                        </h1>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                            <li className="breadcrumb-item"><Link href="/orders">Commandes</Link></li>
                            <li className="breadcrumb-item active">Envoyer Ordonnance</li>
                        </ol>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-10">

                            {/* Success Alert */}
                            {success && (
                                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                                    <i className="ri-checkbox-circle-fill fs-5"></i>
                                    <div>
                                        <strong>Ordonnance envoyée avec succès !</strong>
                                        <div className="small">La pharmacie a été notifiée et traitera votre demande.</div>
                                    </div>
                                </div>
                            )}

                            {/* Error Alert */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                                    <i className="ri-error-warning-fill fs-5"></i>
                                    <div>{error}</div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="mb-0 fw-semibold">
                                        <i className="ri-hospital-line me-2 text-primary"></i>
                                        Détails de l&apos;envoi
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>

                                        {/* Pharmacy ID */}
                                        <div className="mb-4">
                                            <label className="form-label fw-medium">
                                                <i className="ri-store-2-line me-1 text-primary"></i>
                                                ID de la pharmacie <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ex: 6f07ed46-2800-439f-ad4c-ac05fcb88976"
                                                value={pharmacyId}
                                                onChange={e => setPharmacyId(e.target.value)}
                                                required
                                            />
                                            <div className="form-text">Identifiant UUID de la pharmacie destinataire.</div>
                                        </div>

                                        {/* File Drop Zone */}
                                        <div className="mb-4">
                                            <label className="form-label fw-medium">
                                                <i className="ri-file-image-line me-1 text-primary"></i>
                                                Fichier d&apos;ordonnance <span className="text-danger">*</span>
                                            </label>
                                            <div
                                                className="rounded-3 p-4 text-center"
                                                style={{ borderColor: '#dee2e6', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}
                                                onDrop={handleDrop}
                                                onDragOver={e => e.preventDefault()}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {preview ? (
                                                    <div>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={preview}
                                                            alt="Aperçu de l'ordonnance"
                                                            className="img-fluid rounded shadow-sm mb-2"
                                                            style={{ maxHeight: '300px', objectFit: 'contain' }}
                                                        />
                                                        <div className="text-muted small mt-1">
                                                            <i className="ri-file-line me-1"></i>{file?.name} — {file && (file.size / 1024).toFixed(1)} Ko
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary mt-2"
                                                            onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                        >
                                                            <i className="ri-delete-bin-line me-1"></i>Supprimer
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="py-3">
                                                        <i className="ri-upload-cloud-2-line fs-1 text-muted d-block mb-2"></i>
                                                        <p className="mb-1 fw-medium">Glissez votre ordonnance ici</p>
                                                        <p className="text-muted small mb-0">ou cliquez pour parcourir — JPG, PNG, PDF</p>
                                                    </div>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="d-none"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Optional Note */}
                                        <div className="mb-4">
                                            <label className="form-label fw-medium">
                                                <i className="ri-chat-3-line me-1 text-primary"></i>
                                                Note / instructions <span className="text-muted fw-normal">(optionnel)</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                placeholder="Ex : Médicaments urgents, allergie à la pénicilline…"
                                                value={note}
                                                onChange={e => setNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="d-flex gap-3 justify-content-end">
                                            <Link href="/orders" className="btn btn-outline-secondary px-4">
                                                Annuler
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-5"
                                                style={{ backgroundColor: '#3ab047', borderColor: '#3ab047' }}
                                                disabled={isLoading || !file}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Envoi en cours…
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-send-plane-line me-2"></i>
                                                        Envoyer l&apos;ordonnance
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
