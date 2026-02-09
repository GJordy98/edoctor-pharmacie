'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

    // Simulation de chargement des données
    useEffect(() => {
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            try {
                // PARAMÈTRES BACKEND (À configurer plus tard)
                // const res = await fetch(`${API_BASE_URL}/api/v1/officine-order/${id}/`);
                // const data = await res.json();
                
                // Simulation d'une commande Case 3 (Ordonnance + Panier)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const mockOrder = {
                    id: id || '',
                    patient: { name: "John Doe", phone: "+237 699 00 00 00" },
                    date: "2024-02-04 10:20",
                    status: "PENDING",
                    payment_status: "UNPAID",
                    prescription: "https://via.placeholder.com/600x800?text=Ordonnance+Exemple",
                    total_amount: 5500
                };

                const mockItems: OrderItem[] = [
                    { id: 1, name: "Paracétamol", quantity: 2, price: 500, total: 1000, status: 'pending' },
                    { id: 2, name: "Amoxicilline", quantity: 1, price: 2500, total: 2500, status: 'pending' }
                ];

                setOrder(mockOrder);
                setItems(mockItems);
            } catch (error) {
                console.error("Error fetching order:", error);
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
        // Logique d'ajout (simulation)
        const newProduct: OrderItem = {
            id: Date.now(),
            name: "Produit Ajouté " + selectedProductId,
            quantity: quantity,
            price: 1500,
            total: 1500 * quantity,
            status: 'reserved'
        };
        setAddedProducts([...addedProducts, newProduct]);
        setSelectedProductId('');
        setQuantity(1);
    };

    const toggleItemStatus = (id: number | string, status: 'reserved' | 'unavailable') => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    const validateOrder = async () => {
        const reservedItems = [...items, ...addedProducts].filter(item => item.status === 'reserved');
        const isRejection = reservedItems.length === 0;

        setIsValidating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const payload = {
                order_id: id,
                items: items.map(i => ({ id: i.id, status: i.status })),
                added_products: addedProducts.map(i => ({ id: i.id, status: i.status })),
                action: isRejection ? 'REJECT' : 'VALIDATE'
            };
            console.log("Validation payload:", payload);

            alert(isRejection ? "Commande rejetée (aucun produit disponible)" : "Commande validée avec succès !");
            router.push('/orders');
        } catch (error) {
            console.error("Validation error:", error);
            alert("Erreur lors de la validation");
        } finally {
            setIsValidating(false);
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
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h1 className="h4 mb-0">Détails Commande #{id?.slice(0, 8)}</h1>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                <li className="breadcrumb-item"><Link href="/orders">Commandes</Link></li>
                                <li className="breadcrumb-item active">Détails</li>
                            </ol>
                        </nav>
                    </div>

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
                                                >
                                                    <option value="">Sélectionner un produit</option>
                                                    <option value="101">Paracétamol 500mg</option>
                                                    <option value="102">Efferalgan</option>
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
                                        disabled={isValidating || [...items, ...addedProducts].some(i => i.status === 'pending')}
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
                                        <p className="text-danger small text-center mb-3 fw-medium">
                                            <i className="ri-error-warning-line me-1"></i>
                                            Marquez la disponibilité de chaque produit.
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
            <Footer />
        </div>
    );
}
