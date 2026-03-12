'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
    const [profileImg, setProfileImg] = useState('/images/faces/pharmacy_profile.png');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [twoFA, setTwoFA] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        bio: '',
        gender: 'male',
        language: ['French'],
    });

    useEffect(() => {
        const accountData = localStorage.getItem('account');
        if (accountData) {
            try {
                const account = JSON.parse(accountData);
                setFormData({
                    firstName: account.first_name || account.firstName || '',
                    lastName: account.last_name || account.lastName || '',
                    email: account.email || '',
                    telephone: account.telephone || '',
                    bio: account.bio || '',
                    gender: account.gender || 'male',
                    language: account.language
                        ? Array.isArray(account.language) ? account.language : [account.language]
                        : ['French'],
                });
                if (account.profile_image) setProfileImg(account.profile_image);
            } catch (e) {
                console.error('Error parsing account data', e);
            }
        }
        setLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const keyMap: Record<string, string> = {
            'mail-first-name': 'firstName',
            'mail-last-name': 'lastName',
            'mail-email-address': 'email',
            'mail-contact-no': 'telephone',
            'mail-description': 'bio',
        };
        const key = keyMap[id] || id;
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, gender: e.target.id === 'gender-male' ? 'male' : 'female' }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions).map(o => o.value);
        setFormData(prev => ({ ...prev, language: selected }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = () => setProfileImg(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                e.target.value = '';
                alert('Veuillez sélectionner une image valide');
            }
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.updateProfile(formData);
            const accountData = localStorage.getItem('account');
            const newAccount = accountData ? { ...JSON.parse(accountData), ...formData } : { ...formData };
            localStorage.setItem('account', JSON.stringify(newAccount));
            setMessage({ text: 'Profil mis à jour avec succès', type: 'success' });
        } catch (error: unknown) {
            console.error(error);
            setMessage({ text: 'Erreur lors de la mise à jour', type: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Paramètres">
                <div className="flex items-center justify-center py-24">
                    <div className="flex items-center gap-3 text-[#64748B]">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Chargement...
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Paramètres">
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up">

                        {/* Main card */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                                {/* Card header */}
                                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                                    <h2 className="text-[15px] font-semibold text-[#1E293B]">Informations Personnelles</h2>
                                </div>

                                {/* Card body */}
                                <div className="p-6">
                                    {/* Alert */}
                                    {message && (
                                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-[13px] ${message.type === 'success'
                                                ? 'bg-green-50 border border-green-200 text-green-700'
                                                : 'bg-red-50 border border-red-200 text-red-600'
                                            }`}>
                                            <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Prénom */}
                                        <div>
                                            <label htmlFor="mail-first-name" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Prénom
                                            </label>
                                            <input
                                                type="text"
                                                id="mail-first-name"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Entrer prénom"
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Nom */}
                                        <div>
                                            <label htmlFor="mail-last-name" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Nom
                                            </label>
                                            <input
                                                type="text"
                                                id="mail-last-name"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Entrer nom"
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="mail-email-address" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="mail-email-address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Entrer email"
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Téléphone */}
                                        <div>
                                            <label htmlFor="mail-contact-no" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                id="mail-contact-no"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                placeholder="Entrer téléphone"
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="mail-description" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Bio
                                            </label>
                                            <textarea
                                                id="mail-description"
                                                rows={3}
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Votre bio..."
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Genre */}
                                        <div>
                                            <label className="block text-[13px] font-medium text-[#1E293B] mb-2">Genre</label>
                                            <div className="flex items-center gap-5">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        id="gender-male"
                                                        checked={formData.gender === 'male'}
                                                        onChange={handleGenderChange}
                                                        className="accent-[#22C55E] w-4 h-4"
                                                    />
                                                    <span className="text-[14px] text-[#1E293B]">Homme</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        id="gender-female"
                                                        checked={formData.gender === 'female'}
                                                        onChange={handleGenderChange}
                                                        className="accent-[#22C55E] w-4 h-4"
                                                    />
                                                    <span className="text-[14px] text-[#1E293B]">Femme</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Langue */}
                                        <div>
                                            <label htmlFor="language" className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                                                Langue
                                            </label>
                                            <select
                                                id="language"
                                                multiple
                                                value={formData.language}
                                                onChange={handleLanguageChange}
                                                className="w-full px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                                            >
                                                <option value="English">Anglais</option>
                                                <option value="French">Français</option>
                                                <option value="Arabic">Arabe</option>
                                            </select>
                                        </div>

                                        {/* Photo de profil */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[13px] font-medium text-[#1E293B] mb-2">
                                                Photo de profil
                                            </label>
                                            <div className="flex items-center gap-5">
                                                <img
                                                    src={profileImg}
                                                    alt="Profile"
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-[#E2E8F0] shadow-sm"
                                                />
                                                <div>
                                                    <input
                                                        type="file"
                                                        id="profile-change"
                                                        accept="image/*"
                                                        onChange={handleProfileChange}
                                                        className="block w-full text-[13px] text-[#64748B] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[13px] file:font-medium file:bg-[#F0FDF4] file:text-[#22C55E] hover:file:bg-[#DCFCE7] transition-colors cursor-pointer"
                                                    />
                                                    <p className="text-[12px] text-[#94A3B8] mt-1">PNG, JPG, WEBP — max 2MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-5 py-2.5 text-[14px] font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="px-5 py-2.5 text-[14px] font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Enregistrement...
                                            </>
                                        ) : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security card */}
                        <div className="xl:w-72 shrink-0">
                            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#E2E8F0]">
                                    <h2 className="text-[15px] font-semibold text-[#1E293B]">Sécurité</h2>
                                </div>
                                <div className="p-6 flex flex-col gap-5">
                                    {/* 2FA */}
                                    <div>
                                        <label className="block text-[13px] font-medium text-[#1E293B] mb-2">
                                            Double Authentification
                                        </label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] text-[#64748B]">Activer 2FA</span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={twoFA}
                                                onClick={() => setTwoFA(v => !v)}
                                                className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${twoFA ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`}
                                            >
                                                <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${twoFA ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Historique */}
                                    <div>
                                        <label className="block text-[13px] font-medium text-[#1E293B] mb-2">
                                            Historique de connexion
                                        </label>
                                        <button className="w-full py-2.5 text-[13px] font-medium text-[#0EA5E9] border border-[#BAE6FD] rounded-xl hover:bg-[#F0F9FF] transition-colors">
                                            Voir l&apos;historique
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

            </div>
        </DashboardLayout>
    );
}