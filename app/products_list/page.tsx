'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { products, loading, error, deleteProduct } = useProducts();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  const openDeleteModal = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
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
        setDeleteMessage({ text: 'Produit supprimé avec succès !', type: 'success' });
      } else {
        setDeleteMessage({ text: 'Erreur: ' + result.error, type: 'danger' });
      }
    } catch {
      setDeleteMessage({ text: 'Erreur inattendue lors de la suppression.', type: 'danger' });
    } finally {
      setDeleting(false);
      closeDeleteModal();
      setTimeout(() => setDeleteMessage(null), 4000);
    }
  };

  return (
    <div className="page">
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

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="ri-error-warning-line me-2"></i>
              {error}
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}



          {/* Statistics Cards */}
          <div className="row row-cols-xxl-5 row-cols-md-3 row-cols-1">
            <div className="col">
              <div className="card custom-card dashboard-main-card primary">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Total Products</span>
                      <h4 className="fw-semibold my-2 lh-1">{products.length}</h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted">
                          <span className="fs-12 badge bg-success-transparent me-1">✓</span>
                          Total registered
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-primary-transparent svg-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none"></rect>
                          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM192,184H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card custom-card dashboard-main-card success">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Products in Stock</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {products.filter(p => (Number(p.stock) || 0) > 0).length}
                      </h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted">
                          <span className="fs-12 badge bg-success-transparent me-1">
                            {products.length > 0 
                              ? Math.round((products.filter(p => (Number(p.stock) || 0) > 0).length / products.length) * 100)
                              : 0}%
                          </span>
                          Available
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-success-transparent svg-success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none"></rect>
                          <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.35,44L178.57,92.29l-80.35-44Zm0,88L47.65,76,81.56,57.43l80.35,44Zm88,55.85h0l-80,43.79V133.83l32-17.51V152a8,8,0,0,0,16,0V107.56l32-17.51v85.76Z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card custom-card dashboard-main-card warning">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Out of Stock</span>
                      <h4 className="fw-semibold my-2 lh-1">
                          {products.filter(p => (Number(p.stock) || 0) === 0).length}
                      </h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted">
                          <span className="fs-12 badge bg-danger-transparent me-1">!</span>
                          Needs restocking
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-warning-transparent svg-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none"></rect>
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card custom-card dashboard-main-card danger">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Low Stock Alert</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {products.filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10).length}
                      </h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted">
                          <span className="fs-12 badge bg-danger-transparent me-1">⚠</span>
                          Stock ≤ 10 units
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-danger-transparent svg-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none"></rect>
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card custom-card dashboard-main-card info">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-fill">
                      <span className="fs-13 fw-medium">Total Stock Value</span>
                      <h4 className="fw-semibold my-2 lh-1">
                        {(() => {
                          const totalValue = products.reduce((sum, p) => {
                            const price = Number(p.sale_price) || Number(p.salePrice) || 0;
                            const stock = Number(p.stock) || 0;
                            return sum + (price * stock);
                          }, 0);
                          return totalValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
                        })()}
                      </h4>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="d-block text-muted">
                          <span className="fs-12 badge bg-info-transparent me-1">FCFA</span>
                          Inventory value
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="avatar avatar-md bg-info-transparent svg-info">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                          <rect width="256" height="256" fill="none"></rect>
                          <path d="M168,128a40,40,0,1,1-40-40A40,40,0,0,1,168,128Zm80-64V192a8,8,0,0,1-8,8H16a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H240A8,8,0,0,1,248,64Zm-16,46.35A56.78,56.78,0,0,1,193.65,72H62.35A56.78,56.78,0,0,1,24,110.35v35.3A56.78,56.78,0,0,1,62.35,184h131.3A56.78,56.78,0,0,1,232,145.65Z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="row">
            <div className="col-xl-12">
              <div className="card custom-card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="card-title">
                    Liste des Produits
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Link href="/add-product" className="btn btn-primary btn-wave waves-effect waves-light">
                      <i className="ri-add-line me-1 align-middle d-inline-block"></i>
                      Ajouter un produit
                    </Link>
                  </div>
                </div>

                <div className="card-body p-0">
                  <div id="product-table" className="grid-card-table">
                    <div role="complementary" className="gridjs gridjs-container" style={{ width: '100%' }}>
                      <div className="gridjs-wrapper" style={{ height: 'auto' }}>
                        <table role="grid" className="gridjs-table" style={{ height: 'auto' }}>
                          <thead className="gridjs-thead">
                            <tr className="gridjs-tr">
                              <th className="gridjs-th" style={{ minWidth: '42px', width: '60px' }}>
                                <div className="gridjs-th-content">#</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '60px', width: '80px' }}>
                                <div className="gridjs-th-content">Image</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '100px', width: '143px' }}>
                                <div className="gridjs-th-content">ID Produit</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '219px', width: '314px' }}>
                                <div className="gridjs-th-content">Nom du Produit</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '150px', width: '200px' }}>
                                <div className="gridjs-th-content">Forme Galénique</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '120px', width: '180px' }}>
                                <div className="gridjs-th-content">Prix de Vente</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '80px', width: '100px' }}>
                                <div className="gridjs-th-content">Devise</div>
                              </th>
                              <th className="gridjs-th" style={{ minWidth: '82px', width: '118px' }}>
                                <div className="gridjs-th-content">Actions</div>
                              </th>
                            </tr>
                          </thead>

                          <tbody className="gridjs-tbody">
                            {loading ? (
                              <tr className="gridjs-tr">
                                <td colSpan={8} className="gridjs-td text-center py-5">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                  </div>
                                  <p className="text-muted mt-3">Chargement des produits...</p>
                                </td>
                              </tr>
                            ) : error ? (
                              <tr className="gridjs-tr">
                                <td colSpan={8} className="gridjs-td text-center py-5 text-danger">
                                  <i className="ri-error-warning-line fs-24 mb-2 d-block"></i>
                                  <p className="fw-medium mb-0">{error}</p>
                                  <button 
                                    className="btn btn-sm btn-outline-danger mt-3"
                                    onClick={() => window.location.reload()}
                                  >
                                    Réessayer
                                  </button>
                                </td>
                              </tr>
                            ) : products.length === 0 ? (
                              <tr className="gridjs-tr">
                                <td colSpan={8} className="gridjs-td text-center py-5">
                                  <p className="text-muted">Aucun produit trouvé</p>
                                </td>
                              </tr>
                            ) : (
                              products.map((product, index) => (
                                <tr key={product.id} className="gridjs-tr">
                                  <td className="gridjs-td">{index + 1}</td>
                                  <td className="gridjs-td text-center">
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
                                  <td className="gridjs-td" title={product.id}>
                                    {product.id ? product.id.substring(0, 8) + '...' : '—'}
                                  </td>
                                  <td className="gridjs-td">
                                    <span className="fw-semibold">{product.name || '—'}</span>
                                    {product.dci && (
                                      <span className="d-block text-muted fs-12">{product.dci}</span>
                                    )}
                                  </td>
                                  <td className="gridjs-td">{product.galenic_detail?.name || '—'}</td>
                                  <td className="gridjs-td">
                                    {product.sale_price
                                      ? Number(product.sale_price).toLocaleString('fr-FR')
                                      : '—'}
                                  </td>
                                  <td className="gridjs-td">{product.currency ? product.currency : 'XAF'}</td>
                                  <td className="gridjs-td">
                                    <div className="hstack gap-2 fs-15">
                                      <Link href={`/products/${product.id}/edit`} className="btn btn-icon btn-sm btn-info-transparent rounded-pill">
                                        <i className="ri-edit-line"></i>
                                      </Link>
                                      <button 
                                        onClick={() => openDeleteModal(product.id, product.name)}
                                        className="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
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

                      <div className="gridjs-footer">
                        <div className="gridjs-pagination">
                          <div className="gridjs-summary" title="Page 1 of 2">
                            Affichage de <b>1</b> à <b>{products.length}</b> sur <b>{products.length}</b> résultats
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Message Toast */}
      {deleteMessage && (
        <div
          className={`alert alert-${deleteMessage.type} position-fixed bottom-0 end-0 m-3 shadow-lg`}
          style={{ zIndex: 9999, minWidth: '300px' }}
          role="alert"
        >
          <i className={`ri-${deleteMessage.type === 'success' ? 'check-double' : 'error-warning'}-line me-2`}></i>
          {deleteMessage.text}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title">
                    <i className="ri-error-warning-line text-danger me-2"></i>
                    Confirmer la suppression
                  </h5>
                  <button type="button" className="btn-close" onClick={closeDeleteModal} disabled={deleting}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-1">Êtes-vous sûr de vouloir supprimer ce produit ?</p>
                  {productToDelete && (
                    <p className="fw-semibold text-danger mb-0">
                      &laquo; {productToDelete.name} &raquo;
                    </p>
                  )}
                  <p className="text-muted fs-13 mt-2 mb-0">
                    Cette action est irréversible.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <i className="ri-delete-bin-line me-1"></i>
                        Supprimer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}