"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import en from '@/locales/en.json';
import id from '@/locales/id.json';

type Locale = 'en' | 'id';

const translations = { en, id };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('id'); // Default to 'id' initially

  useEffect(() => {
    // On component mount, try to get the locale from localStorage
    const storedLocale = localStorage.getItem('kreatask_locale') as Locale | null;
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'id')) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('kreatask_locale', newLocale);
      document.documentElement.lang = newLocale; // Update the lang attribute
    } catch (error) {
      console.error("Could not save locale to localStorage", error);
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);


  const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
    const keys = key.split('.');
    let translation = (translations[locale] as any);
    for (const k of keys) {
        if (translation) {
            translation = translation[k];
        } else {
            break;
        }
    }

    let result = translation || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        result = result.replace(`{{${placeholder}}}`, replacements[placeholder]);
      });
    }

    return result;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
