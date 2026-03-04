"use client";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // Statuts réels backend
  PENDING:              { label: "En attente",    className: "bg-orange-50 text-orange-600" },
  ACCEPTED:             { label: "Acceptée",      className: "bg-green-50 text-green-600" },
  RESERVED:             { label: "Acceptée",      className: "bg-green-50 text-green-600" },
  IN_PICKUP:            { label: "Prêt collecte", className: "bg-blue-50 text-blue-600" },
  IN_DELIVERY:          { label: "En livraison",  className: "bg-blue-50 text-blue-700" },
  DELIVERED:            { label: "Livré",         className: "bg-green-600 text-white" },
  CANCELLED:            { label: "Annulée",       className: "bg-red-50 text-red-500" },
  REJECTED:             { label: "Rejetée",       className: "bg-red-50 text-red-500" },
  // Statuts complémentaires
  PENDING_PHARMACY:     { label: "En attente",    className: "bg-orange-50 text-orange-600" },
  PENDING_PATIENT:      { label: "À confirmer",   className: "bg-yellow-50 text-yellow-600" },
  PARTIAL_VALIDATION:   { label: "À confirmer",   className: "bg-yellow-50 text-yellow-600" },
  COMPLETED:            { label: "Terminée",      className: "bg-green-700 text-white" },
  // Paiement
  UNPAID:               { label: "Non payé",      className: "bg-orange-50 text-orange-600" },
  PAID:                 { label: "Payé",          className: "bg-green-50 text-green-600" },
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
