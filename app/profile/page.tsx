'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Edit2,
  Save,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Pharmacy, Account } from '@/lib/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { showToast } from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';

/* ── helpers ── */
function SectionCard({
  title,
  icon: Icon,
  iconColor = 'text-[#22C55E]',
  iconBg = 'bg-[#F0FDF4]',
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={17} className={iconColor} />
          </div>
          <h3 className="text-[14px] font-semibold text-[#1E293B]">{title}</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors"
          >
            <Edit2 size={12} />
            {t("profile.btn_edit")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] rounded-lg text-[#94A3B8] hover:text-[#1E293B] transition-colors"
            >
              <X size={12} />
              {t("profile.btn_cancel")}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isSaving ? t("profile.saving") : t("profile.btn_save")}
            </button>
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide">{label}</p>
      <p className="text-[14px] font-semibold text-[#1E293B]">{value || <span className="text-[#CBD5E1] font-normal">—</span>}</p>
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-white text-[#1E293B] hover:border-[#CBD5E1] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none transition-colors';

/* ── page ── */
export default function ProfilePage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [officine, setOfficine] = useState<Pharmacy | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  // formulaires locaux pour l'édition
  const [officineForm, setOfficineForm] = useState<Partial<Pharmacy>>({});
  const [addressForm, setAddressForm] = useState<Partial<Pharmacy['adresse']>>({});
  const [accountForm, setAccountForm] = useState<Partial<Account>>({});

  const [editing, setEditing] = useState({ officine: false, address: false, account: false });
  const [saving, setSaving] = useState({ officine: false, address: false, account: false });

  /* ── chargement ── */
  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem('officine');
        const rawAcc = localStorage.getItem('account');
        if (!raw) {
          setError(t('profile.errors.no_pharmacy'));
          return;
        }
        const parsed = JSON.parse(raw);
        const officineId = parsed?.id || parsed?.uuid || String(parsed);
        if (!officineId) {
          setError(t('profile.errors.no_pharmacy'));
          return;
        }
        const data = await api.getPharmacy(officineId);
        setOfficine(data);
        setOfficineForm({ name: data.name, telephone: data.telephone, description: data.description });
        setAddressForm({ ...data.adresse });

        if (rawAcc) {
          const acc = JSON.parse(rawAcc);
          setAccount(acc);
          setAccountForm(acc);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.errors.fetch_failed'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── sauvegarde ── */
  const save = async (section: 'officine' | 'address' | 'account') => {
    if (!officine) return;
    setSaving(s => ({ ...s, [section]: true }));
    try {
      if (section === 'officine') {
        const updated = { ...officine, ...officineForm };
        await api.updatePharmacy(officine.id, updated);
        setOfficine(updated);
        localStorage.setItem('officine', JSON.stringify(updated));
      } else if (section === 'address') {
        const updated = { ...officine, adresse: { ...officine.adresse, ...addressForm } };
        await api.updatePharmacy(officine.id, updated);
        setOfficine(updated);
        localStorage.setItem('officine', JSON.stringify(updated));
      } else if (section === 'account' && account) {
        const updated = { ...account, ...accountForm };
        await api.updateProfile(updated);
        setAccount(updated);
        localStorage.setItem('account', JSON.stringify(updated));
      }
      setEditing(e => ({ ...e, [section]: false }));
      showToast(t('profile.success.saved'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('profile.errors.save_failed'), 'error');
    } finally {
      setSaving(s => ({ ...s, [section]: false }));
    }
  };

  const startEdit = (section: 'officine' | 'address' | 'account') => {
    // Réinitialise le formulaire avec les valeurs actuelles avant d'éditer
    if (section === 'officine' && officine)
      setOfficineForm({ name: officine.name, telephone: officine.telephone, description: officine.description });
    if (section === 'address' && officine)
      setAddressForm({ ...officine.adresse });
    if (section === 'account' && account)
      setAccountForm({ ...account });
    setEditing(e => ({ ...e, [section]: true }));
  };

  const cancelEdit = (section: 'officine' | 'address' | 'account') =>
    setEditing(e => ({ ...e, [section]: false }));

  /* ── états ── */
  if (loading) {
    return (
      <DashboardLayout title={t("profile.title")}>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={32} className="animate-spin text-[#22C55E]" />
          <p className="text-[14px] text-[#94A3B8]">{t("profile.loading")}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t("profile.title")}>
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-[13px]">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const initial = officine?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <DashboardLayout title={t("profile.title")}>
      <div className="space-y-5 animate-fade-in-up max-w-4xl mx-auto">

        {/* ── Hero card ── */}
        <div className="relative bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-2xl p-6 overflow-hidden">
          {/* pattern décoratif */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 text-white text-[32px] font-bold">
              {initial}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-[22px] font-bold text-white">{officine?.name}</h2>
              {officine?.description && (
                <p className="text-white/70 text-[13px] mt-0.5">{officine.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-white/80 text-[13px]">
                {officine?.adresse?.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {officine.adresse.city}{officine.adresse.quater ? `, ${officine.adresse.quater}` : ''}
                  </span>
                )}
                {officine?.telephone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} />
                    {officine.telephone}
                  </span>
                )}
              </div>
            </div>
            {/* Badge statut */}
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[12px] font-semibold">
                <CheckCircle2 size={13} />
                {officine?.status === "active" || officine?.status === "ACTIVE" ? t("profile.status_active") : (officine?.status || 'Actif')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Grille 2 colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Infos pharmacie */}
          <SectionCard
            title={t("profile.officine_info_title")}
            icon={Store}
            isEditing={editing.officine}
            isSaving={saving.officine}
            onEdit={() => startEdit('officine')}
            onSave={() => save('officine')}
            onCancel={() => cancelEdit('officine')}
          >
            {!editing.officine ? (
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label={t("profile.lastname")} value={officine?.name} />
                <InfoRow label={t("profile.telephone")} value={officine?.telephone} />
                <div className="col-span-2">
                  <InfoRow label={t("profile.description")} value={officine?.description} />
                </div>
                <div className="col-span-2">
                  <InfoRow
                    label={t("profile.created_at")}
                    value={officine?.created_at
                      ? new Date(officine.created_at).toLocaleDateString(language === "fr" ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
                      : undefined}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1">{t("profile.officine_name")}</label>
                  <input
                    className={inputCls}
                    value={officineForm.name ?? ''}
                    onChange={e => setOfficineForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t("profile.officine_name")}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1">{t("profile.telephone")}</label>
                  <input
                    className={inputCls}
                    value={officineForm.telephone ?? ''}
                    onChange={e => setOfficineForm(f => ({ ...f, telephone: e.target.value }))}
                    placeholder={t("profile.telephone_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1">{t("profile.description")}</label>
                  <textarea
                    className={inputCls + ' resize-none'}
                    rows={3}
                    value={officineForm.description ?? ''}
                    onChange={e => setOfficineForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t("profile.description")}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Adresse */}
          <SectionCard
            title={t("profile.address_title")}
            icon={MapPin}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            isEditing={editing.address}
            isSaving={saving.address}
            onEdit={() => startEdit('address')}
            onSave={() => save('address')}
            onCancel={() => cancelEdit('address')}
          >
            {!editing.address ? (
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label={t("profile.city")} value={officine?.adresse?.city} />
                <InfoRow label={t("profile.quater")} value={officine?.adresse?.quater} />
                <InfoRow label={t("profile.street")} value={officine?.adresse?.rue} />
                <InfoRow label={t("profile.bp")} value={officine?.adresse?.bp} />
                <InfoRow label={t("profile.longitude")} value={officine?.adresse?.longitude} />
                <InfoRow label={t("profile.latitude")} value={officine?.adresse?.latitude} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(['city', 'quater', 'rue', 'bp'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-[12px] font-semibold text-[#1E293B] mb-1 capitalize">
                      {field === 'city' ? t("profile.city") : field === 'quater' ? t("profile.quater") : field === 'rue' ? t("profile.street") : t("profile.bp")}
                    </label>
                    <input
                      className={inputCls}
                      value={(addressForm as Record<string, unknown>)[field] as string ?? ''}
                      onChange={e => setAddressForm(f => ({ ...f, [field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Compte */}
          <SectionCard
            title={t("profile.account_info_title")}
            icon={User}
            iconColor="text-purple-500"
            iconBg="bg-purple-50"
            isEditing={editing.account}
            isSaving={saving.account}
            onEdit={() => startEdit('account')}
            onSave={() => save('account')}
            onCancel={() => cancelEdit('account')}
          >
            {!editing.account ? (
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label={t("profile.lastname")} value={(account as Record<string, unknown>)?.last_name as string || account?.lastName} />
                <InfoRow label={t("profile.firstname")} value={(account as Record<string, unknown>)?.first_name as string || account?.firstName} />
                <InfoRow label={t("profile.email")} value={account?.email} />
                <InfoRow label={t("profile.telephone")} value={account?.telephone} />
                <InfoRow label={t("profile.role")} value={account?.role} />
                <InfoRow label={t("profile.status")} value={account?.status} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: 'last_name', label: t("profile.lastname") },
                  { field: 'first_name', label: t("profile.firstname") },
                  { field: 'email', label: t("profile.email") },
                  { field: 'telephone', label: t("profile.telephone") },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="block text-[12px] font-semibold text-[#1E293B] mb-1">{label}</label>
                    <input
                      className={inputCls}
                      value={(accountForm as Record<string, unknown>)[field] as string ?? ''}
                      onChange={e => setAccountForm(f => ({ ...f, [field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Infos rapides */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Calendar size={17} className="text-amber-500" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#1E293B]">{t("profile.summary")}</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 text-[13px]">
                <Store size={15} className="text-[#22C55E] shrink-0" />
                <span className="text-[#94A3B8]">{t("profile.officine_info_title")} :</span>
                <span className="font-semibold text-[#1E293B]">{officine?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <MapPin size={15} className="text-blue-500 shrink-0" />
                <span className="text-[#94A3B8]">{t("profile.address_title")} :</span>
                <span className="font-semibold text-[#1E293B]">
                  {[officine?.adresse?.city, officine?.adresse?.quater].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Phone size={15} className="text-purple-500 shrink-0" />
                <span className="text-[#94A3B8]">{t("profile.telephone")} :</span>
                <span className="font-semibold text-[#1E293B]">{officine?.telephone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Mail size={15} className="text-amber-500 shrink-0" />
                <span className="text-[#94A3B8]">{t("profile.email")} :</span>
                <span className="font-semibold text-[#1E293B]">{account?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Calendar size={15} className="text-[#94A3B8] shrink-0" />
                <span className="text-[#94A3B8]">{t("profile.member_since")}</span>
                <span className="font-semibold text-[#1E293B]">
                  {officine?.created_at
                    ? new Date(officine.created_at).toLocaleDateString(language === "fr" ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
