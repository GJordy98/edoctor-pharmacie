"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ImagePlus,
  Pill,
  Scale,
  Package,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Category, Galenic, Unit, Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ── types ── */
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
}

/* ── helpers ── */
function SectionTitle({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0] mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
        <Icon size={14} className="text-[#22C55E]" />
      </div>
      <div>
        <span className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">{label}</span>
        {sub && <span className="ml-2 text-[11px] text-[#94A3B8]">({sub})</span>}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-[#94A3B8]">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          Ce champ est obligatoire
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  `w-full px-3.5 py-2.5 text-[13px] border rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white transition-colors ${
    err ? "border-red-400 focus:border-red-400" : "border-[#E2E8F0] focus:border-[#22C55E]"
  }`;

/* ── AutocompleteInput ── */
function AutocompleteInput({
  value,
  onChange,
  onFocus,
  suggestions,
  showDropdown,
  onSelect,
  containerRef,
  placeholder,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  suggestions: GlobalProduct[];
  showDropdown: boolean;
  onSelect: (p: GlobalProduct) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete="off"
        className={inputCls(error)}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <Database size={11} className="text-[#94A3B8]" />
            <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">
              Produits existants — cliquez pour pré-remplir
            </span>
          </div>
          {suggestions.map((p) => (
            <div
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(p); }}
              className="px-3 py-2.5 cursor-pointer hover:bg-[#F0FDF4] border-b border-[#F1F5F9] last:border-0 transition-colors"
            >
              <p className="text-[13px] font-semibold text-[#1E293B]">{p.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {p.dci && (
                  <span className="px-1.5 py-0.5 bg-[#F0FDF4] text-[#22C55E] text-[10px] font-medium rounded">
                    DCI: {p.dci}
                  </span>
                )}
                {p.dosage && (
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                    {p.dosage}
                  </span>
                )}
                {p.galenic_detail && (
                  <span className="text-[10px] text-[#94A3B8]">{p.galenic_detail.name}</span>
                )}
                {p.category_detail && (
                  <span className="text-[10px] text-[#94A3B8]">· {p.category_detail.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main component ── */
export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [galenics, setGalenics] = useState<Galenic[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [allProducts, setAllProducts] = useState<GlobalProduct[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<GlobalProduct[]>([]);
  const [dciSuggestions, setDciSuggestions] = useState<GlobalProduct[]>([]);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showDciDropdown, setShowDciDropdown] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);
  const dciRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    dci: "",
    dosage: "",
    category: "",
    galenic: "",
    unit_base: "",
    unit_sale: "",
    unit_purchase: "",
    purchase_price: "",
    sale_price: "",
    currency: "XAF",
    multiplier: "",
    quantity: "",
    expiry_date: "",
    lot_number: "",
    notes: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) setShowNameDropdown(false);
      if (dciRef.current && !dciRef.current.contains(e.target as Node)) setShowDciDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* load reference data */
  useEffect(() => {
    const load = async () => {
      try {
        const safeArr = (d: unknown): unknown[] => {
          if (Array.isArray(d)) return d;
          if (d && typeof d === "object") {
            if ("results" in d && Array.isArray((d as { results: unknown[] }).results))
              return (d as { results: unknown[] }).results;
          }
          return [];
        };
        const [cats, gals, uns, prods] = await Promise.all([
          api.getCategories(),
          api.getGalenics(),
          api.getUnits(),
          api.getAllProducts(),
        ]);
        setCategories(safeArr(cats) as Category[]);
        setGalenics(safeArr(gals) as Galenic[]);
        setUnits(safeArr(uns) as Unit[]);
        setAllProducts(safeArr(prods) as GlobalProduct[]);
      } catch {
        setMessage({ text: "Erreur lors du chargement des données de référence.", ok: false });
      } finally {
        setLoadingRefs(false);
      }
    };
    load();
  }, []);

  /* autocomplete fill */
  const fillFromProduct = useCallback((p: GlobalProduct) => {
    setFormData((prev) => ({
      ...prev,
      name: p.name || "",
      dci: p.dci || "",
      dosage: p.dosage || "",
      category: p.category || "",
      galenic: p.galenic || "",
      unit_base: p.unit_base || "",
      unit_sale: p.unit_sale || "",
      unit_purchase: p.unit_purchase || "",
    }));
    setErrors([]);
    setShowNameDropdown(false);
    setShowDciDropdown(false);
  }, []);

  /* field handlers */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFormData((p) => ({ ...p, name: v }));
    setErrors((p) => p.filter((x) => x !== "name"));
    if (v.trim().length >= 1) {
      const filtered = allProducts.filter((p) => p.name?.toLowerCase().includes(v.toLowerCase())).slice(0, 8);
      setNameSuggestions(filtered);
      setShowNameDropdown(filtered.length > 0);
    } else setShowNameDropdown(false);
  };

  const handleDciChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFormData((p) => ({ ...p, dci: v }));
    if (v.trim().length >= 1) {
      const filtered = allProducts.filter((p) => p.dci?.toLowerCase().includes(v.toLowerCase())).slice(0, 8);
      setDciSuggestions(filtered);
      setShowDciDropdown(filtered.length > 0);
    } else setShowDciDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
    setErrors((p) => p.filter((x) => x !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    if (!formData.name) newErrors.push("name");
    if (!formData.category) newErrors.push("category");
    if (!formData.galenic) newErrors.push("galenic");
    if (!formData.unit_base) newErrors.push("unit_base");
    if (!formData.unit_sale) newErrors.push("unit_sale");
    if (!formData.unit_purchase) newErrors.push("unit_purchase");
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setMessage({ text: "Veuillez remplir tous les champs obligatoires (*).", ok: false });
      return;
    }

    const officineData = localStorage.getItem("officine");
    let pharmacyId: string | null = null;
    if (officineData) {
      try {
        const o = JSON.parse(officineData);
        pharmacyId = o.id || o.officine_id || o.uuid;
      } catch {}
    }
    if (!pharmacyId) {
      setMessage({ text: "ID de pharmacie non trouvé. Veuillez vous reconnecter.", ok: false });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      if (formData.dci) payload.append("dci", formData.dci);
      if (formData.dosage) payload.append("dosage", formData.dosage);
      payload.append("category", formData.category);
      payload.append("galenic", formData.galenic);
      payload.append("unit_base", formData.unit_base);
      payload.append("unit_sale", formData.unit_sale);
      payload.append("unit_purchase", formData.unit_purchase);
      payload.append("officine", pharmacyId);
      if (selectedImage) payload.append("image", selectedImage);

      const created: Product = await api.addProduct(payload);
      const productId = created.id;
      if (!productId) throw new Error("ID produit manquant après création.");

      if (formData.multiplier) {
        await api.createConversion({
          product: productId,
          from_unit: formData.unit_base,
          to_unit: formData.unit_sale,
          multiplier: Number(formData.multiplier),
        });
      }

      if (formData.sale_price) {
        await api.createProductPrice({
          pharmacy: pharmacyId,
          product: productId,
          sale_price: Number(formData.sale_price),
          currency: formData.currency,
        });
      }

      if (formData.quantity) {
        await api.createLot({
          pharmacy: pharmacyId,
          product: productId,
          batch_number: formData.lot_number || `BATCH-${Date.now()}`,
          expiration_date:
            formData.expiry_date ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              .toISOString()
              .split("T")[0],
          unit: formData.unit_base,
          quantity: Number(formData.quantity),
          purchase_price: Number(formData.purchase_price) || 0,
        });
      }

      setMessage({ text: "Produit créé avec succès !", ok: true });
      setTimeout(() => router.push("/products_list"), 1500);
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Une erreur est survenue lors de la création.",
        ok: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* helper label lookups */
  const unitLabel = (id: string) => units.find((u) => u.id === id)?.label || "";
  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.name || "";
  const galenicLabel = (id: string) => galenics.find((g) => g.id === id)?.name || "";

  return (
    <DashboardLayout title="Ajouter un médicament">
      <div className="animate-fade-in-up">

        {/* ── breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#94A3B8] mb-5">
          <Link href="/products_list" className="hover:text-[#22C55E] transition-colors">
            Médicaments
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#1E293B]">Ajouter</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-[16px] font-semibold text-[#1E293B]">Nouveau médicament</h2>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">
                Remplissez les informations du produit. Les champs marqués * sont obligatoires.
              </p>
            </div>

            <div className="p-6">
              {/* Message */}
              {message && (
                <div
                  className={`flex items-center gap-2 text-[13px] px-4 py-3 rounded-xl mb-5 ${
                    message.ok
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-100 text-red-600"
                  }`}
                >
                  {message.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {message.text}
                </div>
              )}

              {loadingRefs ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 size={28} className="animate-spin text-[#22C55E]" />
                  <p className="text-[13px] text-[#94A3B8]">Chargement des données…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* ── Image section ── */}
                  <div>
                    <SectionTitle icon={ImagePlus} label="Image du produit" />
                    <div className="flex items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#22C55E] hover:bg-[#F0FDF4] transition-colors shrink-0"
                        onClick={() => document.getElementById("product_image")?.click()}
                      >
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus size={22} className="text-[#94A3B8]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="product_image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={inputCls()}
                        />
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          Format recommandé: PNG, JPG ou WebP. Max 2Mo.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Informations générales ── */}
                  <div>
                    <SectionTitle icon={Pill} label="Informations générales" />
                    <div className="space-y-4">

                      {/* Name */}
                      <FormField label="Nom du produit" required error={errors.includes("name")}>
                        <AutocompleteInput
                          value={formData.name}
                          onChange={handleNameChange}
                          onFocus={() => nameSuggestions.length > 0 && setShowNameDropdown(true)}
                          suggestions={nameSuggestions}
                          showDropdown={showNameDropdown}
                          onSelect={fillFromProduct}
                          containerRef={nameRef}
                          placeholder="Ex: Paracetamol — commencez à taper pour voir des suggestions"
                          error={errors.includes("name")}
                        />
                      </FormField>

                      <div className="grid grid-cols-2 gap-4">
                        {/* DCI */}
                        <FormField label="DCI">
                          <AutocompleteInput
                            value={formData.dci}
                            onChange={handleDciChange}
                            onFocus={() => dciSuggestions.length > 0 && setShowDciDropdown(true)}
                            suggestions={dciSuggestions}
                            showDropdown={showDciDropdown}
                            onSelect={fillFromProduct}
                            containerRef={dciRef}
                            placeholder="Ex: Paracetamol"
                          />
                        </FormField>

                        {/* Dosage */}
                        <FormField label="Dosage">
                          <input
                            id="dosage"
                            type="text"
                            value={formData.dosage}
                            onChange={handleChange}
                            placeholder="Ex: 500mg"
                            className={inputCls()}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <FormField label="Catégorie" required error={errors.includes("category")}>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={inputCls(errors.includes("category"))}
                          >
                            <option value="">Sélectionner</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          {formData.category && (
                            <p className="mt-1 text-[11px] text-[#22C55E] flex items-center gap-1">
                              <Check size={10} />{categoryLabel(formData.category)}
                            </p>
                          )}
                        </FormField>

                        {/* Galenic */}
                        <FormField label="Forme galénique" required error={errors.includes("galenic")}>
                          <select
                            id="galenic"
                            value={formData.galenic}
                            onChange={handleChange}
                            className={inputCls(errors.includes("galenic"))}
                          >
                            <option value="">Sélectionner</option>
                            {galenics.map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                          {formData.galenic && (
                            <p className="mt-1 text-[11px] text-[#22C55E] flex items-center gap-1">
                              <Check size={10} />{galenicLabel(formData.galenic)}
                            </p>
                          )}
                        </FormField>
                      </div>
                    </div>
                  </div>

                  {/* ── Unités & Prix ── */}
                  <div>
                    <SectionTitle icon={Scale} label="Unités & Prix" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField label="Unité de base" required error={errors.includes("unit_base")}
                          hint={`Plus petite unité${formData.unit_base ? " — " + unitLabel(formData.unit_base) : " (ex: Comprimé)"}`}>
                          <select id="unit_base" value={formData.unit_base} onChange={handleChange}
                            className={inputCls(errors.includes("unit_base"))}>
                            <option value="">Sélectionner</option>
                            {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                          </select>
                        </FormField>

                        <FormField label="Unité de vente" required error={errors.includes("unit_sale")}
                          hint={`Vendue au client${formData.unit_sale ? " — " + unitLabel(formData.unit_sale) : " (ex: Boîte)"}`}>
                          <select id="unit_sale" value={formData.unit_sale} onChange={handleChange}
                            className={inputCls(errors.includes("unit_sale"))}>
                            <option value="">Sélectionner</option>
                            {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                          </select>
                        </FormField>

                        <FormField label="Unité d'achat" required error={errors.includes("unit_purchase")}
                          hint={`Achetée au fournisseur${formData.unit_purchase ? " — " + unitLabel(formData.unit_purchase) : " (ex: Carton)"}`}>
                          <select id="unit_purchase" value={formData.unit_purchase} onChange={handleChange}
                            className={inputCls(errors.includes("unit_purchase"))}>
                            <option value="">Sélectionner</option>
                            {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                          </select>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField label="Multiplicateur" hint="Unités de base dans 1 unité de vente">
                          <input id="multiplier" type="number" min="1" value={formData.multiplier}
                            onChange={handleChange} placeholder="Ex: 30" className={inputCls()} />
                        </FormField>
                        <FormField label="Prix d'achat">
                          <input id="purchase_price" type="number" min="0" step="0.01"
                            value={formData.purchase_price} onChange={handleChange}
                            placeholder="0" className={inputCls()} />
                        </FormField>
                        <FormField label="Prix de vente">
                          <input id="sale_price" type="number" min="0" step="0.01"
                            value={formData.sale_price} onChange={handleChange}
                            placeholder="0" className={inputCls()} />
                        </FormField>
                      </div>

                      <FormField label="Devise">
                        <select id="currency" value={formData.currency} onChange={handleChange}
                          className={inputCls()}>
                          <option value="XAF">XAF (Franc CFA)</option>
                          <option value="EUR">EUR (Euro)</option>
                          <option value="USD">USD (Dollar)</option>
                        </select>
                      </FormField>
                    </div>
                  </div>

                  {/* ── Stock initial ── */}
                  <div>
                    <SectionTitle icon={Package} label="Stock initial" sub="optionnel" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Quantité initiale">
                          <input id="quantity" type="number" min="0" value={formData.quantity}
                            onChange={handleChange} placeholder="0" className={inputCls()} />
                        </FormField>
                        <FormField label="Date de péremption">
                          <input id="expiry_date" type="date" value={formData.expiry_date}
                            onChange={handleChange} className={inputCls()} />
                        </FormField>
                      </div>
                      <FormField label="Numéro de lot">
                        <input id="lot_number" type="text" value={formData.lot_number}
                          onChange={handleChange} placeholder="Ex: LOT2024-001" className={inputCls()} />
                      </FormField>
                      <FormField label="Notes / Remarques">
                        <textarea id="notes" rows={3} value={formData.notes}
                          onChange={handleChange} placeholder="Informations complémentaires…"
                          className={`${inputCls()} resize-none`} />
                      </FormField>
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  <div className="flex items-center gap-3 pt-2 border-t border-[#E2E8F0]">
                    <Link
                      href="/products_list"
                      className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border border-[#E2E8F0] text-[#94A3B8] rounded-xl hover:text-[#1E293B] hover:border-[#1E293B] transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Annuler
                    </Link>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl transition-colors disabled:opacity-60"
                    >
                      {isSaving ? (
                        <><Loader2 size={15} className="animate-spin" />Création en cours…</>
                      ) : (
                        <><Save size={15} />Créer le médicament</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
