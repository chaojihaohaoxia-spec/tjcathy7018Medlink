"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Check,
  ChevronDown,
  ClipboardList,
  Hospital,
  Loader2,
  ShieldAlert,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { mockHospitals } from "@/data/mockHospitals";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type Risk = "HIGH" | "MEDIUM" | "SPECIALIST" | "LOW-MEDIUM";

type TriageResult = {
  risk: Risk;
  probabilities: string[];
  department: string;
  careLevel: string;
  explanation: string;
  redFlag?: string;
};

type SequenceStep = {
  label: string;
  status: "running" | "done";
};

const sampleSymptoms = [
  "Fever and cough for 3 days, mild fatigue",
  "Chest pain and shortness of breath",
  "Diabetes medication refill needed",
  "Sudden severe headache with slurred speech",
  "Cancer targeted drug refill, Osimertinib"
];

const historyProfiles = [
  {
    id: "wang-lei",
    label: "Wang Lei · 42 · Hypertension · Penicillin allergy",
    age: 42,
    chronicCondition: "Hypertension",
    allergy: "Penicillin"
  },
  {
    id: "chen-mei",
    label: "Chen Mei · 68 · Diabetes · No allergy",
    age: 68,
    chronicCondition: "Diabetes",
    allergy: "None"
  },
  {
    id: "li-jun",
    label: "Li Jun · 35 · No chronic condition · Sulfa allergy",
    age: 35,
    chronicCondition: "None",
    allergy: "Sulfa drugs"
  }
];

const loadingSequence = [
  { label: "Retrieving authorized records via FHIR API...", delay: 800 },
  { label: "Checking allergy and medication history...", delay: 800 },
  { label: "Running AI triage model...", delay: 1000 },
  { label: "Writing triage summary to blockchain...", delay: 600 }
];

const safetyItems = [
  "safety_not_final",
  "safety_emergency",
  "safety_human_review",
  "safety_consent"
];

const koSymptomLabels: Record<string, string> = {
  "Fever and cough for 3 days, mild fatigue": "3일간 발열과 기침, 약간의 피로",
  "Chest pain and shortness of breath": "흉통과 숨참",
  "Diabetes medication refill needed": "당뇨약 처방 갱신 필요",
  "Sudden severe headache with slurred speech": "갑작스러운 심한 두통과 말 어눌함",
  "Cancer targeted drug refill, Osimertinib": "암 표적치료제 오시머티닙 처방 갱신"
};

const zhSymptomLabels: Record<string, string> = {
  "Fever and cough for 3 days, mild fatigue": "发热咳嗽3天，轻度乏力",
  "Chest pain and shortness of breath": "胸口痛并伴有呼吸困难",
  "Diabetes medication refill needed": "糖尿病用药需要续方",
  "Sudden severe headache with slurred speech": "突然剧烈头痛，说话不清",
  "Cancer targeted drug refill, Osimertinib": "肿瘤靶向药奥希替尼需要续方"
};

const koProfileLabels: Record<string, string> = {
  "wang-lei": "왕레이 · 42세 · 고혈압 · 페니실린 알레르기",
  "chen-mei": "천메이 · 68세 · 당뇨병 · 알레르기 없음",
  "li-jun": "리쥔 · 35세 · 만성질환 없음 · 설파제 알레르기"
};

const zhProfileLabels: Record<string, string> = {
  "wang-lei": "王磊 · 42岁 · 高血压 · 青霉素过敏",
  "chen-mei": "陈梅 · 68岁 · 糖尿病 · 无过敏史",
  "li-jun": "李军 · 35岁 · 无慢性病 · 磺胺类药物过敏"
};

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function isChineseLanguage(language: string) {
  return language === "zh-CN" || language === "zh-TW";
}

function isKoreanLanguage(language: string) {
  return language === "ko";
}

function displaySymptomText(symptom: string, chinese: boolean, korean: boolean) {
  if (korean) {
    return koSymptomLabels[symptom] ?? symptom;
  }
  if (chinese) {
    return zhSymptomLabels[symptom] ?? symptom;
  }
  return symptom;
}

function symptomForStorage(symptom: string, chinese: boolean, korean: boolean) {
  return displaySymptomText(symptom, chinese, korean);
}

function displayHistoryProfile(profile: typeof historyProfiles[number], chinese: boolean, korean: boolean) {
  if (korean) {
    return koProfileLabels[profile.id] ?? profile.label;
  }
  if (chinese) {
    return zhProfileLabels[profile.id] ?? profile.label;
  }
  return profile.label;
}

function displayMedicalValue(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    Hypertension: "고혈압",
    Diabetes: "당뇨병",
    None: "없음",
    Penicillin: "페니실린",
    "Sulfa drugs": "설파제",
    mild: "가벼움",
    moderate: "중간",
    severe: "심함",
    "<1 day": "하루 미만",
    "1-3 days": "1-3일",
    "3-7 days": "3-7일",
    ">7 days": "7일 이상"
  };

  const zhLabels: Record<string, string> = {
    Hypertension: "高血压",
    Diabetes: "糖尿病",
    None: "无",
    Penicillin: "青霉素",
    "Sulfa drugs": "磺胺类药物",
    mild: "轻微",
    moderate: "中等",
    severe: "严重",
    "<1 day": "不到1天",
    "1-3 days": "1-3天",
    "3-7 days": "3-7天",
    ">7 days": "超过7天"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayHospitalName(name: string, chinese: boolean, korean: boolean) {
  if (korean) {
    if (name.includes("Jinjiang")) {
      return "청두 진장구 지역사회보건센터";
    }
    if (name.includes("West China")) {
      return "쓰촨대학교 화시병원";
    }
    if (name.includes("Second People's")) {
      return "청두시 제2인민병원";
    }
    if (name.includes("Cancer")) {
      return "쓰촨성 암병원";
    }
    if (name.includes("Xinhua")) {
      return "청두 신화 지역 의원";
    }
  }
  if (chinese) {
    if (name.includes("Jinjiang")) {
      return "成都市锦江区社区卫生服务中心";
    }
    if (name.includes("West China")) {
      return "华西医院";
    }
    if (name.includes("Second People's")) {
      return "成都市第二人民医院";
    }
    if (name.includes("Cancer")) {
      return "四川省肿瘤医院";
    }
    if (name.includes("Xinhua")) {
      return "成都新华社区诊所";
    }
  }
  return name;
}

function displayLoadingLabel(label: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Retrieving authorized records via FHIR API...": "승인된 기록을 의료 데이터 API(FHIR)로 조회 중...",
    "Checking allergy and medication history...": "알레르기와 복용 약 기록 확인 중...",
    "Running AI triage model...": "AI 분류 모델 실행 중...",
    "Writing triage summary to blockchain...": "분류 요약을 검증 기록에 저장 중..."
  };

  const zhLabels: Record<string, string> = {
    "Retrieving authorized records via FHIR API...": "正在读取已授权病史记录...",
    "Checking allergy and medication history...": "正在核对过敏史和用药记录...",
    "Running AI triage model...": "正在运行 AI 分诊模型...",
    "Writing triage summary to blockchain...": "正在写入分诊摘要验证记录..."
  };

  if (korean) {
    return koLabels[label] ?? label;
  }
  if (chinese) {
    return zhLabels[label] ?? label;
  }
  return label;
}

function displayRisk(risk: Risk, chinese: boolean, korean: boolean) {
  const koLabels: Record<Risk, string> = {
    HIGH: "높음",
    MEDIUM: "중간",
    SPECIALIST: "전문의 필요",
    "LOW-MEDIUM": "낮음-중간"
  };

  const zhLabels: Record<Risk, string> = {
    HIGH: "高",
    MEDIUM: "中",
    SPECIALIST: "需专科",
    "LOW-MEDIUM": "低-中"
  };

  if (korean) {
    return koLabels[risk];
  }
  if (chinese) {
    return zhLabels[risk];
  }
  return risk;
}

function displayDepartment(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Emergency Medicine": "응급의학과 (Emergency Medicine)",
    "Respiratory Clinic": "호흡기 진료 (Respiratory Clinic)",
    Endocrinology: "내분비내과 (Endocrinology)",
    "Class A Tertiary Oncology": "종양내과 - 3차 병원 (상급종합병원)",
    "General Outpatient": "일반 외래 (General Outpatient)"
  };

  const zhLabels: Record<string, string> = {
    "Emergency Medicine": "急诊医学科",
    "Respiratory Clinic": "呼吸科门诊",
    Endocrinology: "内分泌科",
    "Class A Tertiary Oncology": "三甲肿瘤专科",
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

function displayCareLevel(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Emergency / Class A Tertiary Hospital (Top-Tier)": "응급실 / 3차 병원 (상급종합병원)",
    "Primary Care Clinic + Respiratory": "1차 병원 (의원, 보건소) + 호흡기 진료",
    "Community + Endocrinology": "1차 병원 (의원, 보건소) + 내분비내과",
    "Class A Specialist Hospital": "3차 병원 (상급종합병원)",
    "General outpatient": "일반 외래"
  };

  const zhLabels: Record<string, string> = {
    "Emergency / Class A Tertiary Hospital (Top-Tier)": "急诊 / 三甲医院",
    "Primary Care Clinic + Respiratory": "基层诊所或社区医院 + 呼吸相关评估",
    "Community + Endocrinology": "基层医疗机构 + 内分泌随访",
    "Class A Specialist Hospital": "三甲专科医院",
    "General outpatient": "普通门诊"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayProbability(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "Acute cardiac or neurological emergency: 52%": "급성 심장 또는 신경학적 응급 가능성: 52%",
    "Severe respiratory distress: 29%": "중증 호흡 곤란 가능성: 29%",
    "Other emergency: 19%": "기타 응급 가능성: 19%",
    "Respiratory Infection: 72%": "호흡기 감염 가능성: 72%",
    "Influenza: 18%": "인플루엔자 가능성: 18%",
    "Other: 10%": "기타: 10%",
    "Medication continuity need: 64%": "약물 지속 관리 필요: 64%",
    "Glucose control review: 26%": "혈당 조절 검토 필요: 26%",
    "Oncology medication pathway: 74%": "종양 약물 경로 필요: 74%",
    "Specialist authority check: 18%": "전문의 처방 권한 확인: 18%",
    "Other: 8%": "기타: 8%",
    "General outpatient need: 58%": "일반 외래 필요: 58%",
    "Self-limited condition: 27%": "자연 호전 가능성: 27%",
    "Other: 15%": "기타: 15%"
  };

  const zhLabels: Record<string, string> = {
    "Acute cardiac or neurological emergency: 52%": "急性心脑血管急症可能性：52%",
    "Severe respiratory distress: 29%": "严重呼吸困难可能性：29%",
    "Other emergency: 19%": "其他急症可能性：19%",
    "Respiratory Infection: 72%": "呼吸道感染可能性：72%",
    "Influenza: 18%": "流感可能性：18%",
    "Other: 10%": "其他：10%",
    "Medication continuity need: 64%": "连续用药需求：64%",
    "Glucose control review: 26%": "血糖控制复查需求：26%",
    "Oncology medication pathway: 74%": "肿瘤用药路径需求：74%",
    "Specialist authority check: 18%": "专科医生权限确认：18%",
    "Other: 8%": "其他：8%",
    "General outpatient need: 58%": "普通门诊需求：58%",
    "Self-limited condition: 27%": "可能自行缓解：27%",
    "Other: 15%": "其他：15%"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayExplanation(value: string, chinese: boolean, korean: boolean) {
  const koLabels: Record<string, string> = {
    "The symptom set contains urgent red flags. MediRoute prioritizes emergency access and top-tier hospital fast-track referral.":
      "입력 증상에 긴급 위험 신호가 포함되어 있습니다. MediRoute는 응급 진료 접근성과 3차 병원 (상급종합병원) 신속 의뢰를 우선합니다.",
    "Respiratory symptoms and duration suggest first-contact community care with escalation if symptoms persist.":
      "호흡기 증상과 지속 기간을 고려하면 먼저 1차 병원 (의원, 보건소)에서 평가하고, 증상이 지속되면 상급 진료로 연결하는 경로가 적합합니다.",
    "Authorized history indicates chronic disease context. The route includes prescription continuity and endocrine follow-up.":
      "승인된 병력에서 만성질환 맥락이 확인되었습니다. 경로에는 처방 연속성과 내분비내과 추적 진료가 포함됩니다.",
    "Targeted oncology therapy requires specialist review, prescription authority validation, and drug batch traceability.":
      "표적 항암 치료는 전문의 검토, 처방 권한 확인, 의약품 배치 추적이 필요합니다.",
    "No urgent pattern was detected. General outpatient review is simulated with continued monitoring.":
      "긴급 패턴은 감지되지 않았습니다. 일반 외래 평가와 지속 관찰을 권장하는 시뮬레이션입니다."
  };

  const zhLabels: Record<string, string> = {
    "The symptom set contains urgent red flags. MediRoute prioritizes emergency access and top-tier hospital fast-track referral.":
      "症状中包含急症危险信号，MediRoute 会优先模拟急诊接诊和三甲医院快速转诊路径。",
    "Respiratory symptoms and duration suggest first-contact community care with escalation if symptoms persist.":
      "呼吸道症状和持续时间提示可先到基层医疗机构评估；如果症状持续或加重，再升级到上级医院。",
    "Authorized history indicates chronic disease context. The route includes prescription continuity and endocrine follow-up.":
      "授权病史提示存在慢性病背景，推荐路径包含续方连续性和内分泌随访。",
    "Targeted oncology therapy requires specialist review, prescription authority validation, and drug batch traceability.":
      "靶向肿瘤用药需要专科医生复核、处方权限确认和药品批次追踪。",
    "No urgent pattern was detected. General outpatient review is simulated with continued monitoring.":
      "未发现明显急症模式，本演示推荐普通门诊评估并继续观察。"
  };

  if (korean) {
    return koLabels[value] ?? value;
  }
  if (chinese) {
    return zhLabels[value] ?? value;
  }
  return value;
}

function displayRedFlag(value: string | undefined, chinese: boolean, korean: boolean) {
  if (!value) {
    return value;
  }
  if (korean) {
    return "즉시 임상 평가가 권장됩니다.";
  }
  if (chinese) {
    return "建议立即进行临床评估。";
  }
  return value;
}

function deriveResult(input: {
  symptoms: string;
  severity: string;
  duration: string;
  redFlags: boolean;
  history: typeof historyProfiles[number];
  useHistory: boolean;
}): TriageResult {
  const text = input.symptoms.toLowerCase();
  const emergency =
    text.includes("chest pain") ||
    text.includes("shortness of breath") ||
    text.includes("stroke") ||
    text.includes("slurred speech") ||
    text.includes("speech difficulty") ||
    text.includes("胸口痛") ||
    text.includes("胸痛") ||
    text.includes("呼吸困难") ||
    text.includes("说话不清") ||
    text.includes("剧烈头痛") ||
    text.includes("흉통") ||
    text.includes("숨참") ||
    text.includes("호흡") ||
    text.includes("말 어눌") ||
    text.includes("심한 두통") ||
    input.redFlags ||
    input.severity === "severe";

  if (emergency) {
    return {
      risk: "HIGH",
      probabilities: ["Acute cardiac or neurological emergency: 52%", "Severe respiratory distress: 29%", "Other emergency: 19%"],
      department: "Emergency Medicine",
      careLevel: "Emergency / Class A Tertiary Hospital (Top-Tier)",
      explanation:
        "The symptom set contains urgent red flags. MediRoute prioritizes emergency access and top-tier hospital fast-track referral.",
      redFlag: "Immediate clinical evaluation is recommended."
    };
  }

  if (
    text.includes("fever") ||
    text.includes("cough") ||
    text.includes("tired") ||
    text.includes("sore throat") ||
    text.includes("发热") ||
    text.includes("咳嗽") ||
    text.includes("乏力") ||
    text.includes("咽喉") ||
    text.includes("발열") ||
    text.includes("기침") ||
    text.includes("인후통")
  ) {
    return {
      risk: "MEDIUM",
      probabilities: ["Respiratory Infection: 72%", "Influenza: 18%", "Other: 10%"],
      department: "Respiratory Clinic",
      careLevel: "Primary Care Clinic + Respiratory",
      explanation:
        "Respiratory symptoms and duration suggest first-contact community care with escalation if symptoms persist."
    };
  }

  if (
    text.includes("diabetes") ||
    text.includes("insulin") ||
    text.includes("glucose") ||
    text.includes("hba1c") ||
    text.includes("糖尿病") ||
    text.includes("胰岛素") ||
    text.includes("血糖") ||
    text.includes("당뇨") ||
    text.includes("인슐린") ||
    (input.useHistory && input.history.chronicCondition === "Diabetes")
  ) {
    return {
      risk: "MEDIUM",
      probabilities: ["Medication continuity need: 64%", "Glucose control review: 26%", "Other: 10%"],
      department: "Endocrinology",
      careLevel: "Community + Endocrinology",
      explanation:
        "Authorized history indicates chronic disease context. The route includes prescription continuity and endocrine follow-up."
    };
  }

  if (
    text.includes("cancer") ||
    text.includes("oncology") ||
    text.includes("osimertinib") ||
    text.includes("targeted") ||
    text.includes("肿瘤") ||
    text.includes("癌") ||
    text.includes("奥希替尼") ||
    text.includes("靶向") ||
    text.includes("암") ||
    text.includes("오시머티닙") ||
    text.includes("표적치료제")
  ) {
    return {
      risk: "SPECIALIST",
      probabilities: ["Oncology medication pathway: 74%", "Specialist authority check: 18%", "Other: 8%"],
      department: "Class A Tertiary Oncology",
      careLevel: "Class A Specialist Hospital",
      explanation:
        "Targeted oncology therapy requires specialist review, prescription authority validation, and drug batch traceability."
    };
  }

  return {
    risk: "LOW-MEDIUM",
    probabilities: ["General outpatient need: 58%", "Self-limited condition: 27%", "Other: 15%"],
    department: "General Outpatient",
    careLevel: "General outpatient",
    explanation:
      "No urgent pattern was detected. General outpatient review is simulated with continued monitoring."
  };
}

function riskClass(risk: Risk) {
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

export default function MediRoutePage() {
  const { language, t } = useLanguage();
  const showChinese = isChineseLanguage(language);
  const showKorean = isKoreanLanguage(language);
  const [symptoms, setSymptoms] = useState(symptomForStorage(sampleSymptoms[0], showChinese, showKorean));
  const [historyId, setHistoryId] = useState(historyProfiles[0].id);
  const [useAuthorizedHistory, setUseAuthorizedHistory] = useState(true);
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("moderate");
  const [redFlags, setRedFlags] = useState(false);
  const [sequence, setSequence] = useState<SequenceStep[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const selectedHistory = historyProfiles.find((profile) => profile.id === historyId) ?? historyProfiles[0];
  useEffect(() => {
    const matchingSample = sampleSymptoms.find((sample) => symptoms === sample || symptoms === koSymptomLabels[sample] || symptoms === zhSymptomLabels[sample]);
    if (!matchingSample) {
      return;
    }
    const localizedSample = symptomForStorage(matchingSample, showChinese, showKorean);
    if (symptoms !== localizedSample) {
      setSymptoms(localizedSample);
    }
  }, [showChinese, showKorean, symptoms]);

  const capacitySignal = useMemo(() => {
    const fastest = [...mockHospitals].sort((a, b) => a.capacity.averageWaitMinutes - b.capacity.averageWaitMinutes)[0];
    if (showKorean) {
      return `${displayHospitalName(fastest.name, false, true)}: 평균 대기 ${fastest.capacity.averageWaitMinutes}분`;
    }
    if (showChinese) {
      return `${displayHospitalName(fastest.name, true, false)}：平均等待 ${fastest.capacity.averageWaitMinutes} 分钟`;
    }
    return `${fastest.name}: ${fastest.capacity.averageWaitMinutes} min average wait`;
  }, [showChinese, showKorean]);

  const explainabilityFactors = [
    [t("symptom_severity"), displayMedicalValue(severity, showChinese, showKorean)],
    [t("duration"), displayMedicalValue(duration, showChinese, showKorean)],
    [t("age_label"), useAuthorizedHistory ? `${selectedHistory.age}` : t("hidden_until_consent")],
    [t("chronic_condition"), useAuthorizedHistory ? displayMedicalValue(selectedHistory.chronicCondition, showChinese, showKorean) : t("not_used")],
    [t("allergy_label"), useAuthorizedHistory ? displayMedicalValue(selectedHistory.allergy, showChinese, showKorean) : t("not_used")],
    [t("red_flags"), redFlags ? t("present") : t("not_selected")],
    [t("hospital_capacity"), capacitySignal]
  ];

  const runTriage = async () => {
    setRunning(true);
    setSequence([]);
    setResult(null);
    setTxHash(null);

    for (const phase of loadingSequence) {
      setSequence((current) => [...current, { label: phase.label, status: "running" }]);
      await delay(phase.delay);
      setSequence((current) =>
        current.map((item, index) => (index === current.length - 1 ? { ...item, status: "done" } : item))
      );
    }

    const nextResult = deriveResult({
      symptoms,
      severity,
      duration,
      redFlags,
      history: selectedHistory,
      useHistory: useAuthorizedHistory
    });
    setResult(nextResult);
    setTxHash(generateTxHash(`mediroute:${symptoms}:${selectedHistory.id}`));
    setRunning(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("page.mediroute")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("mediroute_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("mediroute_description")}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <section className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{t("enter_symptoms")}</h2>
            </div>

            <label className="mt-5 grid gap-3 text-sm font-medium text-slate-700">
              {t("describe_symptoms")}
              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                rows={8}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                placeholder={t("symptom_input_placeholder")}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {sampleSymptoms.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setSymptoms(symptomForStorage(sample, showChinese, showKorean))}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition hover:border-sky-300 hover:text-slate-900"
                >
                  {displaySymptomText(sample, showChinese, showKorean)}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {t("patient_history_selector")}
                <span className="relative">
                  <select
                    value={historyId}
                    onChange={(event) => setHistoryId(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-sky-400"
                  >
                    {historyProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id} className="bg-white text-slate-900">
                        {displayHistoryProfile(profile, showChinese, showKorean)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </span>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {t("use_authorized_history")}
                <input
                  type="checkbox"
                  checked={useAuthorizedHistory}
                  onChange={(event) => setUseAuthorizedHistory(event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 bg-white accent-sky-500"
                />
              </label>

              <SelectField label={t("duration")} value={duration} options={["<1 day", "1-3 days", "3-7 days", ">7 days"]} onChange={setDuration} getOptionLabel={(option) => displayMedicalValue(option, showChinese, showKorean)} />
              <SelectField label={t("severity")} value={severity} options={["mild", "moderate", "severe"]} onChange={setSeverity} getOptionLabel={(option) => displayMedicalValue(option, showChinese, showKorean)} />
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <input
                type="checkbox"
                checked={redFlags}
                onChange={(event) => setRedFlags(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white accent-red-300"
              />
              {t("red_flags_present")}
            </label>

            <button type="button" onClick={runTriage} disabled={running || !symptoms.trim()} className="primary-button mt-6 h-12 disabled:cursor-not-allowed disabled:opacity-60">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t("run_triage")}
            </button>
          </section>

          <div className="grid gap-6">
            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("triage_pipeline")}</h2>
              <div className="mt-4 grid gap-3">
                {sequence.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    {t("run_ai_button")}
                  </p>
                ) : (
                  sequence.map((step) => (
                    <div key={step.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {step.status === "done" ? <Check className="h-4 w-4 text-emerald-700" /> : <Loader2 className="h-4 w-4 animate-spin text-sky-600" />}
                      {displayLoadingLabel(step.label, showChinese, showKorean)}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              {result ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{t("recommendation")}</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">{displayDepartment(result.department, showChinese, showKorean)}</h2>
                    </div>
                    <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${riskClass(result.risk)}`}>
                      {t("risk")}: {displayRisk(result.risk, showChinese, showKorean)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <InfoTile label={t("care_level")} value={displayCareLevel(result.careLevel, showChinese, showKorean)} />
                    <InfoTile label={t("blockchain_tx")} value={txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : t("pending")} />
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">{t("simulated_probabilities")}</p>
                    <div className="mt-3 grid gap-2">
                      {result.probabilities.map((item) => (
                        <p key={item} className="text-sm text-slate-600">{displayProbability(item, showChinese, showKorean)}</p>
                      ))}
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600">{displayExplanation(result.explanation, showChinese, showKorean)}</p>
                  {result.redFlag ? (
                    <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                      {displayRedFlag(result.redFlag, showChinese, showKorean)}
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                  {t("triage_output_empty")}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t("why_recommendation")}</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {explainabilityFactors.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
              <h2 className="text-lg font-semibold text-slate-900">{t("safety_guardrails")}</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {safetyItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <Stethoscope className="h-4 w-4 shrink-0" />
                  {t(item)}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
              <Hospital className="h-4 w-4 shrink-0" />
              {t("hospital_capacity_signal")}: {capacitySignal}
            </div>
          </section>
        </div>
      </div>
      <div className="fixed bottom-24 left-5 z-40 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 shadow-2xl lg:left-80">
        ⚠ {t("triage_disclaimer")}
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

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
