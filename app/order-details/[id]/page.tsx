'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// Simulation de composants de layout (à adapter selon tes composants réels)
// import Header from '@/components/layout/Header';
// import Sidebar from '@/components/layout/Sidebar';
// import Footer from '@/components/layout/Footer';

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

                const mockItems = [
                    { id: 1, name: "Paracétamol", quantity: 2, price: 500, total: 1000 },
                    { id: 2, name: "Amoxicilline", quantity: 1, price: 2500, total: 2500 }
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
        const newProduct = {
            id: Date.now(),
            name: "Produit Ajouté " + selectedProductId,
            quantity: quantity,
            price: 1500,
            total: 1500 * quantity
        };
        setAddedProducts([...addedProducts, newProduct]);
        setSelectedProductId('');
        setQuantity(1);
    };

    const validateOrder = async () => {
        setIsValidating(true);
        try {
            // PARAMÈTRES BACKEND
            // await fetch(`${API_BASE_URL}/api/v1/officine-order/${id}/validate-officine-order/`, { method: 'POST' });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert("Commande validée avec succès !");
            router.push('/products_list');
        } catch (error) {
            console.error("Validation error:", error);
            alert("Erreur lors de la validation");
        } finally {
            setIsValidating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <style jsx>{`
                .order-header {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .prescription-container img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                }
                .case-badge {
                    font-size: 0.8rem;
                    padding: 5px 12px;
                    border-radius: 50px;
                    margin-bottom: 10px;
                    display: inline-block;
                }
            `}</style>

            <div className="container-fluid">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h1 className="h4 mb-0">Détails Commande #{id?.slice(0, 8)}</h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="#">Accueil</a></li>
                            <li className="breadcrumb-item"><a href="#">Commandes</a></li>
                            <li className="breadcrumb-item active">Détails</li>
                        </ol>
                    </nav>
                </div>

                {/* Badge du Cas */}
                <div className={`case-badge bg-primary text-white mb-3`}>
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
                            <div className="card-body">
                                <small className="text-muted d-block mb-1"><i className="ri-user-line me-1"></i> Patient</small>
                                <span className="fw-bold">{order?.patient?.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <small className="text-muted d-block mb-1"><i className="ri-calendar-line me-1"></i> Date</small>
                                <span className="fw-bold">{order?.date}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <small className="text-muted d-block mb-1"><i className="ri-shopping-bag-line me-1"></i> Statut</small>
                                <span className="badge bg-warning-transparent">{order?.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <small className="text-muted d-block mb-1"><i className="ri-bank-card-line me-1"></i> Paiement</small>
                                <span className="badge bg-secondary-transparent">{order?.payment_status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Colonne Gauche : Ordonnance et Produits existants */}
                    <div className={orderCase === 1 ? "col-lg-12" : "col-lg-8"}>
                        {/* Section Ordonnance (Cas 2 et 3) */}
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
                                            className="img-fluid"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section Produits (Cas 1 et 3) */}
                        {(orderCase === 1 || orderCase === 3) && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white">
                                    <h5 className="card-title mb-0">Produits de la commande</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Produit</th>
                                                    <th className="text-center">Quantité</th>
                                                    <th>Prix Unitaire</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td>{item.price} XAF</td>
                                                        <td className="fw-bold">{item.total} XAF</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formulaire d'ajout (Cas 2 et 3) */}
                        {(orderCase === 2 || orderCase === 3) && (
                            <div className="card border-0 shadow-sm">
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
                                                <i className="ri-add-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Colonne Droite : Recap et Actions */}
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
                                    <span className="fw-bold">{order?.total_amount || 0} XAF</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Total Ajouts</span>
                                    <span className="fw-bold">{addedProducts.reduce((acc, p) => acc + p.total, 0)} XAF</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="h5">Total Final</span>
                                    <span className="h5 text-primary fw-bold">
                                        {(order?.total_amount || 0) + addedProducts.reduce((acc, p) => acc + p.total, 0)} XAF
                                    </span>
                                </div>

                                <button 
                                    className="btn btn-success btn-lg w-100 mb-3" 
                                    onClick={validateOrder}
                                    disabled={isValidating}
                                >
                                    {isValidating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Validation...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-check-line me-2"></i>
                                            Valider la commande
                                        </>
                                    )}
                                </button>
                                <button className="btn btn-outline-secondary w-100">
                                    Retour aux commandes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
