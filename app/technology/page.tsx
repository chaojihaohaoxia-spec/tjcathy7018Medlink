"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  BrainCircuit,
  ChevronDown,
  Database,
  FileKey2,
  GitBranch,
  Hospital,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  Pill,
  Route,
  ShieldCheck,
  Smartphone,
  Stethoscope
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type ArchitectureLayer = {
  id: string;
  layer: string;
  title: string;
  items: Array<{ labelKey: string; icon: typeof Smartphone }>;
  doesKey: string;
  mattersKey: string;
  demo: {
    labelKey: string;
    href: string;
  };
};

const layers: ArchitectureLayer[] = [
  {
    id: "ui",
    layer: "Layer 1",
    title: "User Interface",
    items: [
      { labelKey: "patient_app", icon: Smartphone },
      { labelKey: "doctor_portal", icon: Stethoscope },
      { labelKey: "hospital_dashboard", icon: Hospital }
    ],
    doesKey: "layer_ui_does",
    mattersKey: "layer_ui_matters",
    demo: { labelKey: "hospital_dashboard", href: "/dashboard" }
  },
  {
    id: "services",
    layer: "Layer 2",
    title: "Application Services",
    items: [
      { labelKey: "ai_triage_service", icon: BrainCircuit },
      { labelKey: "referral_engine", icon: Route },
      { labelKey: "prescription_routing", icon: Pill },
      { labelKey: "notification_service", icon: Bell }
    ],
    doesKey: "layer_services_does",
    mattersKey: "layer_services_matters",
    demo: { labelKey: "page.journey", href: "/journey" }
  },
  {
    id: "integration",
    layer: "Layer 3",
    title: "Integration Layer",
    items: [
      { labelKey: "fhir_gateway", icon: Network },
      { labelKey: "his_connectors", icon: Hospital },
      { labelKey: "pharmacy_inventory_connector", icon: Database }
    ],
    doesKey: "layer_integration_does",
    mattersKey: "layer_integration_matters",
    demo: { labelKey: "page.mediroute", href: "/mediroute" }
  },
  {
    id: "trust",
    layer: "Layer 4",
    title: "Trust Layer",
    items: [
      { labelKey: "tech_hyperledger", icon: GitBranch },
      { labelKey: "smart_contracts", icon: FileKey2 },
      { labelKey: "tech_did_identity", icon: KeyRound },
      { labelKey: "consent_management", icon: ShieldCheck }
    ],
    doesKey: "layer_trust_does",
    mattersKey: "layer_trust_matters",
    demo: { labelKey: "page.medichain", href: "/medichain" }
  },
  {
    id: "data",
    layer: "Layer 5",
    title: "Data Layer",
    items: [
      { labelKey: "ipfs_encrypted_storage", icon: Database },
      { labelKey: "aes_256_encryption", icon: LockKeyhole },
      { labelKey: "hash_metadata", icon: FileKey2 },
      { labelKey: "audit_logs", icon: Activity }
    ],
    doesKey: "layer_data_does",
    mattersKey: "layer_data_matters",
    demo: { labelKey: "page.explorer", href: "/explorer" }
  }
];

const dataFlow = [
  {
    labelKey: "flow_patient_symptom_input",
    layer: "User Interface",
    descriptionKey: "flow_patient_symptom_desc"
  },
  {
    labelKey: "flow_did_authorization",
    layer: "Trust Layer",
    descriptionKey: "flow_did_authorization_desc"
  },
  {
    labelKey: "flow_fhir_retrieval",
    layer: "Integration Layer",
    descriptionKey: "flow_fhir_retrieval_desc"
  },
  {
    labelKey: "flow_ai_triage",
    layer: "Application Services",
    descriptionKey: "flow_ai_triage_desc"
  },
  {
    labelKey: "flow_contract_logging",
    layer: "Trust Layer",
    descriptionKey: "flow_contract_logging_desc"
  },
  {
    labelKey: "flow_referral_voucher",
    layer: "Application Services",
    descriptionKey: "flow_referral_voucher_desc"
  },
  {
    labelKey: "flow_medirx_routing",
    layer: "Application Services",
    descriptionKey: "flow_medirx_routing_desc"
  },
  {
    labelKey: "flow_blockchain_explorer",
    layer: "Trust Layer",
    descriptionKey: "flow_blockchain_explorer_desc"
  }
];

export default function TechnologyPage() {
  const { t } = useLanguage();
  const [expandedLayer, setExpandedLayer] = useState(layers[0].id);
  const [activeFlow, setActiveFlow] = useState<number | null>(null);
  const [watching, setWatching] = useState(false);

  const runFlow = async () => {
    if (watching) {
      return;
    }

    setWatching(true);
    for (let index = 0; index < dataFlow.length; index += 1) {
      setActiveFlow(index);
      const relatedLayer = layers.find((layer) => layer.title === dataFlow[index].layer);
      if (relatedLayer) {
        setExpandedLayer(relatedLayer.id);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setWatching(false);
  };

  const activeFlowStep = activeFlow === null ? null : dataFlow[activeFlow];
  const translatedLayerTitle = (layer: ArchitectureLayer) => {
    if (layer.id === "ui") {
      return t("layer_ui");
    }
    if (layer.id === "services") {
      return t("layer_services");
    }
    if (layer.id === "integration") {
      return t("layer_integration");
    }
    if (layer.id === "trust") {
      return t("layer_trust");
    }
    return t("layer_data");
  };
  const translatedFlowLayer = (layerName: string) => {
    if (layerName === "User Interface") {
      return t("layer_ui");
    }
    if (layerName === "Application Services") {
      return t("layer_services");
    }
    if (layerName === "Integration Layer") {
      return t("layer_integration");
    }
    if (layerName === "Trust Layer") {
      return t("layer_trust");
    }
    if (layerName === "Data Layer") {
      return t("layer_data");
    }
    return layerName;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("page.technology")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("technology_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("technology_description")}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="glass-card rounded-2xl p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                  <Layers3 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{t("layered_architecture")}</h2>
              </div>
              <button type="button" onClick={runFlow} disabled={watching} className="primary-button h-11 disabled:cursor-not-allowed disabled:opacity-60">
                {watching ? t("watching_flow") : t("watch_data_flow")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {layers.map((layer) => {
                const expanded = expandedLayer === layer.id;
                const highlighted = activeFlowStep?.layer === layer.title;
                return (
                  <motion.div
                    key={layer.id}
                    animate={{
                      borderColor: highlighted ? "rgba(14, 165, 233, 0.75)" : "#E2E8F0",
                      backgroundColor: highlighted ? "#E0F2FE" : "#FFFFFF"
                    }}
                    className="overflow-hidden rounded-2xl border"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedLayer(expanded ? "" : layer.id)}
                      className="flex w-full flex-col gap-4 p-5 text-left lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{layer.layer}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">{translatedLayerTitle(layer)}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {layer.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <span key={item.labelKey} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                              <Icon className="h-3.5 w-3.5 text-sky-600" />
                              {t(item.labelKey)}
                            </span>
                          );
                        })}
                        <ChevronDown className={`h-5 w-5 text-slate-500 transition ${expanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-200"
                        >
                          <div className="grid gap-4 p-5 md:grid-cols-3">
                            <InfoBlock label={t("what_it_does")} value={t(layer.doesKey)} />
                            <InfoBlock label={t("why_it_matters")} value={t(layer.mattersKey)} />
                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                              <p className="text-xs uppercase tracking-[0.14em] text-sky-600">{t("where_it_appears")}</p>
                              <Link href={layer.demo.href} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-sky-700">
                                {t(layer.demo.labelKey)}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("data_flow_sequence")}</h2>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              {activeFlowStep ? (
                <motion.div key={activeFlowStep.labelKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{t("active_step")}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{t(activeFlowStep.labelKey)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(activeFlowStep.descriptionKey)}</p>
                  <p className="mt-4 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm text-sky-700">
                    {t("layer")}: {translatedFlowLayer(activeFlowStep.layer)}
                  </p>
                </motion.div>
              ) : (
                <div className="flex min-h-44 items-center justify-center text-center text-sm text-slate-500">
                  {t("press_watch_flow")}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3">
              {dataFlow.map((step, index) => (
                <motion.div
                  key={step.labelKey}
                  animate={{
                    opacity: activeFlow === null || activeFlow === index ? 1 : 0.45,
                    x: activeFlow === index ? 8 : 0
                  }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activeFlow === index ? "bg-sky-500 text-white" : "bg-white text-slate-500"}`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t(step.labelKey)}</p>
                    <p className="text-xs text-slate-500">{translatedFlowLayer(step.layer)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{value}</p>
    </div>
  );
}
