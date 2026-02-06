'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatePharmacyPage() {
    const router = useRouter();

    // État du formulaire
    const [formData, setFormData] = useState({
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        
        // Gérer les champs imbriqués de l'adresse
        if (id.startsWith('addr_')) {
            const field = id.replace('addr_', '');
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
        } else if (id.startsWith('ph_')) {
            const field = id.replace('ph_', '');
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Validation minimale
        if (!formData.name || !formData.address.city) {
            setMessage({ text: 'Le nom de la pharmacie et la ville sont requis.', type: 'danger' });
            return;
        }

        setIsSubmitting(true);

        try {
            // PARAMÈTRES BACKEND (À configurer plus tard)
            // const API_ENDPOINT = "TON_ENDPOINT_ICI/register-officine/";
            
            const payload = {
                name: formData.name,
                description: formData.description,
                telephone: formData.telephone,
                adresse: {
                    ...formData.address,
                    longitude: formData.address.longitude ? parseFloat(formData.address.longitude) : null,
                    latitude: formData.address.latitude ? parseFloat(formData.address.latitude) : null
                }
            };

            console.log("Envoi du payload pharmacie:", payload);

            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Succès simulé (renvoie un ID)
            const mockId = "uuid-" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("createdOfficineId", mockId);

            setMessage({ text: "Pharmacie créée avec succès ! Redirection vers la création d'utilisateur...", type: 'success' });

            setTimeout(() => {
                router.push('/create_pharmacy_user');
            }, 2000);

        } catch (error) {
            console.error("Erreur lors de la création de la pharmacie:", error);
            setMessage({ text: "Une erreur est survenue lors de la création de la pharmacie.", type: 'danger' });
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
                                    <div className="text-center mb-4">
                                        <Link href="/">
                                            <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto' }}>
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
                                    <div>
                                        <h4 className="mb-1 fw-semibold">Créez votre compte pharmacie</h4>
                                        <p className="mb-4 text-muted fw-normal">
                                            Veuillez remplir le formulaire pour créer un compte pharmacie. 
                                            Après quoi vous serez redirigé vers la page de création d utilisateur.
                                        </p>
                                    </div>

                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-3`} role="alert">
                                            {message.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="row gy-3">
                                        <div className="col-xl-12">
                                            <label htmlFor="ph_name" className="form-label text-default">Nom de la pharmacie *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="ph_name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="ph_description" className="form-label">Description de la pharmacie</label>
                                            <textarea 
                                                className="form-control" 
                                                id="ph_description" 
                                                rows={1}
                                                value={formData.description}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        <div className="col-xl-12">
                                            <label htmlFor="ph_telephone" className="form-label d-block">Numéro de Téléphone de la pharmacie</label>
                                            <input 
                                                className="form-control" 
                                                id="ph_telephone" 
                                                type="tel"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <hr className="my-2" />
                                        <h6 className="fw-semibold mb-0">Adresse</h6>
                                        <div className="col-xl-12">
                                            <label htmlFor="addr_city" className="form-label d-block">Ville *</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_city" 
                                                type="text"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_rue" className="form-label d-block">Rue</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_rue" 
                                                type="text"
                                                value={formData.address.rue}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_quater" className="form-label d-block">Quartier</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_quater" 
                                                type="text"
                                                value={formData.address.quater}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_bp" className="form-label d-block">BP</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_bp" 
                                                type="text"
                                                value={formData.address.bp}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_telephone" className="form-label d-block">Téléphone (Adresse)</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_telephone" 
                                                type="tel"
                                                value={formData.address.telephone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_longitude" className="form-label d-block">Longitude</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_longitude" 
                                                type="number" 
                                                step="any"
                                                value={formData.address.longitude}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <label htmlFor="addr_latitude" className="form-label d-block">Latitude</label>
                                            <input 
                                                className="form-control" 
                                                id="addr_latitude" 
                                                type="number" 
                                                step="any"
                                                value={formData.address.latitude}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                id="btnCreatePharmacy" 
                                                className="btn btn-primary"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Création en cours...
                                                    </>
                                                ) : "Créer le compte pharmacie"}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="text-center mt-3 fw-medium">
                                        Compte pharmacie déjà existant ? <Link href="/login" className="text-primary">Connectez-vous ici</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-12 d-xl-block d-none px-0">
                    <div className="authentication-cover overflow-hidden">
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
