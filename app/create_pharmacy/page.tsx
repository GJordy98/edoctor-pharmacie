'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatePharmacyPage() {
    const router = useRouter();

    // État global du processus
    const [step, setStep] = useState(0); // 0: Pharmacie, 1: Utilisateur
    const [direction, setDirection] = useState('next'); // 'next' ou 'prev'

    // État du formulaire Pharmacie (Etape 1)
    const [pharmacyData, setPharmacyData] = useState({
        name: '',
        description: '',
        telephone: '',
        address: {
            city: '',
            rue: '',
            quater: '',
            bp: '',
            longitude: '',
            latitude: '',
            telephone: ''
        }
    });

    // État du formulaire Utilisateur (Etape 2)
    const [userData, setUserData] = useState({
        officineId: '',
        telephone: '',
        email: '',
        lastName: '',
        firstName: '',
        password: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handlePharmacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id.startsWith('addr_')) {
            const field = id.replace('addr_', '');
            setPharmacyData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else if (id.startsWith('ph_')) {
            const field = id.replace('ph_', '');
            setPharmacyData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const keyMap: { [key: string]: string } = {
            'user_officine': 'officineId',
            'user_telephone': 'telephone',
            'user_email': 'email',
            'user_last_name': 'lastName',
            'user_first_name': 'firstName',
            'user_password': 'password'
        };
        const key = keyMap[id] || id;
        setUserData(prev => ({ ...prev, [key]: value }));
    };

    const goToUserStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pharmacyData.name || !pharmacyData.address.city || !pharmacyData.address.latitude || !pharmacyData.address.longitude) {
            setMessage({ text: 'Le nom de la pharmacie, la ville et les coordonnées GPS (Latitude/Longitude) sont requis.', type: 'danger' });
            return;
        }

        // Génération automatique de l'ID de l'officine (simulation)
        const generatedId = pharmacyData.name.toUpperCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
        setUserData(prev => ({ ...prev, officineId: generatedId }));

        setMessage({ text: '', type: '' });
        setDirection('next');
        setStep(1);
    };

    const goToPharmacyStep = () => {
        setDirection('prev');
        setStep(0);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!userData.telephone || !userData.password || !userData.lastName) {
            setMessage({ text: 'Veuillez remplir les champs obligatoires.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                pharmacy: pharmacyData,
                user: userData
            };
            console.log("Envoi global du payload:", payload);

            // Simulation API
            await new Promise(resolve => setTimeout(resolve, 2000));

            setMessage({ text: "Compte pharmacie et utilisateur créés ! Redirection...", type: 'success' });
            setTimeout(() => router.push('/login'), 2000);

        } catch (error) {
            console.error("Erreur:", error);
            setMessage({ text: "Une erreur est survenue.", type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white overflow-hidden min-vh-100">
            <style jsx>{`
                .registration-container {
                    position: relative;
                    width: 100%;
                    min-height: 600px;
                }
                .step-wrapper {
                    position: absolute;
                    width: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s;
                }
                .step-enter-next { transform: translateX(100%); opacity: 0; }
                .step-active { transform: translateX(0); opacity: 1; position: relative; }
                .step-exit-next { transform: translateX(-100%); opacity: 0; position: absolute; }
                
                .step-enter-prev { transform: translateX(-100%); opacity: 0; }
                .step-exit-prev { transform: translateX(100%); opacity: 0; position: absolute; }

                .progress-bar-custom {
                    height: 4px;
                    background: #e9ecef;
                    margin-bottom: 2rem;
                    border-radius: 2px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: #3ab047;
                    transition: width 0.6s ease;
                }
            `}</style>
            
            <div className="row authentication authentication-cover-main mx-0">
                <div className="col-xxl-9 col-xl-9 col-lg-12 bg-white">
                    <div className="row justify-content-center align-items-center h-100">
                        <div className="col-xxl-6 col-xl-7 col-lg-8 col-md-10 col-sm-11 col-12">
                            <div className="card custom-card border-0 shadow-none my-4">
                                <div className="card-body p-md-5 p-4">
                                    <div className="text-center mb-4">
                                        <Link href="/">
                                            <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto' }}>
                                                <Image src="/images/brand-logos/toggle-logo.png" alt="logo" width={64} height={64} style={{ borderRadius: '9px' }} />
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="progress-bar-custom">
                                        <div className="progress-fill" style={{ width: step === 0 ? '50%' : '100%' }}></div>
                                    </div>

                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-3`} role="alert">
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="registration-container overflow-hidden">
                                        {/* Étape 1: Pharmacie */}
                                        <div className={`step-wrapper ${step === 0 ? 'step-active' : (direction === 'next' ? 'step-exit-next' : 'step-exit-prev')}`}>
                                            <h4 className="mb-1 fw-semibold">Étape 1 : Votre Pharmacie</h4>
                                            <p className="mb-4 text-muted fw-normal">Dites-nous en plus sur votre établissement.</p>
                                            
                                            <form onSubmit={goToUserStep} className="row gy-3">
                                                <div className="col-xl-12">
                                                    <label htmlFor="ph_name" className="form-label">Nom de la pharmacie *</label>
                                                    <input type="text" className="form-control" id="ph_name" value={pharmacyData.name} onChange={handlePharmacyChange} required />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="ph_description" className="form-label">Description</label>
                                                    <textarea className="form-control" id="ph_description" rows={1} value={pharmacyData.description} onChange={handlePharmacyChange}></textarea>
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="ph_telephone" className="form-label">Téléphone Pharmacie</label>
                                                    <input className="form-control" id="ph_telephone" type="tel" value={pharmacyData.telephone} onChange={handlePharmacyChange} />
                                                </div>
                                                <hr className="my-2" />
                                                <h6 className="fw-semibold">Adresse</h6>
                                                <div className="col-xl-12">
                                                    <label htmlFor="addr_city" className="form-label">Ville *</label>
                                                    <input className="form-control" id="addr_city" type="text" value={pharmacyData.address.city} onChange={handlePharmacyChange} required />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="addr_rue" className="form-label">Rue</label>
                                                    <input className="form-control" id="addr_rue" type="text" value={pharmacyData.address.rue} onChange={handlePharmacyChange} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="addr_quater" className="form-label">Quartier</label>
                                                    <input className="form-control" id="addr_quater" type="text" value={pharmacyData.address.quater} onChange={handlePharmacyChange} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="addr_latitude" className="form-label">Latitude *</label>
                                                    <input className="form-control" id="addr_latitude" type="text" placeholder="Ex: 4.0511" value={pharmacyData.address.latitude} onChange={handlePharmacyChange} required />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="addr_longitude" className="form-label">Longitude *</label>
                                                    <input className="form-control" id="addr_longitude" type="text" placeholder="Ex: 9.7679" value={pharmacyData.address.longitude} onChange={handlePharmacyChange} required />
                                                </div>
                                                <div className="d-grid mt-4">
                                                    <button type="submit" className="btn btn-primary">Continuer vers l utilisateur <i className="ri-arrow-right-line ms-2"></i></button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Étape 2: Utilisateur */}
                                        <div className={`step-wrapper ${step === 1 ? 'step-active' : (direction === 'next' ? 'step-enter-next' : 'step-enter-prev')}`}>
                                            <h4 className="mb-1 fw-semibold">Étape 2 : Administrateur</h4>
                                            <p className="mb-4 text-muted fw-normal">Créez le compte qui va gérer cette pharmacie.</p>
                                            
                                            <form onSubmit={handleFinalSubmit} className="row gy-3">
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_officine" className="form-label">ID Pharmacie (Auto-généré)</label>
                                                    <input className="form-control bg-light" id="user_officine" type="text" value={userData.officineId} readOnly />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_last_name" className="form-label">Nom *</label>
                                                    <input className="form-control" id="user_last_name" type="text" value={userData.lastName} onChange={handleUserChange} required />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_first_name" className="form-label">Prénom</label>
                                                    <input className="form-control" id="user_first_name" type="text" value={userData.firstName} onChange={handleUserChange} />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_telephone" className="form-label">Téléphone de l admin *</label>
                                                    <input className="form-control" id="user_telephone" type="tel" value={userData.telephone} onChange={handleUserChange} required />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_password" className="form-label">Mot de passe *</label>
                                                    <input className="form-control" id="user_password" type="password" value={userData.password} onChange={handleUserChange} required />
                                                </div>
                                                <div className="d-flex gap-2 mt-4">
                                                    <button type="button" onClick={goToPharmacyStep} className="btn btn-light flex-fill"><i className="ri-arrow-left-line me-2"></i> Retour</button>
                                                    <button type="submit" className="btn btn-primary flex-fill" disabled={isSubmitting}>
                                                        {isSubmitting ? "Création..." : "Terminer l'inscription"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="text-center mt-4 fw-medium">
                                        Compte déjà existant ? <Link href="/login" className="text-primary">Connectez-vous ici</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-12 d-xl-block d-none px-0">
                    <div className="authentication-cover overflow-hidden">
                        <div className="authentication-cover-background">
                            <Image src="/images/media/backgrounds/9.png" alt="background" fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="authentication-cover-content">
                            <div className="p-5">
                                <h3 className="fw-semibold lh-base">Bienvenue sur e Dr TIM Pharmacie</h3>
                                <p className="mb-0 text-muted fw-medium">Gérez votre pharmacie en un clin d œil !</p>
                            </div>
                            <div>
                                <Image src="/images/media/pharmacy-illustration.png" alt="illustration" width={500} height={400} className="img-fluid" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
