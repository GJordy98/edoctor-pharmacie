'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useProducts } from '@/hooks/useProducts';

export default function AddProductPage() {
    const { addProduct } = useProducts();
    
    // État du formulaire
    const [formData, setFormData] = useState({
        productId: '',
        galenic: '',
        unit: '',
        expirationDate: '',
        quantity: '',
        purchasePrice: '',
        salePrice: '',
        currency: 'XAF'
    });

    const [isSaving, setIsSaving] = useState(false);
    
    // Données fictives pour les sélections (à remplacer par des appels API)
    const [availableProducts] = useState([
        { id: '1', name: 'Paracétamol 500mg' },
        { id: '2', name: 'Ibuprofène 400mg' },
        { id: '3', name: 'Amoxicilline 500mg' },
        { id: '4', name: 'Vitamine C 1000mg' }
    ]);

    const galenicForms = ['Comprimé', 'Gélule', 'Sirop', 'Injectable', 'Pommade'];
    const units = ['Boîte', 'Plaquette', 'Flacon', 'Tube', 'Ampoule'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        // Mappe les IDs HTML aux clés de l'état
        const keyMap: { [key: string]: string } = {
            'productSelect': 'productId',
            'galenicSelect': 'galenic',
            'unitSelect': 'unit',
            'publish-date': 'expirationDate',
            'quantity': 'quantity',
            'purchasePrice': 'purchasePrice',
            'salePrice': 'salePrice', 
            'currency': 'currency'
        };
        
        const key = keyMap[id] || id;

        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) e.preventDefault();
        
        // Validation basique
        if (!formData.productId || !formData.galenic || !formData.unit || !formData.quantity) {
            alert('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        setIsSaving(true);
        
        try {
            const selectedProduct = availableProducts.find(p => p.id === formData.productId);
            const result = await addProduct({
                name: selectedProduct ? selectedProduct.name : 'Produit Inconnu',
                galenic: formData.galenic,
                unit: formData.unit,
                expirationDate: formData.expirationDate,
                quantity: parseInt(formData.quantity),
                purchasePrice: parseFloat(formData.purchasePrice),
                salePrice: parseFloat(formData.salePrice),
                currency: formData.currency,
                stock: parseInt(formData.quantity)
            });

            if (result.success) {
                alert('Médicament enregistré avec succès !');
                // Réinitialiser le formulaire
                setFormData({
                    productId: '',
                    galenic: '',
                    unit: '',
                    expirationDate: '',
                    quantity: '',
                    purchasePrice: '',
                    salePrice: '',
                    currency: 'XAF'
                });
            } else {
                alert('Erreur: ' + result.error);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Header />
            <Sidebar />

            <div className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    
                    <div className="page-header-breadcrumb mb-3">
                        <div className="d-flex align-center justify-content-between flex-wrap">
                            <h1 className="page-title fw-medium fs-18 mb-0">Ajouter un Médicament</h1>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link href="/">Dashboards</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="#">Pharmacie</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">Ajouter Médicament</li>
                            </ol>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xl-12">
                            <div className="card custom-card shadow-none mb-0">
                                <div className="card-header">
                                    <div className="card-title">
                                        Informations du Médicament
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row gy-4">
                                        {/* Produit */}
                                        <div className="col-xl-6">
                                            <label htmlFor="productSelect" className="form-label">Sélectionnez le produit *</label>
                                            <select 
                                                id="productSelect" 
                                                className="form-control" 
                                                value={formData.productId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Sélectionnez un produit --</option>
                                                {availableProducts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Forme galénique */}
                                        <div className="col-xl-6">
                                            <label htmlFor="galenicSelect" className="form-label">Forme galénique *</label>
                                            <select 
                                                id="galenicSelect" 
                                                className="form-control"
                                                value={formData.galenic}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Sélectionnez une forme --</option>
                                                {galenicForms.map(f => (
                                                    <option key={f} value={f}>{f}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Unité */}
                                        <div className="col-xl-6">
                                            <label htmlFor="unitSelect" className="form-label">Unité *</label>
                                            <select 
                                                id="unitSelect" 
                                                className="form-control"
                                                value={formData.unit}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Sélectionnez une unité --</option>
                                                {units.map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date d'expiration */}
                                        <div className="col-xl-6">
                                            <label htmlFor="publish-date" className="form-label">Date d&apos;expiration *</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                id="publish-date"
                                                value={formData.expirationDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Quantité */}
                                        <div className="col-xl-6">
                                            <label htmlFor="quantity" className="form-label">Quantité *</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="quantity" 
                                                placeholder="Ex: 100"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Prix d'achat */}
                                        <div className="col-xl-4">
                                            <label htmlFor="purchasePrice" className="form-label">Prix d&apos;achat *</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="purchasePrice"
                                                placeholder="Ex: 1800"
                                                value={formData.purchasePrice}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Prix de vente */}
                                        <div className="col-xl-4">
                                            <label htmlFor="salePrice" className="form-label">Prix de vente *</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="salePrice" 
                                                placeholder="Ex: 2500"
                                                value={formData.salePrice}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Devise */}
                                        <div className="col-xl-4">
                                            <label htmlFor="currency" className="form-label">Devise *</label>
                                            <select 
                                                id="currency" 
                                                className="form-control"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                            >
                                                <option value="XAF">XAF</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bouton d'enregistrement */}
                        <div className="col-xl-12">
                            <div className="px-4 py-3 border-top border-block-start-dashed d-sm-flex justify-content-end">
                                <button 
                                    id="btnSaveProduct" 
                                    onClick={handleSave} 
                                    className="btn btn-success m-1"
                                    disabled={isSaving}
                                >
                                    {!isSaving ? (
                                        <span id="btnSaveText">
                                            <i className="bi bi-check-circle me-2"></i>Enregistrer le Médicament
                                        </span>
                                    ) : (
                                        <span id="btnSaveLoader">
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Enregistrement en cours...
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
