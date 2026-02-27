'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api-client';
import { InvoiceResponse, QrCodeResponse, Product } from '@/lib/types';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

// Types et Interfaces
interface Patient {
    name: string;
    phone: string;
}

interface OrderItem {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    status: 'pending' | 'reserved' | 'unavailable';
}

interface ApiOrderItem {
    id: number | string;
    product?: {
        id?: string;
        name?: string;
        dci?: string;
        galenic?: string;
    };
    product_name?: string;        // legacy field (fallback)
    quantity: number | string;
    unit_price?: string | number; // actual field from API
    price?: string | number;      // legacy alias (fallback)
    line_total?: string | number; // actual field from API
    total_price?: string | number;// legacy alias (fallback)
    status?: string;
    [key: string]: unknown;
}

interface Order {
    id: string | string[];
    patient: Patient;
    date: string;
    status: string;
    payment_status: string;
    prescription: string | null;
    total_amount: number;
}

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    // États pour les données de la commande
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [addedProducts, setAddedProducts] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    // État pour la sélection de produits (Case 2 & 3)
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [pharmacyProducts, setPharmacyProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    // --- Facture ---
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    // --- QR Code ---
    const [qrCodeData, setQrCodeData] = useState<QrCodeResponse | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const qrModalRef = useRef<HTMLDivElement>(null);

    // --- Sous-commande ---
    interface SubItem { product_id: string; quantity: number; unit_price: number; }
    const [subItems, setSubItems] = useState<SubItem[]>([{ product_id: '', quantity: 1, unit_price: 0 }]);
    const [subOrderLoading, setSubOrderLoading] = useState(false);
    const [subOrderMsg, setSubOrderMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const subOrderModalRef = useRef<HTMLDivElement>(null);

    // officineId from localStorage
    const [officineId, setOfficineId] = useState('');
    useEffect(() => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('officine') : null;
        if (raw) {
            try { const p = JSON.parse(raw); setOfficineId(p?.id || p?.uuid || String(p) || ''); }
            catch { setOfficineId(raw); }
        }
    }, []);

    // Chargement des produits de la pharmacie (pour le dropdown Cas 2 & 3)
    useEffect(() => {
        if (!officineId) return;
        setProductsLoading(true);
        api.getProducts(officineId)
            .then(data => setPharmacyProducts(Array.isArray(data) ? data : []))
            .catch(() => setPharmacyProducts([]))
            .finally(() => setProductsLoading(false));
    }, [officineId]);

    // Chargement des données de la commande
    useEffect(() => {
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            try {
                const data = await api.getOrderDetails(id as string);

                // Map API response to component state
                if (data.order) {
                    const patient = data.order.patient;
                    setOrder({
                        id: data.order.id as string,
                        patient: {
                            name: `${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`.trim() || 'Client',
                            phone: patient?.phone ?? ''
                        },
                        date: data.order.created_at ?? new Date().toISOString(),
                        status: data.order.status ?? '',
                        payment_status: data.order.payment_status ?? '',
                        prescription: data.order.prescription ?? null,
                        total_amount: parseFloat(String(data.order.total_amount))
                    });
                }

                // If items are returned separately or nested, map them here
                // Assumed structure based on legacy code/mock:
                if (data.items) {
                    console.log('[OrderDetails] Raw items from API:', JSON.stringify(data.items, null, 2));
                    const mappedItems: OrderItem[] = (data.items as unknown as ApiOrderItem[]).map((item) => ({
                        id: item.id, // SubOrderItem UUID
                        name: item.product
                            ? `${item.product.name ?? ''} — ${item.product.dci ?? ''}`.replace(/ — $/, '')
                            : (item.product_name || 'Produit'),
                        quantity: parseFloat(String(item.quantity)),
                        price: parseFloat(String(item.unit_price ?? item.price ?? 0)),
                        total: parseFloat(String(item.line_total ?? item.total_price ?? 0)),
                        status: 'pending' as const
                    }));
                    setItems(mappedItems);
                }

            } catch (error) {
                console.error("Error fetching order:", error);
                // Optionally set error state to display to user
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    // Déterminer le Cas (1, 2, ou 3)
    const getOrderCase = () => {
        if (!order) return null;
        const hasPrescription = !!order.prescription;
        const hasItems = items.length > 0;

        if (hasItems && !hasPrescription) return 1; // Produits seulement
        if (!hasItems && hasPrescription) return 2; // Ordonnance seulement
        if (hasItems && hasPrescription) return 3;  // Mixte
        return 1;
    };

    const orderCase = getOrderCase();

    const handleAddProduct = () => {
        if (!selectedProductId) return;
        const product = pharmacyProducts.find(p => p.id === selectedProductId);
        if (!product) return;
        const unitPrice = product.sale_price ?? 0;
        const label = [product.name, product.dci, product.dosage].filter(Boolean).join(' — ');
        const newProduct: OrderItem = {
            id: Date.now(),
            name: label,
            quantity: quantity,
            price: unitPrice,
            total: unitPrice * quantity,
            status: 'reserved'
        };
        setAddedProducts(prev => [...prev, newProduct]);
        setSelectedProductId('');
        setQuantity(1);
    };

    // Item statuses are managed locally — they are sent to the backend only on final validation.
    const toggleItemStatus = (itemId: number | string, newStatus: 'reserved' | 'unavailable') => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
    };

    const validateOrder = async () => {
        const allItems = [...items, ...addedProducts];
        const hasReserved = allItems.some(i => i.status === 'reserved');

        // Si aucun produit n'est marqué du tout, on bloque pour éviter une validation accidentelle
        const allStillPending = allItems.every(i => i.status === 'pending');
        if (allStillPending) {
            alert("Veuillez marquer la disponibilité d'au moins un produit avant de valider.");
            return;
        }

        const isRejection = !hasReserved;
        // Le backend accepte uniquement "RESERVED" ou "REJECTED"
        // Les items en "pending" restants sont traités comme indisponibles
        const finalStatus = isRejection ? 'REJECTED' : 'RESERVED';

        setIsValidating(true);
        try {
            // POST /api/v1/officine-order/{orderId}/validate-officine-order/
            // Payload: { "status": "RESERVED" | "REJECTED" }
            await api.validateOrder(id as string, { status: finalStatus });

            alert(isRejection
                ? "Commande rejetée (aucun produit disponible)."
                : "Commande validée avec succès !");
            router.push('/orders');
        } catch (error) {
            console.error("Validation error:", error);
            alert("Erreur lors de la validation. Veuillez réessayer.");
        } finally {
            setIsValidating(false);
        }
    };


    // --- Handlers Facture ---
    const handleGetInvoice = async () => {
        setInvoiceLoading(true);
        setInvoiceError(null);
        try {
            const res = await api.getInvoice({ order_id: id as string });
            setInvoice(res);
        } catch (err: unknown) {
            setInvoiceError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la facture.');
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!invoice?.id) return;
        setPdfLoading(true);
        try {
            const blob = await api.getInvoicePdf(invoice.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-${invoice.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            setInvoiceError(err instanceof Error ? err.message : 'Erreur lors du téléchargement du PDF.');
        } finally {
            setPdfLoading(false);
        }
    };

    // --- Handler QR Code ---
    const handleGetQrCode = async () => {
        setQrLoading(true);
        setQrError(null);
        try {
            const res = await api.getOrderQrCode(id as string);
            setQrCodeData(res);
            // Open modal via Bootstrap JS if available
            if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).bootstrap) {
                type BootstrapModal = { new(el: Element): { show(): void } };
                const BS = (window as unknown as Record<string, unknown>).bootstrap as Record<string, BootstrapModal>;
                const modal = new BS.Modal(qrModalRef.current!);
                modal.show();
            }
        } catch (err: unknown) {
            setQrError(err instanceof Error ? err.message : 'Erreur lors de la récupération du QR code.');
        } finally {
            setQrLoading(false);
        }
    };

    // --- Handlers Sous-commande ---
    const addSubItem = () => setSubItems(prev => [...prev, { product_id: '', quantity: 1, unit_price: 0 }]);
    const removeSubItem = (index: number) => setSubItems(prev => prev.filter((_, i) => i !== index));
    const updateSubItem = (index: number, field: keyof SubItem, value: string | number) => {
        setSubItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
    };

    const handleSubmitSubOrder = async () => {
        setSubOrderMsg(null);
        const validItems = subItems.filter(it => it.product_id.trim() !== '');
        if (validItems.length === 0) {
            setSubOrderMsg({ text: 'Ajoutez au moins un produit.', type: 'danger' });
            return;
        }
        setSubOrderLoading(true);
        try {
            await api.generateSubOrder({
                order_id: id as string,
                officine_id: officineId,
                items: validItems,
            });
            setSubOrderMsg({ text: 'Sous-commande générée avec succès.', type: 'success' });
            setSubItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
        } catch (err: unknown) {
            setSubOrderMsg({ text: err instanceof Error ? err.message : 'Erreur lors de la génération.', type: 'danger' });
        } finally {
            setSubOrderLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-white" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-vh-100">
            <Header />
            <Sidebar />
            <main className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                        <div>
                            <h1 className="h4 mb-1">Détails Commande #{typeof id === 'string' ? id.slice(0, 8) : ''}</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                    <li className="breadcrumb-item"><Link href="/orders">Commandes</Link></li>
                                    <li className="breadcrumb-item active">Détails</li>
                                </ol>
                            </nav>
                        </div>
                        {/* Action buttons */}
                        <div className="d-flex gap-2 flex-wrap">
                            {/* Facture */}
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={handleGetInvoice}
                                disabled={invoiceLoading}
                            >
                                {invoiceLoading
                                    ? <span className="spinner-border spinner-border-sm me-1"></span>
                                    : <i className="ri-file-list-3-line me-1"></i>
                                }
                                Facture
                            </button>
                            {/* QR Code */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#qrCodeModal"
                                onClick={handleGetQrCode}
                            >
                                <i className="ri-qr-code-line me-1"></i>QR Code
                            </button>
                            {/* Sous-commande — visible si ordonnance */}
                            {order?.prescription && (
                                <button
                                    className="btn btn-outline-success btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#subOrderModal"
                                >
                                    <i className="ri-add-circle-line me-1"></i>Sous-commande
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Facture Section */}
                    {(invoice || invoiceError) && (
                        <div className={`alert ${invoiceError ? 'alert-danger' : 'alert-light border'} mb-4`}>
                            {invoiceError ? (
                                <><i className="ri-error-warning-line me-2"></i>{invoiceError}</>
                            ) : invoice && (
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div>
                                        <strong><i className="ri-file-list-3-line me-2"></i>Facture #{invoice.id.slice(0, 8)}</strong>
                                        <span className="ms-3 text-muted small">
                                            Montant : {invoice.total ?? invoice.total_amount ?? '—'} XAF
                                        </span>
                                        {invoice.created_at && (
                                            <span className="ms-3 text-muted small">
                                                {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleDownloadPdf}
                                        disabled={pdfLoading}
                                    >
                                        {pdfLoading
                                            ? <span className="spinner-border spinner-border-sm me-1"></span>
                                            : <i className="ri-download-2-line me-1"></i>
                                        }
                                        Télécharger PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QR Code Error */}
                    {qrError && (
                        <div className="alert alert-danger mb-4">
                            <i className="ri-error-warning-line me-2"></i>{qrError}
                        </div>
                    )}

                    {/* Badge du Cas */}
                    <div className={`case-badge bg-primary text-white mb-3 text-uppercase fw-bold shadow-sm`} style={{ fontSize: '0.75rem', padding: '6px 15px', borderRadius: '50px' }}>
                        CAS {orderCase} : {
                            orderCase === 1 ? "Produits uniquement" :
                                orderCase === 2 ? "Ordonnance uniquement" :
                                    "Ordonnance + Produits"
                        }
                    </div>

                    {/* Infos Générales */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <small className="text-muted d-block mb-1"><i className="ri-user-line me-1"></i> Patient</small>
                                    <span className="fw-bold">{order?.patient?.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <small className="text-muted d-block mb-1"><i className="ri-calendar-line me-1"></i> Date</small>
                                    <span className="fw-bold">{order?.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <small className="text-muted d-block mb-1"><i className="ri-shopping-bag-line me-1"></i> Statut</small>
                                    <span className={`badge ${order?.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${order?.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                        {order?.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <small className="text-muted d-block mb-1"><i className="ri-bank-card-line me-1"></i> Paiement</small>
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">{order?.payment_status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={orderCase === 1 ? "col-lg-12" : "col-lg-8"}>
                            {(orderCase === 2 || orderCase === 3) && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">Ordonnance</h5>
                                        <button className="btn btn-sm btn-outline-primary"><i className="ri-download-line"></i></button>
                                    </div>
                                    <div className="card-body text-center prescription-container">
                                        {order?.prescription && (
                                            <Image
                                                src={order.prescription}
                                                alt="Ordonnance"
                                                width={600}
                                                height={800}
                                                className="img-fluid rounded shadow-sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {(orderCase === 1 || orderCase === 3) && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white">
                                        <h5 className="card-title mb-0">Produits de la commande</h5>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0 align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-4">Produit</th>
                                                        <th className="text-center">Quantité</th>
                                                        <th>Prix Unitaire</th>
                                                        <th>Total</th>
                                                        <th className="text-end pe-4">Disponibilité</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="ps-4">{item.name}</td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td>{item.price} XAF</td>
                                                            <td className="fw-bold">{item.total} XAF</td>
                                                            <td className="text-end pe-4">
                                                                <div className="btn-group btn-group-sm" role="group">
                                                                    <button
                                                                        type="button"
                                                                        className={`btn ${item.status === 'reserved' ? 'btn-success' : 'btn-outline-success'}`}
                                                                        onClick={() => toggleItemStatus(item.id, 'reserved')}
                                                                    >
                                                                        Réserver
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={`btn ${item.status === 'unavailable' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                                        onClick={() => toggleItemStatus(item.id, 'unavailable')}
                                                                    >
                                                                        Indisponible
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(orderCase === 2 || orderCase === 3) && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white">
                                        <h5 className="card-title mb-0">Ajouter des produits</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-7">
                                                <select
                                                    className="form-select"
                                                    value={selectedProductId}
                                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                                    disabled={productsLoading}
                                                >
                                                    <option value="">
                                                        {productsLoading
                                                            ? 'Chargement des produits…'
                                                            : pharmacyProducts.length === 0
                                                                ? 'Aucun produit disponible'
                                                                : 'Sélectionner un produit'}
                                                    </option>
                                                    {pharmacyProducts.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {[p.name, p.dci, p.dosage].filter(Boolean).join(' — ')}
                                                            {p.sale_price ? ` (${p.sale_price} XAF)` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={quantity}
                                                    min="1"
                                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button className="btn btn-primary w-100" onClick={handleAddProduct}>
                                                    <i className="ri-add-line"></i> Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={orderCase === 1 ? "col-lg-12" : "col-lg-4"}>
                            <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                                <div className="card-header bg-white text-center py-3">
                                    <h5 className="mb-0">Récapitulatif</h5>
                                </div>
                                <div className="card-body">
                                    {(orderCase === 2 || orderCase === 3) && addedProducts.length > 0 && (
                                        <div className="mb-4">
                                            <h6 className="text-muted small text-uppercase mb-3">Produits Ajoutés</h6>
                                            <ul className="list-group list-group-flush mb-3">
                                                {addedProducts.map(p => (
                                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                        <div>
                                                            <span className="d-block">{p.name}</span>
                                                            <small className="text-muted">Qté: {p.quantity}</small>
                                                        </div>
                                                        <span className="fw-semibold">{p.total} XAF</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Total Panier</span>
                                        <span className="fw-bold">{items.filter(i => i.status !== 'unavailable').reduce((acc, i) => acc + i.total, 0)} XAF</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Total Ajouts</span>
                                        <span className="fw-bold">{addedProducts.reduce((acc, p) => acc + p.total, 0)} XAF</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="h5">Total Final</span>
                                        <span className="h5 text-primary fw-bold">
                                            {items.filter(i => i.status !== 'unavailable').reduce((acc, i) => acc + i.total, 0) + addedProducts.reduce((acc, p) => acc + p.total, 0)} XAF
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`btn ${[...items, ...addedProducts].filter(i => i.status === 'reserved').length > 0 ? 'btn-success' : 'btn-danger'} btn-lg w-100 mb-3 shadow-sm`}
                                        onClick={validateOrder}
                                        disabled={isValidating || [...items, ...addedProducts].every(i => i.status === 'pending')}
                                    >
                                        {isValidating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-check-line me-2"></i>
                                                {[...items, ...addedProducts].filter(i => i.status === 'reserved').length > 0
                                                    ? "Valider la commande"
                                                    : "Rejeter la commande"}
                                            </>
                                        )}
                                    </button>
                                    {[...items, ...addedProducts].some(i => i.status === 'pending') && (
                                        <p className="text-warning small text-center mb-3 fw-medium">
                                            <i className="ri-information-line me-1"></i>
                                            {[...items, ...addedProducts].filter(i => i.status === 'pending').length} produit(s) non encore marqué(s) — seront ignorés.
                                        </p>
                                    )}
                                    <button className="btn btn-outline-secondary w-100" onClick={() => router.push('/orders')}>
                                        Retour aux commandes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Modal QR Code */}
            <div className="modal fade" id="qrCodeModal" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="ri-qr-code-line me-2"></i>QR Code de la commande
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body text-center py-4">
                            {qrLoading ? (
                                <div className="py-4">
                                    <span className="spinner-border text-primary"></span>
                                    <p className="mt-3 text-muted">Génération du QR code...</p>
                                </div>
                            ) : qrError ? (
                                <div className="alert alert-danger">
                                    <i className="ri-error-warning-line me-2"></i>{qrError}
                                </div>
                            ) : qrCodeData ? (
                                <>
                                    {(qrCodeData.qr_code_url || qrCodeData.qr_code || qrCodeData.image) ? (
                                        <img
                                            src={qrCodeData.qr_code_url ?? qrCodeData.qr_code ?? qrCodeData.image}
                                            alt="QR Code commande"
                                            style={{ maxWidth: '260px', width: '100%' }}
                                            className="img-fluid border rounded p-2"
                                        />
                                    ) : (
                                        <pre className="text-start small bg-light p-3 rounded">
                                            {JSON.stringify(qrCodeData, null, 2)}
                                        </pre>
                                    )}
                                    <p className="text-muted small mt-3">
                                        Ce QR code sera scanné par le livreur lors du retrait en officine.
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted">Aucun QR code disponible pour cette commande.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>
                            {(qrCodeData?.qr_code_url || qrCodeData?.qr_code || qrCodeData?.image) && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => window.print()}
                                >
                                    <i className="ri-printer-line me-2"></i>Imprimer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Sous-commande */}
            <div className="modal fade" id="subOrderModal" tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="ri-add-circle-line me-2"></i>Générer une sous-commande
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            {subOrderMsg && (
                                <div className={`alert alert-${subOrderMsg.type} alert-dismissible`}>
                                    <i className={`${subOrderMsg.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} me-2`}></i>
                                    {subOrderMsg.text}
                                    <button type="button" className="btn-close" onClick={() => setSubOrderMsg(null)}></button>
                                </div>
                            )}
                            <p className="text-muted small mb-3">
                                Ajoutez les produits à préparer pour le patient en saisissant leur identifiant, quantité et prix unitaire.
                            </p>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID Produit</th>
                                            <th style={{ width: '110px' }}>Quantité</th>
                                            <th style={{ width: '140px' }}>Prix unitaire (XAF)</th>
                                            <th style={{ width: '60px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="UUID du produit"
                                                        value={item.product_id}
                                                        onChange={e => updateSubItem(index, 'product_id', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => updateSubItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min={0}
                                                        value={item.unit_price}
                                                        onChange={e => updateSubItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeSubItem(index)}
                                                        disabled={subItems.length === 1}
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addSubItem}>
                                <i className="ri-add-line me-1"></i>Ajouter un produit
                            </button>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleSubmitSubOrder}
                                disabled={subOrderLoading}
                            >
                                {subOrderLoading
                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi...</>
                                    : <><i className="ri-send-plane-line me-2"></i>Générer la sous-commande</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
