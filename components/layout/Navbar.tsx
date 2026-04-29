"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, ChevronDown, Globe2, Home, LogOut, Menu, User, X } from "lucide-react";
import { supportedLanguages, useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type MedLinkRole = "patient" | "business" | "professional";
type LanguageBucket = "en" | "zh" | "ko";
type LocalizedText = Record<LanguageBucket, string>;

type PortalOption = {
  role: MedLinkRole;
  label: LocalizedText;
  description: LocalizedText;
  href: string;
};

const navLinks = [
  { href: "/", labelKey: "nav.product" },
  { href: "/journey", labelKey: "nav.patientJourney" },
  { href: "/technology", labelKey: "nav.technology" },
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/explorer", labelKey: "nav.explorer" },
  { href: "/business", labelKey: "nav.business" }
];

const patientLinks = [
  { href: "/journey", label: { en: "Patient Journey", zh: "患者流程", ko: "환자 여정" } },
  { href: "#support", label: { en: "Support", zh: "帮助", ko: "지원" } }
];

const businessLinks = [
  { href: "/partners#packages", label: { en: "Partnership Packages", zh: "合作方案", ko: "파트너십 패키지" } },
  { href: "/partners#who-we-serve", label: { en: "Who We Serve", zh: "合作对象", ko: "협력 대상" } },
  { href: "/partners#contact", label: { en: "Contact Us", zh: "联系我们", ko: "문의하기" } }
];

const portalOptions: PortalOption[] = [
  {
    role: "patient",
    label: { en: "Patient Portal", zh: "患者端", ko: "환자 포털" },
    description: {
      en: "Find care, check symptoms, manage records",
      zh: "查找就诊建议、描述症状、管理健康记录",
      ko: "진료 경로 확인, 증상 점검, 건강 기록 관리"
    },
    href: "/journey"
  },
  {
    role: "business",
    label: { en: "Partner Portal", zh: "合作伙伴端", ko: "파트너 포털" },
    description: {
      en: "For hospitals, pharma & research partners",
      zh: "面向医院、医药企业和科研合作方",
      ko: "병원, 제약 및 연구 파트너용"
    },
    href: "/partners"
  },
  {
    role: "professional",
    label: { en: "Developer Portal", zh: "开发者端", ko: "개발자 포털" },
    description: {
      en: "Full technical platform & blockchain explorer",
      zh: "完整技术平台与区块链浏览器",
      ko: "전체 기술 플랫폼 및 블록체인 탐색기"
    },
    href: "/"
  }
];

const currentPortalLabels: Record<MedLinkRole, LocalizedText> = {
  patient: { en: "Currently: Patient Portal", zh: "当前：患者端", ko: "현재: 환자 포털" },
  business: { en: "Currently: Partner Portal", zh: "当前：合作伙伴端", ko: "현재: 파트너 포털" },
  professional: { en: "Currently: Developer Portal", zh: "当前：开发者端", ko: "현재: 개발자 포털" }
};

const switchPortalCopy = {
  button: { en: "Switch Portal", zh: "切换端", ko: "포털 전환" },
  heading: { en: "Switch Portal", zh: "切换端", ko: "포털 전환" },
  backTitle: { en: "Back to Portal Selection", zh: "返回端选择页", ko: "포털 선택 화면으로 돌아가기" },
  backDesc: { en: "Return to the three-portal start page", zh: "返回最开始的三个端选择页面", ko: "처음의 세 가지 포털 선택 화면으로 이동" }
};

function languageBucket(language: string): LanguageBucket {
  if (language === "zh-CN" || language === "zh-TW") {
    return "zh";
  }
  if (language === "ko") {
    return "ko";
  }
  return "en";
}

function localize(text: LocalizedText, language: string) {
  return text[languageBucket(language)];
}

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [role, setRole] = useState<MedLinkRole | null>(null);

  const closeMobile = () => setMobileOpen(false);
  const roleHome = role === "patient" ? "/journey" : role === "business" ? "/partners" : role === "professional" ? "/" : "/role-select";

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

  const switchPortal = (nextRole: MedLinkRole) => {
    const nextPortal = portalOptions.find((portal) => portal.role === nextRole);
    if (!nextPortal) {
      return;
    }

    window.localStorage.setItem("medlink_role", nextRole);
    window.dispatchEvent(new Event("medlink-role-change"));
    setRole(nextRole);
    setMobileOpen(false);
    setProfileOpen(false);
    window.location.href = nextPortal.href;
  };

  const returnToPortalSelection = () => {
    window.localStorage.removeItem("medlink_role");
    window.dispatchEvent(new Event("medlink-role-change"));
    setRole(null);
    setMobileOpen(false);
    setProfileOpen(false);
    window.location.href = "/role-select";
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={roleHome} className="flex shrink-0 items-center gap-3" onClick={closeMobile}>
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.45)]" />
          </span>
          <span className="text-lg font-bold tracking-wide text-sky-600">MedLink</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {role === "patient"
            ? patientLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-2 py-2 text-center text-sm font-medium transition xl:px-3 ${
                    pathname === link.href ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-600 hover:text-sky-600"
                  }`}
                >
                  {localize(link.label, language)}
                </Link>
              ))
            : null}

          {role === "business"
            ? businessLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg px-2 py-2 text-center text-sm font-medium text-slate-600 transition hover:text-sky-600 xl:px-3">
                  {localize(link.label, language)}
                </Link>
              ))
            : null}

          {role === "professional"
            ? navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-2 py-2 text-center text-sm font-medium leading-tight transition xl:px-3 ${
                      active
                        ? "border-b-2 border-sky-500 text-sky-600"
                        : "text-slate-600 hover:text-sky-600"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })
            : null}
        </nav>

        <div className="hidden shrink-0 items-start gap-3 lg:flex">
          <label className="sr-only" htmlFor="language-select">
            {t("common.language")}
          </label>
          <div className="relative shrink-0">
            <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
            <select
              id="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-10 w-36 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition hover:border-sky-400 focus:border-sky-500"
            >
              {supportedLanguages.map((option) => (
                <option key={option.code} value={option.code} className="bg-white text-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          </div>

          {role ? <PortalSwitcher language={language} role={role} onReturnToSelection={returnToPortalSelection} onSwitch={switchPortal} /> : null}

          {role === "professional" && isAuthenticated && user ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white pl-2 pr-3 transition hover:border-sky-400"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-bold text-white">
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="max-w-28 truncate text-sm font-medium text-slate-900">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-slate-600" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl ">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {t("page.dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : role === "professional" ? (
            <Link href="/login" className="primary-button h-10 shrink-0 px-4 py-2">
              {t("nav.login")}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {role ? <PortalSwitcher language={language} role={role} onReturnToSelection={returnToPortalSelection} onSwitch={switchPortal} /> : null}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="glass-button h-10 w-10 p-0"
            aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
          <nav className="flex flex-col gap-1">
            {role === "patient"
              ? patientLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMobile} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600">
                    {localize(link.label, language)}
                  </Link>
                ))
              : null}

            {role === "business"
              ? businessLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMobile} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600">
                    {localize(link.label, language)}
                  </Link>
                ))
              : null}

            {role === "professional"
              ? navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      pathname === link.href ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))
              : null}
          </nav>
          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              aria-label={t("common.language")}
            >
              {supportedLanguages.map((option) => (
                <option key={option.code} value={option.code} className="bg-white text-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
            {role === "professional" && isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMobile();
                }}
                className="glass-button justify-start"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.logout")}
              </button>
            ) : role === "professional" ? (
              <Link href="/login" className="primary-button" onClick={closeMobile}>
                {t("nav.login")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PortalSwitcher({
  language,
  role,
  onReturnToSelection,
  onSwitch
}: {
  language: string;
  role: MedLinkRole;
  onReturnToSelection: () => void;
  onSwitch: (role: MedLinkRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const otherPortals = portalOptions.filter((portal) => portal.role !== role);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div ref={switcherRef} className="relative flex flex-col items-end lg:min-w-[11.75rem] lg:shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:w-full"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ArrowLeftRight className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{localize(switchPortalCopy.button, language)}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <p className="mt-1 w-full whitespace-nowrap text-right text-xs leading-none text-slate-400">
        {localize(currentPortalLabels[role], language)}
      </p>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl"
        >
          <p className="px-3 py-2 text-sm font-semibold text-slate-900">{localize(switchPortalCopy.heading, language)}</p>
          <div className="my-1 border-t border-slate-200" />
          <div className="grid gap-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onReturnToSelection();
              }}
              className="rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Home className="h-4 w-4 text-sky-600" />
                {localize(switchPortalCopy.backTitle, language)}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {localize(switchPortalCopy.backDesc, language)}
              </span>
            </button>
            <div className="my-1 border-t border-slate-200" />
            {otherPortals.map((portal) => (
              <button
                key={portal.role}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSwitch(portal.role);
                }}
                className="rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="block text-sm font-semibold text-slate-800">{localize(portal.label, language)}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{localize(portal.description, language)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
