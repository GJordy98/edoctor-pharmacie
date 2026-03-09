"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import PhoneInput from "@/components/ui/PhoneInput";

export default function LoginPage() {
  const router = useRouter();

  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!telephone || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.login({ telephone, password });

      if (response.access && response.refresh) {
        api.setTokens(response.access, response.refresh);
        if (response.account) {
          localStorage.setItem("account", JSON.stringify(response.account));
        }
        if (response.officine) {
          localStorage.setItem("officine", JSON.stringify(response.officine));
        }
        router.push("/orders");
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Identifiants invalides ou erreur serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="#22C55E" />
                <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" fill="none" />
              </svg>
              <div>
                <span className="text-[18px] font-bold text-[#1E293B] leading-none block">PharmaCare</span>
                <span className="text-[11px] text-[#94A3B8] leading-none">Gestion de pharmacie</span>
              </div>
            </div>
            <h1 className="text-[22px] font-semibold text-[#1E293B] mt-2">Se connecter</h1>
            <p className="text-[13px] text-[#94A3B8] mt-1">Accédez à votre espace pharmacie</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                Téléphone
              </label>
              <PhoneInput
                id="login-telephone"
                value={telephone}
                onChange={setTelephone}
                placeholder="6XX XX XX XX"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full pl-10 pr-11 py-3 text-[14px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link
                  href="/forgot-password"
                  className="text-[12px] text-[#22C55E] hover:text-[#16A34A] font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[15px] rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[13px] text-[#94A3B8] mt-6">
            Pas encore de compte ?{" "}
            <Link
              href="/create_pharmacy"
              className="text-[#22C55E] hover:text-[#16A34A] font-semibold"
            >
              Créer une pharmacie
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
