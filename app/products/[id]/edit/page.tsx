'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  Tag,
  Image as ImageIcon,
  RefreshCw,
  FlaskConical,
  Boxes,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Category, Galenic, Unit } from '@/lib/types';
import DashboardLayout from '@/components/layout/DashboardLayout';

/* ─── helpers ─── */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-[#1E293B]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 text-[13px] border rounded-xl text-[#1E293B] bg-white border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none transition-colors';

function SectionHeader({
  icon: Icon,
  label,
  color = 'text-[#22C55E]',
  bg = 'bg-[#F0FDF4]',
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={color} />
      </div>
      <h3 className="text-[14px] font-semibold text-[#1E293B]">{label}</h3>
    </div>
  );
}

/* ─── page ─── */
export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const productPriceId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ID du produit réel (pas le product-price)
  const [productId, setProductId] = useState<string | null>(null);

  // Listes de référence pour les selects
  const [categories, setCategories] = useState<Category[]>([]);
  const [galenics, setGalenics] = useState<Galenic[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Formulaire produit
  const [productForm, setProductForm] = useState({
    name: '',
    dci: '',
    dosage: '',
    category: '',
    galenic: '',
    unit_base: '',
    unit_sale: '',
    unit_purchase: '',
  });

  // Prix
  const [priceForm, setPriceForm] = useState({
    sale_price: '',
    currency: 'XAF',
  });

  // Image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* ─── chargement des listes de référence ─── */
  useEffect(() => {
    api.getCategories()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch((e) => console.warn('[edit] categories:', e));

    api.getGalenics()
      .then((gals) => setGalenics(Array.isArray(gals) ? gals : []))
      .catch((e) => console.warn('[edit] galenics:', e));

    api.getUnits()
      .then((us) => setUnits(Array.isArray(us) ? us : []))
      .catch((e) => console.warn('[edit] units:', e));
  }, []);

  /* ─── chargement du produit ─── */
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Étape 1 : charger le product-price pour obtenir l'ID produit et le prix
      const priceData = await api.getProductPrice(productPriceId) as Record<string, unknown>;

      const priceProduct = priceData.product as Record<string, unknown> | undefined;
      const rawProductId = priceProduct?.id ? String(priceProduct.id) : null;

      if (!rawProductId) {
        throw new Error('Impossible de trouver les informations du produit.');
      }

      setProductId(rawProductId);

      setPriceForm({
        sale_price: String(priceData.sale_price ?? ''),
        currency:   String(priceData.currency ?? 'XAF'),
      });

      // Étape 2 : charger le produit directement pour avoir les vrais UUIDs des FK
      // GET /api/v1/products/{id}/ retourne category, galenic, unit_base, etc. directement
      let product: Record<string, unknown> = priceProduct ?? {};
      try {
        const fullProduct = await api.getProductById(rawProductId);
        if (fullProduct?.id) product = fullProduct;
      } catch {
        // Fallback sur les données déjà dans priceProduct
        console.warn('[edit] Could not load full product, using embedded data');
      }

      // Helper : lit l'UUID direct ou depuis l'objet _detail
      const uuid = (direct: unknown, detail: unknown): string => {
        if (direct && direct !== 'undefined' && direct !== 'null' && direct !== '') return String(direct);
        const d = detail as Record<string, unknown> | undefined;
        if (d?.id) return String(d.id);
        return '';
      };

      setProductForm({
        name:          String(product.name ?? ''),
        dci:           String(product.dci ?? ''),
        dosage:        String(product.dosage ?? ''),
        category:      uuid(product.category,      product.category_detail),
        galenic:       uuid(product.galenic,        product.galenic_detail),
        unit_base:     uuid(product.unit_base,      product.unit_base_detail),
        unit_sale:     uuid(product.unit_sale,      product.unit_sale_detail),
        unit_purchase: uuid(product.unit_purchase,  product.unit_purchase_detail),
      });

      setImagePreview((product.image as string) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit.');
    } finally {
      setLoading(false);
    }
  }, [productPriceId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /* ─── image ─── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ─── sauvegarde ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('ID du produit introuvable. Veuillez recharger la page.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Mettre à jour le produit → PUT /api/v1/products/{id}/
      const productPayload: Record<string, unknown> = {
        name: productForm.name,
        dci: productForm.dci,
        dosage: productForm.dosage,
        ...(productForm.category ? { category: productForm.category } : {}),
        ...(productForm.galenic ? { galenic: productForm.galenic } : {}),
        ...(productForm.unit_base ? { unit_base: productForm.unit_base } : {}),
        ...(productForm.unit_sale ? { unit_sale: productForm.unit_sale } : {}),
        ...(productForm.unit_purchase ? { unit_purchase: productForm.unit_purchase } : {}),
      };

      await api.updateProductById(productId, productPayload);

      // 2. Mettre à jour le prix + image → PATCH /api/v1/product-price/{id}/
      const pricePayload = new FormData();
      pricePayload.append('sale_price', priceForm.sale_price);
      pricePayload.append('currency', priceForm.currency);
      if (selectedImage) {
        pricePayload.append('image', selectedImage, selectedImage.name);
      }

      await api.updateProductPrice(productPriceId, pricePayload);

      setSuccess('Produit mis à jour avec succès !');
      setTimeout(() => router.push('/products_list'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du produit.');
    } finally {
      setSaving(false);
    }
  };

  /* ─── chargement ─── */
  if (loading) {
    return (
      <DashboardLayout title="Modifier le produit">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#22C55E]" />
          </div>
          <p className="text-[14px] text-[#94A3B8]">Chargement du produit…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Modifier le produit">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 animate-fade-in-up max-w-3xl mx-auto">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/products_list')}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B] hover:border-[#1E293B] transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-[16px] font-semibold text-[#1E293B]">Modifier le produit</h2>
                <nav className="flex items-center gap-1 text-[12px] text-[#94A3B8] mt-0.5">
                  <Link href="/products_list" className="hover:text-[#22C55E]">Produits</Link>
                  <span>/</span>
                  <span>Modification</span>
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadProduct}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#94A3B8] hover:text-[#22C55E] hover:border-[#22C55E] transition-colors"
                title="Recharger"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#22C55E] hover:bg-[#16A34A] text-white transition-colors disabled:opacity-50 shadow-lg shadow-green-200"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {/* ── Alertes ── */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">✕</button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F0FDF4] border border-green-200 rounded-2xl text-[13px] text-[#16A34A]">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ═══════════════════════════════ */}
          {/* A. IMAGE + INFOS DE BASE        */}
          {/* ═══════════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-5">
            <SectionHeader icon={Package} label="Informations du produit" />

            {/* Image */}
            <div className="flex items-start gap-5">
              <button
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#E2E8F0] hover:border-[#22C55E] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center shrink-0 overflow-hidden"
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <ImageIcon size={28} className="text-[#CBD5E1]" />
                )}
              </button>
              <div className="flex-1 space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#1E293B]">Image du produit</label>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#E2E8F0] rounded-xl text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors"
                >
                  <ImageIcon size={14} />
                  {imagePreview ? "Changer l'image" : 'Ajouter une image'}
                </button>
                <p className="text-[11px] text-[#94A3B8]">Cliquez sur l&apos;aperçu ou le bouton pour choisir une image (JPG, PNG…)</p>
              </div>
            </div>

            {/* Nom, DCI, Dosage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nom du produit" required>
                  <input
                    className={inputCls}
                    value={productForm.name}
                    onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex : Paracétamol"
                    required
                  />
                </Field>
              </div>
              <Field label="DCI (Dénomination Commune Internationale)">
                <input
                  className={inputCls}
                  value={productForm.dci}
                  onChange={(e) => setProductForm(p => ({ ...p, dci: e.target.value }))}
                  placeholder="Ex : Paracétamol"
                />
              </Field>
              <Field label="Dosage">
                <input
                  className={inputCls}
                  value={productForm.dosage}
                  onChange={(e) => setProductForm(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="Ex : 500 mg"
                />
              </Field>
            </div>
          </div>

          {/* ═══════════════════════════════ */}
          {/* B. CATÉGORIE & GALÉNIQUE        */}
          {/* ═══════════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <SectionHeader icon={FlaskConical} label="Catégorie & Forme galénique" color="text-purple-500" bg="bg-purple-50" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Catégorie">
                <select
                  className={inputCls + ' cursor-pointer'}
                  value={productForm.category}
                  onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="">— Sélectionner une catégorie —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Forme galénique">
                <select
                  className={inputCls + ' cursor-pointer'}
                  value={productForm.galenic}
                  onChange={(e) => setProductForm(p => ({ ...p, galenic: e.target.value }))}
                >
                  <option value="">— Sélectionner une galénique —</option>
                  {galenics.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* ═══════════════════════════════ */}
          {/* C. UNITÉS                       */}
          {/* ═══════════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Boxes} label="Unités" color="text-blue-500" bg="bg-blue-50" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Unité de base">
                <select
                  className={inputCls + ' cursor-pointer'}
                  value={productForm.unit_base}
                  onChange={(e) => setProductForm(p => ({ ...p, unit_base: e.target.value }))}
                >
                  <option value="">— Sélectionner —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label || u.code}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unité de vente">
                <select
                  className={inputCls + ' cursor-pointer'}
                  value={productForm.unit_sale}
                  onChange={(e) => setProductForm(p => ({ ...p, unit_sale: e.target.value }))}
                >
                  <option value="">— Sélectionner —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label || u.code}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unité d'achat">
                <select
                  className={inputCls + ' cursor-pointer'}
                  value={productForm.unit_purchase}
                  onChange={(e) => setProductForm(p => ({ ...p, unit_purchase: e.target.value }))}
                >
                  <option value="">— Sélectionner —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label || u.code}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* ═══════════════════════════════ */}
          {/* D. PRIX DE VENTE               */}
          {/* ═══════════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Tag} label="Prix de vente" color="text-amber-500" bg="bg-amber-50" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prix de vente" required>
                <div className="flex">
                  <input
                    type="number"
                    value={priceForm.sale_price}
                    onChange={(e) => setPriceForm(p => ({ ...p, sale_price: e.target.value }))}
                    placeholder="Ex : 500"
                    min="0"
                    step="1"
                    required
                    className="flex-1 px-3.5 py-2.5 text-[13px] border border-r-0 border-[#E2E8F0] rounded-l-xl text-[#1E293B] bg-white hover:border-[#CBD5E1] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none transition-colors"
                  />
                  <div className="flex items-center px-3.5 border border-l-0 border-[#E2E8F0] rounded-r-xl bg-[#F8FAFC] text-[13px] font-semibold text-[#64748B] shrink-0">
                    {priceForm.currency}
                  </div>
                </div>
              </Field>

              <Field label="Devise">
                <select
                  value={priceForm.currency}
                  onChange={(e) => setPriceForm(p => ({ ...p, currency: e.target.value }))}
                  className={inputCls + ' cursor-pointer'}
                >
                  <option value="XAF">XAF — Franc CFA</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar US</option>
                </select>
              </Field>
            </div>
          </div>

          {/* ── Boutons du bas ── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.push('/products_list')}
              className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-[#E2E8F0] text-[#94A3B8] hover:border-[#1E293B] hover:text-[#1E293B] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-[#22C55E] hover:bg-[#16A34A] text-white transition-colors disabled:opacity-50 shadow-lg shadow-green-200"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>

        </div>
      </form>
    </DashboardLayout>
  );
}
