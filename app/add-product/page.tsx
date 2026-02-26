'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';
import { Category, Galenic, Unit, Product } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Type for the global product catalog (from GET /api/v1/products/)
interface GlobalProduct {
    id: string;
    name: string | null;
    dci: string | null;
    dosage: string | null;
    category: string | null;
    galenic: string | null;
    unit_base: string | null;
    unit_sale: string | null;
    unit_purchase: string | null;
    category_detail?: { id: string; name: string } | null;
    galenic_detail?: { id: string; name: string } | null;
    unit_base_detail?: { id: string; code: string; label: string } | null;
    unit_sale_detail?: { id: string; code: string; label: string } | null;
    unit_purchase_detail?: { id: string; code: string; label: string } | null;
}

export default function AddProductPage() {
    const router = useRouter();

    // Reference data lists
    const [categories, setCategories] = useState<Category[]>([]);
    const [galenics, setGalenics] = useState<Galenic[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingRefs, setLoadingRefs] = useState(true);

    // Global products for autocomplete
    const [allProducts, setAllProducts] = useState<GlobalProduct[]>([]);
    const [nameSuggestions, setNameSuggestions] = useState<GlobalProduct[]>([]);
    const [dciSuggestions, setDciSuggestions] = useState<GlobalProduct[]>([]);
    const [showNameDropdown, setShowNameDropdown] = useState(false);
    const [showDciDropdown, setShowDciDropdown] = useState(false);
    const nameRef = useRef<HTMLDivElement>(null);
    const dciRef = useRef<HTMLDivElement>(null);

    // Form state — all fields in one page
    const [formData, setFormData] = useState({
        name: '',
        dci: '',
        dosage: '',
        category: '',
        galenic: '',
        unit_base: '',
        unit_sale: '',
        unit_purchase: '',
        purchase_price: '',
        sale_price: '',
        currency: 'XAF',
        multiplier: '',
        // Stock initial (optional)
        quantity: '',
        expiry_date: '',
        lot_number: '',
        notes: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState<string[]>([]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (nameRef.current && !nameRef.current.contains(e.target as Node)) {
                setShowNameDropdown(false);
            }
            if (dciRef.current && !dciRef.current.contains(e.target as Node)) {
                setShowDciDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load reference data + global product list
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [cats, gals, uns, prods] = await Promise.all([
                    api.getCategories(),
                    api.getGalenics(),
                    api.getUnits(),
                    api.getAllProducts(),
                ]);

                const safeArray = (data: unknown): unknown[] => {
                    if (Array.isArray(data)) return data;
                    if (data && typeof data === 'object') {
                        if ('results' in data && Array.isArray((data as { results: unknown[] }).results))
                            return (data as { results: unknown[] }).results;
                        if ('data' in data && Array.isArray((data as { data: unknown[] }).data))
                            return (data as { data: unknown[] }).data;
                    }
                    return [];
                };

                setCategories(safeArray(cats) as Category[]);
                setGalenics(safeArray(gals) as Galenic[]);
                setUnits(safeArray(uns) as Unit[]);
                setAllProducts(safeArray(prods) as GlobalProduct[]);
            } catch (err) {
                console.error('Erreur chargement références:', err);
                setMessage({ text: 'Erreur lors du chargement des données de référence.', type: 'danger' });
            } finally {
                setLoadingRefs(false);
            }
        };
        loadAll();
    }, []);

    // Auto-fill all form fields from a selected product suggestion
    const fillFromProduct = useCallback((product: GlobalProduct) => {
        setFormData(prev => ({
            ...prev,
            name: product.name || '',
            dci: product.dci || '',
            dosage: product.dosage || '',
            category: product.category || '',
            galenic: product.galenic || '',
            unit_base: product.unit_base || '',
            unit_sale: product.unit_sale || '',
            unit_purchase: product.unit_purchase || '',
        }));
        setErrors([]);
        setShowNameDropdown(false);
        setShowDciDropdown(false);
    }, []);

    // Handle name field changes and filter suggestions
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, name: value }));
        setErrors(prev => prev.filter(err => err !== 'name'));
        if (value.trim().length >= 1) {
            const filtered = allProducts.filter(p =>
                p.name && p.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8);
            setNameSuggestions(filtered);
            setShowNameDropdown(filtered.length > 0);
        } else {
            setShowNameDropdown(false);
        }
    };

    // Handle DCI field changes and filter suggestions
    const handleDciChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, dci: value }));
        if (value.trim().length >= 1) {
            const filtered = allProducts.filter(p =>
                p.dci && p.dci.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8);
            setDciSuggestions(filtered);
            setShowDciDropdown(filtered.length > 0);
        } else {
            setShowDciDropdown(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setErrors(prev => prev.filter(err => err !== id));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Final submit — single step
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: string[] = [];
        if (!formData.name) newErrors.push('name');
        if (!formData.category) newErrors.push('category');
        if (!formData.galenic) newErrors.push('galenic');
        if (!formData.unit_base) newErrors.push('unit_base');
        if (!formData.unit_sale) newErrors.push('unit_sale');
        if (!formData.unit_purchase) newErrors.push('unit_purchase');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setMessage({ text: 'Veuillez remplir tous les champs obligatoires (*).', type: 'danger' });
            return;
        }

        setIsSaving(true);
        setMessage({ text: '', type: '' });

        // Get pharmacy ID
        const officineData = localStorage.getItem('officine');
        let pharmacyId: string | null = null;
        if (officineData) {
            try {
                const officine = JSON.parse(officineData);
                pharmacyId = officine.id || officine.officine_id || officine.uuid;
            } catch (parseError) {
                console.error('Could not parse officine data:', parseError);
            }
        }

        if (!pharmacyId) {
            setMessage({ text: 'ID de pharmacie non trouvé. Veuillez vous reconnecter.', type: 'danger' });
            setIsSaving(false);
            return;
        }

        try {
            // 1. Create product
            const formDataPayload = new FormData();
            formDataPayload.append('name', formData.name);
            if (formData.dci) formDataPayload.append('dci', formData.dci);
            if (formData.dosage) formDataPayload.append('dosage', formData.dosage);
            formDataPayload.append('category', formData.category);
            formDataPayload.append('galenic', formData.galenic);
            formDataPayload.append('unit_base', formData.unit_base);
            formDataPayload.append('unit_sale', formData.unit_sale);
            formDataPayload.append('unit_purchase', formData.unit_purchase);
            formDataPayload.append('officine', pharmacyId);
            if (selectedImage) {
                formDataPayload.append('image', selectedImage);
            }

            const createdProduct: Product = await api.addProduct(formDataPayload);
            const productId = createdProduct.id;
            if (!productId) throw new Error('Erreur: ID produit manquant après création.');

            // 2. Unit conversion (if multiplier provided)
            if (formData.multiplier) {
                await api.createConversion({
                    product: productId,
                    from_unit: formData.unit_base,
                    to_unit: formData.unit_sale,
                    multiplier: Number(formData.multiplier),
                });
            }

            // 3. Price (if sale price provided)
            if (formData.sale_price) {
                await api.createProductPrice({
                    pharmacy: pharmacyId,
                    product: productId,
                    sale_price: Number(formData.sale_price),
                    currency: formData.currency,
                });
            }

            // 4. Initial stock lot (if quantity provided)
            if (formData.quantity) {
                await api.createLot({
                    pharmacy: pharmacyId,
                    product: productId,
                    batch_number: formData.lot_number || `BATCH-${Date.now()}`,
                    expiration_date: formData.expiry_date
                        || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    unit: formData.unit_base,
                    quantity: Number(formData.quantity),
                    purchase_price: Number(formData.purchase_price) || 0,
                });
            }

            setMessage({ text: 'Produit créé avec succès !', type: 'success' });
            setTimeout(() => router.push('/products_list'), 1500);
        } catch (error: unknown) {
            console.error('Save error:', error);
            setMessage({
                text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création.',
                type: 'danger',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Helper: label for a unit ID
    const unitLabel = (id: string) => units.find(u => u.id === id)?.label || id;
    const categoryLabel = (id: string) => categories.find(c => c.id === id)?.name || id;
    const galenicLabel = (id: string) => galenics.find(g => g.id === id)?.name || id;

    return (
        <div className="bg-white min-vh-100">
            <style jsx>{`
                /* Autocomplete dropdown */
                .autocomplete-wrapper { position: relative; }
                .autocomplete-dropdown {
                    position: absolute;
                    top: calc(100% + 2px);
                    left: 0;
                    right: 0;
                    z-index: 1050;
                    background: #fff;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    max-height: 280px;
                    overflow-y: auto;
                }
                .autocomplete-item {
                    padding: 10px 14px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    transition: background 0.15s;
                }
                .autocomplete-item:last-child { border-bottom: none; }
                .autocomplete-item:hover { background: #f0fdf4; }
                .autocomplete-name { font-weight: 600; font-size: 0.875rem; color: #1f2937; }
                .autocomplete-meta { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }
                .autocomplete-badge {
                    display: inline-block;
                    background: #dcfce7;
                    color: #166534;
                    border-radius: 4px;
                    padding: 1px 6px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    margin-right: 4px;
                }
                /* Section divider */
                .form-section-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #3ab047;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e9ecef;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .prefilled-hint {
                    display: inline-block;
                    background: #fff3cd;
                    color: #856404;
                    border-radius: 4px;
                    padding: 2px 8px;
                    font-size: 0.72rem;
                    font-weight: 500;
                    margin-left: 6px;
                }
                .suggestion-header {
                    padding: 8px 14px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #9ca3af;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    border-radius: 8px 8px 0 0;
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
                                <li className="breadcrumb-item"><Link href="/products_list">Produits</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Ajouter Médicament</li>
                            </ol>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-xl-9">
                            <div className="card custom-card shadow-sm border-0">
                                <div className="card-body p-md-5 p-4">

                                    {message.text && (
                                        <div className={`alert alert-${message.type} mb-4`} role="alert">
                                            {message.type === 'success'
                                                ? <i className="ri-checkbox-circle-line me-2"></i>
                                                : <i className="ri-error-warning-line me-2"></i>}
                                            {message.text}
                                        </div>
                                    )}

                                    {loadingRefs ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Chargement des données...</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="row gy-3">

                                            <div className="col-12">
                                                <div className="form-section-title">
                                                    <i className="ri-image-line"></i>
                                                    Image du Produit
                                                </div>
                                                <div className="row align-items-center">
                                                    <div className="col-auto">
                                                        <div 
                                                            className="rounded-3 border d-flex align-items-center justify-content-center bg-light overflow-hidden" 
                                                            style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                                                            onClick={() => document.getElementById('product_image')?.click()}
                                                        >
                                                            {/* eslint-disable @next/next/no-img-element */}
                                                            {imagePreview ? (
                                                                <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <i className="ri-image-add-line fs-32 text-muted"></i>
                                                            )}
                                                            {/* eslint-enable @next/next/no-img-element */}
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <label htmlFor="product_image" className="form-label mb-1">Photo du produit</label>
                                                        <input 
                                                            type="file" 
                                                            className="form-control" 
                                                            id="product_image" 
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                        <div className="form-text fs-12 mt-1">Format recommandé: PNG, JPG ou WebP. Max 2Mo.</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── SECTION 1: Informations générales ── */}
                                            <div className="col-12">
                                                <div className="form-section-title">
                                                    <i className="ri-medicine-bottle-line"></i>
                                                    Informations Générales
                                                </div>
                                            </div>

                                            {/* Name field with autocomplete */}
                                            <div className="col-xl-12">
                                                <label htmlFor="name" className="form-label">
                                                    Nom du Produit *
                                                    {formData.name && (
                                                        <span className="prefilled-hint">
                                                            <i className="ri-search-line me-1"></i>Suggestion disponible
                                                        </span>
                                                    )}
                                                </label>
                                                <div className="autocomplete-wrapper" ref={nameRef}>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.includes('name') ? 'is-invalid' : ''}`}
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={handleNameChange}
                                                        onFocus={() => nameSuggestions.length > 0 && setShowNameDropdown(true)}
                                                        placeholder="Ex: Paracetamol — commencez à taper pour voir des suggestions"
                                                        autoComplete="off"
                                                    />
                                                    {errors.includes('name') && (
                                                        <div className="invalid-feedback">Le nom est obligatoire.</div>
                                                    )}
                                                    {showNameDropdown && (
                                                        <div className="autocomplete-dropdown">
                                                            <div className="suggestion-header">
                                                                <i className="ri-database-line me-1"></i>
                                                                Produits existants — cliquez pour pré-remplir le formulaire
                                                            </div>
                                                            {nameSuggestions.map(p => (
                                                                <div
                                                                    key={p.id}
                                                                    className="autocomplete-item"
                                                                    onMouseDown={(e) => { e.preventDefault(); fillFromProduct(p); }}
                                                                >
                                                                    <div className="autocomplete-name">{p.name}</div>
                                                                    <div className="autocomplete-meta">
                                                                        {p.dci && <span className="autocomplete-badge">DCI: {p.dci}</span>}
                                                                        {p.dosage && <span className="autocomplete-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Dosage: {p.dosage}</span>}
                                                                        {p.galenic_detail && <span style={{ color: '#6b7280' }}>{p.galenic_detail.name}</span>}
                                                                        {p.category_detail && <span style={{ color: '#9ca3af' }}> · {p.category_detail.name}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* DCI field with autocomplete */}
                                            <div className="col-xl-6">
                                                <label htmlFor="dci" className="form-label">DCI (Dénomination Commune Internationale)</label>
                                                <div className="autocomplete-wrapper" ref={dciRef}>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="dci"
                                                        value={formData.dci}
                                                        onChange={handleDciChange}
                                                        onFocus={() => dciSuggestions.length > 0 && setShowDciDropdown(true)}
                                                        placeholder="Ex: Paracetamol"
                                                        autoComplete="off"
                                                    />
                                                    {showDciDropdown && (
                                                        <div className="autocomplete-dropdown">
                                                            <div className="suggestion-header">
                                                                <i className="ri-database-line me-1"></i>
                                                                Produits existants par DCI
                                                            </div>
                                                            {dciSuggestions.map(p => (
                                                                <div
                                                                    key={p.id}
                                                                    className="autocomplete-item"
                                                                    onMouseDown={(e) => { e.preventDefault(); fillFromProduct(p); }}
                                                                >
                                                                    <div className="autocomplete-name">{p.name}</div>
                                                                    <div className="autocomplete-meta">
                                                                        {p.dci && <span className="autocomplete-badge">DCI: {p.dci}</span>}
                                                                        {p.dosage && <span className="autocomplete-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Dosage: {p.dosage}</span>}
                                                                        {p.unit_base_detail && <span style={{ color: '#6b7280' }}>{p.unit_base_detail.label}</span>}
                                                                        {p.category_detail && <span style={{ color: '#9ca3af' }}> · {p.category_detail.name}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-xl-6">
                                                <label htmlFor="dosage" className="form-label">Dosage</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="dosage"
                                                    value={formData.dosage}
                                                    onChange={handleChange}
                                                    placeholder="Ex: 500mg"
                                                />
                                            </div>

                                            <div className="col-xl-6">
                                                <label htmlFor="category" className="form-label">Catégorie *</label>
                                                <select
                                                    className={`form-control ${errors.includes('category') ? 'is-invalid' : ''}`}
                                                    id="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Sélectionner une catégorie</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                {errors.includes('category') && (
                                                    <div className="invalid-feedback">La catégorie est obligatoire.</div>
                                                )}
                                                {formData.category && !errors.includes('category') && (
                                                    <div className="form-text text-success">
                                                        <i className="ri-check-line me-1"></i>
                                                        {categoryLabel(formData.category)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-xl-6">
                                                <label htmlFor="galenic" className="form-label">Forme Galénique *</label>
                                                <select
                                                    className={`form-control ${errors.includes('galenic') ? 'is-invalid' : ''}`}
                                                    id="galenic"
                                                    value={formData.galenic}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Sélectionner une forme</option>
                                                    {galenics.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name}</option>
                                                    ))}
                                                </select>
                                                {errors.includes('galenic') && (
                                                    <div className="invalid-feedback">La forme galénique est obligatoire.</div>
                                                )}
                                                {formData.galenic && !errors.includes('galenic') && (
                                                    <div className="form-text text-success">
                                                        <i className="ri-check-line me-1"></i>
                                                        {galenicLabel(formData.galenic)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── SECTION 2: Unités et Prix ── */}
                                            <div className="col-12 mt-2">
                                                <div className="form-section-title">
                                                    <i className="ri-scales-line"></i>
                                                    Unités &amp; Prix
                                                </div>
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="unit_base" className="form-label">Unité de Base *</label>
                                                <select
                                                    className={`form-control ${errors.includes('unit_base') ? 'is-invalid' : ''}`}
                                                    id="unit_base"
                                                    value={formData.unit_base}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Sélectionner</option>
                                                    {units.map(u => (
                                                        <option key={u.id} value={u.id}>{u.label}</option>
                                                    ))}
                                                </select>
                                                {errors.includes('unit_base') && (
                                                    <div className="invalid-feedback">Obligatoire.</div>
                                                )}
                                                <div className="form-text">
                                                    Plus petite unité (ex: Comprimé)
                                                    {formData.unit_base && <> — <strong className="text-success">{unitLabel(formData.unit_base)}</strong></>}
                                                </div>
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="unit_sale" className="form-label">Unité de Vente *</label>
                                                <select
                                                    className={`form-control ${errors.includes('unit_sale') ? 'is-invalid' : ''}`}
                                                    id="unit_sale"
                                                    value={formData.unit_sale}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Sélectionner</option>
                                                    {units.map(u => (
                                                        <option key={u.id} value={u.id}>{u.label}</option>
                                                    ))}
                                                </select>
                                                {errors.includes('unit_sale') && (
                                                    <div className="invalid-feedback">Obligatoire.</div>
                                                )}
                                                <div className="form-text">
                                                    Vendue au client (ex: Boîte)
                                                    {formData.unit_sale && <> — <strong className="text-success">{unitLabel(formData.unit_sale)}</strong></>}
                                                </div>
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="unit_purchase" className="form-label">Unité d&apos;Achat *</label>
                                                <select
                                                    className={`form-control ${errors.includes('unit_purchase') ? 'is-invalid' : ''}`}
                                                    id="unit_purchase"
                                                    value={formData.unit_purchase}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Sélectionner</option>
                                                    {units.map(u => (
                                                        <option key={u.id} value={u.id}>{u.label}</option>
                                                    ))}
                                                </select>
                                                {errors.includes('unit_purchase') && (
                                                    <div className="invalid-feedback">Obligatoire.</div>
                                                )}
                                                <div className="form-text">
                                                    Achetée au fournisseur (ex: Carton)
                                                    {formData.unit_purchase && <> — <strong className="text-success">{unitLabel(formData.unit_purchase)}</strong></>}
                                                </div>
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="multiplier" className="form-label">Multiplicateur (Conversion)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="multiplier"
                                                    value={formData.multiplier}
                                                    onChange={handleChange}
                                                    placeholder="Ex: 30"
                                                    min="1"
                                                />
                                                <div className="form-text">Unités de base dans une unité de vente</div>
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="purchase_price" className="form-label">Prix d&apos;Achat</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="purchase_price"
                                                    value={formData.purchase_price}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="col-xl-4">
                                                <label htmlFor="sale_price" className="form-label">Prix de Vente</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="sale_price"
                                                    value={formData.sale_price}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="col-xl-12">
                                                <label htmlFor="currency" className="form-label">Devise</label>
                                                <select
                                                    className="form-control"
                                                    id="currency"
                                                    value={formData.currency}
                                                    onChange={handleChange}
                                                >
                                                    <option value="XAF">XAF (Franc CFA)</option>
                                                    <option value="EUR">EUR (Euro)</option>
                                                    <option value="USD">USD (Dollar)</option>
                                                </select>
                                            </div>

                                            {/* ── SECTION 3: Stock Initial ── */}
                                            <div className="col-12 mt-2">
                                                <div className="form-section-title">
                                                    <i className="ri-stack-line"></i>
                                                    Stock Initial
                                                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.78rem', color: '#6c757d' }}>
                                                        (optionnel)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-xl-6">
                                                <label htmlFor="quantity" className="form-label">Quantité Initiale</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="col-xl-6">
                                                <label htmlFor="expiry_date" className="form-label">Date de Péremption</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="expiry_date"
                                                    value={formData.expiry_date}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="col-xl-12">
                                                <label htmlFor="lot_number" className="form-label">Numéro de Lot</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lot_number"
                                                    value={formData.lot_number}
                                                    onChange={handleChange}
                                                    placeholder="Ex: LOT2024-001"
                                                />
                                            </div>

                                            <div className="col-xl-12">
                                                <label htmlFor="notes" className="form-label">Notes / Remarques</label>
                                                <textarea
                                                    className="form-control"
                                                    id="notes"
                                                    rows={3}
                                                    value={formData.notes}
                                                    onChange={handleChange}
                                                    placeholder="Informations complémentaires..."
                                                />
                                            </div>

                                            {/* Action buttons */}
                                            <div className="col-12 mt-3">
                                                <div className="d-flex gap-2">
                                                    <Link href="/products_list" className="btn btn-light flex-fill">
                                                        <i className="ri-arrow-left-line me-2"></i>Annuler
                                                    </Link>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary flex-fill"
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Création en cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="ri-save-line me-2"></i>
                                                                Créer le Produit
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                        </form>
                                    )}
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
