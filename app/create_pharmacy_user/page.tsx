'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatePharmacyUserPage() {
    const router = useRouter();
    
    // Interface pour les données du formulaire
    interface PharmacyFormData {
        officineId: string;
        telephone: string;
        email: string;
        lastName: string;
        firstName: string;
        password: string;
        [key: string]: string;
    }

    // État du formulaire
    const [formData, setFormData] = useState<PharmacyFormData>({
        officineId: '',
        telephone: '',
        email: '',
        lastName: '',
        firstName: '',
        password: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Récupérer l'ID de l'officine depuis le localStorage si disponible
    useEffect(() => {
        const storedId = localStorage.getItem('createdOfficineId');
        if (storedId) {
            setFormData(prev => ({ ...prev, officineId: storedId }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Validation basique
        if (!formData.telephone || !formData.password || !formData.lastName) {
            setMessage({ text: 'Veuillez remplir les champs obligatoires (Téléphone, Nom, Mot de passe).', type: 'danger' });
            return;
        }

        setIsSubmitting(true);

        try {
            // PARAMÈTRES BACKEND (À configurer plus tard)
            // const API_ENDPOINT = "TON_ENDPOINT_ICI/register-user/"; 
            
            console.log("Envoi des données utilisateur:", formData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Succès simulé
            setMessage({ text: 'Utilisateur créé avec succès ! Redirection vers la connexion...', type: 'success' });
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur:", error);
            setMessage({ text: "Une erreur est survenue lors de la création de l'utilisateur.", type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            <div className="row authentication authentication-cover-main mx-0">
                <div className="col-xxl-9 col-xl-9 col-lg-12">
                    <div className="row justify-content-center align-items-center h-100">
                        <div className="col-xxl-4 col-xl-5 col-lg-6 col-md-6 col-sm-8 col-12">
                            <div className="card custom-card border-0 shadow-none my-4">
                                <div className="card-body p-5">
                                    <div>
                                        <h4 className="mb-1 fw-semibold">Créez un utilisateur de pharmacie</h4>
                                        <p className="mb-4 text-muted fw-normal">Veuillez remplir le formulaire pour créer un utilisateur de pharmacie</p>
                                    </div>
                                    
                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-3`} role="alert">
                                            {message.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="row gy-3">
                                        <div className="col-xl-12">
                                            <label htmlFor="user_officine" className="form-label text-default">ID de la pharmacie (officine)</label>
                                            <textarea 
                                                className="form-control" 
                                                id="user_officine" 
                                                rows={2}
                                                placeholder="UUID de l'officine (automatique)"
                                                value={formData.officineId}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="user_telephone" className="form-label text-default">Téléphone *</label>
                                            <input 
                                                type="tel" 
                                                className="form-control" 
                                                id="user_telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="user_email" className="form-label">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="user_email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="user_last_name" className="form-label d-block">Nom *</label>
                                            <input 
                                                className="form-control" 
                                                id="user_last_name" 
                                                type="text"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="user_first_name" className="form-label d-block">Prénom</label>
                                            <input 
                                                className="form-control" 
                                                id="user_first_name" 
                                                type="text"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="user_password" className="form-label d-block">Mot de passe *</label>
                                            <input 
                                                className="form-control" 
                                                id="user_password" 
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                id="btnCreateUser" 
                                                className="btn btn-primary"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Création en cours...
                                                    </>
                                                ) : "Créer l'utilisateur"}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="text-center mt-3 fw-medium">
                                        Utilisateur déjà existant ? <Link href="/login" className="text-primary">Connectez-vous ici</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-12 d-xl-block d-none px-0">
                    <div className="authentication-cover overflow-hidden">
                        <div className="authentication-cover-logo">
                            <Link href="/">
                                <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                                    <Image src="/images/brand-logos/toggle-logo.png" alt="logo" width={64} height={64} style={{ borderRadius: '9px' }} />
                                </div>
                            </Link>
                        </div>
                        <div className="authentication-cover-background">
                            <Image 
                                src="/images/media/backgrounds/9.png" 
                                alt="background"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="authentication-cover-content">
                            <div className="p-5">
                                <h3 className="fw-semibold lh-base">Bienvenue sur e Dr TIM Pharmacie</h3>
                                <p className="mb-0 text-muted fw-medium">Gérez votre pharmacie depuis votre écran de bureau !</p>
                            </div>
                            <div>
                                <Image src="/images/media/media-72.png" alt="illustration" width={500} height={400} className="img-fluid" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
