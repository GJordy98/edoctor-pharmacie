'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// ── Country list ───────────────────────────────────────────
export interface Country {
    code: string;   // dial code, e.g. "+237"
    iso: string;    // ISO-2, e.g. "CM"
    name: string;
    flag: string;   // emoji
}

export const COUNTRIES: Country[] = [
    { code: '+237', iso: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: '+225', iso: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
    { code: '+221', iso: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: '+212', iso: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: '+213', iso: 'DZ', name: 'Algérie', flag: '🇩🇿' },
    { code: '+216', iso: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: '+241', iso: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: '+242', iso: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: '+243', iso: 'CD', name: 'RD Congo', flag: '🇨🇩' },
    { code: '+229', iso: 'BJ', name: 'Bénin', flag: '🇧🇯' },
    { code: '+228', iso: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: '+226', iso: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+223', iso: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: '+227', iso: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: '+233', iso: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: '+234', iso: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+235', iso: 'TD', name: 'Tchad', flag: '🇹🇩' },
    { code: '+236', iso: 'CF', name: 'Centrafrique', flag: '🇨🇫' },
    { code: '+240', iso: 'GQ', name: 'Guinée Équatoriale', flag: '🇬🇶' },
    { code: '+245', iso: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼' },
    { code: '+224', iso: 'GN', name: 'Guinée', flag: '🇬🇳' },
    { code: '+232', iso: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+220', iso: 'GM', name: 'Gambie', flag: '🇬🇲' },
    { code: '+222', iso: 'MR', name: 'Mauritanie', flag: '🇲🇷' },
    { code: '+251', iso: 'ET', name: 'Éthiopie', flag: '🇪🇹' },
    { code: '+254', iso: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: '+255', iso: 'TZ', name: 'Tanzanie', flag: '🇹🇿' },
    { code: '+256', iso: 'UG', name: 'Ouganda', flag: '🇺🇬' },
    { code: '+250', iso: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+257', iso: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: '+258', iso: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+261', iso: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', iso: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: '+260', iso: 'ZM', name: 'Zambie', flag: '🇿🇲' },
    { code: '+263', iso: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+27', iso: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
    { code: '+33', iso: 'FR', name: 'France', flag: '🇫🇷' },
    { code: '+32', iso: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: '+41', iso: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: '+1', iso: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: '+1', iso: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: '+44', iso: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
];

// ── Props ─────────────────────────────────────────────────
interface PhoneInputProps {
    value: string;              // full value returned to parent: e.g. "+237612345678"
    onChange: (full: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    id?: string;
    className?: string;
    defaultCountry?: string;    // ISO-2 of pre-selected country
}

// ── Component ─────────────────────────────────────────────
export default function PhoneInput({
    value,
    onChange,
    placeholder = '6XX XX XX XX',
    disabled,
    required,
    id,
    defaultCountry = 'CM',
}: PhoneInputProps) {
    // Derive initial country + local number from `value` if provided
    const initCountry = COUNTRIES.find(c => c.iso === defaultCountry) ?? COUNTRIES[0];
    const [country, setCountry] = useState<Country>(initCountry);
    const [local, setLocal] = useState(() => {
        if (value && value.startsWith(initCountry.code)) {
            return value.slice(initCountry.code.length);
        }
        return value ?? '';
    });
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Keep parent in sync
    useEffect(() => {
        onChange(local ? `${country.code}${local}` : '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local, country]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when opening
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const filtered = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
    );

    const selectCountry = (c: Country) => {
        setCountry(c);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="flex gap-0 w-full" ref={dropdownRef}>
            {/* Country picker trigger */}
            <div className="relative shrink-0">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(v => !v)}
                    className={`flex items-center gap-1.5 h-full px-3 border border-r-0 border-[#E2E8F0] rounded-l-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors ${open ? 'border-[#22C55E] bg-white' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="text-[18px] leading-none">{country.flag}</span>
                    <span className="text-[12px] font-semibold text-[#475569]">{country.code}</span>
                    <ChevronDown size={12} className={`text-[#94A3B8] transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-[#F1F5F9]">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher un pays…"
                                    className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E]"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="text-center text-[12px] text-[#94A3B8] py-4">Aucun résultat</p>
                            ) : filtered.map(c => (
                                <button
                                    key={c.iso}
                                    type="button"
                                    onClick={() => selectCountry(c)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F0FDF4] transition-colors ${country.iso === c.iso ? 'bg-[#F0FDF4]' : ''}`}
                                >
                                    <span className="text-[16px] shrink-0">{c.flag}</span>
                                    <span className="text-[12px] text-[#1E293B] font-medium flex-1 truncate">{c.name}</span>
                                    <span className="text-[11px] text-[#94A3B8] shrink-0">{c.code}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Phone number input */}
            <input
                id={id}
                type="tel"
                inputMode="numeric"
                value={local}
                onChange={e => setLocal(e.target.value.replace(/[^\d\s\-]/g, ''))}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                autoComplete="tel-national"
                className="flex-1 min-w-0 px-4 py-2.5 text-[13px] border border-[#E2E8F0] rounded-r-xl bg-[#F8FAFC] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all"
            />
        </div>
    );
}
