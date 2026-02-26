'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api-client';
import { PharmacistRegisterData } from '@/lib/types';

export default function CreatePharmacyPage() {
    const router = useRouter();

    // État global du processus
    const [step, setStep] = useState(0); // 0: Pharmacie, 1: Utilisateur, 2: OTP
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
        telephone: '',
        email: '',
        lastName: '',
        firstName: '',
        password: '',
        confirmPassword: ''
    });

    // État OTP (Etape 3)
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [registeredTelephone, setRegisteredTelephone] = useState('');
    const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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
            'user_telephone': 'telephone',
            'user_email': 'email',
            'user_last_name': 'lastName',
            'user_first_name': 'firstName',
            'user_password': 'password',
            'user_confirm_password': 'confirmPassword'
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
            setMessage({ text: 'Veuillez remplir les champs obligatoires (Nom, Téléphone, Mot de passe).', type: 'danger' });
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setMessage({ text: 'Les mots de passe ne correspondent pas.', type: 'danger' });
            return;
        }

        if (userData.password.length < 6) {
            setMessage({ text: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Étape 1 : Créer la pharmacie
            const pharmacyPayload = {
                name: pharmacyData.name,
                description: pharmacyData.description,
                telephone: pharmacyData.telephone,
                adresse: {
                    city: pharmacyData.address.city,
                    rue: pharmacyData.address.rue,
                    quater: pharmacyData.address.quater,
                    bp: pharmacyData.address.bp,
                    longitude: parseFloat(pharmacyData.address.longitude) || 0,
                    latitude: parseFloat(pharmacyData.address.latitude) || 0,
                    telephone: pharmacyData.address.telephone || pharmacyData.telephone
                }
            };
            console.log('[Inscription] Payload pharmacie:', pharmacyPayload);

            const pharmacyResponse = await api.registerPharmacy(pharmacyPayload);
            const rawResponse = pharmacyResponse as Record<string, unknown>;
            const officineId = (rawResponse.id || rawResponse.uuid || rawResponse.officine) as string;

            if (!officineId) {
                console.error('[Inscription] Réponse pharmacie complète:', pharmacyResponse);
                throw new Error("Pharmacie créée mais impossible de récupérer son identifiant. Contactez le support.");
            }

            console.log('[Inscription] Pharmacie créée avec ID:', officineId);

            // Étape 2 : Créer le pharmacien lié à cette officine
            const pharmacistPayload: PharmacistRegisterData = {
                officine: officineId,
                telephone: userData.telephone,
                email: userData.email,
                last_name: userData.lastName,
                first_name: userData.firstName,
                password: userData.password
            };
            console.log('[Inscription] Payload pharmacien:', { ...pharmacistPayload, password: '***' });

            await api.registerPharmacist(pharmacistPayload);
            console.log('[Inscription] Pharmacien créé avec succès');

            // Succès : passer à l'étape OTP
            setRegisteredTelephone(userData.telephone);
            setMessage({ text: 'Pharmacie et compte créés avec succès ! Veuillez entrer le code OTP envoyé à votre téléphone.', type: 'success' });
            setDirection('next');
            setStep(2);

        } catch (error: unknown) {
            console.error('[Inscription] Erreur:', error);
            let errorMessage = "Une erreur est survenue lors de l'inscription.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setMessage({ text: errorMessage, type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- OTP Handlers ---
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // chiffres uniquement
        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1); // un seul chiffre
        setOtpCode(newOtp);
        // Auto-focus sur le champ suivant
        if (value && index < 5) {
            otpInputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newOtp = [...otpCode];
            for (let i = 0; i < pasted.length; i++) {
                newOtp[i] = pasted[i];
            }
            setOtpCode(newOtp);
            const focusIndex = Math.min(pasted.length, 5);
            otpInputsRef.current[focusIndex]?.focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otpCode.join('');
        if (code.length !== 6) {
            setMessage({ text: 'Veuillez entrer le code OTP complet (6 chiffres).', type: 'danger' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            await api.validateOtp({ otp: code, telephone: registeredTelephone });
            setMessage({ text: 'Compte validé avec succès ! Redirection vers la connexion...', type: 'success' });
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: unknown) {
            console.error('Erreur validation OTP:', error);
            let errorMessage = 'Code OTP invalide ou expiré.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setMessage({ text: errorMessage, type: 'danger' });
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
                .otp-input {
                    width: 52px;
                    height: 58px;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 600;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    outline: none;
                }
                .otp-input:focus {
                    border-color: #3ab047;
                    box-shadow: 0 0 0 3px rgba(58, 176, 71, 0.15);
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
                                        <div className="progress-fill" style={{ width: step === 0 ? '33%' : step === 1 ? '66%' : '100%' }}></div>
                                    </div>

                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-3`} role="alert">
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="registration-container overflow-hidden">
                                        {/* Étape 1: Pharmacie */}
                                        <div className={`step-wrapper ${step === 0 ? 'step-active' : 'step-exit-next'}`}>
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
                                                    <label htmlFor="addr_bp" className="form-label">Boîte Postale</label>
                                                    <input className="form-control" id="addr_bp" type="text" value={pharmacyData.address.bp} onChange={handlePharmacyChange} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="addr_telephone" className="form-label">Téléphone Adresse</label>
                                                    <input className="form-control" id="addr_telephone" type="tel" value={pharmacyData.address.telephone} onChange={handlePharmacyChange} />
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
                                        <div className={`step-wrapper ${
                                            step === 1 ? 'step-active' :
                                            step === 0 ? (direction === 'next' ? 'step-enter-next' : 'step-exit-prev') :
                                            'step-exit-next'
                                        }`}>
                                            <h4 className="mb-1 fw-semibold">Étape 2 : Administrateur</h4>
                                            <p className="mb-4 text-muted fw-normal">Créez le compte pharmacien qui va gérer cette pharmacie.</p>

                                            <form onSubmit={handleFinalSubmit} className="row gy-3">
                                                <div className="col-xl-6">
                                                    <label htmlFor="user_last_name" className="form-label">Nom *</label>
                                                    <input className="form-control" id="user_last_name" type="text" value={userData.lastName} onChange={handleUserChange} required />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="user_first_name" className="form-label">Prénom</label>
                                                    <input className="form-control" id="user_first_name" type="text" value={userData.firstName} onChange={handleUserChange} />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_email" className="form-label">Email</label>
                                                    <input className="form-control" id="user_email" type="email" placeholder="pharmacien@exemple.com" value={userData.email} onChange={handleUserChange} />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="user_telephone" className="form-label">Téléphone du pharmacien *</label>
                                                    <input className="form-control" id="user_telephone" type="tel" placeholder="Ex: +237600000000" value={userData.telephone} onChange={handleUserChange} required />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="user_password" className="form-label">Mot de passe *</label>
                                                    <input className="form-control" id="user_password" type="password" value={userData.password} onChange={handleUserChange} required minLength={6} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="user_confirm_password" className="form-label">Confirmer le mot de passe *</label>
                                                    <input
                                                        className={`form-control ${userData.confirmPassword && userData.password !== userData.confirmPassword ? 'is-invalid' : ''}`}
                                                        id="user_confirm_password"
                                                        type="password"
                                                        value={userData.confirmPassword}
                                                        onChange={handleUserChange}
                                                        required
                                                    />
                                                    {userData.confirmPassword && userData.password !== userData.confirmPassword && (
                                                        <div className="invalid-feedback">Les mots de passe ne correspondent pas.</div>
                                                    )}
                                                </div>
                                                <div className="d-flex gap-2 mt-4">
                                                    <button type="button" onClick={goToPharmacyStep} className="btn btn-light flex-fill"><i className="ri-arrow-left-line me-2"></i> Retour</button>
                                                    <button type="submit" className="btn btn-primary flex-fill" disabled={isSubmitting}>
                                                        {isSubmitting
                                                            ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Création en cours...</>
                                                            : 'Créer et continuer'
                                                        }
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Étape 3: Validation OTP */}
                                        <div className={`step-wrapper ${step === 2 ? 'step-active' : 'step-enter-next'}`}>
                                            <div className="text-center">
                                                <div className="mb-3" style={{ fontSize: '3rem' }}>🔐</div>
                                                <h4 className="mb-1 fw-semibold">Étape 3 : Vérification OTP</h4>
                                                <p className="mb-4 text-muted fw-normal">Un code de vérification a été envoyé au numéro<br/><strong>{registeredTelephone}</strong></p>
                                            </div>
                                            
                                            <form onSubmit={handleOtpSubmit}>
                                                <div className="d-flex justify-content-center gap-2 mb-4">
                                                    {otpCode.map((digit, index) => (
                                                        <input
                                                            key={index}
                                                            ref={el => { otpInputsRef.current[index] = el; }}
                                                            className="otp-input"
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={e => handleOtpChange(index, e.target.value)}
                                                            onKeyDown={e => handleOtpKeyDown(index, e)}
                                                            onPaste={index === 0 ? handleOtpPaste : undefined}
                                                            autoFocus={index === 0 && step === 2}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="d-grid">
                                                    <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || otpCode.join('').length !== 6}>
                                                        {isSubmitting ? 'Vérification...' : 'Valider le code'}
                                                    </button>
                                                </div>
                                                <div className="text-center mt-3">
                                                    <span className="text-muted">Vous n&apos;avez pas reçu le code ? </span>
                                                    <button type="button" className="btn btn-link p-0 text-primary" onClick={() => setMessage({ text: 'Un nouveau code a été envoyé.', type: 'success' })}>
                                                        Renvoyer
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
