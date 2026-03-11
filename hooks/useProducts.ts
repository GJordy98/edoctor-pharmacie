import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Product, ProductCreatePayload } from '@/lib/types';

export type AddProductData = ProductCreatePayload;

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (productData: AddProductData) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  searchProducts: (query: string) => Product[];
  filterByCategory: (category: string) => Product[];
  getProductById: (productId: string) => Product | undefined;
  refreshProducts: () => void;
}

/**
 * Hook personnalisé pour gérer les produits
 * @returns {UseProductsReturn}
 */
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits au montage du composant
  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Charger tous les produits
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const officineData = localStorage.getItem('officine');
      let pharmacyId: string | null = null;

      if (officineData) {
        try {
          const officine = JSON.parse(officineData);
          pharmacyId = officine.id || officine.officine_id;
        } catch (e) {
          console.error('Error parsing officine data:', e);
        }
      }

      if (!pharmacyId) {
        setError('ID de pharmacie non trouvé. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      // api.getProducts() retourne déjà des Product[] correctement aplatis
      // (champs name, dci, dosage, sale_price au niveau racine)
      const productList = await api.getProducts(pharmacyId);
      setProducts(Array.isArray(productList) ? productList : []);

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Erreur lors du chargement des produits:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajouter un nouveau produit
   * @param {AddProductData} productData - Données du produit à ajouter (doit inclure officine)
   */
  const addProduct = async (productData: AddProductData) => {
    try {
      setLoading(true);
      setError(null);

      await api.addProduct(productData);
      
      // For now, reload to get fresh list with IDs
      await loadProducts();

      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Erreur lors de l\'ajout du produit:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour un produit existant
   * @param {string} productId - ID du produit à modifier
   * @param {Partial<Product>} updates - Données à mettre à jour
   */
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      setLoading(true);
      setError(null);

      // Cast updates to match ProductData partial if necessary
      const payload: Record<string, unknown> = { ...updates };
      delete payload.id;
      delete payload.productId;
      
      // Type assertion to Unknown then Partial<ProductData> to satisfy the method signature
      await api.updateProductPrice(productId, payload);
      
      await loadProducts();

      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Erreur lors de la modification du produit:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer un produit
   * @param {string} productId - ID du produit à supprimer
   */
  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      await api.deleteProductPrice(productId);
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));

      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Erreur lors de la suppression du produit:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rechercher des produits
   * @param {string} query - Terme de recherche
   */
  const searchProducts = (query: string) => {
    if (!query) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.id.toLowerCase().includes(lowerQuery) ||
      (product.dci && product.dci.toLowerCase().includes(lowerQuery)) ||
      (product.category_detail?.name && product.category_detail.name.toLowerCase().includes(lowerQuery))
    );
  };

  /**
   * Filtrer les produits par catégorie
   * @param {string} category - Catégorie à filtrer
   */
  const filterByCategory = (category: string) => {
    if (!category) return products;
    return products.filter(product => product.category_detail?.name === category);
  };

  /**
   * Obtenir un produit par son ID
   * @param {string} productId - ID du produit
   */
  const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  /**
   * Rafraîchir la liste des produits
   */
  const refreshProducts = () => {
    loadProducts();
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterByCategory,
    getProductById,
    refreshProducts,
  };
}
