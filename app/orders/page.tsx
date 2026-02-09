'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState('all');

    // Données fictives pour le tableau
    const orders = [
        { id: '#dca9fa28', patient: 'Jean Dupont', date: '2023-10-24', total: '15,000 XAF', payment: 'PAID', status: 'COMPLETED' },
        { id: '#bfc2a3d4', patient: 'Marie Kouam', date: '2023-10-25', total: '8,500 XAF', payment: 'UNPAID', status: 'PENDING' },
        { id: '#e8f1b2c5', patient: 'Paul Atangana', date: '2023-10-25', total: '22,000 XAF', payment: 'PAID', status: 'APPROVED' },
        { id: '#a1b2c3d4', patient: 'Alice Ndoumbe', date: '2023-10-26', total: '5,000 XAF', payment: 'UNPAID', status: 'REJECTED' },
        { id: '#f5e4d3c2', patient: 'Samuel Eto\'o', date: '2023-10-26', total: '45,000 XAF', payment: 'PAID', status: 'COMPLETED' },
        { id: '#7h8i9j10', patient: 'Cathérine Abena', date: '2023-10-27', total: '12,500 XAF', payment: 'UNPAID', status: 'CANCELLED' },
        { id: '#k1l2m3n4', patient: 'Pierre Mvondo', date: '2023-10-27', total: '3,000 XAF', payment: 'PAID', status: 'COMPLETED' },
        { id: '#p5q6r7s8', patient: 'Solange Ngo', date: '2023-10-28', total: '18,500 XAF', payment: 'PAID', status: 'APPROVED' },
    ];

    // Données fictives pour les statistiques
    const stats = [
        { label: 'Total Commandes', count: orders.length, sub: 'Toutes les commandes', type: 'primary', icon: 'ri-shopping-cart-line', filter: 'all' },
        { label: 'En Attente', count: orders.filter(o => o.status === 'PENDING').length, sub: 'À traiter', type: 'secondary', icon: 'ri-time-line', filter: 'PENDING' },
        { label: 'Approuvées', count: orders.filter(o => o.status === 'APPROVED').length, sub: 'Confirmées', type: 'success', icon: 'ri-checkbox-circle-line', filter: 'APPROVED' },
        { label: 'Rejetées', count: orders.filter(o => o.status === 'REJECTED').length, sub: 'Refusées', type: 'danger', icon: 'ri-close-circle-line', filter: 'REJECTED' },
        { label: 'Terminées', count: orders.filter(o => o.status === 'COMPLETED').length, sub: 'Livrées', type: 'success', icon: 'ri-medal-line', filter: 'COMPLETED' },
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPayment = paymentFilter === 'all' || order.payment === paymentFilter;
        const matchesStatus = deliveryFilter === 'all' || order.status === deliveryFilter;
        return matchesSearch && matchesPayment && matchesStatus;
    });

    return (
        <div className="bg-white min-vh-100">
            <style jsx>{`
                .dashboard-main-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border-left: 4px solid transparent;
                }
                .dashboard-main-card:hover, .dashboard-main-card.active {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
                }
                .dashboard-main-card.active {
                    border-left-width: 6px;
                }
                .dashboard-main-card.primary { border-left-color: #3ab047; }
                .dashboard-main-card.secondary { border-left-color: #6c757d; }
                .dashboard-main-card.success { border-left-color: #21ba45; }
                .dashboard-main-card.danger { border-left-color: #db2828; }
                
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    font-size: 24px;
                }
                .bg-primary-transparent { background: rgba(58, 176, 71, 0.1); color: #3ab047; }
                .bg-secondary-transparent { background: rgba(108, 117, 125, 0.1); color: #6c757d; }
                .bg-success-transparent { background: rgba(33, 186, 69, 0.1); color: #21ba45; }
                .bg-danger-transparent { background: rgba(219, 40, 40, 0.1); color: #db2828; }

                .order-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                }
                .badge-paid { background: #e6f4ea; color: #1e7e34; }
                .badge-unpaid { background: #fff4e5; color: #b7791f; }
            `}</style>

            <Header />
            <Sidebar />

            <main className="main-content app-content">
                <div className="container-fluid page-container main-body-container">
                    
                    {/* Breadcrumb */}
                    <div className="page-header-breadcrumb mb-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <h1 className="page-title fw-semibold fs-18 mb-0">Tableau de Bord des Commandes</h1>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                                <li className="breadcrumb-item">Pharmacie</li>
                                <li className="breadcrumb-item active">Commandes</li>
                            </ol>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="col-xl-2 col-lg-4 col-md-6 col-sm-6 mb-3">
                                <div 
                                    className={`card custom-card dashboard-main-card h-100 border-0 shadow-sm ${stat.type} ${deliveryFilter === stat.filter ? 'active' : ''}`}
                                    onClick={() => setDeliveryFilter(stat.filter)}
                                >
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`stat-icon bg-${stat.type}-transparent`}>
                                                <i className={stat.icon}></i>
                                            </div>
                                            <div className="flex-fill">
                                                <span className="fs-12 text-muted d-block mb-1">{stat.label}</span>
                                                <h4 className="fw-bold mb-0 lh-1">{stat.count}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters & Table */}
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="card custom-card border-0 shadow-sm">
                                <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3 p-4">
                                    <div className="search-box" style={{ maxWidth: '300px', flex: '1' }}>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0"><i className="ri-search-line"></i></span>
                                            <input 
                                                type="text" 
                                                className="form-control border-0 bg-light" 
                                                placeholder="Rechercher une commande..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 flex-wrap align-items-center">
                                        <select 
                                            className="form-select border-light w-auto"
                                            value={paymentFilter}
                                            onChange={(e) => setPaymentFilter(e.target.value)}
                                        >
                                            <option value="all">Tous les paiements</option>
                                            <option value="PAID">Payé</option>
                                            <option value="UNPAID">Non payé</option>
                                        </select>

                                        <select 
                                            className="form-select border-light w-auto"
                                            value={deliveryFilter}
                                            onChange={(e) => setDeliveryFilter(e.target.value)}
                                        >
                                            <option value="all">Tous les statuts</option>
                                            <option value="PENDING">En attente</option>
                                            <option value="APPROVED">Approuvée</option>
                                            <option value="COMPLETED">Terminée</option>
                                            <option value="REJECTED">Rejetée</option>
                                            <option value="CANCELLED">Annulée</option>
                                        </select>

                                        <button className="btn btn-primary d-flex align-items-center gap-2" style={{ backgroundColor: '#3ab047', borderColor: '#3ab047' }}>
                                            <i className="ri-download-2-line"></i> Export
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table order-table table-hover mb-0 align-middle">
                                            <thead>
                                                <tr>
                                                    <th className="ps-4">ID Commande</th>
                                                    <th>Patient</th>
                                                    <th>Date</th>
                                                    <th>Total</th>
                                                    <th>Paiement</th>
                                                    <th>Statut</th>
                                                    <th className="text-end pe-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.length > 0 ? (
                                                    filteredOrders.map((order, idx) => (
                                                        <tr key={idx}>
                                                            <td className="ps-4 fw-medium text-primary">{order.id}</td>
                                                            <td>{order.patient}</td>
                                                            <td className="text-muted">{order.date}</td>
                                                            <td className="fw-semibold">{order.total}</td>
                                                            <td>
                                                                <span className={`badge rounded-pill ${order.payment === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>
                                                                    {order.payment === 'PAID' ? 'Payé' : 'Non payé'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${
                                                                    order.status === 'COMPLETED' ? 'bg-success' : 
                                                                    order.status === 'PENDING' ? 'bg-warning' : 
                                                                    order.status === 'APPROVED' ? 'bg-primary' :
                                                                    order.status === 'REJECTED' ? 'bg-danger' :
                                                                    'bg-secondary'
                                                                } bg-opacity-10 text-${
                                                                    order.status === 'COMPLETED' ? 'success' : 
                                                                    order.status === 'PENDING' ? 'warning' : 
                                                                    order.status === 'APPROVED' ? 'primary' :
                                                                    order.status === 'REJECTED' ? 'danger' :
                                                                    'secondary'
                                                                }`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="text-end pe-4">
                                                                <Link href={`/order-details/${order.id.replace('#', '')}`} className="btn btn-icon btn-sm btn-light-transparent rounded-pill me-1">
                                                                    <i className="ri-eye-line"></i>
                                                                </Link>
                                                                <button className="btn btn-icon btn-sm btn-light-transparent rounded-pill text-info">
                                                                    <i className="ri-printer-line"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-5">
                                                            <div className="text-muted">
                                                                <i className="ri-search-line fs-24 d-block mb-2"></i>
                                                                Aucune commande ne correspond à vos critères.
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card-footer p-3 border-top-0">
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination justify-content-end mb-0">
                                            <li className="page-item disabled"><a className="page-link shadow-none" href="#">Précédent</a></li>
                                            <li className="page-item active"><a className="page-link shadow-none" href="#" style={{ backgroundColor: '#3ab047', borderColor: '#3ab047' }}>1</a></li>
                                            <li className="page-item"><a className="page-link shadow-none" href="#">Suivant</a></li>
                                        </ul>
                                    </nav>
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
