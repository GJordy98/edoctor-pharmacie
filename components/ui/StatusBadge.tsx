"use client";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // ── Statuts officine-order (enum backend confirmé) ────────────────────
  PENDING:          { label: "En attente",      className: "bg-orange-50 text-orange-600" },
  PENDING_PATIENT:  { label: "À confirmer",     className: "bg-yellow-50 text-yellow-600" },
  APPROVED:         { label: "Acceptée",        className: "bg-green-50 text-green-600" },
  READY_FOR_PICKUP: { label: "Prêt collecte",   className: "bg-blue-50 text-blue-600" },
  PICKED_UP:        { label: "En livraison",    className: "bg-indigo-50 text-indigo-600" },
  COMPLETED:        { label: "Terminée",        className: "bg-teal-50 text-teal-700" },
  REJECTED:         { label: "Rejetée",         className: "bg-red-50 text-red-500" },
  CANCELLED:        { label: "Annulée",         className: "bg-red-50 text-red-400" },
  // ── Statuts historique produits ───────────────────────────────────────
  RESERVED:         { label: "Réservé",         className: "bg-blue-50 text-blue-600" },
  PICKED:           { label: "Collecté",        className: "bg-indigo-50 text-indigo-600" },
  // ── Paiement ─────────────────────────────────────────────────────────
  UNPAID:           { label: "Non payé",        className: "bg-orange-50 text-orange-600" },
  PAID:             { label: "Payé",            className: "bg-green-50 text-green-600" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-[#F8FAFC] text-[#94A3B8]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
