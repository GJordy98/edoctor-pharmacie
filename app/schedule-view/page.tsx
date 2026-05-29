'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api-client';
import { ScheduleDayPayload, Pharmacy } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, ShieldAlert, Loader2, AlertCircle, Building2, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

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

export default function ScheduleViewPage() {
    const { t } = useLanguage();
    const [schedule, setSchedule] = useState<ScheduleDayPayload[]>([]);
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Tenter de charger la pharmacie depuis le stockage local (pharmacien) ou session (patient)
        let officineId = '';
        let pharmacyObj: Pharmacy | null = null;

        const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem('viewing_officine') : null;
        const localData = typeof window !== 'undefined' ? localStorage.getItem('officine') : null;

        if (sessionData) {
            try {
                pharmacyObj = JSON.parse(sessionData);
                officineId = pharmacyObj?.id || '';
            } catch {
                // silent
            }
        }

        if (!officineId && localData) {
            try {
                pharmacyObj = JSON.parse(localData);
                officineId = pharmacyObj?.id || '';
            } catch {
                // silent
            }
        }

        if (pharmacyObj) {
            setPharmacy(pharmacyObj);
        }

        if (!officineId) {
            setLoading(false);
            setError(t('schedule_view.no_pharmacy'));
            return;
        }

        api.getSchedule(officineId)
            .then(res => {
                if (res && Array.isArray(res.schedules)) {
                    setSchedule(res.schedules);
                } else {
                    setError(t('schedule_view.no_schedule'));
                }
            })
            .catch(() => {
                setError(t('schedule_view.fetch_error'));
            })
            .finally(() => setLoading(false));
    }, [t]);

    const officineAddress = pharmacy
        ? [pharmacy.adresse?.rue, pharmacy.adresse?.city].filter(Boolean).join(', ')
        : '';

    return (
        <DashboardLayout title={t('schedule_view.title')}>
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-green-200">
                        <Clock size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-[#1E293B]">{t('schedule_view.title')}</h2>
                        <p className="text-[12px] text-[#94A3B8] mt-0.5">
                            {t('schedule_view.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Info Pharmacie */}
                {pharmacy && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                <Building2 size={18} className="text-[#22C55E]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[15px] font-bold text-[#1E293B]">{pharmacy.name}</h3>
                                {pharmacy.description && (
                                    <p className="text-[12px] text-[#64748B] mt-0.5">{pharmacy.description}</p>
                                )}
                            </div>
                        </div>

                        {(pharmacy.telephone || officineAddress) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9] text-[12px]">
                                {pharmacy.telephone && (
                                    <a
                                        href={`tel:${pharmacy.telephone}`}
                                        className="flex items-center gap-2 text-[#64748B] hover:text-[#22C55E]"
                                    >
                                        <Phone size={14} className="text-[#94A3B8]" />
                                        <span>{pharmacy.telephone}</span>
                                    </a>
                                )}
                                {officineAddress && (
                                    <div className="flex items-center gap-2 text-[#64748B]">
                                        <MapPin size={14} className="text-[#94A3B8]" />
                                        <span className="truncate">{officineAddress}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Contenu */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-sm">
                        <Loader2 size={32} className="text-[#22C55E] animate-spin mx-auto mb-3" />
                        <p className="text-[13px] text-[#94A3B8]">{t('schedule_view.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-sm space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-[#1E293B]">{error}</p>
                            <p className="text-[12px] text-[#94A3B8] mt-1">
                                {t('schedule_view.urgent_hint')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="divide-y divide-[#F1F5F9]">
                            {DAYS.map((day) => {
                                const found = schedule.find(s => s.day === day.key);
                                const isOpen = !!found;
                                const isGuard = found?.is_guard ?? false;

                                return (
                                    <div
                                        key={day.key}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors ${
                                            isGuard ? 'bg-amber-50/40' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[13px] font-bold text-[#1E293B] w-20">{t('schedule.days.' + day.key)}</span>
                                            {isGuard && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    <ShieldAlert size={10} /> {t('schedule.guard_badge')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            {isOpen ? (
                                                <span className="text-[13px] font-semibold text-[#475569]">
                                                    {found.open_time} - {found.close_time}
                                                </span>
                                            ) : (
                                                <span className="text-[12px] font-medium text-[#94A3B8] italic">
                                                    {t('schedule_view.closed')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bouton retour */}
                <div className="flex justify-center">
                    <Link
                        href="/orders"
                        className="text-[13px] font-semibold text-[#22C55E] hover:underline"
                    >
                        {t('schedule_view.back_to_orders')}
                    </Link>
                </div>

            </div>
        </DashboardLayout>
    );
}
