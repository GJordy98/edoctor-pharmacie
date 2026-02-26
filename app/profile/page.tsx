'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';
import { Pharmacy, Account } from '@/lib/types';

export default function ProfileOfficinePage() {
    // États pour le mode édition par section
    const [editModes, setEditModes] = useState({
        officine: false,
        address: false,
        account: false // Keeping account for now, might need separate logic
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Données du profil
    const [profileData, setProfileData] = useState<{
        officine: Pharmacy;
        account: Account | null;
        holder: unknown;
    }>({
        officine: {
            id: '',
            name: '',
            description: '',
            telephone: '',
            status: '',
            created_at: '',
            adresse: {
                city: '',
                quater: '',
                rue: '',
                bp: '',
                longitude: 0,
                latitude: 0,
                telephone: ''
            }
        },
        account: {
            lastName: '',
            firstName: '',
            email: '',
            telephone: '',
            role: '',
            status: ''
        },
        holder: {
            name: '',
            email: '',
            telephone: '',
            poste: '',
            createdAt: '',
            employeesCount: 0
        }
    });

    const [isSaving, setIsSaving] = useState({
        officine: false,
        address: false,
        account: false
    });

    // Chargement des données
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Récupérer l'ID de la pharmacie depuis le localStorage
                const storedOfficine = localStorage.getItem('officine');
                const storedAccount = localStorage.getItem('account');
                
                let officineId = '';
                if (storedOfficine) {
                    const parsed = JSON.parse(storedOfficine);
                    officineId = parsed.id;
                }

                if (!officineId) {
                    setError("Aucune pharmacie identifiée. Veuillez vous reconnecter.");
                    setLoading(false);
                    return;
                }

                const pharmacyData = await api.getPharmacy(officineId);
                
                // Préparer les données pour l'affichage
                setProfileData(prev => ({
                    ...prev,
                    officine: pharmacyData,
                    // Si le backend renvoie aussi les infos du titulaire/compte dans l'objet pharmacy, on les map ici.
                    // Sinon on utilise ce qu'on a en local ou on laisse vide.
                    // Pour l'instant on reprend les infos du compte local pour la partie "Compte"
                    account: storedAccount ? JSON.parse(storedAccount) : prev.account
                }));

            } catch (err: unknown) {
                console.error("Erreur chargement profil:", err);
                const msg = err instanceof Error ? err.message : "Impossible de charger le profil.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Basculer le mode édition
    const toggleEditMode = (section: 'officine' | 'address' | 'account') => {
        setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Gérer les changements d'input
    const handleInputChange = (section: 'officine' | 'address' | 'account', field: string, value: string) => {
        setProfileData(prev => {
            if (section === 'officine') {
                return { ...prev, officine: { ...prev.officine, [field]: value } };
            }
            if (section === 'address') {
                 // Address is nested in officine in our type, but UI treats it as separate section
                 return { 
                     ...prev, 
                     officine: { 
                         ...prev.officine, 
                         adresse: { ...prev.officine.adresse, [field]: value } 
                     } 
                 };
            }
            // Account updates might need separate API call or updateProfile
            if (section === 'account') {
                return { ...prev, account: { ...prev.account, [field]: value } };
            }
            return prev;
        });
    };

    // Sauvegarder les modifications
    const saveSection = async (section: 'officine' | 'address' | 'account') => {
        setIsSaving(prev => ({ ...prev, [section]: true }));
        
        try {
            if (section === 'officine' || section === 'address') {
                await api.updatePharmacy(profileData.officine.id, profileData.officine);
                // Mettre à jour le localStorage si nécessaire
                localStorage.setItem('officine', JSON.stringify(profileData.officine));
            } else if (section === 'account') {
                if (profileData.account) {
                    // Utiliser updateProfile pour le compte
                    await api.updateProfile(profileData.account);
                    localStorage.setItem('account', JSON.stringify(profileData.account));
                }
            }
            
            setEditModes(prev => ({ ...prev, [section]: false }));
            alert('Modifications enregistrées !');
        } catch (error: unknown) {
            console.error(`Erreur sauvegarde ${section}:`, error);
            const msg = error instanceof Error ? error.message : 'Echec de la sauvegarde';
            alert(`Erreur: ${msg}`);
        } finally {
            setIsSaving(prev => ({ ...prev, [section]: false }));
        }
    };

    if (loading) return <div className="p-5 text-center">Chargement du profil...</div>;
    if (error) return <div className="p-5 text-center text-danger">Erreur: {error}</div>;

    return (
        <>
            <style jsx>{`
                .profile-card {
                    background: linear-gradient(135deg, #3ab047 0%, #2e8b3a 100%);
                    border-radius: 16px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                .profile-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                .profile-avatar {
                    width: 120px;
                    height: 120px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.2);
                    font-size: 48px;
                    font-weight: bold;
                    margin: 0 auto;
                }
                .info-card {
                    border-radius: 12px;
                    border: none;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .info-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
                }
                .info-label {
                    color: #6c757d;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                .info-value {
                    color: #2d3748;
                    font-size: 1rem;
                    font-weight: 600;
                }
                .status-badge {
                    padding: 6px 16px;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    background-color: #d4edda;
                    color: #155724;
                }
                .icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }
                .icon-box.primary { background: rgba(58, 176, 71, 0.1); color: #3ab047; }
                .icon-box.success { background: rgba(40, 167, 69, 0.1); color: #28a745; }
                .icon-box.warning { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
                .icon-box.info { background: rgba(23, 162, 184, 0.1); color: #17a2b8; }
                
                .btn-edit-profile {
                    background: linear-gradient(135deg, #3ab047 0%, #2e8b3a 100%);
                    border: none;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .btn-save-profile {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border: none;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                }
                .btn-cancel {
                    background: #6c757d;
                    border: none;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                }
            `}</style>

            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">

                    <div className="page-header-breadcrumb mb-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <h1 className="page-title fw-medium fs-18 mb-0">Profil de la Pharmacie</h1>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                <li className="breadcrumb-item"><a href="#">Pharmacie</a></li>
                                <li className="breadcrumb-item active" aria-current="page">Profil</li>
                            </ol>
                        </div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card profile-card p-4 p-md-5 border-0">
                                <div className="position-relative" style={{ zIndex: 1 }}>
                                    <div className="row align-items-center">
                                        <div className="col-md-3 text-center mb-4 mb-md-0">
                                            <div className="profile-avatar">
                                                <i className="ri-store-2-line"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <h2 className="mb-2 fw-bold text-white">{profileData.officine.name}</h2>
                                            <p className="mb-2 opacity-75">{profileData.officine.description}</p>
                                            <div className="d-flex flex-wrap gap-3 mt-3">
                                                <span className="d-flex align-items-center">
                                                    <i className="ri-map-pin-line me-2"></i>
                                                    <span>{profileData.officine.adresse?.city}, {profileData.officine.adresse?.quater}</span>
                                                </span>
                                                <span className="d-flex align-items-center">
                                                    <i className="ri-phone-line me-2"></i>
                                                    <span>{profileData.officine.telephone}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3 text-md-end text-center mt-4 mt-md-0">
                                            <span className="status-badge">
                                                <i className="ri-checkbox-circle-line me-1"></i>
                                                <span>{profileData.officine.status || 'Actif'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Informations de la Pharmacie */}
                        <div className="col-lg-6 mb-4">
                            <div className="card info-card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom-0 p-3">
                                    <h5 className="mb-0 fs-16 fw-semibold">
                                        <i className="ri-store-2-line me-2 text-primary"></i>
                                        Informations de la Pharmacie
                                    </h5>
                                    {!editModes.officine ? (
                                        <button className="btn-edit-profile btn-sm" onClick={() => toggleEditMode('officine')}>
                                            <i className="ri-edit-line me-1"></i> Modifier
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn-cancel btn-sm" onClick={() => toggleEditMode('officine')}>Annuler</button>
                                            <button className="btn-save-profile btn-sm" onClick={() => saveSection('officine')} disabled={isSaving.officine}>
                                                {isSaving.officine ? '...' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    {!editModes.officine ? (
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="info-label">Nom de la Pharmacie</div>
                                                <div className="info-value">{profileData.officine.name}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Téléphone</div>
                                                <div className="info-value">{profileData.officine.telephone}</div>
                                            </div>
                                            <div className="col-12">
                                                <div className="info-label">Description</div>
                                                <div className="info-value">{profileData.officine.description}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Date de création</div>
                                                <div className="info-value">{profileData.officine.created_at}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row gy-3">
                                            <div className="col-12">
                                                <label className="form-label">Nom de la Pharmacie</label>
                                                <input type="text" className="form-control" value={profileData.officine.name} onChange={(e) => handleInputChange('officine', 'name', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Téléphone</label>
                                                <input type="text" className="form-control" value={profileData.officine.telephone || ''} onChange={(e) => handleInputChange('officine', 'telephone', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Description</label>
                                                <textarea className="form-control" rows={3} value={profileData.officine.description || ''} onChange={(e) => handleInputChange('officine', 'description', e.target.value)}></textarea>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Adresse de la Pharmacie */}
                        <div className="col-lg-6 mb-4">
                            <div className="card info-card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom-0 p-3">
                                    <h5 className="mb-0 fs-16 fw-semibold">
                                        <i className="ri-map-pin-line me-2 text-success"></i>
                                        Adresse
                                    </h5>
                                    {!editModes.address ? (
                                        <button className="btn-edit-profile btn-sm" onClick={() => toggleEditMode('address')}>
                                            <i className="ri-edit-line me-1"></i> Modifier
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn-cancel btn-sm" onClick={() => toggleEditMode('address')}>Annuler</button>
                                            <button className="btn-save-profile btn-sm" onClick={() => saveSection('address')} disabled={isSaving.address}>
                                                {isSaving.address ? '...' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    {!editModes.address ? (
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="info-label">Ville</div>
                                                <div className="info-value">{profileData.officine.adresse?.city}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Quartier</div>
                                                <div className="info-value">{profileData.officine.adresse?.quater}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Rue</div>
                                                <div className="info-value">{profileData.officine.adresse?.rue}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Boîte Postale</div>
                                                <div className="info-value">{profileData.officine.adresse?.bp}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Coordonnées (Lon, Lat)</div>
                                                <div className="info-value">{profileData.officine.adresse?.longitude}, {profileData.officine.adresse?.latitude}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row gy-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Ville</label>
                                                <input type="text" className="form-control" value={profileData.officine.adresse?.city || ''} onChange={(e) => handleInputChange('address', 'city', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Quartier</label>
                                                <input type="text" className="form-control" value={profileData.officine.adresse?.quater || ''} onChange={(e) => handleInputChange('address', 'quater', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Rue</label>
                                                <input type="text" className="form-control" value={profileData.officine.adresse?.rue || ''} onChange={(e) => handleInputChange('address', 'rue', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">BP</label>
                                                <input type="text" className="form-control" value={profileData.officine.adresse?.bp || ''} onChange={(e) => handleInputChange('address', 'bp', e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations du Compte */}
                        <div className="col-lg-6 mb-4">
                            <div className="card info-card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom-0 p-3">
                                    <h5 className="mb-0 fs-16 fw-semibold">
                                        <i className="ri-user-line me-2 text-warning"></i>
                                        Informations du Compte
                                    </h5>
                                    {!editModes.account ? (
                                        <button className="btn-edit-profile btn-sm" onClick={() => toggleEditMode('account')}>
                                            <i className="ri-edit-line me-1"></i> Modifier
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn-cancel btn-sm" onClick={() => toggleEditMode('account')}>Annuler</button>
                                            <button className="btn-save-profile btn-sm" onClick={() => saveSection('account')} disabled={isSaving.account}>
                                                {isSaving.account ? '...' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    {!editModes.account ? (
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="info-label">Nom</div>
                                                <div className="info-value">{profileData.account?.last_name || profileData.account?.lastName}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Prénom</div>
                                                <div className="info-value">{profileData.account?.first_name || profileData.account?.firstName}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Email</div>
                                                <div className="info-value">{profileData.account?.email}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Téléphone</div>
                                                <div className="info-value">{profileData.account?.telephone}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row gy-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Nom</label>
                                                <input type="text" className="form-control" value={profileData.account?.last_name || profileData.account?.lastName || ''} onChange={(e) => handleInputChange('account', 'last_name', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Prénom</label>
                                                <input type="text" className="form-control" value={profileData.account?.first_name || profileData.account?.firstName || ''} onChange={(e) => handleInputChange('account', 'first_name', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={profileData.account?.email || ''} onChange={(e) => handleInputChange('account', 'email', e.target.value)} />
                                            </div>
                                        </div>
                                    )}
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
