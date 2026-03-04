'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api-client';
import { ScheduleDayPayload } from '@/lib/types';
import { Clock, Save, Loader2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

type DayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

const DAYS: { key: DayCode; label: string }[] = [
    { key: 'MON', label: 'Lundi' },
    { key: 'TUE', label: 'Mardi' },
    { key: 'WED', label: 'Mercredi' },
    { key: 'THU', label: 'Jeudi' },
    { key: 'FRI', label: 'Vendredi' },
    { key: 'SAT', label: 'Samedi' },
    { key: 'SUN', label: 'Dimanche' },
];

const DEFAULT_SCHEDULE: ScheduleDayPayload[] = DAYS.map(d => ({
    day: d.key,
    open_time: '08:00',
    close_time: '18:00',
    is_guard: false,
}));

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleDayPayload[]>(DEFAULT_SCHEDULE);
    const [loading, setLoading]   = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);
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
            setMessage({ text: 'Officine introuvable. Veuillez vous reconnecter.', ok: false });
            return;
        }

        api.getSchedule(id)
            .then(res => {
                const items = res?.schedules;
                if (Array.isArray(items) && items.length > 0) {
                    const merged = DAYS.map(d => {
                        const found = items.find((s: ScheduleDayPayload) => s.day === d.key);
                        return found ?? DEFAULT_SCHEDULE.find(s => s.day === d.key)!;
                    });
                    setSchedule(merged);
                }
            })
            .catch(() => { /* No schedule yet — keep defaults */ })
            .finally(() => setLoading(false));
    }, []);

    const handleTimeChange = (day: DayCode, field: 'open_time' | 'close_time', value: string) => {
        setSchedule(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
    };

    const handleGuardToggle = (day: DayCode) => {
        setSchedule(prev => prev.map(s => s.day === day ? { ...s, is_guard: !s.is_guard } : s));
    };

    const handleSave = async () => {
        if (!officineId) {
            setMessage({ text: 'Officine introuvable.', ok: false });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            await api.updateSchedule(officineId, { schedules: schedule });
            setMessage({ text: 'Horaires enregistrés avec succès.', ok: true });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.';
            setMessage({ text: msg, ok: false });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout title="Horaires d'ouverture">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                            <Clock size={20} className="text-[#22C55E]" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-bold text-[#1E293B]">Horaires d&apos;ouverture</h1>
                            <p className="text-[12px] text-[#94A3B8]">Configurez vos créneaux hebdomadaires</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-[#22C55E]/30"
                    >
                        {isSaving
                            ? <><Loader2 size={15} className="animate-spin" />Enregistrement…</>
                            : <><Save size={15} />Enregistrer</>
                        }
                    </button>
                </div>

                {/* Alert */}
                {message && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${
                        message.ok
                            ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#86EFAC]'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.ok
                            ? <CheckCircle size={16} className="shrink-0" />
                            : <XCircle size={16} className="shrink-0" />
                        }
                        {message.text}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 size={32} className="text-[#22C55E] animate-spin" />
                            <p className="text-[13px] text-[#94A3B8]">Chargement des horaires…</p>
                        </div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-[140px_1fr_1fr_auto] gap-3 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Jour</span>
                                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Heure ouverture</span>
                                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Heure fermeture</span>
                                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">De garde</span>
                            </div>

                            <div className="divide-y divide-[#F8FAFC]">
                                {schedule.map((s) => {
                                    const dayLabel = DAYS.find(d => d.key === s.day)?.label ?? s.day;
                                    return (
                                        <div
                                            key={s.day}
                                            className={`grid grid-cols-[140px_1fr_1fr_auto] gap-3 items-center px-5 py-4 transition-colors ${
                                                s.is_guard ? 'bg-amber-50/50' : ''
                                            }`}
                                        >
                                            {/* Day name */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-[#1E293B]">{dayLabel}</span>
                                                {s.is_guard && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                                        <ShieldAlert size={10} />Garde
                                                    </span>
                                                )}
                                            </div>

                                            {/* Open time */}
                                            <input
                                                type="time"
                                                value={s.open_time}
                                                onChange={(e) => handleTimeChange(s.day as DayCode, 'open_time', e.target.value)}
                                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] bg-white w-full max-w-[120px]"
                                            />

                                            {/* Close time */}
                                            <input
                                                type="time"
                                                value={s.close_time}
                                                onChange={(e) => handleTimeChange(s.day as DayCode, 'close_time', e.target.value)}
                                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] bg-white w-full max-w-[120px]"
                                            />

                                            {/* Guard toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handleGuardToggle(s.day as DayCode)}
                                                className={`w-11 h-6 rounded-full relative transition-colors ${
                                                    s.is_guard ? 'bg-amber-400' : 'bg-[#E2E8F0]'
                                                }`}
                                                title={s.is_guard ? 'Pharmacie de garde' : 'Non de garde'}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                                    s.is_guard ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer hint */}
                            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                                <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                                    <ShieldAlert size={12} className="text-amber-400" />
                                    Activez &quot;De garde&quot; pour les jours où votre pharmacie assure une garde nocturne ou hebdomadaire.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
