"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api-client";
import { PharmaWallet, PharmaTransaction } from "@/lib/types";
import {
  Wallet, PlusCircle, CheckCircle, Lock,
  History, CreditCard, TrendingUp, TrendingDown,
  Loader2, Wifi, ClipboardList, RefreshCw,
} from "lucide-react";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";

const statusLabel: Record<string, string> = {
  COMPLETED: "Complété",
  PENDING: "En attente",
  FAILED: "Échoué",
};

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<PharmaWallet | null>(null);
  const [transactions, setTransactions] = useState<PharmaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletData, txData] = await Promise.all([
        api.getWallet(),
        api.getWalletTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(txData);
    } catch (err) {
      console.error("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Portefeuille">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={36} className="text-[#22C55E] animate-spin mb-4" />
          <p className="text-[#94A3B8] text-[14px]">Chargement du portefeuille…</p>
        </div>
      </DashboardLayout>
    );
  }

  const availableBalance = wallet ? wallet.balance - wallet.locked_amount : 0;

  return (
    <DashboardLayout title="Portefeuille">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Cartes solde ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Solde principal */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-7 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                  Solde total
                </span>
                <div className="flex items-center gap-2">
                  <Wallet size={22} className="opacity-60" />
                  <button
                    onClick={fetchData}
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    title="Actualiser"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {wallet ? (
                <p className="text-4xl font-black tracking-tight mb-6">
                  {formatPrice(wallet.balance)}
                </p>
              ) : (
                <div className="mb-6">
                  <p className="text-2xl font-black opacity-60">Portefeuille indisponible</p>
                  <p className="text-[12px] opacity-70 mt-1">
                    Contactez le support si le problème persiste.
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowRechargeModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#22C55E] font-bold text-[13px] rounded-xl shadow hover:scale-105 transition-all"
              >
                <PlusCircle size={16} />
                Recharger
              </button>
            </div>
          </div>

          {/* Détail disponible / bloqué */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between">
            {wallet ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-[12px] font-bold text-green-700">Disponible</span>
                    </div>
                    <span className="text-[13px] font-black text-green-700">
                      {formatPrice(availableBalance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-orange-600" />
                      <span className="text-[12px] font-bold text-orange-700">Bloqué</span>
                    </div>
                    <span className="text-[13px] font-black text-orange-700">
                      {formatPrice(wallet.locked_amount)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#94A3B8] text-center mt-3 italic">
                  Fonds réservés pour les remboursements en attente.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                <Wallet size={32} className="text-gray-200" />
                <p className="text-[12px] text-[#94A3B8] text-center">
                  Aucun portefeuille trouvé
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Historique des transactions ── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1E293B] flex items-center gap-2">
              <History size={16} className="text-[#22C55E]" />
              Historique des transactions
            </h3>
            {transactions.length > 0 && (
              <span className="text-[11px] text-[#94A3B8]">
                {transactions.length} transaction{transactions.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center">
                <ClipboardList size={24} className="text-gray-200" />
              </div>
              <p className="text-[14px] font-semibold text-[#94A3B8]">Aucune transaction</p>
              <p className="text-[12px] text-[#94A3B8]">Les mouvements apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F8FAFC]">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "CREDIT"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tx.type === "CREDIT"
                        ? <TrendingUp size={18} />
                        : <TrendingDown size={18} />
                      }
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1E293B]">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#94A3B8]">
                          {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            statusColors[tx.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusLabel[tx.status] ?? tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[14px] font-black ${
                      tx.type === "CREDIT" ? "text-green-600" : "text-[#1E293B]"
                    }`}
                  >
                    {tx.type === "CREDIT" ? "+" : "−"}
                    {formatPrice(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal rechargement ── */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-5">
                <Wifi size={28} className="text-[#22C55E]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1E293B] mb-3">
                Rechargement bientôt disponible
              </h3>
              <p className="text-[13px] text-[#94A3B8] mb-6">
                Nous intégrons les solutions de paiement mobile (Orange Money, MTN Money)
                pour simplifier vos transactions.
              </p>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl transition-colors"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
