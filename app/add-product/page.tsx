'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useProducts, Product } from '@/hooks/useProducts';

export default function AddProductPage() {
    const { products } = useProducts();
    
    // État global du processus
    const [step, setStep] = useState(0); // 0: Info, 1: Conversion, 2: Prix
    const [direction, setDirection] = useState('next'); // 'next' ou 'prev'

    // État du formulaire
    const [formData, setFormData] = useState({
        // Étape 1
        pharmacy: 'a832f7cf-c0a2-44c9-92eb-b33671b778af', // ID fixe pour l'exemple
        product: '',
        batch_number: '',
        expiration_date: '',
        unit: '',
        quantity: '',
        purchase_price: '',
        
        // Étape 2 (Conversion)
        from_unit: '',
        to_unit: '',
        multiplier: '',

        // Étape 3 (Prix)
        sale_price: '',
        currency: 'XAF'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState<string[]>([]);
    
    // États pour la recherche de produit
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const units = ['Boîte', 'Plaquette', 'Flacon', 'Tube', 'Ampoule', 'Gélule', 'Comprimé'];

    // Fermer les résultats lors d'un clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductSelect = (product: Product) => {
        setFormData(prev => ({
            ...prev,
            product: product.id,
            unit: product.unit || ''
        }));
        setSearchTerm(product.name);
        setShowResults(false);
        setErrors(prev => prev.filter(e => e !== 'productSearch'));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        
        if (id === 'productSearch') {
            setSearchTerm(value);
            setShowResults(true);
            if (value === '') {
                setFormData(prev => ({ ...prev, product: '' }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }

        // Nettoyer l'erreur quand l'utilisateur commence à saisir
        setErrors(prev => prev.filter(err => err !== id));
    };

    const goToStep = (targetStep: number) => {
        if (targetStep > step) {
            // Validation par étape
            const newErrors: string[] = [];
            if (step === 0) {
                if (!formData.product) newErrors.push('productSearch');
                if (!formData.batch_number) newErrors.push('batch_number');
                if (!formData.expiration_date) newErrors.push('expiration_date');
                if (!formData.unit) newErrors.push('unit');
                if (!formData.quantity) newErrors.push('quantity');
                if (!formData.purchase_price) newErrors.push('purchase_price');
            }
            if (step === 1) {
                if (!formData.from_unit) newErrors.push('from_unit');
                if (!formData.to_unit) newErrors.push('to_unit');
                if (!formData.multiplier) newErrors.push('multiplier');
            }

            if (newErrors.length > 0) {
                setErrors(newErrors);
                setMessage({ text: 'Veuillez remplir les champs en surbrillance rouge.', type: 'danger' });
                return;
            }
            setDirection('next');
        } else {
            setDirection('prev');
        }
        setErrors([]);
        setMessage({ text: '', type: '' });
        setStep(targetStep);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: string[] = [];
        if (!formData.sale_price) newErrors.push('sale_price');
        if (!formData.currency) newErrors.push('currency');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setMessage({ text: 'Veuillez renseigner le prix de vente et la devise.', type: 'danger' });
            return;
        }

        setIsSaving(true);
        setMessage({ text: '', type: '' });
        setErrors([]);
        
        try {
            // Simulation d'envoi du payload global
            const payload = {
                step1: {
                    pharmacy: formData.pharmacy,
                    product: formData.product,
                    batch_number: formData.batch_number,
                    expiration_date: formData.expiration_date,
                    unit: formData.unit,
                    quantity: parseInt(formData.quantity),
                    purchase_price: parseFloat(formData.purchase_price)
                },
                step2: {
                    product: formData.product,
                    from_unit: formData.from_unit,
                    to_unit: formData.to_unit,
                    multiplier: parseFloat(formData.multiplier)
                },
                step3: {
                    pharmacy: formData.pharmacy,
                    product: formData.product,
                    sale_price: parseFloat(formData.sale_price),
                    currency: formData.currency
                }
            };

            console.log("Envoi global du produit:", payload);
            
            // Simulation API
            await new Promise(resolve => setTimeout(resolve, 2000));

            setMessage({ text: 'Produit enregistré avec succès !', type: 'success' });
            
            // Réinitialiser après succès
            setTimeout(() => {
                setStep(0);
                setFormData({
                    pharmacy: 'a832f7cf-c0a2-44c9-92eb-b33671b778af',
                    product: '',
                    batch_number: '',
                    expiration_date: '',
                    unit: '',
                    quantity: '',
                    purchase_price: '',
                    from_unit: '',
                    to_unit: '',
                    multiplier: '',
                    sale_price: '',
                    currency: 'XAF'
                });
                setSearchTerm('');
            }, 1500);

        } catch (error) {
            console.error('Save error:', error);
            setMessage({ text: 'Une erreur est survenue lors de l\'enregistrement.', type: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    const progressWidth = ((step + 1) / 3) * 100;

    return (
        <div className="bg-white min-vh-100">
            <style jsx>{`
                .registration-container {
                    position: relative;
                    width: 100%;
                    min-height: 500px;
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

                .search-results-container { position: relative; }
                .search-results-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 0 0 8px 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    max-height: 200px;
                    overflow-y: auto;
                }
                .search-result-item {
                    padding: 10px 15px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .search-result-item:hover { background: #f8f9fa; }

                @keyframes glow-red {
                    0% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.4); border-color: #ff0000; }
                    50% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); border-color: #ff0000; }
                    100% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.4); border-color: #ff0000; }
                }
                .is-invalid-glow {
                    animation: glow-red 1.5s infinite;
                    border-color: #ff0000 !important;
                }
            `}</style>
            
            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    
                    <div className="page-header-breadcrumb mb-3">
                        <div className="d-flex align-center justify-content-between flex-wrap">
                            <h1 className="page-title fw-medium fs-18 mb-0">Ajouter un Médicament</h1>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><Link href="/">Dashboards</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Ajouter Médicament</li>
                            </ol>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card custom-card shadow-sm border-0">
                                <div className="card-body p-md-5 p-4">
                                    
                                    <div className="progress-bar-custom">
                                        <div className="progress-fill" style={{ width: `${progressWidth}%` }}></div>
                                    </div>

                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-3`} role="alert">
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="registration-container overflow-hidden">
                                        
                                        {/* Étape 1: Informations Produit */}
                                        <div className={`step-wrapper ${step === 0 ? 'step-active' : (direction === 'next' ? 'step-exit-next' : 'step-exit-prev')}`}>
                                            <h4 className="mb-1 fw-semibold">Étape 1 : Informations Produit</h4>
                                            <p className="mb-4 text-muted">Détails de base du médicament et du lot.</p>
                                            
                                            <div className="row gy-3">
                                                <div className="col-xl-12" ref={searchRef}>
                                                    <label className="form-label">Produit *</label>
                                                    <div className="search-results-container">
                                                        <input 
                                                            type="text" 
                                                            id="productSearch" 
                                                            className={`form-control ${errors.includes('productSearch') ? 'is-invalid-glow' : ''}`}
                                                            placeholder="Rechercher un produit..."
                                                            value={searchTerm}
                                                            onChange={handleInputChange}
                                                            autoComplete="off"
                                                        />
                                                        {showResults && searchTerm && (
                                                            <div className="search-results-dropdown">
                                                                {filteredProducts.length > 0 ? (
                                                                    filteredProducts.map(p => (
                                                                        <div key={p.id} className="search-result-item" onClick={() => handleProductSelect(p)}>
                                                                            <strong>{p.name}</strong> <small className="text-muted">({p.galenic})</small>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-3 text-muted text-center">Aucun produit trouvé</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="batch_number" className="form-label">Numéro de lot *</label>
                                                    <input type="text" className={`form-control ${errors.includes('batch_number') ? 'is-invalid-glow' : ''}`} id="batch_number" value={formData.batch_number} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="expiration_date" className="form-label">Date d&apos;expiration *</label>
                                                    <input type="date" className={`form-control ${errors.includes('expiration_date') ? 'is-invalid-glow' : ''}`} id="expiration_date" value={formData.expiration_date} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="unit" className="form-label">Unité *</label>
                                                    <select className={`form-control ${errors.includes('unit') ? 'is-invalid-glow' : ''}`} id="unit" value={formData.unit} onChange={handleInputChange}>
                                                        <option value="">Sélectionnez l&apos;unité</option>
                                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="quantity" className="form-label">Quantité *</label>
                                                    <input type="number" className={`form-control ${errors.includes('quantity') ? 'is-invalid-glow' : ''}`} id="quantity" value={formData.quantity} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="purchase_price" className="form-label">Prix d&apos;achat *</label>
                                                    <input type="number" className={`form-control ${errors.includes('purchase_price') ? 'is-invalid-glow' : ''}`} id="purchase_price" value={formData.purchase_price} onChange={handleInputChange} />
                                                </div>
                                                <div className="d-grid mt-4">
                                                    <button type="button" onClick={() => goToStep(1)} className="btn btn-primary">
                                                        Suivant (Conversion) <i className="ri-arrow-right-line ms-2"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Étape 2: Conversion */}
                                        <div className={`step-wrapper ${step === 1 ? 'step-active' : (direction === 'next' ? (step === 0 ? 'step-enter-next' : 'step-exit-next') : (step === 2 ? 'step-exit-prev' : 'step-enter-prev'))}`}>
                                            <h4 className="mb-1 fw-semibold">Étape 2 : Unité de conversion</h4>
                                            <p className="mb-4 text-muted">Définissez les règles de conversion pour ce produit.</p>
                                            
                                            <div className="row gy-3">
                                                <div className="col-xl-6">
                                                    <label htmlFor="from_unit" className="form-label">De l&apos;unité</label>
                                                    <select className={`form-control ${errors.includes('from_unit') ? 'is-invalid-glow' : ''}`} id="from_unit" value={formData.from_unit} onChange={handleInputChange}>
                                                        <option value="">Sélectionnez l&apos;unité</option>
                                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-xl-6">
                                                    <label htmlFor="to_unit" className="form-label">Vers l&apos;unité</label>
                                                    <select className={`form-control ${errors.includes('to_unit') ? 'is-invalid-glow' : ''}`} id="to_unit" value={formData.to_unit} onChange={handleInputChange}>
                                                        <option value="">Sélectionnez l&apos;unité</option>
                                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="multiplier" className="form-label">Multiplicateur</label>
                                                    <input type="number" className={`form-control ${errors.includes('multiplier') ? 'is-invalid-glow' : ''}`} id="multiplier" placeholder="Ex: 10" value={formData.multiplier} onChange={handleInputChange} />
                                                </div>
                                                <div className="d-flex gap-2 mt-4">
                                                    <button type="button" onClick={() => goToStep(0)} className="btn btn-light flex-fill"><i className="ri-arrow-left-line me-2"></i> Retour</button>
                                                    <button type="button" onClick={() => goToStep(2)} className="btn btn-primary flex-fill">Suivant (Prix) <i className="ri-arrow-right-line ms-2"></i></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Étape 3: Prix */}
                                        <div className={`step-wrapper ${step === 2 ? 'step-active' : (direction === 'next' ? 'step-enter-next' : 'step-enter-prev')}`}>
                                            <h4 className="mb-1 fw-semibold">Étape 3 : Informations Prix</h4>
                                            <p className="mb-4 text-muted">Détails sur la facturation et la devise.</p>
                                            
                                            <div className="row gy-3">
                                                <div className="col-xl-12">
                                                    <label htmlFor="sale_price" className="form-label">Prix de vente *</label>
                                                    <input type="number" className={`form-control ${errors.includes('sale_price') ? 'is-invalid-glow' : ''}`} id="sale_price" value={formData.sale_price} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-xl-12">
                                                    <label htmlFor="currency" className="form-label">Devise *</label>
                                                    <select className={`form-control ${errors.includes('currency') ? 'is-invalid-glow' : ''}`} id="currency" value={formData.currency} onChange={handleInputChange}>
                                                        <option value="XAF">XAF (Franc CFA)</option>
                                                        <option value="USD">USD (Dollar)</option>
                                                        <option value="EUR">EUR (Euro)</option>
                                                    </select>
                                                </div>
                                                <div className="d-flex gap-2 mt-4">
                                                    <button type="button" onClick={() => goToStep(1)} className="btn btn-light flex-fill"><i className="ri-arrow-left-line me-2"></i> Retour</button>
                                                    <button type="button" onClick={handleFinalSubmit} className="btn btn-success flex-fill" disabled={isSaving}>
                                                        {isSaving ? "Enregistrement..." : "Terminer et Enregistrer"}
                                                    </button>
                                                </div>
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
        </div>
    );
}
