"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Pill,
  Plus,
  Wallet,
  Clock,
  UserCircle,
  Settings,
  LogOut,
  PackageSearch,
} from "lucide-react";

const navItems = [
  { href: "/orders", icon: ClipboardList, label: "Commandes" },
  { href: "/products_list", icon: Pill, label: "Médicaments" },
  { href: "/add-product", icon: Plus, label: "Ajouter stock" },
  { href: "/wallet", icon: Wallet, label: "Portefeuille" },
  { href: "/schedule", icon: Clock, label: "Horaires" },
  { href: "/recuperation-colis", icon: PackageSearch, label: "Récupération colis" },
];

// Barre mobile : 4 items max pour ne pas saturer l'écran
const mobileNavItems = [
  { href: "/orders", icon: ClipboardList, label: "Commandes" },
  { href: "/products_list", icon: Pill, label: "Médicaments" },
  { href: "/recuperation-colis", icon: PackageSearch, label: "Colis" },
  { href: "/wallet", icon: Wallet, label: "Portefeuille" },
];

const bottomItems = [
  { href: "/profile", icon: UserCircle, label: "Profil" },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

function logout() {
  if (typeof window !== "undefined") {
    localStorage.clear();
    window.location.href = "/login";
  }
}

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E2E8F0] z-40">
        {/* Logo PharmaCare */}
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0] shrink-0">
          <Link href="/orders" className="flex items-center gap-3 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="e-Dr TIM Pharmacy" style={{ height: 44, width: 'auto' }} className="object-contain" />
            <div>
              <span className="text-[15px] font-bold text-[#1E293B] leading-none">e-Dr TIM</span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-none">Gestion de pharmacie</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(href)
                ? "bg-[#F0FDF4] text-[#22C55E]"
                : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                }`}
            >
              {isActive(href) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#22C55E] rounded-r-full" />
              )}
              <Icon
                size={20}
                className={isActive(href) ? "text-[#22C55E]" : "text-[#94A3B8] group-hover:text-[#1E293B]"}
              />
              <span className="text-[14px] font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#E2E8F0] space-y-1">
          {bottomItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(href)
                ? "bg-[#F0FDF4] text-[#22C55E]"
                : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                }`}
            >
              <Icon size={20} />
              <span className="text-[14px] font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#EF4444] hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="text-[14px] font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${isActive(href) ? "text-[#22C55E]" : "text-[#94A3B8]"
                }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </Link>
          ))}
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${pathname === "/settings" ? "text-[#22C55E]" : "text-[#94A3B8]"
              }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium leading-tight">Paramètres</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
