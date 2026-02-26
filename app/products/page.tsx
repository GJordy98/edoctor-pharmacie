'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/types';
import { api } from '@/lib/api-client';

export default function ProductsPage() {
  const { products, loading, error, deleteProduct, refreshProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Recherche API officine ---
  const [apiResults, setApiResults] = useState<Product[] | null>(null);
  const [apiSearchLoading, setApiSearchLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [apiMsg, setApiMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [officineId, setOfficineId] = useState('');

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('officine') : null;
    if (raw) {
      try { const p = JSON.parse(raw); setOfficineId(p?.id || p?.uuid || String(p) || ''); }
      catch { setOfficineId(raw); }
    }
  }, []);

  // --- Recherche via API officine ---
  const handleApiSearch = async () => {
    if (!searchQuery.trim()) return;
    setApiSearchLoading(true);
    setApiMsg(null);
    try {
      const res = await api.searchProductOfficine({ search: searchQuery, officine_id: officineId });
      const list = Array.isArray(res) ? res : ((res as Record<string, unknown>)?.results ?? (res as Record<string, unknown>)?.data ?? []);
      setApiResults(list as Product[]);
      setApiMsg({ text: `${(list as Product[]).length} résultat(s) trouvé(s) via l'API.`, type: 'success' });
    } catch (err: unknown) {
      setApiMsg({ text: err instanceof Error ? err.message : 'Erreur recherche API.', type: 'danger' });
    } finally {
      setApiSearchLoading(false);
    }
  };

  // --- Catalogue complet de l'officine ---
  const handleViewCatalog = async () => {
    setCatalogLoading(true);
    setApiMsg(null);
    try {
      const res = await api.getAllProductsOfficine();
      const list = Array.isArray(res) ? res : ((res as Record<string, unknown>)?.results ?? (res as Record<string, unknown>)?.data ?? []);
      setApiResults(list as Product[]);
      setApiMsg({ text: `${(list as Product[]).length} produit(s) dans le catalogue officine.`, type: 'success' });
    } catch (err: unknown) {
      setApiMsg({ text: err instanceof Error ? err.message : 'Erreur chargement catalogue.', type: 'danger' });
    } finally {
      setCatalogLoading(false);
    }
  };

  // --- Suppression avec confirmation ---
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        alert('Produit supprimé avec succès !');
      } else {
        alert('Erreur lors de la suppression : ' + result.error);
      }
    }
  };

  // --- Filtrage et recherche ---
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const productName = product.name?.toLowerCase() || '';
      const productDci = product.dci?.toLowerCase() || '';
      const productCategory = product.category_detail?.name?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        productName.includes(query) ||
        productDci.includes(query) ||
        productCategory.includes(query);

      const matchesCategory =
        categoryFilter === 'all' ||
        product.category_detail?.name?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Catégories uniques pour le filtre ---
  const uniqueCategories = useMemo(() => {
    const cats = products
      .map((p: Product) => p.category_detail?.name)
      .filter((name): name is string => !!name);
    return [...new Set(cats)];
  }, [products]);

  // --- Statistiques ---
  const totalProducts = products.length;
  const recentProducts = products.filter((p: Product) => {
    if (!p.created_at) return false;
    const date = new Date(p.created_at);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  return (
    <>
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="main-content app-content">
        <div className="container-fluid page-container main-body-container">

          {/* Page Header */}
          <div className="page-header-breadcrumb mb-3">
            <div className="d-flex align-center justify-content-between flex-wrap">
              <h1 className="page-title fw-medium fs-18 mb-0">Produits</h1>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                <li className="breadcrumb-item"><a href="#">Pharmacie</a></li>
                <li className="breadcrumb-item active" aria-current="page">Produits</li>
              </ol>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row row-cols-xxl-4 row-cols-md-2 row-cols-1 mb-4">

            {/* Total Produits */}
            <div className="col">
              <div className="card custom-card dashboard-main-card primary">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Total Produits</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : (
                          totalProducts.toLocaleString()
                        )}
                      </h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted fs-12">Produits enregistrés</span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-primary-transparent svg-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none" />
                          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM192,184H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="col">
              <div className="card custom-card dashboard-main-card success">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Catégories</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm text-success" role="status" />
                        ) : (
                          uniqueCategories.length
                        )}
                      </h4>
                      <span className="d-block text-muted fs-12">Catégories distinctes</span>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-success-transparent svg-success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none" />
                          <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.35,44L178.57,92.29l-80.35-44Zm0,88L47.65,76,81.56,57.43l80.35,44Zm88,55.85h0l-80,43.79V133.83l32-17.51V152a8,8,0,0,0,16,0V107.56l32-17.51v85.76Z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ajoutés récemment */}
            <div className="col">
              <div className="card custom-card dashboard-main-card secondary">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Ajoutés ce mois</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm text-secondary" role="status" />
                        ) : (
                          recentProducts
                        )}
                      </h4>
                      <span className="d-block text-muted fs-12">
                        <span className="fs-12 badge bg-success-transparent me-1">Ces 30 derniers jours</span>
                      </span>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-secondary-transparent svg-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none" />
                          <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats filtrés */}
            <div className="col">
              <div className="card custom-card dashboard-main-card info">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Résultats affichés</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {loading ? (
                          <span className="spinner-border spinner-border-sm text-info" role="status" />
                        ) : (
                          filteredProducts.length
                        )}
                      </h4>
                      <span className="d-block text-muted fs-12">Après filtres appliqués</span>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-info-transparent svg-info">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none" />
                          <path d="M229.66,218.34l-50.07-50.07a88,88,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="ri-error-warning-line fs-18"></i>
              <div>
                <strong>Erreur :</strong> {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={refreshProducts}
                >
                  <i className="ri-refresh-line me-1"></i>Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="row">
            <div className="col-xl-12">
              <div className="card custom-card">

                {/* Card Header : Titre + Filtres + Bouton Ajout */}
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="card-title mb-0">Liste des Produits</div>
                  <div className="d-flex flex-wrap align-items-center gap-2">

                    {/* Recherche */}
                    <div className="input-group input-group-sm" style={{ width: '220px' }}>
                      <span className="input-group-text">
                        <i className="ri-search-line"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                          setApiResults(null);
                          setApiMsg(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApiSearch()}
                      />
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleApiSearch}
                        disabled={apiSearchLoading || !searchQuery.trim()}
                        title="Rechercher via l'API officine"
                      >
                        {apiSearchLoading
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <i className="ri-search-2-line"></i>
                        }
                      </button>
                    </div>

                    {/* Catalogue officine */}
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={handleViewCatalog}
                      disabled={catalogLoading}
                      title="Voir tous les produits du catalogue officine"
                    >
                      {catalogLoading
                        ? <span className="spinner-border spinner-border-sm me-1"></span>
                        : <i className="ri-store-2-line me-1"></i>
                      }
                      Catalogue
                    </button>

                    {/* Reset résultats API */}
                    {apiResults && (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => { setApiResults(null); setApiMsg(null); }}
                        title="Revenir à la liste locale"
                      >
                        <i className="ri-close-line me-1"></i>Réinitialiser
                      </button>
                    )}

                    {/* Filtre catégorie */}
                    <select
                      className="form-select form-select-sm"
                      style={{ width: '160px' }}
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">Toutes catégories</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {/* Bouton refresh */}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={refreshProducts}
                      disabled={loading}
                      title="Actualiser"
                    >
                      <i className={`ri-refresh-line ${loading ? 'ri-spin' : ''}`}></i>
                    </button>

                    {/* Bouton Ajouter */}
                    <Link
                      href="/add-product"
                      className="btn btn-primary btn-sm btn-wave waves-effect waves-light"
                    >
                      <i className="ri-add-line me-1 align-middle d-inline-block"></i>
                      Ajouter un produit
                    </Link>
                  </div>
                </div>

                {/* Message résultats API */}
                {apiMsg && (
                  <div className={`alert alert-${apiMsg.type} alert-dismissible m-3 mb-0`} role="alert">
                    <i className={`${apiMsg.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} me-2`}></i>
                    {apiMsg.text}
                    <button type="button" className="btn-close" onClick={() => setApiMsg(null)}></button>
                  </div>
                )}

                {/* Card Body : Tableau */}
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover text-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '60px' }}>Image</th>
                          <th>ID Produit</th>
                          <th>Nom du Produit</th>
                          <th>Forme Galénique</th>
                          <th>Prix de Vente</th>
                          <th>Devise</th>
                          <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                              </div>
                              <p className="text-muted mt-3 mb-0">Chargement des produits...</p>
                            </td>
                          </tr>
                        ) : paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <i className="ri-inbox-line fs-40 text-muted d-block mb-2"></i>
                              <p className="text-muted mb-0">
                                {searchQuery || categoryFilter !== 'all'
                                  ? 'Aucun produit ne correspond à votre recherche'
                                  : 'Aucun produit trouvé'}
                              </p>
                              {(searchQuery || categoryFilter !== 'all') && (
                                <button
                                  className="btn btn-sm btn-outline-secondary mt-2"
                                  onClick={() => {
                                    setSearchQuery('');
                                    setCategoryFilter('all');
                                  }}
                                >
                                  Réinitialiser les filtres
                                </button>
                              )}
                            </td>
                          </tr>
                        ) : (
                          (apiResults ?? paginatedProducts).map((product: Product) => (
                            <tr key={product.id}>
                              <td className="text-center">
                                <div className="avatar avatar-md bg-light overflow-hidden rounded-2" style={{ position: 'relative', width: '40px', height: '40px' }}>
                                  {product.image ? (
                                    <Image 
                                      src={product.image} 
                                      alt={product.name} 
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      sizes="40px"
                                    />
                                  ) : (
                                    <i className="ri-medicine-bottle-line text-muted fs-20"></i>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className="text-muted" title={product.id}>
                                  {product.id.substring(0, 8)}...
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-semibold">{product.name}</span>
                                  {product.dci && (
                                    <span className="text-muted fs-12">{product.dci}</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {product.galenic_detail?.name || (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                {product.sale_price ? (
                                  <span className="fw-medium">
                                    {Number(product.sale_price).toLocaleString('fr-FR')}
                                  </span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                {product.currency ? (
                                  product.currency
                                ) : (
                                  <span className="text-muted">XAF</span>
                                )}
                              </td>
                              <td>
                                <div className="hstack gap-2 fs-15">
                                  <Link
                                    href={`/products/${product.id}/edit`}
                                    className="btn btn-icon btn-sm btn-info-transparent rounded-pill"
                                    title="Modifier"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
                                    title="Supprimer"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Card Footer : Pagination */}
                {!loading && filteredProducts.length > 0 && (
                  <div className="card-footer d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="text-muted fs-13">
                      Affichage de{' '}
                      <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> à{' '}
                      <strong>
                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                      </strong>{' '}
                      sur <strong>{filteredProducts.length}</strong> produits
                    </div>

                    {totalPages > 1 && (
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage((p) => p - 1)}
                              disabled={currentPage === 1}
                            >
                              <i className="ri-arrow-left-s-line"></i>
                            </button>
                          </li>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <li
                              key={page}
                              className={`page-item ${currentPage === page ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage((p) => p + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <i className="ri-arrow-right-s-line"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}