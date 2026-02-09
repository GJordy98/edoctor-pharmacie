'use client';

import { useState, useEffect } from 'react';

/**
 * Interface pour les données d'un produit
 */
export interface Product {
  id: string;
  productId: string;
  name: string;
  galenic: string;
  unit?: string;
  expirationDate?: string;
  price?: number;
  salePrice?: number;
  purchasePrice?: number;
  currency: string;
  stock: number;
  category?: string;
  description?: string;
}

/**
 * Interface pour les données nécessaires à l'ajout d'un produit
 */
export interface AddProductData {
  name: string;
  galenic: string;
  unit: string;
  expirationDate: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  currency: string;
  stock: number;
}

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

      // TODO: Remplacer par votre appel API réel
      // const response = await fetch('/api/products');
      // if (!response.ok) throw new Error('Erreur lors du chargement des produits');
      // const data = await response.json();

      // Pour l'instant, on charge depuis localStorage ou données mockées
      const storedProducts = localStorage.getItem('pharmacy_products');
      
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // Données mockées pour le développement
        const mockProducts: Product[] = [
          {
            id: '1',
            productId: 'PRD001',
            name: 'Paracétamol 500mg',
            galenic: 'Comprimé',
            unit: 'Boîte',
            price: 2500,
            currency: 'FCFA',
            stock: 150,
            category: 'Antalgique',
            description: 'Traitement de la douleur et de la fièvre',
          },
          {
            id: '2',
            productId: 'PRD002',
            name: 'Ibuprofène 400mg',
            galenic: 'Gélule',
            unit: 'Plaquette',
            price: 3500,
            currency: 'FCFA',
            stock: 80,
            category: 'Anti-inflammatoire',
            description: 'Anti-inflammatoire non stéroïdien',
          },
          {
            id: '3',
            productId: 'PRD003',
            name: 'Amoxicilline 500mg',
            galenic: 'Comprimé',
            unit: 'Boîte',
            price: 5000,
            currency: 'FCFA',
            stock: 120,
            category: 'Antibiotique',
            description: 'Antibiotique à large spectre',
          },
          {
            id: '4',
            productId: 'PRD004',
            name: 'Sirop Codéine',
            galenic: 'Sirop',
            unit: 'Flacon',
            price: 4500,
            currency: 'FCFA',
            stock: 45,
            category: 'Antitussif',
          },
          {
            id: '5',
            productId: 'PRD005',
            name: 'Diclofénac Gel',
            galenic: 'Pommade',
            unit: 'Tube',
            price: 3000,
            currency: 'FCFA',
            stock: 60,
            category: 'Anti-inflammatoire',
          },
          {
            id: '6',
            productId: 'PRD006',
            name: 'Ventoline 100µg',
            galenic: 'Aérosol',
            unit: 'Flacon',
            price: 6500,
            currency: 'FCFA',
            stock: 30,
            category: 'Asthme',
          }
        ];
        setProducts(mockProducts);
        localStorage.setItem('pharmacy_products', JSON.stringify(mockProducts));
      }
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
   * @param {AddProductData} productData - Données du produit à ajouter
   */
  const addProduct = async (productData: AddProductData) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Remplacer par votre appel API réel
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData),
      // });
      // if (!response.ok) throw new Error('Erreur lors de l\'ajout du produit');
      // const newProduct = await response.json();

      // Pour l'instant, on ajoute en local
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        productId: `PRD${String(products.length + 1).padStart(3, '0')}`,
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('pharmacy_products', JSON.stringify(updatedProducts));

      return { success: true, product: newProduct };
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

      // TODO: Remplacer par votre appel API réel
      // const response = await fetch(`/api/products/${productId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // });
      // if (!response.ok) throw new Error('Erreur lors de la modification du produit');
      // const updatedProduct = await response.json();

      // Pour l'instant, on modifie en local
      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      );

      setProducts(updatedProducts);
      localStorage.setItem('pharmacy_products', JSON.stringify(updatedProducts));

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

      // TODO: Remplacer par votre appel API réel
      // const response = await fetch(`/api/products/${productId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Erreur lors de la suppression du produit');

      // Pour l'instant, on supprime en local
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('pharmacy_products', JSON.stringify(updatedProducts));

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
      product.productId.toLowerCase().includes(lowerQuery) ||
      (product.category && product.category.toLowerCase().includes(lowerQuery))
    );
  };

  /**
   * Filtrer les produits par catégorie
   * @param {string} category - Catégorie à filtrer
   */
  const filterByCategory = (category: string) => {
    if (!category) return products;
    return products.filter(product => product.category === category);
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
