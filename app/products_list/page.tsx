"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { showToast } from "@/components/ui/Toast";

/* ── skeleton ── */
function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function ProductsPage() {
  const { products, loading, error, deleteProduct } = useProducts();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        showToast("Produit supprimé avec succès !", "success");
      } else {
        showToast("Erreur : " + result.error, "error");
      }
    } catch {
      showToast("Erreur inattendue lors de la suppression.", "error");
    } finally {
      setDeleting(false);
      closeDeleteModal();
    }
  };


  return (
    <DashboardLayout title="Médicaments">
      <div className="space-y-5 animate-fade-in-up">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[18px] font-semibold text-[#1E293B]">Liste des médicaments</h2>
          <Link
            href="/add-product"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-semibold rounded-xl transition-colors"
          >
            <Plus size={15} />
            Ajouter un médicament
          </Link>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl">
            <AlertCircle size={15} />
            {error}
          </div>
        )}


        {/* ── Table ── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-semibold text-[#1E293B]">Catalogue</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide w-10">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide w-12">
                    Image
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Produit
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Forme galénique
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Prix de vente
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Devise
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Package size={32} className="text-[#E2E8F0] mx-auto mb-3" />
                      <p className="text-[14px] font-medium text-[#94A3B8]">Aucun médicament</p>
                      <Link
                        href="/add-product"
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-[12px] font-semibold bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-colors"
                      >
                        <Plus size={13} />
                        Ajouter le premier médicament
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 text-[#94A3B8]">{index + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <Image
                              src={product.image as string}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package size={16} className="text-[#94A3B8]" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-[#1E293B]">{product.name || "—"}</p>
                        {product.dci && (
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">{product.dci}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">
                        {product.galenic_detail?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#1E293B]">
                        {product.sale_price
                          ? Number(product.sale_price).toLocaleString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#22C55E] text-[11px] font-semibold rounded-md">
                          {product.currency || "XAF"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.price_id || product.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(product.id, product.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && products.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E2E8F0] text-[12px] text-[#94A3B8]">
              {products.length} médicament{products.length > 1 ? "s" : ""} au total
            </div>
          )}
        </div>
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#1E293B] flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                Confirmer la suppression
              </h3>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[13px] text-[#64748B] mb-2">
              Êtes-vous sûr de vouloir supprimer ce produit ?
            </p>
            {productToDelete && (
              <p className="text-[14px] font-semibold text-red-500 mb-2">
                « {productToDelete.name} »
              </p>
            )}
            <p className="text-[12px] text-[#94A3B8] mb-6">Cette action est irréversible.</p>

            <div className="flex items-center gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 py-2.5 text-[13px] font-medium border border-[#E2E8F0] text-[#94A3B8] rounded-xl hover:text-[#1E293B] hover:border-[#1E293B] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-[13px] font-semibold bg-[#EF4444] text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <><Loader2 size={14} className="animate-spin" />Suppression…</>
                ) : (
                  <><Trash2 size={14} />Supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
