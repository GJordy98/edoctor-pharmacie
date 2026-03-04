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

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  step,
  disabled,
  required,
  name,
}: {
  type?: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  step?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      disabled={disabled}
      required={required}
      className={`w-full px-3.5 py-2.5 text-[13px] border rounded-xl text-[#1E293B] transition-colors focus:outline-none ${disabled
        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20'
        }`}
    />
  );
}

function SectionHeader({ icon: Icon, label, color = 'text-[#22C55E]', bg = 'bg-[#F0FDF4]' }: {
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

  // Raw data (garder les IDs nécessaires)
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);
  const [lotId, setLotId] = useState<string | null>(null);

  // Infos produit
  const [productForm, setProductForm] = useState({
    name: '',
    dci: '',
    dosage: '',
  });

  // Prix & devise  
  const [priceForm, setPriceForm] = useState({
    sale_price: '',
    currency: 'XAF',
  });

  // Stock / lot
  const [stockForm, setStockForm] = useState({
    quantity: '',
    purchase_price: '',
    expiration_date: '',
    batch_number: '',
  });

  // Image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* ─── chargement ─── */
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger les infos product-price (prix + produit embarqué)
      const data = await api.getProductPrice(productPriceId) as Record<string, unknown>;
      setRawData(data);

      const product = data.product as Record<string, unknown> | undefined;
      const internalProductId = product?.id ? String(product.id) : null;

      setProductForm({
        name: (product?.name as string) || '',
        dci: (product?.dci as string) || '',
        dosage: (product?.dosage as string) || '',
      });

      setPriceForm({
        sale_price: String(data.sale_price ?? ''),
        currency: (data.currency as string) || 'XAF',
      });

      setImagePreview((product?.image as string) || null);

      // ── Chercher le lot dans toutes les positions possibles ──
      // L'API peut l'emboîter à différents endroits selon la version du backend
      const lotCandidates: (Record<string, unknown> | undefined)[] = [
        data.lot as Record<string, unknown> | undefined,
        Array.isArray(data.lots) ? (data.lots as Record<string, unknown>[])[0] : undefined,
        data.stock as Record<string, unknown> | undefined,
        data.stock_lot as Record<string, unknown> | undefined,
        product?.lot as Record<string, unknown> | undefined,
        Array.isArray(product?.lots) ? (product?.lots as Record<string, unknown>[])[0] : undefined,
      ];

      const embeddedLot = lotCandidates.find((c) => c && c.id != null);

      if (embeddedLot) {
        setLotId(String(embeddedLot.id));
        setStockForm({
          quantity: String(embeddedLot.quantity ?? ''),
          purchase_price: String(embeddedLot.purchase_price ?? ''),
          expiration_date: String(embeddedLot.expiration_date ?? ''),
          batch_number: String(embeddedLot.batch_number ?? ''),
        });
      } else {
        // Aucun lot embarqué → essayer getLotById avec l'ID du produit interne,
        // puis avec l'ID du product-price en dernier recours
        const idsToTry = [internalProductId, productPriceId].filter(Boolean) as string[];
        let resolved = false;

        for (const tryId of idsToTry) {
          try {
            const lotData = await api.getLotById(tryId) as Record<string, unknown>;
            if (lotData?.id) {
              setLotId(String(lotData.id));
              setStockForm({
                quantity: String(lotData.quantity ?? ''),
                purchase_price: String(lotData.purchase_price ?? ''),
                expiration_date: String(lotData.expiration_date ?? ''),
                batch_number: String(lotData.batch_number ?? ''),
              });
              resolved = true;
              break; // On a trouvé un lot, on arrête
            }
          } catch {
            // try next ID
          }
        }

        if (!resolved) {
          // Dernier essai : stock directement sur le product
          const stockQty =
            (product?.stock as string | number | undefined) ??
            (product?.quantity as string | number | undefined);

          if (stockQty != null) {
            setStockForm((prev) => ({ ...prev, quantity: String(stockQty) }));
          }
          // lotId reste null → champs stock affichés avec valeurs lues mais désactivés pour la sauvegarde
        }
      }
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
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const parentProduct = rawData?.product as Record<string, unknown> | undefined;

      // 1. Mettre à jour product-price (prix + infos produit)
      const formDataPayload = new FormData();
      formDataPayload.append('sale_price', priceForm.sale_price);
      formDataPayload.append('currency', priceForm.currency);

      if (parentProduct?.id) {
        formDataPayload.append('product[id]', String(parentProduct.id));
        formDataPayload.append('product[name]', productForm.name);
        formDataPayload.append('product[dci]', productForm.dci);
        formDataPayload.append('product[dosage]', productForm.dosage);
      }

      if (selectedImage) {
        formDataPayload.append('product[image]', selectedImage);
      }

      await api.updateProductPrice(productPriceId, formDataPayload);

      // 2. Mettre à jour le lot si stock renseigné
      if (lotId && stockForm.quantity) {
        try {
          await api.updateProduct(lotId, {
            quantity: parseFloat(stockForm.quantity),
            ...(stockForm.purchase_price ? { purchase_price: parseFloat(stockForm.purchase_price) } : {}),
            ...(stockForm.expiration_date ? { expiration_date: stockForm.expiration_date } : {}),
            ...(stockForm.batch_number ? { batch_number: stockForm.batch_number } : {}),
          });
        } catch {
          // Erreur non-bloquante sur le lot
        }
      }

      setSuccess('Produit mis à jour avec succès !');
      setTimeout(() => router.push('/products_list'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du produit.');
    } finally {
      setSaving(false);
    }
  };

  /* ─── loading ─── */
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
                <h2 className="text-[16px] font-semibold text-[#1E293B]">
                  Modifier le produit
                </h2>
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

          {/* ═══════════════════════════ */}
          {/* A. IMAGE + INFOS PRODUIT    */}
          {/* ═══════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-5">
            <SectionHeader icon={Package} label="Informations du produit" />

            {/* Image */}
            <div className="flex items-start gap-5">
              {/* Aperçu */}
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
                <label className="block text-[13px] font-semibold text-[#1E293B]">
                  Image du produit
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#E2E8F0] rounded-xl text-[#64748B] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors"
                >
                  <ImageIcon size={14} />
                  {imagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                </button>
                <p className="text-[11px] text-[#94A3B8]">
                  Cliquez sur l&apos;aperçu ou le bouton pour choisir une image (JPG, PNG…)
                </p>
              </div>
            </div>

            {/* Nom & DCI & Dosage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nom du produit" required>
                  <Input
                    name="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex : Paracétamol"
                    required
                  />
                </Field>
              </div>
              <Field label="DCI (Dénomination Commune Internationale)">
                <Input
                  name="dci"
                  value={productForm.dci}
                  onChange={(e) => setProductForm(p => ({ ...p, dci: e.target.value }))}
                  placeholder="Ex : Paracétamol"
                />
              </Field>
              <Field label="Dosage">
                <Input
                  name="dosage"
                  value={productForm.dosage}
                  onChange={(e) => setProductForm(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="Ex : 500 mg"
                />
              </Field>
            </div>
          </div>

          {/* ═══════════════════════════ */}
          {/* B. PRIX DE VENTE            */}
          {/* ═══════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Tag} label="Prix de vente" color="text-purple-500" bg="bg-purple-50" />

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
                  className="w-full px-3.5 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl text-[#1E293B] bg-white hover:border-[#CBD5E1] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="XAF">XAF — Franc CFA</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar US</option>
                </select>
              </Field>
            </div>
          </div>

          {/* ═══════════════════════════ */}
          {/* C. STOCK / LOT              */}
          {/* ═══════════════════════════ */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Boxes} label="Stock & Lot" color="text-blue-500" bg="bg-blue-50" />

            {!lotId && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
                <FlaskConical size={14} className="shrink-0" />
                Aucun lot de stock trouvé pour ce produit. Vous pouvez en créer un depuis la liste des produits.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Quantité en stock" hint={lotId ? undefined : 'Aucun lot associé'}>
                <Input
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm(p => ({ ...p, quantity: e.target.value }))}
                  placeholder="Ex : 100"
                  min="0"
                  step="1"
                  disabled={!lotId}
                />
              </Field>

              <Field label="Prix d'achat (optionnel)">
                <Input
                  type="number"
                  value={stockForm.purchase_price}
                  onChange={(e) => setStockForm(p => ({ ...p, purchase_price: e.target.value }))}
                  placeholder="Ex : 300"
                  min="0"
                  step="1"
                  disabled={!lotId}
                />
              </Field>

              <Field label="Numéro de lot">
                <Input
                  value={stockForm.batch_number}
                  onChange={(e) => setStockForm(p => ({ ...p, batch_number: e.target.value }))}
                  placeholder="Ex : LOT-2024-001"
                  disabled={!lotId}
                />
              </Field>

              <Field label="Date d'expiration">
                <Input
                  type="date"
                  value={stockForm.expiration_date}
                  onChange={(e) => setStockForm(p => ({ ...p, expiration_date: e.target.value }))}
                  disabled={!lotId}
                />
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
