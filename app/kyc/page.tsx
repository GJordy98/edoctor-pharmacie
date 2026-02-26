'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

interface FileField {
    key: string;
    label: string;
    hint: string;
    required: boolean;
    file: File | null;
}

const INITIAL_FIELDS: FileField[] = [
    {
        key: 'licence_file',
        label: 'Licence d\'exploitation',
        hint: 'Autorisation officielle d\'ouverture de la pharmacie (PDF ou image)',
        required: true,
        file: null,
    },
    {
        key: 'owner_id_file',
        label: 'Pièce d\'identité du gérant',
        hint: 'CNI, passeport ou titre de séjour en cours de validité (PDF ou image)',
        required: true,
        file: null,
    },
    {
        key: 'additional_doc',
        label: 'Document complémentaire',
        hint: 'Tout document justificatif supplémentaire (optionnel)',
        required: false,
        file: null,
    },
];

export default function KycPage() {
    const [fields, setFields] = useState<FileField[]>(INITIAL_FIELDS);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleFileChange = (key: string, file: File | null) => {
        setFields(prev => prev.map(f => f.key === key ? { ...f, file } : f));
    };

    const handleDrop = (key: string, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file) handleFileChange(key, file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate required fields
        const missing = fields.filter(f => f.required && !f.file);
        if (missing.length > 0) {
            setMessage({
                text: `Veuillez fournir : ${missing.map(f => f.label).join(', ')}.`,
                type: 'danger',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            fields.forEach(f => {
                if (f.file) formData.append(f.key, f.file);
            });

            await api.submitKycOfficine(formData);

            setMessage({ text: 'Documents KYC envoyés avec succès. Votre dossier est en cours de vérification.', type: 'success' });
            setFields(INITIAL_FIELDS);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur lors de l\'envoi des documents.';
            setMessage({ text: msg, type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page">
            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">

                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
                        <div>
                            <h1 className="page-title fw-semibold fs-18 mb-0">
                                <i className="ri-shield-check-line me-2"></i>Vérification KYC
                            </h1>
                            <nav aria-label="breadcrumb" className="mt-1">
                                <ol className="breadcrumb breadcrumb-style1 mb-0">
                                    <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                    <li className="breadcrumb-item active">KYC</li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    {/* Alert */}
                    {message && (
                        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                            <i className={`${message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} me-2`}></i>
                            {message.text}
                            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                        </div>
                    )}

                    <div className="row justify-content-center">
                        <div className="col-lg-8">

                            {/* Info Banner */}
                            <div className="alert alert-primary d-flex align-items-center mb-4" role="alert">
                                <i className="ri-information-line fs-4 me-3"></i>
                                <div>
                                    <strong>Pourquoi ces documents ?</strong><br />
                                    <small>
                                        La vérification KYC permet de valider l&apos;authenticité de votre officine et d&apos;activer
                                        toutes les fonctionnalités de la plateforme.
                                    </small>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {fields.map((field) => (
                                    <div key={field.key} className="card custom-card mb-4">
                                        <div className="card-header">
                                            <div className="card-title">
                                                <i className="ri-file-text-line me-2"></i>
                                                {field.label}
                                                {field.required && <span className="text-danger ms-1">*</span>}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <p className="text-muted small mb-3">{field.hint}</p>

                                            {/* Drop Zone */}
                                            <div
                                                onClick={() => inputRefs.current[field.key]?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleDrop(field.key, e)}
                                                style={{
                                                    border: `2px dashed ${field.file ? '#3ab047' : '#ced4da'}`,
                                                    borderRadius: '8px',
                                                    padding: '30px 20px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: field.file ? '#f0fff0' : '#fafafa',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {field.file ? (
                                                    <div>
                                                        <i className="ri-file-check-line fs-2 text-success mb-2 d-block"></i>
                                                        <p className="fw-semibold text-success mb-1">{field.file.name}</p>
                                                        <small className="text-muted">
                                                            {(field.file.size / 1024).toFixed(1)} Ko — Cliquez pour remplacer
                                                        </small>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <i className="ri-upload-cloud-2-line fs-2 text-muted mb-2 d-block"></i>
                                                        <p className="mb-1 text-muted">Glissez un fichier ici ou <strong>cliquez pour parcourir</strong></p>
                                                        <small className="text-muted">PDF, JPG, PNG — max 10 Mo</small>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                ref={el => { inputRefs.current[field.key] = el; }}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileChange(field.key, e.target.files?.[0] ?? null)}
                                            />

                                            {field.file && (
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm text-danger mt-2 p-0"
                                                    onClick={() => handleFileChange(field.key, null)}
                                                >
                                                    <i className="ri-delete-bin-line me-1"></i>Supprimer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Submit */}
                                <div className="d-flex gap-3 justify-content-end mb-5">
                                    <Link href="/" className="btn btn-outline-secondary">
                                        <i className="ri-arrow-left-line me-2"></i>Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi en cours...</>
                                            : <><i className="ri-send-plane-line me-2"></i>Soumettre les documents</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
