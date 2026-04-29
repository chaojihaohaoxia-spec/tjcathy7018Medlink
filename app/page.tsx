"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  ClipboardList,
  DatabaseZap,
  FileCheck2,
  FileX2,
  GitBranch,
  Hospital,
  Minus,
  Network,
  Pill,
  Route,
  ShieldCheck,
  Stethoscope,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const modules = [
  {
    key: "medichain",
    label: "MediChain",
    icon: ShieldCheck,
    className: "left-1/2 top-0 -translate-x-1/2",
    color: "from-sky-500 to-sky-600"
  },
  {
    key: "mediroute",
    label: "MediRoute",
    icon: Network,
    className: "bottom-8 left-4 md:left-10",
    color: "from-emerald-400 to-sky-500"
  },
  {
    key: "medirx",
    label: "MediRx",
    icon: FileCheck2,
    className: "bottom-8 right-4 md:right-10",
    color: "from-blue-400 to-sky-400"
  }
];

const techLabels = [
  "tech_fhir_api",
  "tech_smart_contract_label",
  "tech_ipfs_aes",
  "tech_hyperledger",
  "tech_did_identity",
  "tech_ai_triage_model"
];

const sectionMotion = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.68, ease: "easeOut" }
} as const;

const painPoints = [
  {
    titleKey: "pain_fragmented_title",
    descriptionKey: "pain_fragmented_desc",
    icon: FileX2
  },
  {
    titleKey: "pain_triage_title",
    descriptionKey: "pain_triage_desc",
    icon: ClipboardList
  },
  {
    titleKey: "pain_rx_title",
    descriptionKey: "pain_rx_desc",
    icon: Pill
  }
];

const solutionSteps = [
  {
    labelKey: "flow_symptom_input",
    technologyKey: "tech_nlp",
    icon: Activity
  },
  {
    labelKey: "flow_patient_authorization",
    technologyKey: "tech_contract_did",
    icon: ShieldCheck
  },
  {
    labelKey: "flow_ai_triage",
    technologyKey: "tech_ai_model",
    icon: BrainCircuit
  },
  {
    labelKey: "flow_hospital_referral",
    technologyKey: "tech_referral",
    icon: Hospital
  },
  {
    labelKey: "flow_prescription_routing",
    technologyKey: "tech_prescription",
    icon: Route
  },
  {
    labelKey: "flow_blockchain_audit",
    technologyKey: "tech_fabric_hash",
    icon: GitBranch
  }
];

type ComparisonValue = "yes" | "no" | "partial";

const comparisonRows: Array<{
  capabilityKey: string;
  traditional: ComparisonValue;
  his: ComparisonValue;
  medlink: ComparisonValue;
}> = [
  {
    capabilityKey: "cap_data_ownership",
    traditional: "no",
    his: "partial",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_record_sharing",
    traditional: "partial",
    his: "partial",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_ai_triage",
    traditional: "partial",
    his: "no",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_authority_routing",
    traditional: "no",
    his: "partial",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_drug_traceability",
    traditional: "no",
    his: "partial",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_audit_trail",
    traditional: "no",
    his: "no",
    medlink: "yes"
  },
  {
    capabilityKey: "cap_fhir_interop",
    traditional: "partial",
    his: "partial",
    medlink: "yes"
  }
];

function CapabilityMark({ value }: { value: ComparisonValue }) {
  if (value === "yes") {
    return (
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-4 w-4" />
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Minus className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
      <X className="h-4 w-4" />
    </span>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden">
      <section className="relative flex min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-sky-50 to-white px-5 py-12 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-700">
              <Activity className="h-3.5 w-3.5" />
              {t("landing.eyebrow")}
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("landing.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {t("landing.subtitle")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="primary-button" href="/journey">
                {t("button.exploreJourney")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="glass-button px-5 py-3" href="/dashboard">
                <Stethoscope className="h-4 w-4" />
                {t("button.viewDashboard")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="relative mx-auto h-[560px] w-full max-w-[620px]"
            aria-label={t("landing_visual_label")}
          >
            <div className="absolute inset-8 rounded-full border border-sky-100 bg-sky-50" />
            <div className="absolute inset-20 rounded-full border border-sky-200/70" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 620 560" aria-hidden="true">
              <motion.path
                d="M310 276 L310 82"
                stroke="rgba(14, 165, 233, 0.28)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.4 }}
              />
              <motion.path
                d="M310 286 L142 420"
                stroke="rgba(20, 184, 166, 0.36)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.55 }}
              />
              <motion.path
                d="M310 286 L478 420"
                stroke="rgba(59, 130, 246, 0.36)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.7 }}
              />
            </svg>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card absolute left-1/2 top-1/2 z-10 w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-600">{t("hero.patientDid")}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">did:medlink:8F3A-21C</p>
                </div>
                <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">{t("hero.consent")}</p>
                  <p className="mt-1 font-medium text-emerald-600">{t("status.verified")}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">{t("hero.risk")}</p>
                  <p className="mt-1 font-medium text-amber-600">{t("status.mediumRisk")}</p>
                </div>
              </div>
            </motion.div>

            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.key}
                  className={`glass-card absolute z-20 w-[170px] rounded-2xl p-4 ${module.className}`}
                  animate={{ y: [0, index % 2 === 0 ? 10 : -10, 0] }}
                  transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{t(`module.${module.key}`)}</p>
                </motion.div>
              );
            })}

            <motion.div
              className="absolute right-10 top-24 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              {t("landing_ai_triage")}
            </motion.div>

            {techLabels.map((label, index) => (
              <motion.div
                key={label}
                className="absolute rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600"
                style={{
                  left: `${12 + ((index * 17) % 72)}%`,
                  top: `${12 + ((index * 23) % 74)}%`
                }}
                animate={{ opacity: [0.48, 1, 0.48], y: [0, -6, 0] }}
                transition={{ duration: 4 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
              >
                {t(label)}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        {...sectionMotion}
        className="relative px-5 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("landing_pain_eyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{t("landing_pain_title")}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {painPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.article
                  key={point.titleKey}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{t(point.titleKey)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(point.descriptionKey)}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="relative px-5 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{t("landing_solution_eyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{t("landing_solution_title")}</h2>
          </div>

          <div className="mt-12">
            <div className="relative min-w-[920px] overflow-visible rounded-2xl border border-slate-200 bg-white px-6 py-10 ">
              <div className="relative">
                <div className="absolute left-16 right-16 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
                <motion.div
                  className="absolute top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full bg-sky-500 shadow-[0_0_24px_rgba(14,165,233,0.45)]"
                  initial={{ left: "7.5%" }}
                  animate={{ left: ["7.5%", "24.5%", "41.5%", "58.5%", "75.5%", "92.5%"] }}
                  transition={{ duration: 5, ease: "easeInOut", repeat: 1, repeatType: "reverse" }}
                />

                <div className="relative z-20 grid grid-cols-6 gap-4">
                  {solutionSteps.map((step, index) => {
                    const Icon = step.icon;
                    const active = activeStep === index;
                    return (
                      <button
                        key={step.labelKey}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        onMouseEnter={() => setHoveredStep(index)}
                        onMouseLeave={() => setHoveredStep(null)}
                        onFocus={() => setHoveredStep(index)}
                        onBlur={() => setHoveredStep(null)}
                        className="group relative z-30 flex min-h-36 flex-col items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:border-sky-400 hover:bg-white"
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                            active ? "bg-sky-500 text-white" : "bg-white text-sky-600 group-hover:bg-sky-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-semibold leading-5 text-slate-900">{t(step.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.div
                key={hoveredStep === null ? "default" : solutionSteps[hoveredStep].labelKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="glass-card mt-6 rounded-xl p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                  {hoveredStep === null ? t("technology_layer") : t(solutionSteps[hoveredStep].labelKey)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {hoveredStep === null
                    ? t("hover_step_prompt")
                    : t(solutionSteps[hoveredStep].technologyKey)}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="relative px-5 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("differentiation_eyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{t("differentiation_title")}</h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white ">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-600">
                    <th className="w-[34%] px-5 py-5 font-medium">{t("capability")}</th>
                    <th className="w-[22%] px-5 py-5 text-center font-medium">{t("traditional_online_consultation")}</th>
                    <th className="w-[22%] px-5 py-5 text-center font-medium">{t("hospital_his_system")}</th>
                    <th className="w-[22%] border-l border-sky-200 bg-sky-50 px-5 py-5 text-center font-semibold text-sky-700">MedLink</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.capabilityKey} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">{t(row.capabilityKey)}</td>
                      <td className="px-5 py-4 text-center">
                        <CapabilityMark value={row.traditional} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CapabilityMark value={row.his} />
                      </td>
                      <td className="border-l border-sky-200 bg-sky-50 px-5 py-4 text-center">
                        <CapabilityMark value={row.medlink} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.footer
        {...sectionMotion}
        className="relative border-t border-slate-200 px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.45)]" />
              </span>
              <span className="text-lg font-semibold tracking-wide text-slate-900">MedLink</span>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
              {t("footer_description")}
            </p>
            <p className="mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-700">
              {t("academic_disclaimer")}
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <nav className="flex flex-wrap gap-3 text-sm text-slate-600 lg:justify-end">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-sky-600">{t("nav.product")}</Link>
              <Link href="/technology" className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-sky-600">{t("nav.technology")}</Link>
              <Link href="/business" className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-sky-600">{t("nav.business")}</Link>
              <a href="mailto:medlink.prototype@example.edu" className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-sky-600">{t("contact")}</a>
            </nav>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <DatabaseZap className="h-4 w-4 text-sky-600" />
              <span>{t("fhir_ready_prototype")}</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-200 pt-5 text-xs text-slate-500">
          {t("copyright_line")}
        </div>
      </motion.footer>
    </div>
  );
}
