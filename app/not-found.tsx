"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-xl rounded-2xl p-8 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <SearchX className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          The MedLink demo route you opened does not exist yet.
        </p>
        <Link href="/" className="primary-button mt-7">
          <ArrowLeft className="h-4 w-4" />
          {t("nav.product")}
        </Link>
      </motion.section>
    </div>
  );
}
