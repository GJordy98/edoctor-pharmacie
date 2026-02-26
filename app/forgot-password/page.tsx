'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api-client';

export default function ForgotPasswordPage() {
    const router = useRouter();

    // Steps: 1 = Enter Phone, 2 = Enter OTP + New Password
    const [step, setStep] = useState(1);
    
    // Form State
    const [telephone, setTelephone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = React.useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!telephone) {
            setMessage({ text: 'Veuillez entrer votre numéro de téléphone.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.changeForgotPassword(telephone);
            setMessage({ text: 'Code OTP envoyé avec succès !', type: 'success' });
            setTimeout(() => {
                setStep(2);
                setMessage({ text: '', type: '' });
            }, 1000);
        } catch (err: unknown) {
            const error = err as Error & { message?: string };
            console.error("Erreur demande OTP:", error);
            setMessage({ 
                text: error.message || "Erreur lors de l'envoi du code. Vérifiez le numéro.", 
                type: 'danger' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!otp || !newPassword || !confirmPassword) {
            setMessage({ text: 'Veuillez remplir tous les champs.', type: 'danger' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Les mots de passe ne correspondent pas.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);
        try {
            // Change forgotten password
            // API expects: { telephone, password }
            // Note: OTP validation happens on backend side
            await api.changeForgotPasswordWithOtp({
                telephone,
                password: newPassword
            });

            setMessage({ text: 'Mot de passe modifié avec succès ! Redirection...', type: 'success' });
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: unknown) {
            const error = err as Error & { message?: string };
            console.error("Erreur changement mot de passe:", error);
            setMessage({ 
                text: error.message || "Code OTP invalide ou erreur serveur.", 
                type: 'danger' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="authentication-background">
            <style jsx>{`
                .authentication-background {
                    background-color: #f0f2f5;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .authentication-basic-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 0;
                }
                .authentication-basic-background img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.6;
                }
                .custom-card {
                    z-index: 1;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    border-radius: 12px;
                    border: none;
                }
                .show-password-button {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    z-index: 10;
                }
            `}</style>

            <div className="authentication-basic-background">
                <Image 
                    src="/images/media/backgrounds/9.png" 
                    alt="background" 
                    fill
                    style={{ objectFit: 'cover', opacity: 0.6 }}
                    priority
                />
            </div>

            <div className="container" style={{ zIndex: 1 }}>
                <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
                    <div className="col-xxl-5 col-xl-6 col-lg-8 col-md-10 col-sm-11 col-12">
                        <div className="card custom-card my-4">
                            <div className="card-body p-5">
                                <div className="d-flex justify-content-center mb-4">
                                    <Link href="/">
                                        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                                            <Image 
                                                src="/images/brand-logos/toggle-logo.png" 
                                                alt="logo" 
                                                width={64}
                                                height={64}
                                                style={{ borderRadius: '9px' }}
                                            />
                                        </div>
                                    </Link>
                                </div>
                                <div className="text-center">
                                    <h4 className="mb-1 fw-semibold">Mot de passe oublié ?</h4>
                                    <p className="mb-4 text-muted fw-normal">
                                        {step === 1 
                                            ? "Entrez votre numéro de téléphone pour recevoir un code de réinitialisation." 
                                            : "Entrez le code reçu et votre nouveau mot de passe."}
                                    </p>
                                </div>

                                {message.text && (
                                    <div className={`alert alert-${message.type} mb-3`} role="alert">
                                        {message.text}
                                    </div>
                                )}

                                {step === 1 ? (
                                    <form onSubmit={handleStep1Submit} className="row gy-3">
                                        <div className="col-xl-12">
                                            <label htmlFor="reset_telephone" className="form-label text-default">Téléphone</label>
                                            <input 
                                                id="reset_telephone" 
                                                type="tel" 
                                                className="form-control form-control-lg"
                                                placeholder="Ex: +237..."
                                                value={telephone}
                                                onChange={(e) => setTelephone(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Envoi en cours...
                                                    </>
                                                ) : "Envoyer le code"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleStep2Submit} className="row gy-3">
                                        <div className="col-xl-12">
                                            <label htmlFor="otp_code" className="form-label text-default">Code OTP</label>
                                            <input 
                                                id="otp_code" 
                                                type="text" 
                                                className="form-control form-control-lg"
                                                placeholder="Entrez le code reçu"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-xl-12">
                                            <label htmlFor="new_password" className="form-label text-default">Nouveau mot de passe</label>
                                            <div className="position-relative">
                                                <input 
                                                    id="new_password" 
                                                    type={showPassword ? "text" : "password"} 
                                                    className="form-control form-control-lg"
                                                    placeholder="Nouveau mot de passe"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                <span 
                                                    className="show-password-button text-muted"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-xl-12">
                                            <label htmlFor="confirm_password" className="form-label text-default">Confirmer le mot de passe</label>
                                            <div className="position-relative">
                                                <input 
                                                    id="confirm_password" 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    className="form-control form-control-lg"
                                                    placeholder="Confirmez le mot de passe"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                                <span 
                                                    className="show-password-button text-muted"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <i className={showConfirmPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Validation...
                                                    </>
                                                ) : "Changer le mot de passe"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="text-center mt-4">
                                    <Link href="/login" className="text-primary fw-medium">
                                        <i className="ri-arrow-left-line align-middle me-1"></i>Retour à la connexion
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
