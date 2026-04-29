"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "@/data/translations";

export type Language = "en" | "zh-CN" | "zh-TW" | "ko";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

export const supportedLanguages: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "ko", label: "한국어" }
];

const LANGUAGE_STORAGE_KEY = "medlink-language";
const defaultLanguage: Language = "en";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
type TranslationValue = string | readonly string[];
const translationTable = translations as Record<Language, Record<string, TranslationValue>>;

function isSupportedLanguage(value: string): value is Language {
  return supportedLanguages.some((language) => language.code === value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && isSupportedLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: string) => {
    if (!isSupportedLanguage(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string) => {
        const value = translationTable[language][key] ?? translationTable.en[key];
        return typeof value === "string" ? value : key;
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
