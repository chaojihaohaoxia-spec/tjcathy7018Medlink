"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ClipboardSignature,
  Hash,
  Hospital,
  Loader2,
  Map,
  PackageCheck,
  Pill,
  Route,
  ShieldCheck,
  Truck
} from "lucide-react";
import { mockHospitals } from "@/data/mockHospitals";
import { mockPharmacyRoutes } from "@/data/mockMedicines";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type FlowStatus = "idle" | "running" | "done";

type FlowStep = {
  label: string;
  detail: string;
  icon: typeof ClipboardSignature;
  status: FlowStatus;
};

const sampleMedicines = [
  {
    label: "Common Antibiotic",
    need: "Amoxicillin-clavulanate prescription for respiratory infection",
    type: "Antibiotic"
  },
  {
    label: "Insulin Refill",
    need: "Insulin glargine refill for diabetes medication continuity",
    type: "Chronic refill"
  },
  {
    label: "Oncology Drug",
    need: "Osimertinib targeted oncology drug refill",
    type: "Specialist controlled"
  },
  {
    label: "Mental Health Med",
    need: "SSRI medication refill for stable mental health treatment",
    type: "Specialist monitored"
  },
  {
    label: "General Cold Med",
    need: "General cold medicine for cough and sore throat",
    type: "General OTC"
  }
];

const locations = ["Chengdu", "Shanghai", "Guangzhou", "Shenzhen"];
const prescriptionTypes = ["New prescription", "Chronic refill", "Specialist controlled", "General OTC"];
const urgencyLevels = ["Routine", "Within 24 hours", "Urgent"];

const baseFlow: FlowStep[] = [
  {
    label: "Doctor Authority",
    detail: "Verify prescribing role and department authority.",
    icon: ClipboardSignature,
    status: "idle"
  },
  {
    label: "Inventory Check",
    detail: "Sync hospital and pharmacy stock.",
    icon: PackageCheck,
    status: "idle"
  },
  {
    label: "Drug Batch Verification",
    detail: "Check batch origin, distributor, and tamper proof.",
    icon: ShieldCheck,
    status: "idle"
  },
  {
    label: "Patient Pickup Route",
    detail: "Optimize pickup or hospital pharmacy route.",
    icon: Route,
    status: "idle"
  },
  {
    label: "Blockchain Confirmation",
    detail: "Anchor prescription route and batch proof.",
    icon: Hash,
    status: "idle"
  }
];

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function compactHash(hash: string) {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function getAuthorityText(need: string) {
  const text = need.toLowerCase();
  if (text.includes("osimertinib") || text.includes("oncology") || text.includes("奥希替尼") || text.includes("肿瘤") || text.includes("靶向") || text.includes("오시머티닙") || text.includes("항암") || text.includes("암")) {
    return "Oncology specialist required";
  }

  if (text.includes("insulin") || text.includes("diabetes") || text.includes("胰岛素") || text.includes("糖尿病") || text.includes("인슐린") || text.includes("당뇨")) {
    return "Endocrinology or chronic care physician";
  }

  if (text.includes("mental") || text.includes("精神健康") || text.includes("정신건강")) {
    return "Psychiatry review recommended";
  }

  if (text.includes("antibiotic") || text.includes("抗生素") || text.includes("抗感染") || text.includes("항생제")) {
    return "Community physician with infection indication";
  }

  return "General outpatient authority";
}

function stockForNeed(need: string, index: number) {
  const text = need.toLowerCase();
  if (text.includes("osimertinib") || text.includes("oncology") || text.includes("奥希替尼") || text.includes("肿瘤") || text.includes("靶向") || text.includes("오시머티닙") || text.includes("항암") || text.includes("암")) {
    return index === 0 ? "16 units" : index === 2 ? "5 units" : "Special order";
  }

  if (text.includes("insulin") || text.includes("胰岛素") || text.includes("인슐린")) {
    return index === 1 ? "34 pens" : "Available";
  }

  if (text.includes("antibiotic") || text.includes("抗生素") || text.includes("항생제")) {
    return "Available";
  }

  return index === 3 ? "Limited" : "Available";
}

function isKoreanLanguage(language: string) {
  return language === "ko";
}

function displayInstitutionName(name: string, showChinese: boolean, showKorean = false) {
  if (showKorean) {
    if (name.includes("West China")) {
      return "쓰촨대학교 화시병원";
    }
    if (name.includes("Second People's")) {
      return "청두시 제2인민병원";
    }
    if (name.includes("Jinjiang")) {
      return name.includes("Pharmacy") ? "청두 진장구 지역사회보건센터 약국" : "청두 진장구 지역사회보건센터";
    }
    if (name.includes("Cancer")) {
      return "쓰촨성 암병원";
    }
    if (name.includes("Xinhua")) {
      return name.includes("Pharmacy") ? "청두 신화 지역 의원 약국" : "청두 신화 지역 의원";
    }
  }
  if (showChinese) {
    if (name.includes("West China")) {
      return name.includes("Pharmacy") ? "华西医院药房" : "华西医院";
    }
    if (name.includes("Second People's")) {
      return "成都市第二人民医院";
    }
    if (name.includes("Jinjiang")) {
      return name.includes("Pharmacy") ? "成都市锦江区社区卫生服务中心药房" : "成都市锦江区社区卫生服务中心";
    }
    if (name.includes("Cancer")) {
      return "四川省肿瘤医院";
    }
    if (name.includes("Xinhua")) {
      return name.includes("Pharmacy") ? "成都新华社区诊所药房" : "成都新华社区诊所";
    }
  }
  return name.replace("Community Clinic", "Primary Care Clinic");
}

function displayMedicineValue(value: string, showChinese: boolean, showKorean: boolean) {
  const koLabels: Record<string, string> = {
    "Common Antibiotic": "일반 항생제",
    "Insulin Refill": "인슐린 처방 갱신",
    "Oncology Drug": "종양 표적치료제",
    "Mental Health Med": "정신건강 약",
    "General Cold Med": "일반 감기약",
    "Amoxicillin-clavulanate prescription for respiratory infection": "호흡기 감염 항생제 처방",
    "Insulin glargine refill for diabetes medication continuity": "당뇨 치료 연속성을 위한 인슐린 글라진 처방 갱신",
    "Osimertinib targeted oncology drug refill": "오시머티닙 표적항암제 처방 갱신",
    "SSRI medication refill for stable mental health treatment": "안정적 정신건강 치료를 위한 SSRI 처방 갱신",
    "General cold medicine for cough and sore throat": "기침과 인후통을 위한 일반 감기약",
    Antibiotic: "항생제",
    "Chronic refill": "만성질환 처방 갱신",
    "Specialist controlled": "전문의 관리 처방",
    "Specialist monitored": "전문의 모니터링",
    "General OTC": "일반의약품",
    "metformin-500": "메트포르민 500mg",
    "atorvastatin-20": "아토르바스타틴 20mg",
    "salbutamol-inhaler": "살부타몰 흡입제",
    "budesonide-200": "부데소니드 200",
    "apixaban-25": "아픽사반 2.5mg",
    Chengdu: "청두",
    Shanghai: "상하이",
    Guangzhou: "광저우",
    Shenzhen: "선전",
    "New prescription": "신규 처방",
    Routine: "일반",
    "Within 24 hours": "24시간 이내",
    Urgent: "긴급",
    Available: "재고 있음",
    Limited: "제한적 재고",
    "Special order": "전문 주문",
    "FHIR inventory live": "재고 연동 실시간",
    "Connector review needed": "연동 검토 필요",
    community: "지역 약국",
    hospital: "병원 약국",
    retail: "소매 약국",
    "Chengdu, Sichuan": "청두, 쓰촨"
  };

  const zhLabels: Record<string, string> = {
    "Common Antibiotic": "常用抗生素",
    "Insulin Refill": "胰岛素续方",
    "Oncology Drug": "肿瘤靶向药",
    "Mental Health Med": "精神健康用药",
    "General Cold Med": "普通感冒药",
    "Amoxicillin-clavulanate prescription for respiratory infection": "呼吸道感染的阿莫西林克拉维酸处方",
    "Insulin glargine refill for diabetes medication continuity": "糖尿病连续用药所需甘精胰岛素续方",
    "Osimertinib targeted oncology drug refill": "奥希替尼靶向药续方",
    "SSRI medication refill for stable mental health treatment": "稳定精神健康治疗所需 SSRI 续方",
    "General cold medicine for cough and sore throat": "咳嗽和咽喉痛的普通感冒药",
    Antibiotic: "抗生素",
    "Chronic refill": "慢病续方",
    "Specialist controlled": "专科管控处方",
    "Specialist monitored": "专科随访用药",
    "General OTC": "普通非处方药",
    "metformin-500": "二甲双胍 500mg",
    "atorvastatin-20": "阿托伐他汀 20mg",
    "salbutamol-inhaler": "沙丁胺醇吸入剂",
    "budesonide-200": "布地奈德 200",
    "apixaban-25": "阿哌沙班 2.5mg",
    Chengdu: "成都",
    Shanghai: "上海",
    Guangzhou: "广州",
    Shenzhen: "深圳",
    "New prescription": "新处方",
    Routine: "常规",
    "Within 24 hours": "24小时内",
    Urgent: "紧急",
    Available: "有货",
    Limited: "库存有限",
    "Special order": "专项订货",
    "FHIR inventory live": "实时库存已接入",
    "Connector review needed": "需接口复核",
    community: "社区药房",
    hospital: "医院药房",
    retail: "零售药房",
    "Chengdu, Sichuan": "成都，四川"
  };

  if (showKorean) {
    if (value.endsWith(" units")) {
      return `${value.replace(" units", "")}개`;
    }
    if (value.endsWith(" pens")) {
      return `${value.replace(" pens", "")}펜`;
    }
    if (value.startsWith("Today")) {
      return value.replace("Today", "오늘");
    }
    if (value.startsWith("Tomorrow")) {
      return value.replace("Tomorrow", "내일");
    }
    if (value.startsWith("May 1")) {
      return value.replace("May 1", "5월 1일");
    }
    return koLabels[value] ?? value;
  }

  if (showChinese) {
    if (value.endsWith(" units")) {
      return `${value.replace(" units", "")}盒`;
    }
    if (value.endsWith(" pens")) {
      return `${value.replace(" pens", "")}支`;
    }
    if (value.startsWith("Today")) {
      return value.replace("Today", "今天");
    }
    if (value.startsWith("Tomorrow")) {
      return value.replace("Tomorrow", "明天");
    }
    if (value.startsWith("May 1")) {
      return value.replace("May 1", "5月1日");
    }
    return zhLabels[value] ?? value;
  }

  return value;
}

function displayAuthorityText(value: string, showChinese: boolean, showKorean: boolean) {
  const koLabels: Record<string, string> = {
    "Oncology specialist required": "종양내과 전문의 확인 필요",
    "Endocrinology or chronic care physician": "내분비내과 또는 만성질환 담당 의사",
    "Psychiatry review recommended": "정신건강의학과 검토 권장",
    "Community physician with infection indication": "감염 소견을 확인한 1차 병원 의사",
    "General outpatient authority": "일반 외래 처방 권한"
  };

  const zhLabels: Record<string, string> = {
    "Oncology specialist required": "需肿瘤专科医生确认",
    "Endocrinology or chronic care physician": "内分泌科或慢病管理医生",
    "Psychiatry review recommended": "建议精神科复核",
    "Community physician with infection indication": "具备感染评估权限的基层医生",
    "General outpatient authority": "普通门诊处方权限"
  };

  if (showKorean) {
    return koLabels[value] ?? value;
  }
  if (showChinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayFlowDetail(value: string, showChinese: boolean, showKorean: boolean) {
  const koLabels: Record<string, string> = {
    "Verify prescribing role and department authority.": "처방 가능 역할과 진료과 권한을 확인합니다.",
    "Sync hospital and pharmacy stock.": "병원과 약국 재고를 동기화합니다.",
    "Check batch origin, distributor, and tamper proof.": "의약품 배치 출처, 유통사, 변조 여부를 확인합니다.",
    "Optimize pickup or hospital pharmacy route.": "환자 수령 또는 병원 약국 경로를 최적화합니다.",
    "Anchor prescription route and batch proof.": "처방 경로와 배치 검증 정보를 기록합니다."
  };

  const zhLabels: Record<string, string> = {
    "Verify prescribing role and department authority.": "核验医生处方角色和科室权限。",
    "Sync hospital and pharmacy stock.": "同步医院药房和周边药房库存。",
    "Check batch origin, distributor, and tamper proof.": "核对药品批次来源、配送方和防篡改记录。",
    "Optimize pickup or hospital pharmacy route.": "优化本院药房或附近药房取药路线。",
    "Anchor prescription route and batch proof.": "确认处方流转路径和批次证明。"
  };

  if (showKorean) {
    return koLabels[value] ?? value;
  }
  if (showChinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayColdChainRoute(showChinese: boolean, showKorean: boolean) {
  if (showKorean) {
    return "유통사 → 병원 약국";
  }
  if (showChinese) {
    return "配送商 → 医院药房";
  }
  return "Distributor → hospital pharmacy";
}

export default function MediRxPage() {
  const { language, t } = useLanguage();
  const showChinese = language === "zh-CN" || language === "zh-TW";
  const showKorean = isKoreanLanguage(language);
  const [need, setNeed] = useState(displayMedicineValue("Insulin glargine refill for diabetes medication continuity", showChinese, showKorean));
  const [location, setLocation] = useState("Chengdu");
  const [prescriptionType, setPrescriptionType] = useState("Chronic refill");
  const [urgency, setUrgency] = useState("Within 24 hours");
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>(baseFlow);
  const [routing, setRouting] = useState(false);
  const [routeTxHash, setRouteTxHash] = useState(generateTxHash("medirx-initial"));

  useEffect(() => {
    const matchingSample = sampleMedicines.find(
      (sample) => need === sample.need || need === displayMedicineValue(sample.need, false, true) || need === displayMedicineValue(sample.need, true, false)
    );
    if (!matchingSample) {
      return;
    }
    const localizedNeed = displayMedicineValue(matchingSample.need, showChinese, showKorean);
    if (need !== localizedNeed) {
      setNeed(localizedNeed);
    }
  }, [need, showChinese, showKorean]);

  const matchingRows = useMemo(
    () =>
      mockHospitals.map((hospital, index) => ({
        institution: displayInstitutionName(hospital.name, showChinese, showKorean),
        level: showKorean ? hospital.koreanLevel : showChinese ? hospital.level : hospital.englishLevel,
        authority: displayAuthorityText(getAuthorityText(need), showChinese, showKorean),
        stock: displayMedicineValue(stockForNeed(need, index), showChinese, showKorean),
        slot: displayMedicineValue(["Today 16:00", "Tomorrow 09:20", "Today 18:30", "May 1 10:00", "Today 15:10"][index], showChinese, showKorean),
        distance: showChinese ? hospital.distance.replace(" km", " 公里") : hospital.distance,
        notes: displayMedicineValue(hospital.integration.status === "live" ? "FHIR inventory live" : "Connector review needed", showChinese, showKorean)
      })),
    [need, showChinese, showKorean]
  );

  const batchTimeline = [
    {
      title: showKorean ? "제조사 출고" : showChinese ? "厂家放行" : "Manufacturer release",
      detail: showKorean
        ? need.toLowerCase().includes("oncology") || need.includes("항암")
          ? "아스트라제네카 중국 배치 인증서가 발급되었습니다."
          : "제조사 인증서가 발급되었습니다."
        : showChinese
          ? need.toLowerCase().includes("oncology") || need.includes("肿瘤") || need.includes("奥希替尼")
            ? "阿斯利康中国批次证明已生成。"
            : "厂家批次证明已生成。"
        : need.toLowerCase().includes("oncology") ? "AstraZeneca China batch certificate issued." : "Manufacturer certificate issued."
    },
    {
      title: showKorean ? "유통사 인계" : showChinese ? "配送商交接" : "Distributor handoff",
      detail: showKorean
        ? "쓰촨 인증 의료 유통사가 콜드체인과 보관 인계 이벤트를 기록했습니다."
        : showChinese
          ? "四川认证医药配送商已记录冷链和保管交接事件。"
        : "Sichuan Verified Medical Distributor recorded cold-chain and custody event."
    },
    {
      title: showKorean ? "병원 약국 수령" : showChinese ? "医院药房收货" : "Hospital pharmacy receipt",
      detail: showKorean
        ? `${matchingRows[0].institution} 약국이 포장을 스캔하고 재고를 확인했습니다.`
        : showChinese
          ? `${matchingRows[0].institution}药房已扫码收货并确认库存。`
        : `${matchingRows[0].institution} pharmacy scanned package and verified inventory.`
    },
    {
      title: showKorean ? "암호화 문서 증명 (IPFS)" : showChinese ? "加密文件证明" : "IPFS proof",
      detail: showKorean
        ? `CID bafkrei${generateTxHash(need).slice(2, 24)}가 암호화된 배치 문서로 기록되었습니다.`
        : showChinese
          ? `文件编号 bafkrei${generateTxHash(need).slice(2, 24)} 已作为加密批次文件记录。`
        : `CID bafkrei${generateTxHash(need).slice(2, 24)} anchored as encrypted batch document.`
    },
    {
      title: showKorean ? "블록체인 확인" : showChinese ? "链上确认" : "Blockchain confirmation",
      detail: showKorean
        ? `${compactHash(routeTxHash)} 검증 완료, 변조 검사 통과.`
        : showChinese
          ? `${compactHash(routeTxHash)} 已验证，篡改检查通过。`
        : `${compactHash(routeTxHash)} verified, tamper check passed.`
    }
  ];

  const runRouting = async () => {
    setRouting(true);
    setFlowSteps(baseFlow.map((step) => ({ ...step, status: "idle" })));

    for (let index = 0; index < baseFlow.length; index += 1) {
      setFlowSteps((current) =>
        current.map((step, stepIndex) => ({
          ...step,
          status: stepIndex === index ? "running" : step.status
        }))
      );
      await delay(650);
      setFlowSteps((current) =>
        current.map((step, stepIndex) => ({
          ...step,
          status: stepIndex <= index ? "done" : step.status
        }))
      );
    }

    setRouteTxHash(generateTxHash(`medirx:${need}:${location}`));
    setRouting(false);
  };

  const applySample = (sample: typeof sampleMedicines[number]) => {
    setNeed(displayMedicineValue(sample.need, showChinese, showKorean));
    setPrescriptionType(sample.type);
    setFlowSteps(baseFlow.map((step) => ({ ...step, status: "idle" })));
  };

  const flowLabel = (label: string) => {
    if (label === "Doctor Authority") {
      return t("authority_verified");
    }
    if (label === "Inventory Check") {
      return t("stock_synced");
    }
    if (label === "Drug Batch Verification") {
      return t("batch_verified");
    }
    if (label === "Patient Pickup Route") {
      return t("route_generated");
    }
    return t("confirm");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("page.medirx")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("medirx_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("medirx_description")}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                <Pill className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("prescription_need")}</h2>
            </div>

            <label className="mt-5 grid gap-3 text-sm font-medium text-slate-700">
              {t("prescription_need")}
              <textarea
                value={need}
                onChange={(event) => setNeed(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                placeholder={t("prescription_placeholder")}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {sampleMedicines.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition hover:border-sky-300 hover:text-slate-900"
                >
                  {displayMedicineValue(sample.label, showChinese, showKorean)}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SelectField label={t("location")} value={location} options={locations} onChange={setLocation} getOptionLabel={(option) => displayMedicineValue(option, showChinese, showKorean)} />
              <SelectField label={t("type")} value={prescriptionType} options={prescriptionTypes} onChange={setPrescriptionType} getOptionLabel={(option) => displayMedicineValue(option, showChinese, showKorean)} />
              <SelectField label={t("severity")} value={urgency} options={urgencyLevels} onChange={setUrgency} getOptionLabel={(option) => displayMedicineValue(option, showChinese, showKorean)} />
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-sky-600">{t("route_proof")}</p>
                <p className="mt-2 font-mono text-xs text-slate-900">{compactHash(routeTxHash)}</p>
              </div>
            </div>

            <button type="button" onClick={runRouting} disabled={routing || !need.trim()} className="primary-button mt-6 h-12 disabled:cursor-not-allowed disabled:opacity-60">
              {routing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
              {t("route_prescription")}
            </button>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("routing_flow")}</h2>
            <div className="mt-6 grid gap-4">
              {flowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    animate={{ opacity: step.status === "idle" ? 0.72 : 1, x: step.status === "running" ? [0, 6, 0] : 0 }}
                    transition={{ duration: 0.55, repeat: step.status === "running" ? Infinity : 0 }}
                    className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    {index < flowSteps.length - 1 ? <div className="absolute left-8 top-16 h-7 w-px bg-sky-100" /> : null}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          step.status === "done"
                            ? "bg-emerald-500 text-white"
                            : step.status === "running"
                              ? "bg-sky-500 text-white"
                              : "bg-white text-slate-500"
                        }`}
                      >
                        {step.status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : step.status === "done" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{flowLabel(step.label)}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{displayFlowDetail(step.detail, showChinese, showKorean)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <h2 className="text-lg font-semibold text-slate-900">{t("institution_matching")}</h2>
            <div className="flex flex-wrap gap-2">
              <AuthorityBadge label={displayAuthorityText(getAuthorityText(need), showChinese, showKorean)} />
              <AuthorityBadge label={displayMedicineValue(prescriptionType, showChinese, showKorean)} />
              <AuthorityBadge label={displayMedicineValue(urgency, showChinese, showKorean)} />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">{t("institution")}</th>
                  <th className="px-4 py-4 font-medium">{t("level")}</th>
                  <th className="px-4 py-4 font-medium">{t("distance")}</th>
                  <th className="px-4 py-4 font-medium">{t("doctor_authority")}</th>
                  <th className="px-4 py-4 font-medium">{t("medicine_stock")}</th>
                  <th className="px-4 py-4 font-medium">{t("next_slot")}</th>
                  <th className="px-4 py-4 font-medium">{t("notes")}</th>
                </tr>
              </thead>
              <tbody>
                {matchingRows.map((row) => (
                  <tr key={row.institution} className="border-t border-slate-200 text-sm text-slate-600">
                    <td className="px-4 py-4 font-medium text-slate-900">{row.institution}</td>
                    <td className="px-4 py-4">{row.level}</td>
                    <td className="px-4 py-4">{row.distance}</td>
                    <td className="px-4 py-4">{row.authority}</td>
                    <td className="px-4 py-4">{row.stock}</td>
                    <td className="px-4 py-4">{row.slot}</td>
                    <td className="px-4 py-4">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("pharmacy_stock_cards")}</h2>
            <div className="mt-5 grid gap-4">
              {mockPharmacyRoutes.map((pharmacy) => (
                <div key={pharmacy.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{displayInstitutionName(pharmacy.name, showChinese, showKorean)}</p>
                      <p className="mt-1 text-sm text-slate-500">{displayMedicineValue(pharmacy.region, showChinese, showKorean)} · {displayMedicineValue(pharmacy.type, showChinese, showKorean)}</p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                      {t("score")} {pharmacy.fulfillmentScore}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {Object.entries(pharmacy.inventory).slice(0, 4).map(([medicineId, amount]) => (
                      <div key={medicineId} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="truncate text-slate-500">{displayMedicineValue(medicineId.replace("rx-", ""), showChinese, showKorean)}</p>
                        <p className="mt-1 font-semibold text-slate-900">{amount} {t("available")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("drug_batch_timeline")}</h2>
            <ol className="mt-5 grid gap-4">
              {batchTimeline.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="relative border-l border-sky-200 pl-5"
                >
                  <span className="absolute -left-2 top-0 flex h-4 w-4 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(14,165,233,0.35)]" />
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                </motion.li>
              ))}
            </ol>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InfoTile icon={Truck} label={t("pickup_route")} value={`${displayMedicineValue(location, showChinese, showKorean)} ${t("route_ready")}`} />
              <InfoTile icon={BadgeCheck} label={t("verified")} value={showKorean ? "통과 ✓" : showChinese ? "已通过 ✓" : "Passed ✓"} />
              <InfoTile icon={Map} label={t("cold_chain_route")} value={displayColdChainRoute(showChinese, showKorean)} />
              <InfoTile icon={Hash} label={t("batch_verified")} value={`${t("verified")} ✓`} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  getOptionLabel
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getOptionLabel?: (value: string) => string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-sky-400"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-white text-slate-900">
              {getOptionLabel ? getOptionLabel(option) : option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function AuthorityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
      <Hospital className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sky-600">
        <Icon className="h-4 w-4" />
        <p className="text-xs uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
