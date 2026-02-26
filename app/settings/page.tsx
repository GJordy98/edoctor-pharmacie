'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
    const [profileImg, setProfileImg] = useState('/images/faces/pharmacy_profile.png');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        bio: '',
        gender: 'male',
        language: ['English']
    });

    useEffect(() => {
        // Load user data from localStorage
        const accountData = localStorage.getItem('account');
        if (accountData) {
            try {
                const account = JSON.parse(accountData);
                // Map account data to form fields. Adjust keys based on actual API response structure
                setFormData({
                    firstName: account.first_name || account.firstName || '',
                    lastName: account.last_name || account.lastName || '',
                    email: account.email || '',
                    telephone: account.telephone || '',
                    bio: account.bio || '',
                    gender: account.gender || 'male',
                    language: account.language ? (Array.isArray(account.language) ? account.language : [account.language]) : ['French']
                });
                if (account.profile_image) {
                    setProfileImg(account.profile_image);
                }
            } catch (e) {
                console.error("Error parsing account data", e);
            }
        }
        setLoading(false);

        // Initialize Choices.js if available in window (keeping original logic)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (typeof window !== 'undefined' && win.Choices) {
            // Note: In a real React app, avoid direct DOM manipulation libs if possible, 
            // or use specific React wrappers. Keeping as is for now to match original template style.
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        // Map IDs to state keys
        const keyMap: Record<string, string> = {
            'mail-first-name': 'firstName',
            'mail-last-name': 'lastName',
            'mail-email-address': 'email',
            'mail-contact-no': 'telephone',
            'mail-description': 'bio',
            'language': 'language' // Select multiple might need special handling
        };
        const key = keyMap[id] || id; // Fallback to ID if no map
        
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, gender: e.target.id === 'gender-male' ? 'male' : 'female' }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setProfileImg(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                e.target.value = '';
                alert('Please select a valid image');
            }
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.updateProfile(formData);
            
            // Update localStorage with new data
            const accountData = localStorage.getItem('account');
            let newAccount = {};
            if (accountData) {
                newAccount = { ...JSON.parse(accountData), ...formData };
            } else {
                newAccount = { ...formData };
            }
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
        return <div className="p-5 text-center">Chargement...</div>;
    }

    return (
        <>
            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid">

                    {/* Start::page-header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
                        <h1 className="page-title fw-semibold fs-18 mb-0">Paramètres</h1>
                        <div className="ms-md-1 ms-0">
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Paramètres</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* End::page-header */}

                    <div className="row">
                        <div className="col-xl-9">
                            <div className="card custom-card">
                                <div className="card-header justify-content-between">
                                    <div className="card-title">
                                        Informations Personnelles
                                    </div>
                                </div>
                                <div className="card-body">
                                    {message && (
                                        <div className={`alert alert-${message.type} mb-3`}>
                                            {message.text}
                                        </div>
                                    )}
                                    <div className="row gy-3">
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-first-name" className="form-label">Prénom :</label>
                                            <input type="text" className="form-control" id="mail-first-name" value={formData.firstName} onChange={handleChange} placeholder="Entrer prénom" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-last-name" className="form-label">Nom :</label>
                                            <input type="text" className="form-control" id="mail-last-name" value={formData.lastName} onChange={handleChange} placeholder="Entrer nom" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-email-address" className="form-label">Email :</label>
                                            <input type="text" className="form-control" id="mail-email-address" value={formData.email} onChange={handleChange} placeholder="Entrer email" />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="mail-contact-no" className="form-label">Téléphone :</label>
                                            <input type="text" className="form-control" id="mail-contact-no" value={formData.telephone} onChange={handleChange} placeholder="Entrer téléphone" />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="mail-description" className="form-label">Bio :</label>
                                            <textarea className="form-control" id="mail-description" rows={3} value={formData.bio} onChange={handleChange} placeholder="Votre bio..."></textarea>
                                        </div>
                                        <div className="col-xl-6">
                                            <label className="form-label">Genre :</label>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="gender" id="gender-male" checked={formData.gender === 'male'} onChange={handleGenderChange} />
                                                    <label className="form-check-label" htmlFor="gender-male">
                                                        Homme
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="gender" id="gender-female" checked={formData.gender === 'female'} onChange={handleGenderChange} />
                                                    <label className="form-check-label" htmlFor="gender-female">
                                                        Femme
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="language" className="form-label">Langue :</label>
                                            <select className="form-control" name="language" id="language" multiple value={formData.language} onChange={() => {}}>
                                                <option value="English">Anglais</option>
                                                <option value="French">Français</option>
                                                <option value="Arabic">Arabe</option>
                                            </select>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="d-flex align-items-start gap-4">
                                                <div className="mb-0">
                                                    <label htmlFor="profile-change" className="form-label">Photo de profil :</label>
                                                    <input type="file" className="form-control" id="profile-change" onChange={handleProfileChange} />
                                                </div>
                                                <div className="mt-4">
                                                    <Image src={profileImg} alt="Profile" width={80} height={80} className="avatar avatar-xxl rounded-circle" id="profile-img" unoptimized />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="float-end">
                                        <button className="btn btn-primary-light m-1" onClick={() => window.location.reload()}>Annuler</button>
                                        <button className="btn btn-primary m-1" onClick={handleSubmit} disabled={saving}>
                                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3">
                            <div className="card custom-card">
                                <div className="card-header">
                                    <div className="card-title">
                                        Sécurité
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row gy-3">
                                        <div className="col-xl-12">
                                            <label className="form-label">Double Authentification</label>
                                            <div className="form-check form-switch p-0">
                                                <input className="form-check-input float-end" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Activer 2FA</label>
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <label className="form-label">Historique de connexion</label>
                                            <div className="d-grid">
                                                <button className="btn btn-outline-info">Voir l&apos;historique</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
