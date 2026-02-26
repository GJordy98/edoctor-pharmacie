'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';
import { ScheduleDayPayload } from '@/lib/types';

const DAYS = [
    { key: 'monday',    label: 'Lundi' },
    { key: 'tuesday',   label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday',  label: 'Jeudi' },
    { key: 'friday',    label: 'Vendredi' },
    { key: 'saturday',  label: 'Samedi' },
    { key: 'sunday',    label: 'Dimanche' },
];

const DEFAULT_SCHEDULE: ScheduleDayPayload[] = DAYS.map(d => ({
    day: d.key,
    opening_time: '08:00',
    closing_time: '18:00',
    is_open: d.key !== 'sunday',
}));

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleDayPayload[]>(DEFAULT_SCHEDULE);
    const [loading, setLoading]   = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage]   = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [officineId, setOfficineId] = useState<string>('');

    useEffect(() => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('officine') : null;
        let id = '';
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                id = parsed?.id || parsed?.uuid || String(parsed) || '';
            } catch {
                id = raw;
            }
        }
        setOfficineId(id);

        if (!id) {
            setLoading(false);
            setMessage({ text: 'Officine introuvable. Veuillez vous reconnecter.', type: 'danger' });
            return;
        }

        api.getSchedule(id)
            .then(res => {
                const raw = res?.schedule;
                if (Array.isArray(raw) && raw.length > 0) {
                    // Merge with DEFAULT_SCHEDULE so all 7 days are always displayed
                    const merged = DAYS.map(d => {
                        const found = raw.find((s: ScheduleDayPayload) => s.day === d.key);
                        return found ?? DEFAULT_SCHEDULE.find(s => s.day === d.key)!;
                    });
                    setSchedule(merged);
                }
            })
            .catch(() => {
                // No schedule yet — keep defaults, user can create one
            })
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (day: string) => {
        setSchedule(prev =>
            prev.map(s => s.day === day ? { ...s, is_open: !s.is_open } : s)
        );
    };

    const handleTimeChange = (day: string, field: 'opening_time' | 'closing_time', value: string) => {
        setSchedule(prev =>
            prev.map(s => s.day === day ? { ...s, [field]: value } : s)
        );
    };

    const handleSave = async () => {
        if (!officineId) {
            setMessage({ text: 'Officine introuvable.', type: 'danger' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            await api.updateSchedule(officineId, { schedule });
            setMessage({ text: 'Horaires enregistrés avec succès.', type: 'success' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.';
            setMessage({ text: msg, type: 'danger' });
        } finally {
            setIsSaving(false);
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
                                <i className="ri-time-line me-2"></i>Planning & Horaires
                            </h1>
                            <nav aria-label="breadcrumb" className="mt-1">
                                <ol className="breadcrumb breadcrumb-style1 mb-0">
                                    <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                    <li className="breadcrumb-item active">Planning</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="ms-md-1 ms-0 mt-md-0 mt-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={isSaving || loading}
                            >
                                {isSaving
                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                                    : <><i className="ri-save-line me-2"></i>Enregistrer</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    {message && (
                        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                            <i className={`${message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} me-2`}></i>
                            {message.text}
                            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-12">
                            <div className="card custom-card">
                                <div className="card-header">
                                    <div className="card-title">
                                        <i className="ri-calendar-schedule-line me-2"></i>
                                        Horaires d&apos;ouverture hebdomadaires
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <span className="spinner-border text-primary"></span>
                                            <p className="mt-3 text-muted">Chargement des horaires...</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-bordered align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '160px' }}>Jour</th>
                                                        <th style={{ width: '120px' }}>Ouvert</th>
                                                        <th>Heure d&apos;ouverture</th>
                                                        <th>Heure de fermeture</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schedule.map((s) => {
                                                        const dayLabel = DAYS.find(d => d.key === s.day)?.label ?? s.day;
                                                        return (
                                                            <tr key={s.day} className={!s.is_open ? 'table-secondary' : ''}>
                                                                <td>
                                                                    <span className="fw-semibold">
                                                                        <i className="ri-calendar-line me-2 text-primary"></i>
                                                                        {dayLabel}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="form-check form-switch">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            role="switch"
                                                                            id={`toggle-${s.day}`}
                                                                            checked={s.is_open}
                                                                            onChange={() => handleToggle(s.day)}
                                                                        />
                                                                        <label className="form-check-label" htmlFor={`toggle-${s.day}`}>
                                                                            {s.is_open
                                                                                ? <span className="badge bg-success-transparent text-success">Ouvert</span>
                                                                                : <span className="badge bg-danger-transparent text-danger">Fermé</span>
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="time"
                                                                        className="form-control"
                                                                        value={s.opening_time}
                                                                        disabled={!s.is_open}
                                                                        onChange={(e) => handleTimeChange(s.day, 'opening_time', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="time"
                                                                        className="form-control"
                                                                        value={s.closing_time}
                                                                        disabled={!s.is_open}
                                                                        onChange={(e) => handleTimeChange(s.day, 'closing_time', e.target.value)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-light">
                                    <small className="text-muted">
                                        <i className="ri-information-line me-1"></i>
                                        Les horaires s&apos;affichent aux patients lors de la recherche de pharmacies.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
