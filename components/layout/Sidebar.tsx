"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  Network,
  Pill,
  Route,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type MedLinkRole = "patient" | "business" | "professional";

const hiddenRoutes = new Set(["/", "/login", "/role-select", "/partners"]);

const sidebarItems = [
  { href: "/journey", labelKey: "page.journey", icon: Route },
  { href: "/medichain", labelKey: "page.medichain", icon: ShieldCheck },
  { href: "/mediroute", labelKey: "page.mediroute", icon: Network },
  { href: "/medirx", labelKey: "page.medirx", icon: Pill },
  { href: "/explorer", labelKey: "page.explorer", icon: FileText },
  { href: "/dashboard", labelKey: "page.dashboard", icon: LayoutDashboard },
  { href: "/technology", labelKey: "page.technology", icon: Building2 },
  { href: "/business", labelKey: "page.business", icon: Building2 }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<MedLinkRole | null>(null);

  useEffect(() => {
    const readRole = () => {
      const storedRole = window.localStorage.getItem("medlink_role");
      setRole(storedRole === "patient" || storedRole === "business" || storedRole === "professional" ? storedRole : null);
    };

    readRole();
    window.addEventListener("storage", readRole);
    window.addEventListener("medlink-role-change", readRole);
    return () => {
      window.removeEventListener("storage", readRole);
      window.removeEventListener("medlink-role-change", readRole);
    };
  }, [pathname]);

  const visibleItems = role === "patient" ? sidebarItems.slice(0, 1) : role === "professional" ? sidebarItems : [];

  if (hiddenRoutes.has(pathname) || visibleItems.length === 0) {
    return null;
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r border-slate-200 bg-white transition-all lg:block ${
          collapsed ? "w-20" : "w-72"
        }`}
        aria-label={t("common.modules")}
      >
        <div className="flex h-full flex-col p-3">
          <div className="mb-3 flex items-center justify-between px-2 py-1">
            {!collapsed ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("common.modules")}</p> : null}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-400 hover:text-slate-900"
              aria-label={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="grid gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                    active
                      ? "border-r-2 border-sky-500 bg-sky-50 text-sky-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed ? <span className="truncate">{t(item.labelKey)}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-sky-500 px-3 text-sm font-semibold text-white"
            aria-label={mobileOpen ? t("common.collapseSidebar") : t("common.expandSidebar")}
          >
            <ChevronsUpDown className="h-4 w-4" />
            {t("common.modules")}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {(mobileOpen ? visibleItems : visibleItems.slice(0, 4)).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    pathname === item.href ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  aria-label={t(item.labelKey)}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
