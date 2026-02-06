'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function ProfileOfficinePage() {
    // États pour le mode édition par section
    const [editModes, setEditModes] = useState({
        officine: false,
        address: false,
        account: false
    });

    // Données du profil (initialisées avec des valeurs par défaut ou venant de localStorage/API)
    const [profileData, setProfileData] = useState({
        officine: {
            name: 'Pharmacie Renaissance',
            description: 'Officine moderne offrant médicaments et conseils.',
            telephone: '+237699887744',
            createdAt: '2025-12-03',
            status: 'Actif'
        },
        address: {
            city: 'Douala',
            quater: 'Bonamoussadi',
            rue: 'Carrefour Agip',
            bp: '2345',
            longitude: '4.052321',
            latitude: '9.701245',
            telephone: '+237670112233'
        },
        account: {
            lastName: 'pharmacie',
            firstName: '2',
            email: 'pharmacie2@gmail.com',
            telephone: '+237612345678',
            role: 'PHARMACIST',
            status: 'Actif'
        },
        holder: {
            name: 'Dr. Gedeon Hakoua',
            email: 'gedeonhakoua1@gmail.com',
            telephone: '+237699887766',
            poste: 'Pharmacien Titulaire',
            createdAt: '2025-12-03',
            employeesCount: 1
        }
    });

    const [isSaving, setIsSaving] = useState({
        officine: false,
        address: false,
        account: false
    });

    // Basculer le mode édition
    const toggleEditMode = (section: 'officine' | 'address' | 'account') => {
        setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Gérer les changements d'input
    const handleInputChange = (section: 'officine' | 'address' | 'account', field: string, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Sauvegarder les modifications (Simulé)
    const saveSection = async (section: 'officine' | 'address' | 'account') => {
        setIsSaving(prev => ({ ...prev, [section]: true }));
        
        try {
            console.log(`Sauvegarde de la section ${section}:`, profileData[section]);
            
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setEditModes(prev => ({ ...prev, [section]: false }));
            // Optionnel: Afficher une notification de succès
        } catch (error) {
            console.error(`Erreur lors de la sauvegarde de ${section}:`, error);
        } finally {
            setIsSaving(prev => ({ ...prev, [section]: false }));
        }
    };

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
                                                    <span>{profileData.address.city}, {profileData.address.quater}</span>
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
                                                <span>{profileData.officine.status}</span>
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
                                                <div className="info-value">{profileData.officine.createdAt}</div>
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
                                                <input type="text" className="form-control" value={profileData.officine.telephone} onChange={(e) => handleInputChange('officine', 'telephone', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Description</label>
                                                <textarea className="form-control" rows={3} value={profileData.officine.description} onChange={(e) => handleInputChange('officine', 'description', e.target.value)}></textarea>
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
                                                <div className="info-value">{profileData.address.city}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Quartier</div>
                                                <div className="info-value">{profileData.address.quater}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Rue</div>
                                                <div className="info-value">{profileData.address.rue}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Boîte Postale</div>
                                                <div className="info-value">{profileData.address.bp}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Coordonnées (Lon, Lat)</div>
                                                <div className="info-value">{profileData.address.longitude}, {profileData.address.latitude}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row gy-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Ville</label>
                                                <input type="text" className="form-control" value={profileData.address.city} onChange={(e) => handleInputChange('address', 'city', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Quartier</label>
                                                <input type="text" className="form-control" value={profileData.address.quater} onChange={(e) => handleInputChange('address', 'quater', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Rue</label>
                                                <input type="text" className="form-control" value={profileData.address.rue} onChange={(e) => handleInputChange('address', 'rue', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">BP</label>
                                                <input type="text" className="form-control" value={profileData.address.bp} onChange={(e) => handleInputChange('address', 'bp', e.target.value)} />
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
                                                <div className="info-value">{profileData.account.lastName}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Prénom</div>
                                                <div className="info-value">{profileData.account.firstName}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Email</div>
                                                <div className="info-value">{profileData.account.email}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-label">Téléphone</div>
                                                <div className="info-value">{profileData.account.telephone}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row gy-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Nom</label>
                                                <input type="text" className="form-control" value={profileData.account.lastName} onChange={(e) => handleInputChange('account', 'lastName', e.target.value)} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Prénom</label>
                                                <input type="text" className="form-control" value={profileData.account.firstName} onChange={(e) => handleInputChange('account', 'firstName', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={profileData.account.email} onChange={(e) => handleInputChange('account', 'email', e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pharmacien Titulaire */}
                        <div className="col-lg-6 mb-4">
                            <div className="card info-card h-100">
                                <div className="card-header bg-white border-bottom-0 p-3">
                                    <h5 className="mb-0 fs-16 fw-semibold">
                                        <i className="ri-nurse-line me-2 text-info"></i>
                                        Pharmacien Titulaire
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="info-label">Nom complet</div>
                                            <div className="info-value">{profileData.holder.name}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-label">Email</div>
                                            <div className="info-value">{profileData.holder.email}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-label">Téléphone</div>
                                            <div className="info-value">{profileData.holder.telephone}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-label">Poste</div>
                                            <div className="info-value">{profileData.holder.poste}</div>
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
