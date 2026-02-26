'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api-client';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productPriceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    productName: '',
    dci: '',
    dosage: '',
    galenic: '',
    salePriceValue: '',
    currency: 'XAF',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Raw data from API (to preserve IDs we don't edit)
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (productPriceId) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productPriceId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use getProductPrice instead of getLotById
      const response = await api.getProductPrice(productPriceId);
      const data = response as Record<string, unknown>;
      setRawData(data);

      const nestedProduct = data.product as Record<string, unknown> | undefined;

      setFormData({
        productName: (nestedProduct?.name as string) || '',
        dci: (nestedProduct?.dci as string) || '',
        dosage: (nestedProduct?.dosage as string) || '',
        galenic: (nestedProduct?.galenic as string) || '',
        salePriceValue: (data.sale_price as string) || '',
        currency: (data.currency as string) || 'XAF',
      });
      setCurrentImageUrl((nestedProduct?.image as string) || null);
      setImagePreview((nestedProduct?.image as string) || null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error loading product:', error);
      setError(error.message || 'Erreur lors du chargement du produit.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const parentProduct = rawData?.product as Record<string, unknown> | undefined;

      // Build update payload using FormData for image support
      const formDataPayload = new FormData();
      formDataPayload.append('sale_price', formData.salePriceValue);
      formDataPayload.append('currency', formData.currency);
      
      // We send the product data as a JSON string for the nested object if using application/json
      // BUT for multipart/form-data with DRF and nested serializers, it's often better to prefix
      // However, ApiClient expects a FormData object. 
      // Let's structure the product fields as keys
      formDataPayload.append('product[id]', String(parentProduct?.id));
      formDataPayload.append('product[name]', formData.productName);
      formDataPayload.append('product[dci]', formData.dci);
      formDataPayload.append('product[dosage]', formData.dosage);
      formDataPayload.append('product[galenic]', formData.galenic);
      
      if (selectedImage) {
        formDataPayload.append('product[image]', selectedImage);
      }

      await api.updateProductPrice(productPriceId, formDataPayload);
      setSuccess('Produit mis à jour avec succès !');
      
      // Redirect after short delay
      setTimeout(() => router.push('/products'), 1500);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error updating product:', error);
      setError(error.message || 'Erreur lors de la mise à jour du produit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Header />
      <Sidebar />

      <div className="main-content app-content">
        <div className="container-fluid page-container main-body-container">

          {/* Page Header */}
          <div className="page-header-breadcrumb mb-3">
            <div className="d-flex align-center justify-content-between flex-wrap">
              <h1 className="page-title fw-medium fs-18 mb-0">Modifier le Produit</h1>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                <li className="breadcrumb-item"><Link href="/products_list">Produits</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Modifier</li>
              </ol>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="ri-error-warning-line me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="ri-check-double-line me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess(null)} aria-label="Close"></button>
            </div>
          )}

          {loading ? (
            <div className="card custom-card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-muted mt-3">Chargement des données du produit...</p>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-xl-8 mx-auto">
                <div className="card custom-card">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <div className="card-title">Informations du Produit</div>
                    <Link href="/products_list" className="btn btn-sm btn-outline-secondary">
                      <i className="ri-arrow-left-line me-1"></i>Retour
                    </Link>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>

                      {/* Image Upload */}
                      <div className="row mb-4 align-items-center">
                        <label className="col-sm-3 col-form-label fw-medium">
                          Image du Produit
                        </label>
                        <div className="col-sm-9">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="rounded-3 border d-flex align-items-center justify-content-center bg-light overflow-hidden" 
                              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              {/* imagePreview may be a blob URL (local file) or a server URL.
                                  We use plain img for both since next/image doesn't support blob: URLs */}
                              {/* eslint-disable @next/next/no-img-element */}
                              {imagePreview ? (
                                <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <i className="ri-image-add-line fs-32 text-muted"></i>
                              )}
                              {/* eslint-enable @next/next/no-img-element */}
                            </div>
                            <div className="flex-fill">
                              <input 
                                type="file" 
                                className="form-control" 
                                id="image-upload" 
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                              <div className="form-text fs-12 mt-1">
                                {currentImageUrl ? 'Changez l\'image du produit.' : 'Ajoutez une image pour ce produit.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Name */}
                      <div className="row mb-3">
                        <label htmlFor="productName" className="col-sm-3 col-form-label fw-medium">
                          Nom du Produit <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Paracetamol"
                          />
                        </div>
                      </div>

                      {/* DCI */}
                      <div className="row mb-3">
                        <label htmlFor="dci" className="col-sm-3 col-form-label fw-medium">
                          DCI
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            id="dci"
                            name="dci"
                            value={formData.dci}
                            onChange={handleChange}
                            placeholder="Ex: Paracétamol"
                          />
                        </div>
                      </div>

                      {/* Dosage */}
                      <div className="row mb-3">
                        <label htmlFor="dosage" className="col-sm-3 col-form-label fw-medium">
                          Dosage
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            id="dosage"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            placeholder="Ex: 500mg"
                          />
                        </div>
                      </div>

                      {/* Galenic Form */}
                      <div className="row mb-3">
                        <label htmlFor="galenic" className="col-sm-3 col-form-label fw-medium">
                          Forme Galénique
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            id="galenic"
                            name="galenic"
                            value={formData.galenic}
                            onChange={handleChange}
                            placeholder="Ex: Comprimé / Tablet"
                          />
                        </div>
                      </div>

                      <hr className="my-4" />

                      {/* Sale Price */}
                      <div className="row mb-3">
                        <label htmlFor="salePriceValue" className="col-sm-3 col-form-label fw-medium">
                          Prix de Vente <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              id="salePriceValue"
                              name="salePriceValue"
                              value={formData.salePriceValue}
                              onChange={handleChange}
                              required
                              min="0"
                              step="0.01"
                              placeholder="Ex: 500"
                            />
                            <span className="input-group-text">{formData.currency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Currency */}
                      <div className="row mb-3">
                        <label htmlFor="currency" className="col-sm-3 col-form-label fw-medium">
                          Devise
                        </label>
                        <div className="col-sm-9">
                          <select
                            className="form-select"
                            id="currency"
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                          >
                            <option value="XAF">XAF (Franc CFA)</option>
                            <option value="EUR">EUR (Euro)</option>
                            <option value="USD">USD (Dollar US)</option>
                          </select>
                        </div>
                      </div>

                      <hr className="my-4" />

                      {/* Product ID (read-only info) */}
                      <div className="row mb-3">
                        <label className="col-sm-3 col-form-label fw-medium text-muted">
                          ID du Lot
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={productPriceId}
                            disabled
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <Link href="/products_list" className="btn btn-outline-secondary">
                          <i className="ri-close-line me-1"></i>Annuler
                        </Link>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <i className="ri-save-line me-1"></i>Enregistrer les modifications
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
