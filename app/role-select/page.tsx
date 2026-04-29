"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, Code2, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type RoleId = "patient" | "business" | "professional";
type RoleLocale = "en" | "zh" | "ko";

const roleMeta: Array<{
  id: RoleId;
  href: string;
  icon: typeof Heart;
}> = [
  {
    id: "patient",
    href: "/journey",
    icon: Heart
  },
  {
    id: "business",
    href: "/partners",
    icon: Briefcase
  },
  {
    id: "professional",
    href: "/",
    icon: Code2
  }
] as const;

const pageCopy = {
  en: {
    eyebrow: "Choose Your MedLink Experience",
    title: "Start with the path that matches your role.",
    subtitle: "MedLink can be explored as a patient journey, a partnership offering, or the full technical platform."
  },
  zh: {
    eyebrow: "选择您的 MedLink 入口",
    title: "请选择与您身份相匹配的入口。",
    subtitle: "您可以从患者就诊流程、合作伙伴方案，或完整技术平台三个入口体验 MedLink。"
  },
  ko: {
    eyebrow: "MedLink 이용 모드 선택",
    title: "사용자 역할에 맞는 포털을 선택하세요.",
    subtitle: "MedLink는 환자 여정, 파트너 협업, 전체 기술 플랫폼 세 가지 방식으로 체험할 수 있습니다."
  }
} satisfies Record<RoleLocale, { eyebrow: string; title: string; subtitle: string }>;

const roleCopy = {
  patient: {
    en: {
      title: "I'm a Patient",
      subtitle: "Find the right care pathway, manage my medical records, and get symptom-based guidance.",
      button: "Start My Journey"
    },
    zh: {
      title: "我是患者",
      subtitle: "查找合适的就诊路径，管理自己的病历，并获得清晰的症状建议。",
      button: "进入患者端"
    },
    ko: {
      title: "환자입니다",
      subtitle: "적절한 진료 경로를 찾고, 의료 기록을 관리하며, 증상에 따른 안내를 받습니다.",
      button: "환자 포털 시작"
    }
  },
  business: {
    en: {
      title: "Partner With Us",
      subtitle: "Hospitals, pharmaceutical distributors, drug manufacturers, research institutions, and regulators.",
      button: "Explore Partnership"
    },
    zh: {
      title: "商业合作伙伴",
      subtitle: "面向医院、药品配送企业、药企、科研机构和监管相关合作方。",
      button: "查看合作方案"
    },
    ko: {
      title: "파트너 기관",
      subtitle: "병원, 의약품 유통사, 제약사, 연구기관, 규제 관련 협력 기관을 위한 포털입니다.",
      button: "파트너 포털 보기"
    }
  },
  professional: {
    en: {
      title: "Developer & Evaluator",
      subtitle: "Explore the full technical platform including blockchain infrastructure, AI engine, and system architecture.",
      button: "Enter Full Platform"
    },
    zh: {
      title: "开发者与评审者",
      subtitle: "查看完整技术平台，包括区块链基础设施、AI 引擎和系统架构。",
      button: "进入技术平台"
    },
    ko: {
      title: "개발자 및 평가자",
      subtitle: "블록체인 인프라, AI 엔진, 시스템 아키텍처를 포함한 전체 기술 플랫폼을 확인합니다.",
      button: "기술 플랫폼으로 이동"
    }
  }
} satisfies Record<RoleId, Record<RoleLocale, { title: string; subtitle: string; button: string }>>;

function roleLocale(language: string): RoleLocale {
  if (language === "zh-CN" || language === "zh-TW") {
    return "zh";
  }
  if (language === "ko") {
    return "ko";
  }
  return "en";
}

export default function RoleSelectPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = roleLocale(language);
  const copy = pageCopy[locale];

  const selectRole = (role: typeof roleMeta[number]) => {
    window.localStorage.setItem("medlink_role", role.id);
    window.dispatchEvent(new Event("medlink-role-change"));
    router.push(role.href);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {roleMeta.map((role, index) => {
            const Icon = role.icon;
            const localizedRole = roleCopy[role.id][locale];
            return (
              <motion.article
                key={role.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="glass-card flex min-h-[320px] flex-col rounded-2xl p-6 transition hover:border-sky-400 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-slate-900">{localizedRole.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{localizedRole.subtitle}</p>
                <button type="button" onClick={() => selectRole(role)} className="primary-button mt-6 h-12 w-full justify-center">
                  {localizedRole.button}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
