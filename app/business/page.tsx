"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  DatabaseZap,
  Factory,
  Hospital,
  Landmark,
  Pill,
  Stethoscope,
  TrendingUp,
  UserRound
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const targetCustomers = [
  ["customer_hospitals", Hospital],
  ["customer_clinics", Stethoscope],
  ["customer_distributors", Pill],
  ["customer_manufacturers", Factory],
  ["customer_regulators", Landmark],
  ["customer_patients", UserRound]
];

const revenueStreams = [
  {
    titleKey: "rev_saas_title",
    descriptionKey: "rev_saas_desc"
  },
  {
    titleKey: "rev_drug_title",
    descriptionKey: "rev_drug_desc"
  },
  {
    titleKey: "rev_ai_title",
    descriptionKey: "rev_ai_desc"
  },
  {
    titleKey: "rev_data_title",
    descriptionKey: "rev_data_desc"
  },
  {
    titleKey: "rev_caas_title",
    descriptionKey: "rev_caas_desc"
  }
];

const financialProjection = [
  { year: "2026E", saas: 13, drugCert: 0.5, aiApi: 0, dataAuth: 0, caas: 0, total: 13.5, margin: null },
  { year: "2027E", saas: 28, drugCert: 5, aiApi: 5.6, dataAuth: 0, caas: 0, total: 38.6, margin: null },
  { year: "2028E", saas: 52, drugCert: 18, aiApi: 16.8, dataAuth: 8, caas: 0, total: 94.8, margin: 4.7 },
  { year: "2029E", saas: 85, drugCert: 45, aiApi: 33.6, dataAuth: 24, caas: 6, total: 193.6, margin: 9.9 },
  { year: "2030E", saas: 120, drugCert: 90, aiApi: 50.4, dataAuth: 48, caas: 18, total: 326.4, margin: 14.1 }
];

const phases = [
  {
    phaseKey: "phase_1",
    periodKey: "year_1_2",
    titleKey: "phase_1_title",
    descriptionKey: "phase_1_desc"
  },
  {
    phaseKey: "phase_2",
    periodKey: "year_3_4",
    titleKey: "phase_2_title",
    descriptionKey: "phase_2_desc"
  },
  {
    phaseKey: "phase_3",
    periodKey: "year_5_plus",
    titleKey: "phase_3_title",
    descriptionKey: "phase_3_desc"
  }
];

export default function BusinessPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("page.business")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("business_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("business_description")}
          </p>
        </motion.div>

        <section className="mt-8">
          <SectionHeader label={t("section_1")} title={t("target_customers")} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {targetCustomers.map(([label, Icon]) => (
              <motion.div key={label as string} whileHover={{ y: -4 }} className="glass-card rounded-2xl p-5">
                <Icon className="h-7 w-7 text-sky-600" />
                <p className="mt-4 text-base font-semibold text-slate-900">{t(label as string)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader label={t("section_2")} title={t("revenue_streams")} />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {revenueStreams.map((stream, index) => (
              <motion.article
                key={stream.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                  {index === 0 ? <Building2 className="h-5 w-5" /> : index === 1 ? <BadgeCheck className="h-5 w-5" /> : index === 2 ? <Activity className="h-5 w-5" /> : index === 3 ? <DatabaseZap className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{t(stream.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{t(stream.descriptionKey)}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="glass-card mt-10 rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <SectionHeader label={t("section_3")} title={t("five_year_projection")} />
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {t("unit_revenue")}
            </div>
          </div>

          <div className="mt-6 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialProjection}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="year" stroke="#64748B" />
                <YAxis yAxisId="revenue" stroke="#64748B" label={{ value: t("revenue_axis"), angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
                <YAxis yAxisId="margin" orientation="right" stroke="#10B981" unit="%" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "margin") {
                      return value === null ? [t("loss"), t("net_profit_margin")] : [`${value}%`, t("net_profit_margin")];
                    }
                    return [`¥${value}M`, name];
                  }}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A" }}
                />
                <Legend />
                <Bar yAxisId="revenue" dataKey="saas" name="SaaS" stackId="revenue" fill="#0EA5E9" />
                <Bar yAxisId="revenue" dataKey="drugCert" name="Drug cert" stackId="revenue" fill="#10B981" />
                <Bar yAxisId="revenue" dataKey="aiApi" name="AI API" stackId="revenue" fill="#F59E0B" />
                <Bar yAxisId="revenue" dataKey="dataAuth" name="Data auth" stackId="revenue" fill="#8B5CF6" />
                <Bar yAxisId="revenue" dataKey="caas" name="CaaS" stackId="revenue" fill="#EF4444" radius={[8, 8, 0, 0]} />
                <Line yAxisId="margin" type="monotone" dataKey="margin" name={t("net_profit_margin")} stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {financialProjection.map((year) => (
              <div key={year.year} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{year.year}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">¥{year.total}M</p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("margin")}: {year.margin === null ? t("loss") : `${year.margin}%`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader label={t("section_4")} title={t("go_to_market")} />
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {phases.map((phase, index) => (
              <motion.article
                key={phase.phaseKey}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    {t(phase.phaseKey)}
                  </span>
                  <TrendingUp className="h-5 w-5 text-sky-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-emerald-600">{t(phase.periodKey)}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{t(phase.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{t(phase.descriptionKey)}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
    </div>
  );
}
