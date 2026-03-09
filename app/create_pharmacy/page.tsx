'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Building2, User, ShieldCheck, ArrowRight, ArrowLeft,
    CheckCircle2, Loader2, Mail, Lock, Eye, EyeOff,
    MapPin, FileText, Hash,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { PharmacistRegisterData } from '@/lib/types';
import PhoneInput from '@/components/ui/PhoneInput';

// ── Types ──────────────────────────────────────────────────
interface PharmacyForm {
    name: string;
    description: string;
    telephone: string;
    address: {
        city: string;
        rue: string;
        quater: string;
        bp: string;
        longitude: string;
        latitude: string;
        telephone: string;
    };
}

interface PharmacistForm {
    last_name: string;
    first_name: string;
    email: string;
    telephone: string;
    password: string;
    confirmPassword: string;
}

// ── Step indicator ─────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    const steps = [
        { label: 'Pharmacie', icon: Building2 },
        { label: 'Pharmacien', icon: User },
        { label: 'Validation', icon: ShieldCheck },
    ];

    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => {
                const Icon = s.icon;
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done
                                ? 'border-[#22C55E] bg-[#22C55E]'
                                : active
                                    ? 'border-[#22C55E] bg-white'
                                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                                }`}>
                                {done ? (
                                    <CheckCircle2 size={18} className="text-white" />
                                ) : (
                                    <Icon size={16} className={active ? 'text-[#22C55E]' : 'text-[#CBD5E1]'} />
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold ${active ? 'text-[#22C55E]' : done ? 'text-[#22C55E]' : 'text-[#CBD5E1]'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-[2px] w-16 mb-4 mx-1 transition-all ${i < current ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Input wrapper ──────────────────────────────────────────
function Field({
    label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {hint && <p className="text-[11px] text-[#94A3B8] mt-1">{hint}</p>}
        </div>
    );
}

const inputCls = "w-full pl-10 pr-4 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all";
const inputNoPadCls = "w-full px-4 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all";

function IconInput({ icon: Icon, ...props }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative">
            <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input className={inputCls} {...props} />
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────
export default function CreatePharmacyPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // OTP state
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [registeredPhone, setRegisteredPhone] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [pharmacy, setPharmacy] = useState<PharmacyForm>({
        name: '', description: '', telephone: '',
        address: { city: '', rue: '', quater: '', bp: '', longitude: '', latitude: '', telephone: '' },
    });

    const [pharmacist, setPharmacist] = useState<PharmacistForm>({
        last_name: '', first_name: '', email: '', telephone: '', password: '', confirmPassword: '',
    });

    // ── Handlers ──────────────────────────────────────────
    const setPh = (field: keyof Omit<PharmacyForm, 'address'>, val: string) =>
        setPharmacy(p => ({ ...p, [field]: val }));

    const setAddr = (field: keyof PharmacyForm['address'], val: string) =>
        setPharmacy(p => ({ ...p, address: { ...p.address, [field]: val } }));

    const setPhist = (field: keyof PharmacistForm, val: string) =>
        setPharmacist(p => ({ ...p, [field]: val }));

    // ── Step 1 validation → Step 2 ────────────────────────
    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pharmacy.name || !pharmacy.address.city || !pharmacy.address.latitude || !pharmacy.address.longitude) {
            setError('Le nom, la ville et les coordonnées GPS sont obligatoires.');
            return;
        }
        setError(null);
        setStep(1);
    };

    // ── Step 2 → API calls → Step 3 ───────────────────────
    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!pharmacist.last_name || !pharmacist.telephone || !pharmacist.password) {
            setError('Le nom, le téléphone et le mot de passe sont obligatoires.');
            return;
        }
        if (pharmacist.password !== pharmacist.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (pharmacist.password.length < 6) {
            setError('Le mot de passe doit faire au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Créer la pharmacie
            const pharmacyPayload = {
                name: pharmacy.name,
                description: pharmacy.description,
                telephone: pharmacy.telephone,
                adresse: {
                    city: pharmacy.address.city,
                    rue: pharmacy.address.rue,
                    quater: pharmacy.address.quater,
                    bp: pharmacy.address.bp,
                    longitude: parseFloat(pharmacy.address.longitude) || 0,
                    latitude: parseFloat(pharmacy.address.latitude) || 0,
                    telephone: pharmacy.address.telephone || pharmacy.telephone,
                },
            };
            const pharmacyRes = await api.registerPharmacy(pharmacyPayload) as Record<string, unknown>;
            const officineId = String(pharmacyRes.id ?? pharmacyRes.uuid ?? pharmacyRes.officine ?? '');

            if (!officineId) {
                throw new Error("Pharmacie créée mais identifiant introuvable — contactez le support.");
            }

            // 2️⃣ Créer le pharmacien
            const pharmacistPayload: PharmacistRegisterData = {
                officine: officineId,
                telephone: pharmacist.telephone,
                email: pharmacist.email,
                last_name: pharmacist.last_name,
                first_name: pharmacist.first_name,
                password: pharmacist.password,
            };
            await api.registerPharmacist(pharmacistPayload);

            // 3️⃣ Passer à l'OTP
            setRegisteredPhone(pharmacist.telephone);
            setStep(2);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP handlers ──────────────────────────────────────
    const handleOtpChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otpDigits];
        next[i] = val.slice(-1);
        setOtpDigits(next);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };

    const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setOtpDigits(next);
        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otpDigits.join('');
        if (code.length !== 6) { setError('Entrez les 6 chiffres du code OTP.'); return; }
        setLoading(true);
        setError(null);
        try {
            await api.validateOtp({ otp: code, telephone: registeredPhone });
            router.push('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Code OTP invalide ou expiré.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-white to-[#F0FDF4] flex items-center justify-center p-4">
            <div className="w-full max-w-xl">

                {/* Logo + title */}
                <div className="text-center mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="e-Dr TIM" className="h-12 w-auto mx-auto mb-3 object-contain" />
                    <h1 className="text-[22px] font-bold text-[#1E293B]">Création de compte</h1>
                    <p className="text-[13px] text-[#94A3B8] mt-1">Enregistrez votre pharmacie en quelques étapes</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl shadow-black/5 overflow-hidden">

                    {/* Progress bar */}
                    <div className="h-1 bg-[#E2E8F0]">
                        <div
                            className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-700"
                            style={{ width: `${((step + 1) / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-6 md:p-8">
                        <StepIndicator current={step} />

                        {/* Error banner */}
                        {error && (
                            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-5">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-red-500 text-[10px] font-bold">!</span>
                                </div>
                                <p className="text-[13px] text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {/* ── STEP 0 : Pharmacie ── */}
                        {step === 0 && (
                            <form onSubmit={handleStep1} className="space-y-4">
                                <div>
                                    <p className="text-[17px] font-bold text-[#1E293B]">Informations de la pharmacie</p>
                                    <p className="text-[12px] text-[#94A3B8] mt-0.5">Renseignez les informations générales et l&apos;adresse.</p>
                                </div>

                                <Field label="Nom de la pharmacie" required>
                                    <IconInput icon={Building2} type="text" placeholder="Pharmacie de Jean Bernard"
                                        value={pharmacy.name} onChange={e => setPh('name', e.target.value)} required />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Téléphone">
                                        <PhoneInput
                                            value={pharmacy.telephone}
                                            onChange={v => setPh('telephone', v)}
                                            placeholder="6XX XX XX XX"
                                        />
                                    </Field>
                                    <Field label="Description">
                                        <IconInput icon={FileText} type="text" placeholder="Description courte"
                                            value={pharmacy.description} onChange={e => setPh('description', e.target.value)} />
                                    </Field>
                                </div>

                                {/* Address section */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
                                    <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin size={12} /> Adresse
                                    </p>

                                    <Field label="Ville" required>
                                        <input className={inputNoPadCls} type="text" placeholder="Douala"
                                            value={pharmacy.address.city} onChange={e => setAddr('city', e.target.value)} required />
                                    </Field>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Rue">
                                            <input className={inputNoPadCls} type="text" placeholder="Feu rouge"
                                                value={pharmacy.address.rue} onChange={e => setAddr('rue', e.target.value)} />
                                        </Field>
                                        <Field label="Quartier">
                                            <input className={inputNoPadCls} type="text" placeholder="Akwa"
                                                value={pharmacy.address.quater} onChange={e => setAddr('quater', e.target.value)} />
                                        </Field>
                                        <Field label="Boîte postale">
                                            <input className={inputNoPadCls} type="text" placeholder="BP 1234"
                                                value={pharmacy.address.bp} onChange={e => setAddr('bp', e.target.value)} />
                                        </Field>
                                        <Field label="Tél. adresse">
                                            <PhoneInput
                                                value={pharmacy.address.telephone}
                                                onChange={v => setAddr('telephone', v)}
                                                placeholder="6XX XX XX XX"
                                            />
                                        </Field>
                                        <Field label="Latitude" required hint="Ex : 4.0511">
                                            <input className={inputNoPadCls} type="text" placeholder="4.0511"
                                                value={pharmacy.address.latitude} onChange={e => setAddr('latitude', e.target.value)} required />
                                        </Field>
                                        <Field label="Longitude" required hint="Ex : 9.7679">
                                            <input className={inputNoPadCls} type="text" placeholder="9.7679"
                                                value={pharmacy.address.longitude} onChange={e => setAddr('longitude', e.target.value)} required />
                                        </Field>
                                    </div>
                                </div>

                                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200">
                                    Continuer <ArrowRight size={16} />
                                </button>
                            </form>
                        )}

                        {/* ── STEP 1 : Pharmacien ── */}
                        {step === 1 && (
                            <form onSubmit={handleStep2} className="space-y-4">
                                <div>
                                    <p className="text-[17px] font-bold text-[#1E293B]">Compte du pharmacien</p>
                                    <p className="text-[12px] text-[#94A3B8] mt-0.5">Créez le compte administrateur qui gérera la pharmacie.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Nom" required>
                                        <IconInput icon={User} type="text" placeholder="Jean"
                                            value={pharmacist.last_name} onChange={e => setPhist('last_name', e.target.value)} required />
                                    </Field>
                                    <Field label="Prénom">
                                        <IconInput icon={User} type="text" placeholder="Tamo"
                                            value={pharmacist.first_name} onChange={e => setPhist('first_name', e.target.value)} />
                                    </Field>
                                </div>

                                <Field label="Email">
                                    <IconInput icon={Mail} type="email" placeholder="pharmacien@exemple.com"
                                        value={pharmacist.email} onChange={e => setPhist('email', e.target.value)} />
                                </Field>

                                <Field label="Téléphone" required hint="Format international : +237XXXXXXXXX">
                                    <PhoneInput
                                        value={pharmacist.telephone}
                                        onChange={v => setPhist('telephone', v)}
                                        placeholder="6XX XX XX XX"
                                        required
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Mot de passe" required>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                className={inputCls}
                                                type={showPwd ? 'text' : 'password'}
                                                placeholder="Min. 6 caractères"
                                                value={pharmacist.password}
                                                onChange={e => setPhist('password', e.target.value)}
                                                required minLength={6}
                                            />
                                            <button type="button" onClick={() => setShowPwd(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]">
                                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </Field>
                                    <Field label="Confirmer" required>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                className={`${inputCls} ${pharmacist.confirmPassword && pharmacist.password !== pharmacist.confirmPassword ? 'border-red-400 focus:border-red-400' : ''}`}
                                                type={showConfirmPwd ? 'text' : 'password'}
                                                placeholder="Répétez"
                                                value={pharmacist.confirmPassword}
                                                onChange={e => setPhist('confirmPassword', e.target.value)}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]">
                                                {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </Field>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => { setStep(0); setError(null); }}
                                        className="flex items-center gap-2 px-5 py-3 border-2 border-[#E2E8F0] text-[#64748B] text-[13px] font-semibold rounded-xl hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all">
                                        <ArrowLeft size={15} /> Retour
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Création en cours…</>
                                        ) : (
                                            <>Créer le compte <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── STEP 2 : OTP ── */}
                        {step === 2 && (
                            <form onSubmit={handleOtpSubmit} className="space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                                        <ShieldCheck size={28} className="text-white" />
                                    </div>
                                    <p className="text-[17px] font-bold text-[#1E293B]">Vérification du compte</p>
                                    <p className="text-[13px] text-[#94A3B8] mt-1">
                                        Un code à 6 chiffres a été envoyé au numéro<br />
                                        <strong className="text-[#1E293B]">{registeredPhone}</strong>
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-2.5">
                                    {otpDigits.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleOtpKey(i, e)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                            autoFocus={i === 0}
                                            className="w-12 h-14 text-center text-[22px] font-bold border-2 border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all"
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                                    <Hash size={12} className="text-[#CBD5E1]" />
                                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                                </div>

                                <button type="submit" disabled={loading || otpDigits.join('').length !== 6}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[14px] font-bold rounded-xl hover:from-[#16A34A] hover:to-[#15803D] transition-all shadow-md shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Vérification…</>
                                    ) : (
                                        <><CheckCircle2 size={16} /> Valider le code</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer link */}
                <p className="text-center text-[13px] text-[#94A3B8] mt-5">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-[#22C55E] font-semibold hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
