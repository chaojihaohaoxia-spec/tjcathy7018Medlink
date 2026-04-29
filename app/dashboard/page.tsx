"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  DatabaseZap,
  FileCheck2,
  LineChart as LineIcon,
  Network,
  ShieldCheck,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  UserRound
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const kpis = [
  ["connected_hospitals", "5", Building2],
  ["did_registrations", "1,024", UserRound],
  ["retrieval_success", "97.3%", DatabaseZap],
  ["triage_agreement", "84.1%", Stethoscope],
  ["duplicate_reduction", "31%", FileCheck2],
  ["verified_batches", "412", BadgeCheck],
  ["referral_vouchers_generated", "156", ClipboardList],
  ["suspicious_prescription_alerts", "3", AlertTriangle]
];

const triageVolume = [
  { month: "Nov", volume: 118 },
  { month: "Dec", volume: 142 },
  { month: "Jan", volume: 176 },
  { month: "Feb", volume: 203 },
  { month: "Mar", volume: 244 },
  { month: "Apr", volume: 286 }
];

const referralDistributionBase = [
  { name: "Primary Care", chineseName: "基层", koreanName: "1차 병원 (의원, 보건소)", value: 46, color: "#10B981" },
  { name: "Class B Secondary", chineseName: "二级", koreanName: "2차 병원 (일반 종합병원)", value: 28, color: "#F59E0B" },
  { name: "Class A Tertiary", chineseName: "三级", koreanName: "3차 병원 (상급종합병원)", value: 18, color: "#0EA5E9" },
  { name: "Emergency", chineseName: "急诊", koreanName: "응급실", value: 8, color: "#EF4444" }
];

const transactionModules = [
  { month: "Nov", MediChain: 180, MediRoute: 96, MediRx: 72 },
  { month: "Dec", MediChain: 204, MediRoute: 118, MediRx: 88 },
  { month: "Jan", MediChain: 236, MediRoute: 134, MediRx: 104 },
  { month: "Feb", MediChain: 260, MediRoute: 154, MediRx: 126 },
  { month: "Mar", MediChain: 294, MediRoute: 182, MediRx: 150 },
  { month: "Apr", MediChain: 332, MediRoute: 216, MediRx: 176 }
];

const duplicateReduction = [
  { month: "Nov", reduction: 14 },
  { month: "Dec", reduction: 18 },
  { month: "Jan", reduction: 22 },
  { month: "Feb", reduction: 25 },
  { month: "Mar", reduction: 29 },
  { month: "Apr", reduction: 31 }
];

const referrals = [
  {
    patientId: "DID-2038-8841",
    risk: "HIGH",
    department: "Emergency Medicine",
    status: "Fast-track",
    waitTime: "6 min",
    authorization: "6-hour emergency"
  },
  {
    patientId: "DID-2038-7712",
    risk: "MEDIUM",
    department: "Respiratory Clinic",
    status: "Community booked",
    waitTime: "24 min",
    authorization: "72-hour limited"
  },
  {
    patientId: "DID-2038-5560",
    risk: "SPECIALIST",
    department: "Class A Tertiary Oncology",
    status: "Specialist review",
    waitTime: "2.3 hr",
    authorization: "Oncology bundle"
  },
  {
    patientId: "DID-2038-4429",
    risk: "MEDIUM",
    department: "Endocrinology",
    status: "Voucher issued",
    waitTime: "41 min",
    authorization: "Prescription + lab"
  },
  {
    patientId: "DID-2038-1194",
    risk: "LOW-MEDIUM",
    department: "General Outpatient",
    status: "Routine",
    waitTime: "58 min",
    authorization: "Allergy only"
  }
];

const complianceMetrics = [
  ["Data access logs summary", "1,247 confirmed logs, 0 unresolved tamper events", ShieldCheck],
  ["Prescription compliance rate", "98.6% policy-aligned prescriptions", CheckCircle2],
  ["Drug traceability coverage percentage", "94.8% verified batch coverage", Network],
  ["PIPL audit readiness status", "Ready for simulated university review", FileCheck2]
];

function isKoreanLanguage(language: string) {
  return language === "ko";
}

function displayMonth(month: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    Nov: "11월",
    Dec: "12월",
    Jan: "1월",
    Feb: "2월",
    Mar: "3월",
    Apr: "4월"
  };

  const zhLabels: Record<string, string> = {
    Nov: "11月",
    Dec: "12月",
    Jan: "1月",
    Feb: "2月",
    Mar: "3月",
    Apr: "4月"
  };

  if (korean) {
    return koLabels[month] ?? month;
  }
  if (chinese) {
    return zhLabels[month] ?? month;
  }
  return month;
}

function displayRisk(risk: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    HIGH: "높음",
    MEDIUM: "중간",
    SPECIALIST: "전문의",
    "LOW-MEDIUM": "낮음-중간"
  };

  const zhLabels: Record<string, string> = {
    HIGH: "高",
    MEDIUM: "中",
    SPECIALIST: "专科",
    "LOW-MEDIUM": "低-中"
  };

  if (korean) {
    return koLabels[risk] ?? risk;
  }
  if (chinese) {
    return zhLabels[risk] ?? risk;
  }
  return risk;
}

function displayDepartment(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Emergency Medicine": "응급의학과",
    "Respiratory Clinic": "호흡기 진료",
    "Class A Tertiary Oncology": "종양내과 - 3차 병원 (상급종합병원)",
    Endocrinology: "내분비내과",
    "General Outpatient": "일반 외래"
  };

  const zhLabels: Record<string, string> = {
    "Emergency Medicine": "急诊医学科",
    "Respiratory Clinic": "呼吸科门诊",
    "Class A Tertiary Oncology": "三甲肿瘤专科",
    Endocrinology: "内分泌科",
    "General Outpatient": "普通门诊"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayReferralStatus(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Fast-track": "신속 접수",
    "Community booked": "1차 병원 예약됨",
    "Specialist review": "전문의 검토",
    "Voucher issued": "바우처 발급",
    Routine: "일반"
  };

  const zhLabels: Record<string, string> = {
    "Fast-track": "快速接诊",
    "Community booked": "社区已预约",
    "Specialist review": "专科审核",
    "Voucher issued": "凭证已生成",
    Routine: "常规"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayWaitTime(value: string, chinese: boolean, korean: boolean) {
  if (korean) {
    return value.replace(" min", "분").replace(" hr", "시간");
  }
  if (chinese) {
    return value.replace(" min", "分钟").replace(" hr", "小时");
  }
  return value;
}

function displayAuthorization(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "6-hour emergency": "응급 6시간 권한",
    "72-hour limited": "72시간 제한 권한",
    "Oncology bundle": "종양 진료 묶음 권한",
    "Prescription + lab": "처방 + 검사 권한",
    "Allergy only": "알레르기 기록만"
  };

  const zhLabels: Record<string, string> = {
    "6-hour emergency": "急诊6小时授权",
    "72-hour limited": "72小时有限授权",
    "Oncology bundle": "肿瘤专科资料包",
    "Prescription + lab": "处方+检验",
    "Allergy only": "仅过敏信息"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayComplianceMetric(label: string, value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, { label: string; value: string }> = {
    "Data access logs summary": {
      label: "데이터 접근 로그 요약",
      value: "확인된 로그 1,247건, 미해결 변조 이벤트 0건"
    },
    "Prescription compliance rate": {
      label: "처방 컴플라이언스 비율",
      value: "정책 기준에 맞는 처방 98.6%"
    },
    "Drug traceability coverage percentage": {
      label: "의약품 추적성 적용률",
      value: "검증된 배치 적용률 94.8%"
    },
    "PIPL audit readiness status": {
      label: "개인정보보호법(PIPL) 감사 준비 상태",
      value: "대학 시뮬레이션 검토 준비 완료"
    }
  };

  const zhLabels: Record<string, { label: string; value: string }> = {
    "Data access logs summary": {
      label: "数据访问日志汇总",
      value: "已确认日志 1,247 条，未解决篡改事件 0 条"
    },
    "Prescription compliance rate": {
      label: "处方合规率",
      value: "98.6% 处方符合规则"
    },
    "Drug traceability coverage percentage": {
      label: "药品追溯覆盖率",
      value: "94.8% 批次已完成验证"
    },
    "PIPL audit readiness status": {
      label: "个人信息保护审查准备状态",
      value: "已准备好用于课堂模拟审查"
    }
  };

  if (korean) {
    return koLabels[label] ?? { label, value };
  }
  if (chinese) {
    return zhLabels[label] ?? { label, value };
  }
  return { label, value };
}

function riskClass(risk: string) {
  if (risk === "HIGH") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (risk === "SPECIALIST") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (risk === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const showChinese = language === "zh-CN" || language === "zh-TW";
  const showKorean = isKoreanLanguage(language);
  const referralDistribution = referralDistributionBase.map((entry) => ({
    ...entry,
    name: showKorean ? entry.koreanName : showChinese ? entry.chineseName : entry.name
  }));
  const localizedTriageVolume = triageVolume.map((entry) => ({ ...entry, month: displayMonth(entry.month, showChinese, showKorean) }));
  const localizedTransactionModules = transactionModules.map((entry) => ({ ...entry, month: displayMonth(entry.month, showChinese, showKorean) }));
  const localizedDuplicateReduction = duplicateReduction.map((entry) => ({ ...entry, month: displayMonth(entry.month, showChinese, showKorean) }));
  const [regulatorView, setRegulatorView] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("dashboard_title")}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("dashboard_main_title")}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {t("dashboard_description")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRegulatorView((value) => !value)}
            className={`glass-button h-11 ${regulatorView ? "border-emerald-300/40 text-emerald-700" : ""}`}
          >
            {regulatorView ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {t("regulator_view")} {regulatorView ? t("on") : t("off")}
          </button>
        </motion.div>

        {regulatorView ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-6 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <h2 className="text-xl font-semibold text-slate-900">{t("aggregated_compliance_metrics")}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {t("regulator_desc")}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {complianceMetrics.map(([label, value, Icon]) => {
                const metric = displayComplianceMetric(label as string, value as string, showChinese, showKorean);
                return (
                <div key={label as string} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Icon className="h-6 w-6 text-sky-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-900">{metric.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{metric.value}</p>
                </div>
                );
              })}
            </div>
          </motion.section>
        ) : null}

        {!regulatorView ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map(([label, value, Icon]) => (
              <motion.div key={label as string} whileHover={{ y: -4 }} className="glass-card rounded-2xl p-4">
                <Icon className="h-5 w-5 text-sky-600" />
                <p className="mt-4 text-2xl font-semibold text-slate-900">{value as string}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{t(label as string)}</p>
              </motion.div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartCard title={t("monthly_ai_triage_volume")} icon={BarChart3}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={localizedTriageVolume}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A" }} />
                <Bar dataKey="volume" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t("referral_distribution")} icon={Activity}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={referralDistribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={90} paddingAngle={4}>
                  {referralDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t("blockchain_transactions_by_module")} icon={DatabaseZap}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={localizedTransactionModules}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A" }} />
                <Legend />
                <Bar dataKey="MediChain" stackId="a" fill="#0EA5E9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="MediRoute" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="MediRx" stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t("duplicate_reduction_trend")} icon={LineIcon}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={localizedDuplicateReduction}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" unit="%" />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A" }} />
                <Line type="monotone" dataKey="reduction" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {regulatorView ? t("aggregated_referral_operations") : t("recent_referrals")}
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">{t("patient_id")}</th>
                  <th className="px-4 py-4 font-medium">{t("risk_level")}</th>
                  <th className="px-4 py-4 font-medium">{t("department")}</th>
                  <th className="px-4 py-4 font-medium">{t("status")}</th>
                  <th className="px-4 py-4 font-medium">{t("wait_time")}</th>
                  <th className="px-4 py-4 font-medium">{t("record_authorization")}</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={referral.patientId} className="border-t border-slate-200 text-sm text-slate-600">
                    <td className="px-4 py-4 font-mono text-xs text-sky-700">
                      {regulatorView ? `MASKED-${String(index + 1).padStart(3, "0")}` : referral.patientId}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${riskClass(referral.risk)}`}>
                        {displayRisk(referral.risk, showChinese, showKorean)}
                      </span>
                    </td>
                    <td className="px-4 py-4">{displayDepartment(referral.department, showChinese, showKorean)}</td>
                    <td className="px-4 py-4">{displayReferralStatus(referral.status, showChinese, showKorean)}</td>
                    <td className="px-4 py-4">{displayWaitTime(referral.waitTime, showChinese, showKorean)}</td>
                    <td className="px-4 py-4">{regulatorView ? t("aggregated_only") : displayAuthorization(referral.authorization, showChinese, showKorean)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-sky-600" />
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
