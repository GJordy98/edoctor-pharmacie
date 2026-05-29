'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '@/data/locales/fr.json';
import en from '@/data/locales/en.json';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to French as it's the primary language of the app
  const [language, setLanguageState] = useState<Language>('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Retrieve language preference from localStorage on mount
    const savedLanguage = localStorage.getItem('app_language') as Language;
    if (savedLanguage === 'fr' || savedLanguage === 'en') {
      setLanguageState(savedLanguage);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    // Update html lang attribute dynamically for accessibility / styling
    document.documentElement.setAttribute('lang', lang);
  };

  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Fallback to path if not found
      }
    }
    return typeof current === 'string' ? current : path;
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dictionary = language === 'fr' ? fr : en;
    let value = getNestedValue(dictionary, key);

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }

    return value;
  };

  // Prevent flash of untranslated content during loading on client side
  if (!isLoaded) {
    // During SSR or before hydration completes, use default/saved language silently
    // to avoid layout shifts, but return a simple wrapper or children.
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
