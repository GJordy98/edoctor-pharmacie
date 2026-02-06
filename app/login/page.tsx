'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    
    // État du formulaire
    const [formData, setFormData] = useState({
        telephone: '',
        password: '',
        rememberMe: true
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id === 'login_telephone' ? 'telephone' : 
             id === 'login_password' ? 'password' : 
             'rememberMe']: type === 'checkbox' ? checked : value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!formData.telephone || !formData.password) {
            setMessage({ text: 'Veuillez remplir tous les champs.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);

        try {
            // PARAMÈTRES BACKEND (À configurer plus tard)
            // const API_ENDPOINT = "TON_ENDPOINT_ICI/login/";
            
            console.log("Tentative de connexion avec:", formData);

            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Succès simulé
            setMessage({ text: 'Connexion réussie ! Redirection...', type: 'success' });
            
            // Stocker le token ou les infos utilisateur si nécessaire
            // localStorage.setItem('token', 'fake-jwt-token');

            setTimeout(() => {
                router.push('/products_list');
            }, 1000);

        } catch (error) {
            console.error("Erreur de connexion:", error);
            setMessage({ text: "Identifiants invalides ou erreur serveur.", type: 'danger' });
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
                .authentication-barrier {
                    position: relative;
                    text-align: center;
                }
                .authentication-barrier::before {
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 1px;
                    background: #e9ecef;
                    left: 0;
                    top: 50%;
                    z-index: -1;
                }
                .authentication-barrier span {
                    background: #fff;
                    padding: 0 15px;
                    color: #adb5bd;
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
                    <div className="col-xxl-4 col-xl-5 col-lg-6 col-md-6 col-sm-8 col-12">
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
                                    <h4 className="mb-1 fw-semibold">Se connecter</h4>
                                    <p className="mb-4 text-muted fw-normal">Connectez-vous en tant que pharmacie</p>
                                </div>

                                {message.text && (
                                    <div className={`alert alert-${message.type} mb-3`} role="alert">
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="row gy-3">
                                    <div className="col-xl-12">
                                        <label htmlFor="login_telephone" className="form-label text-default">Téléphone</label>
                                        <input 
                                            id="login_telephone" 
                                            type="tel" 
                                            className="form-control form-control-lg"
                                            placeholder="Ex: +237..."
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-xl-12">
                                        <label htmlFor="login_password" className="form-label text-default">Mot de passe</label>
                                        <div className="position-relative">
                                            <input 
                                                id="login_password" 
                                                type={showPassword ? "text" : "password"} 
                                                className="form-control form-control-lg"
                                                placeholder="Votre mot de passe"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <span 
                                                className="show-password-button text-muted"
                                                onClick={togglePasswordVisibility}
                                            >
                                                <i className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}></i>
                                            </span>
                                        </div>

                                        <div className="mt-2">
                                            <div className="form-check mb-0">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id="defaultCheck1"
                                                    checked={formData.rememberMe}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="defaultCheck1">
                                                    Rester connecté
                                                </label>
                                            </div>
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
                                                    Connexion...
                                                </>
                                            ) : "Se connecter"}
                                        </button>
                                    </div>
                                </form>

                                <div className="text-center my-3 authentication-barrier">
                                    <span>OU</span>
                                </div>

                                <div className="d-grid mb-3">
                                    <button className="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill mb-3">
                                        <span className="avatar avatar-xs">
                                        <Image src="/images/media/apps/google.png" alt="Google" width={18} height={18} />
                                    </span>
                                        <span className="lh-1 ms-2 fs-13 text-default fw-medium">Se connecter avec Google</span>
                                    </button>
                                    <button className="btn btn-white btn-w-lg border d-flex align-items-center justify-content-center flex-fill">
                                        <span className="avatar avatar-xs shrink-0">
                                            <Image src="/images/media/apps/facebook.png" alt="Facebook" width={18} height={18} />
                                        </span>
                                        <span className="lh-1 ms-2 fs-13 text-default fw-medium">Se connecter avec Facebook</span>
                                    </button>
                                </div>

                                <div className="text-center mt-3 fw-medium">
                                    Pas encore de compte pharmacie ? <Link href="/create_pharmacy" className="text-primary">Créez votre compte pharmacie ici</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
