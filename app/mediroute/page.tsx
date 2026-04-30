"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Check,
  ClipboardCheck,
  GitBranch,
  Loader2,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Locale = "en" | "zh" | "ko";
type ShortcutCaseId = "normal" | "chest" | "chronic";
type CaseId = "normal" | "chest" | "stroke" | "chronic" | "oncology" | "allergy" | "pediatric" | "unknown";
type ActiveCaseId = ShortcutCaseId | "custom";
type TraceTabId = "records" | "fhir" | "ai" | "safety" | "chaincode" | "feedback";

type TechCard = {
  title: string;
  badge: string;
  description: string;
};

type HospitalMatch = {
  name: string;
  badge: string;
  department: string;
  availability: string;
  queue: string;
  bedCapacity: string;
  distance: string;
  fhirStatus: string;
  reason?: string;
};

type CaseCopy = {
  label: string;
  symptoms: string;
  risk: string;
  riskTone: "emerald" | "amber" | "red";
  recommendation: string;
  guardrail: string;
  guardrailTriggered: boolean;
  hospital: string;
  department: string;
  action: string;
  availability: string;
  confidence: string;
  humanReview: string;
  resultProof: string;
  duration: string;
  ageRisk: string;
  history: string;
  redFlags: string;
  hospitalCapacity: string;
  referralLogic: string;
  reasoningFactors: string[];
  hospitalMatches: HospitalMatch[];
};

type PageCopy = {
  pageLabel: string;
  title: string;
  subtitle: string;
  decisionSupportOnly: string;
  techStackTitle: string;
  techStack: TechCard[];
  careFlowTitle: string;
  careFlow: Array<{ label: string; badge: string }>;
  patientInputTitle: string;
  caseSelector: string;
  patient: string;
  patientName: string;
  age: string;
  ageValue: string;
  location: string;
  locationValue: string;
  authorizedHistory: string;
  consentStatus: string;
  consentActive: string;
  describeSymptoms: string;
  runAiTriage: string;
  runningTriage: string;
  triageCompletedToast: string;
  customTriageCompletedToast: string;
  customInput: string;
  sampleOrCustomTip: string;
  waitingToRun: string;
  triageOutputPlaceholder: string;
  technologyTraceRequiresRunToast: string;
  livePipelineTitle: string;
  recommendationOutputTitle: string;
  riskLevel: string;
  recommendedDepartment: string;
  recommendedHospital: string;
  recommendedAction: string;
  hospitalAvailabilityText: string;
  confidence: string;
  humanReviewRequired: string;
  resultProof: string;
  reasoningFactors: string;
  issueReferralVoucher: string;
  inspectTechnologyTrace: string;
  whyThisRecommendation: string;
  symptomSeverity: string;
  duration: string;
  ageRisk: string;
  redFlags: string;
  hospitalCapacity: string;
  referralLogic: string;
  medicalSafetyGuardrails: string;
  safetyItems: string[];
  hospitalMatchingViaFhir: string;
  hospitalMatchingSubtitle: string;
  department: string;
  availability: string;
  queue: string;
  bedCapacity: string;
  distance: string;
  fhirStatus: string;
  reason: string;
  technologyTrace: string;
  close: string;
  triageResultHashed: string;
  referralVoucherReady: string;
  onchainProofDisclaimer: string;
  referralVoucherGenerated: string;
  voucherId: string;
  priority: string;
  validity: string;
  auditEvent: string;
  copyVoucherId: string;
  voucherIdCopied: string;
  voucherValidityValue: string;
  copiedReferralToast: string;
  referralIssued: string;
  traceTabs: Record<TraceTabId, string>;
  traceDescriptions: Record<TraceTabId, string>;
  tracePayloadLabels: Record<string, string>;
  pipeline: {
    consentCheck: string;
    retrieveAuthorizedRecords: string;
    aiRiskScoring: string;
    safetyGuardrail: string;
    hospitalAvailability: string;
    recommendationRanking: string;
    resultProof: string;
    mediChain: string;
    mediChainFhir: string;
    medicalAiModel: string;
    clinicalSafetyRules: string;
    hl7Fhir: string;
    aiMatchingEngine: string;
    chaincode: string;
    authorized: string;
    pulled: string;
    completed: string;
    triggered: string;
    notTriggered: string;
    synced: string;
    ranked: string;
    recorded: string;
    consentText: string;
    recordsText: string;
    aiText: string;
    safetyText: string;
    hospitalText: string;
    rankingText: string;
    proofText: string;
    consentPreview: string;
    recordsPreview: string;
    rankingPreview: string;
    proofPreview: string;
  };
  cases: Record<ShortcutCaseId, CaseCopy>;
};

const TRACE_TABS: TraceTabId[] = ["records", "fhir", "ai", "safety", "chaincode", "feedback"];
const CASE_SELECTOR_IDS: ShortcutCaseId[] = ["normal", "chest", "chronic"];

const TRIAGE_RULES: Array<{ id: CaseId; keywords: string[] }> = [
  {
    id: "stroke",
    keywords: [
      "slurred speech",
      "one-sided weakness",
      "facial droop",
      "sudden severe headache",
      "numbness",
      "unable to speak",
      "说话含糊",
      "单侧无力",
      "口角歪斜",
      "突然剧烈头痛",
      "麻木",
      "无法说话",
      "말이 어눌",
      "한쪽 힘",
      "안면 마비",
      "갑작스러운 심한 두통",
      "말을 못",
      "마비"
    ]
  },
  {
    id: "chest",
    keywords: [
      "chest pain",
      "chest tightness",
      "shortness of breath",
      "breathing difficulty",
      "chest pressure",
      "breathless",
      "胸痛",
      "胸闷",
      "气短",
      "呼吸困难",
      "胸口压迫",
      "흉통",
      "흉부 답답",
      "호흡곤란",
      "숨이 참",
      "가슴 압박"
    ]
  },
  {
    id: "oncology",
    keywords: [
      "cancer",
      "tumor",
      "oncology",
      "targeted drug",
      "osimertinib",
      "chemotherapy",
      "radiotherapy",
      "癌症",
      "肿瘤",
      "肿瘤科",
      "靶向药",
      "奥希替尼",
      "化疗",
      "放疗",
      "암",
      "종양",
      "종양내과",
      "표적치료제",
      "표적항암제",
      "오시머티닙",
      "항암치료",
      "방사선치료"
    ]
  },
  {
    id: "allergy",
    keywords: [
      "allergy",
      "allergic",
      "rash",
      "penicillin",
      "drug reaction",
      "swelling",
      "过敏",
      "皮疹",
      "青霉素",
      "药物反应",
      "肿胀",
      "红疹",
      "알레르기",
      "발진",
      "페니실린",
      "약물 반응",
      "부종"
    ]
  },
  {
    id: "pediatric",
    keywords: [
      "child",
      "baby",
      "infant",
      "pediatric",
      "kid",
      "fever child",
      "儿童",
      "宝宝",
      "婴儿",
      "小孩",
      "儿科",
      "孩子发烧",
      "孩子",
      "아이",
      "아기",
      "영아",
      "소아",
      "어린이",
      "아이 발열"
    ]
  },
  {
    id: "chronic",
    keywords: [
      "diabetes follow-up",
      "blood sugar",
      "glucose",
      "insulin refill",
      "metformin refill",
      "medication refill",
      "diabetes refill",
      "糖尿病复诊",
      "血糖",
      "胰岛素续药",
      "二甲双胍续药",
      "慢病续方",
      "续药",
      "당뇨병 추적",
      "혈당",
      "인슐린 리필",
      "메트포르민 리필",
      "만성질환 리필",
      "약물 리필",
      "당뇨병 리필"
    ]
  },
  {
    id: "normal",
    keywords: [
      "fever",
      "cough",
      "sore throat",
      "mild fatigue",
      "runny nose",
      "cold",
      "发热",
      "咳嗽",
      "喉咙痛",
      "轻度乏力",
      "流鼻涕",
      "感冒",
      "발열",
      "기침",
      "인후통",
      "피로",
      "콧물",
      "감기"
    ]
  }
];

const COPY: Record<Locale, PageCopy> = {
  en: {
    pageLabel: "MEDIROUTE",
    title: "MediRoute AI Triage Playground",
    subtitle:
      "Simulate AI-assisted care navigation using authorized MediChain records, HL7 FHIR hospital availability, red-flag safety rules, and on-chain result proof.",
    decisionSupportOnly: "Decision support only - not a medical diagnosis.",
    techStackTitle: "MediRoute Technology Stack",
    techStack: [
      {
        title: "Medical AI Model",
        badge: "Symptom risk scoring",
        description: "Interprets symptoms and authorized history to estimate risk and recommend a care pathway."
      },
      {
        title: "MediChain Authorized Records",
        badge: "Trusted clinical context",
        description: "AI can only use records authorized by the patient through MediChain consent."
      },
      {
        title: "HL7 FHIR API",
        badge: "Hospital resource interface",
        description: "Pulls appointment slots, department availability, queue time, and bed capacity."
      },
      {
        title: "Safety Guardrails",
        badge: "Red-flag escalation",
        description: "Flags high-risk symptoms such as chest pain, stroke signs, or severe breathing difficulty."
      },
      {
        title: "Smart Contract / Chaincode",
        badge: "Result proof & referral voucher",
        description: "Records triage result hash and referral voucher for auditability, not medical correctness."
      },
      {
        title: "Human Review Feedback",
        badge: "Clinician review loop",
        description: "Clinician confirmation or correction is stored as feedback for future model calibration."
      }
    ],
    careFlowTitle: "MediRoute Care Navigation Flow",
    careFlow: [
      { label: "Symptoms", badge: "Input" },
      { label: "Consent Check", badge: "MediChain" },
      { label: "Authorized MediChain Records", badge: "MediChain" },
      { label: "AI Risk Scoring", badge: "Medical AI" },
      { label: "FHIR Hospital Availability", badge: "HL7 FHIR" },
      { label: "Hospital Recommendation", badge: "FHIR + AI" },
      { label: "Referral Voucher", badge: "Chaincode" },
      { label: "On-chain Result Proof", badge: "Fabric" },
      { label: "Clinician Review Feedback", badge: "Human Review" }
    ],
    patientInputTitle: "Patient & Symptom Input",
    caseSelector: "Case selector",
    patient: "Patient",
    patientName: "Ms. Chen",
    age: "Age",
    ageValue: "62",
    location: "Location",
    locationValue: "Chengdu",
    authorizedHistory: "Authorized history",
    consentStatus: "Consent status",
    consentActive: "MediChain record access active",
    describeSymptoms: "Describe symptoms",
    runAiTriage: "Run AI Triage",
    runningTriage: "Running AI Triage...",
    triageCompletedToast: "AI triage completed. Recommendation generated for clinician review.",
    customTriageCompletedToast: "AI triage completed based on custom symptom input.",
    customInput: "Custom input",
    sampleOrCustomTip:
      "Tip: You can select a sample case or type your own symptoms. The demo engine will adjust the recommendation based on the text.",
    waitingToRun: "Waiting to run",
    triageOutputPlaceholder: "Triage output will appear after running the model.",
    technologyTraceRequiresRunToast: "Run AI triage first to generate the technology trace.",
    livePipelineTitle: "Live Triage Pipeline",
    recommendationOutputTitle: "Recommendation Output",
    riskLevel: "Risk Level",
    recommendedDepartment: "Recommended Department",
    recommendedHospital: "Recommended Hospital",
    recommendedAction: "Recommended Action",
    hospitalAvailabilityText: "Hospital Availability",
    confidence: "Confidence",
    humanReviewRequired: "Human Review",
    resultProof: "Result Proof",
    reasoningFactors: "Reasoning Factors",
    issueReferralVoucher: "Issue Referral Voucher",
    inspectTechnologyTrace: "Inspect Technology Trace",
    whyThisRecommendation: "Why this recommendation?",
    symptomSeverity: "Symptom severity",
    duration: "Duration",
    ageRisk: "Age risk",
    redFlags: "Red flags",
    hospitalCapacity: "Hospital capacity",
    referralLogic: "Referral logic",
    medicalSafetyGuardrails: "Medical Safety Guardrails",
    safetyItems: [
      "Not a final diagnosis",
      "Human review required before clinical action",
      "Emergency escalation for red flags",
      "Patient consent required for record access",
      "Smart contract records proof, not medical correctness",
      "High-risk symptoms are routed to urgent care"
    ],
    hospitalMatchingViaFhir: "Hospital Matching via HL7 FHIR",
    hospitalMatchingSubtitle:
      "FHIR provides appointment slots, department availability, queue estimates, and bed capacity. MediRoute ranks options but does not guarantee final admission.",
    department: "Department",
    availability: "Availability",
    queue: "Queue",
    bedCapacity: "Bed capacity",
    distance: "Distance",
    fhirStatus: "FHIR status",
    reason: "Reason",
    technologyTrace: "MediRoute Technology Trace",
    close: "Close",
    triageResultHashed: "TRIAGE_RESULT_HASHED",
    referralVoucherReady: "REFERRAL_VOUCHER_READY",
    onchainProofDisclaimer:
      "The on-chain proof records when the triage recommendation was generated. It does not prove medical correctness.",
    referralVoucherGenerated: "Referral Voucher Generated",
    voucherId: "Voucher ID",
    priority: "Priority",
    validity: "Validity",
    auditEvent: "Audit Event",
    copyVoucherId: "Copy Voucher ID",
    voucherIdCopied: "Voucher ID copied.",
    voucherValidityValue: "24 hours",
    copiedReferralToast: "Referral voucher prepared in this demo.",
    referralIssued: "Referral voucher issued in demo mode.",
    traceTabs: {
      records: "Authorized Records",
      fhir: "FHIR Availability",
      ai: "AI Inference",
      safety: "Safety Guardrail",
      chaincode: "Chaincode Proof",
      feedback: "Human Feedback"
    },
    traceDescriptions: {
      records: "These records come from the MediChain consent scope. AI can only read records approved by the patient for triage review.",
      fhir: "FHIR interfaces are used to query appointment slots, departments, bed capacity, and queue status.",
      ai: "The AI output is a triage recommendation, not a medical diagnosis. Final judgment requires a clinician or triage nurse.",
      safety: "Safety guardrails detect high-risk symptoms such as chest pain, stroke signs, or severe breathing difficulty and trigger urgent routing.",
      chaincode:
        "The on-chain record proves the triage result was generated at a point in time and was not altered. It does not prove medical correctness.",
      feedback:
        "Clinician review outcomes are de-identified before being used for future model calibration; AI does not directly learn real identity data."
    },
    tracePayloadLabels: {
      source: "Source",
      patientDID: "Patient DID",
      consentStatus: "Consent status",
      authorizedRecords: "Authorized records",
      scope: "Scope",
      expiresIn: "Expires in",
      api: "API",
      endpoint: "Endpoint",
      hospital: "Hospital",
      departmentAvailability: "Department availability",
      queueEstimate: "Queue estimate",
      bedCapacity: "Bed capacity",
      model: "Model",
      inputSource: "Input source",
      riskLevel: "Risk level",
      confidence: "Confidence",
      recommendedDepartment: "Recommended department",
      recommendedHospitalLevel: "Recommended hospital level",
      humanReviewRequired: "Human review required",
      notDiagnosis: "Not a diagnosis",
      redFlagDetected: "Red flag detected",
      signals: "Signals",
      action: "Action",
      message: "Message",
      channel: "Channel",
      event: "Event",
      resultHash: "Result hash",
      referralVoucher: "Referral voucher",
      timestamp: "Timestamp",
      note: "Note",
      clinicianReview: "Clinician review",
      reviewerRole: "Reviewer role",
      possibleActions: "Possible actions",
      feedbackUse: "Feedback use"
    },
    pipeline: {
      consentCheck: "Consent Check",
      retrieveAuthorizedRecords: "Retrieve Authorized Records",
      aiRiskScoring: "AI Risk Scoring",
      safetyGuardrail: "Safety Guardrail",
      hospitalAvailability: "Hospital Availability",
      recommendationRanking: "Recommendation Ranking",
      resultProof: "Result Proof",
      mediChain: "MediChain",
      mediChainFhir: "MediChain + HL7 FHIR",
      medicalAiModel: "Medical AI Model",
      clinicalSafetyRules: "Clinical Safety Rules",
      hl7Fhir: "HL7 FHIR",
      aiMatchingEngine: "AI Matching Engine",
      chaincode: "Smart Contract / Chaincode",
      authorized: "Authorized",
      pulled: "Pulled",
      completed: "Completed",
      triggered: "Triggered",
      notTriggered: "Not triggered",
      synced: "Synced",
      ranked: "Ranked",
      recorded: "Recorded",
      consentText: "Confirm patient consent before reading medical history.",
      recordsText: "Fetch authorized records through FHIR-compatible APIs.",
      aiText: "Estimate symptom risk using symptoms and authorized history.",
      safetyText: "Red-flag symptoms trigger urgent escalation.",
      hospitalText: "Query department availability, queue time, appointment slots, and bed capacity.",
      rankingText: "Rank hospitals by clinical fit, urgency, capacity, distance, and referral pathway.",
      proofText: "Store triage result hash and referral voucher for auditability.",
      consentPreview: "scope = Blood Test, Allergy Record, Visit Summary",
      recordsPreview: "GET /fhir/R4/DocumentReference?patient=did:medlink:CN-2038-8841",
      rankingPreview: "clinicalFit + urgency + capacity + distance",
      proofPreview: "TRIAGE_RESULT_HASHED -> REFERRAL_VOUCHER_ISSUED"
    },
    cases: {
      normal: {
        label: "Normal triage case",
        symptoms: "Fever and cough for 3 days, mild fatigue",
        risk: "Medium",
        riskTone: "amber",
        recommendation: "Community respiratory clinic",
        guardrail: "Not triggered",
        guardrailTriggered: false,
        hospital: "Chengdu Xinhua Community Clinic",
        department: "Respiratory / General outpatient",
        action: "Routine appointment",
        availability: "Respiratory slots available, queue estimated 20 min, no inpatient bed needed",
        confidence: "72%",
        humanReview: "Routine clinician review",
        resultProof: "Recorded as triage hash, not as medical diagnosis",
        duration: "3 days",
        ageRisk: "Age above 60",
        history: "Diabetes, hypertension",
        redFlags: "No red-flag signal detected",
        hospitalCapacity: "Chengdu Xinhua Community Clinic respiratory clinic available",
        referralLogic: "Community respiratory care recommended with escalation if symptoms persist",
        reasoningFactors: [
          "Fever and cough for 3 days",
          "Mild fatigue",
          "No severe breathing difficulty",
          "Authorized chronic history checked",
          "Safety guardrail not triggered"
        ],
        hospitalMatches: [
          {
            name: "Chengdu Xinhua Community Clinic",
            badge: "Recommended",
            department: "Respiratory / General outpatient",
            availability: "High",
            queue: "Low, estimated 20 min",
            bedCapacity: "Not applicable",
            distance: "1.3 km",
            fhirStatus: "Live"
          },
          {
            name: "Chengdu Jinjiang Community Clinic",
            badge: "Alternative",
            department: "General outpatient",
            availability: "High",
            queue: "Low, estimated 25 min",
            bedCapacity: "Not applicable",
            distance: "1.1 km",
            fhirStatus: "Live"
          },
          {
            name: "West China Hospital, Sichuan University",
            badge: "Not recommended for this case",
            department: "Emergency / Respiratory",
            availability: "Medium",
            queue: "Moderate",
            bedCapacity: "Available",
            distance: "4.2 km",
            fhirStatus: "Live",
            reason: "No high-risk signal; community care reduces tertiary hospital burden"
          }
        ]
      },
      chest: {
        label: "High-risk chest pain case",
        symptoms: "Chest tightness for 3 days, shortness of breath",
        risk: "High",
        riskTone: "red",
        recommendation: "Cardiology at tertiary hospital",
        guardrail: "Triggered",
        guardrailTriggered: true,
        hospital: "West China Hospital, Sichuan University",
        department: "Cardiology",
        action: "Priority referral to tertiary hospital",
        availability: "Cardiology slots available, queue estimated 15 min, bed capacity available",
        confidence: "87%",
        humanReview: "Required",
        resultProof: "Recorded as triage hash, not as medical diagnosis",
        duration: "3 days",
        ageRisk: "Age above 60",
        history: "Diabetes, hypertension",
        redFlags: "Chest tightness + shortness of breath",
        hospitalCapacity: "West China Hospital cardiology available",
        referralLogic: "Tertiary hospital recommended due to high-risk signals",
        reasoningFactors: [
          "Chest tightness for 3 days",
          "Shortness of breath",
          "Age above 60",
          "Diabetes and hypertension history",
          "Safety guardrail triggered"
        ],
        hospitalMatches: [
          {
            name: "West China Hospital, Sichuan University",
            badge: "Recommended",
            department: "Cardiology",
            availability: "High",
            queue: "Low, estimated 15 min",
            bedCapacity: "Available",
            distance: "4.2 km",
            fhirStatus: "Live"
          },
          {
            name: "Chengdu Second People's Hospital",
            badge: "Alternative",
            department: "Cardiology / Internal Medicine",
            availability: "Medium",
            queue: "Moderate, estimated 45 min",
            bedCapacity: "Limited",
            distance: "2.8 km",
            fhirStatus: "Live"
          },
          {
            name: "Chengdu Jinjiang Community Clinic",
            badge: "Not recommended for this case",
            department: "General outpatient",
            availability: "High",
            queue: "Low",
            bedCapacity: "Not applicable",
            distance: "1.1 km",
            fhirStatus: "Live",
            reason: "High-risk symptoms require tertiary care"
          }
        ]
      },
      chronic: {
        label: "Chronic follow-up case",
        symptoms: "Diabetes follow-up and medication refill request",
        risk: "Low",
        riskTone: "emerald",
        recommendation: "Endocrinology follow-up at secondary hospital or community clinic",
        guardrail: "Not triggered",
        guardrailTriggered: false,
        hospital: "Chengdu Second People's Hospital",
        department: "Endocrinology follow-up",
        action: "Follow-up visit",
        availability: "Endocrinology follow-up slots available, queue estimated 35 min, no inpatient bed needed",
        confidence: "80%",
        humanReview: "Routine clinician review",
        resultProof: "Recorded as triage hash, not as medical diagnosis",
        duration: "Follow-up request",
        ageRisk: "Age above 60",
        history: "Diabetes, hypertension",
        redFlags: "No urgent red-flag signal detected",
        hospitalCapacity: "Chengdu Second People's Hospital endocrine follow-up available",
        referralLogic: "Follow-up care recommended for medication continuity and glucose control review",
        reasoningFactors: [
          "Diabetes follow-up and medication refill request",
          "Existing diabetes history",
          "Medication continuity need",
          "No emergency symptom",
          "Safety guardrail not triggered"
        ],
        hospitalMatches: [
          {
            name: "Chengdu Second People's Hospital",
            badge: "Recommended",
            department: "Endocrinology / Internal Medicine",
            availability: "High",
            queue: "Moderate, estimated 35 min",
            bedCapacity: "Not needed",
            distance: "2.8 km",
            fhirStatus: "Live"
          },
          {
            name: "Chengdu Jinjiang Community Clinic",
            badge: "Alternative",
            department: "Chronic disease follow-up",
            availability: "Medium",
            queue: "Low, estimated 25 min",
            bedCapacity: "Not applicable",
            distance: "1.1 km",
            fhirStatus: "Live"
          },
          {
            name: "West China Hospital, Sichuan University",
            badge: "Not first-line",
            department: "Endocrinology",
            availability: "Medium",
            queue: "Moderate",
            bedCapacity: "Available",
            distance: "4.2 km",
            fhirStatus: "Live",
            reason: "Stable follow-up can use secondary or community resources first"
          }
        ]
      }
    }
  },
  zh: {
    pageLabel: "MEDIROUTE",
    title: "MediRoute AI 分诊与转诊演示",
    subtitle: "模拟基于已授权 MediChain 病历、HL7 FHIR 医院资源接口、高风险安全规则和链上结果证明的 AI 就诊路径推荐。",
    decisionSupportOnly: "仅作为分诊辅助，不构成医疗诊断。",
    techStackTitle: "MediRoute 技术栈",
    techStack: [
      { title: "医疗 AI 模型", badge: "症状风险评分", description: "解析症状和已授权病史，估算风险等级，并推荐就诊路径。" },
      { title: "MediChain 已授权病历", badge: "可信临床上下文", description: "AI 只能读取患者通过 MediChain 授权的病历记录。" },
      { title: "HL7 FHIR 接口", badge: "医院资源接口", description: "调取医院号源、科室可用性、排队时间和床位容量。" },
      { title: "医疗安全护栏", badge: "高风险升级", description: "识别胸痛、中风先兆、严重呼吸困难等高风险症状。" },
      { title: "智能合约 / 链码", badge: "结果证明与转诊凭证", description: "记录分诊结果哈希和转诊凭证，便于审计，但不验证医学正确性。" },
      { title: "医生复核反馈", badge: "临床复核闭环", description: "医生确认或修改后的结果用于后续模型校准。" }
    ],
    careFlowTitle: "MediRoute 就诊路径流程",
    careFlow: [
      { label: "症状输入", badge: "Input" },
      { label: "授权校验", badge: "MediChain" },
      { label: "已授权 MediChain 病历", badge: "MediChain" },
      { label: "AI 风险评分", badge: "Medical AI" },
      { label: "FHIR 医院资源查询", badge: "HL7 FHIR" },
      { label: "医院推荐", badge: "FHIR + AI" },
      { label: "转诊凭证", badge: "Chaincode" },
      { label: "链上结果证明", badge: "Fabric" },
      { label: "医生复核反馈", badge: "Human Review" }
    ],
    patientInputTitle: "患者与症状输入",
    caseSelector: "案例选择",
    patient: "患者",
    patientName: "陈女士",
    age: "年龄",
    ageValue: "62",
    location: "位置",
    locationValue: "成都",
    authorizedHistory: "已授权病史",
    consentStatus: "授权状态",
    consentActive: "MediChain 病历访问已授权",
    describeSymptoms: "描述症状",
    runAiTriage: "运行 AI 分诊",
    runningTriage: "正在运行 AI 分诊...",
    triageCompletedToast: "AI 分诊已完成，已生成供医生复核的推荐结果。",
    customTriageCompletedToast: "AI 分诊已根据自定义症状输入完成。",
    customInput: "自定义输入",
    sampleOrCustomTip: "提示：你可以选择示例案例，也可以自行输入症状。演示引擎会根据文本内容调整推荐结果。",
    waitingToRun: "等待运行",
    triageOutputPlaceholder: "运行 AI 分诊后，将显示推荐结果。",
    technologyTraceRequiresRunToast: "请先运行 AI 分诊，再查看技术追踪。",
    livePipelineTitle: "实时分诊流水线",
    recommendationOutputTitle: "推荐结果",
    riskLevel: "风险等级",
    recommendedDepartment: "推荐科室",
    recommendedHospital: "推荐医院",
    recommendedAction: "建议动作",
    hospitalAvailabilityText: "医院资源",
    confidence: "置信度",
    humanReviewRequired: "医生复核",
    resultProof: "结果证明",
    reasoningFactors: "推荐依据",
    issueReferralVoucher: "生成转诊凭证",
    inspectTechnologyTrace: "查看技术追踪",
    whyThisRecommendation: "为什么这样推荐？",
    symptomSeverity: "症状严重程度",
    duration: "持续时间",
    ageRisk: "年龄风险",
    redFlags: "高风险信号",
    hospitalCapacity: "医院资源",
    referralLogic: "转诊逻辑",
    medicalSafetyGuardrails: "医疗安全护栏",
    safetyItems: [
      "不构成最终诊断",
      "临床行动前需要医生复核",
      "高风险症状触发紧急升级",
      "读取病历必须获得患者授权",
      "智能合约记录证明，不验证医学正确性",
      "高风险症状会引导至紧急就医路径"
    ],
    hospitalMatchingViaFhir: "基于 HL7 FHIR 的医院匹配",
    hospitalMatchingSubtitle: "FHIR 提供号源、科室可用性、排队时间和床位容量。MediRoute 负责推荐排序，但不保证最终接诊结果。",
    department: "科室",
    availability: "可用性",
    queue: "排队",
    bedCapacity: "床位",
    distance: "距离",
    fhirStatus: "FHIR状态",
    reason: "原因",
    technologyTrace: "MediRoute 技术追踪",
    close: "关闭",
    triageResultHashed: "TRIAGE_RESULT_HASHED 分诊结果哈希已记录",
    referralVoucherReady: "REFERRAL_VOUCHER_READY 转诊凭证可生成",
    onchainProofDisclaimer: "链上证明记录分诊建议生成的时间和完整性，不证明医学判断一定正确。",
    referralVoucherGenerated: "转诊凭证已生成",
    voucherId: "凭证编号",
    priority: "优先级",
    validity: "有效期",
    auditEvent: "审计事件",
    copyVoucherId: "复制凭证编号",
    voucherIdCopied: "凭证编号已复制。",
    voucherValidityValue: "24小时",
    copiedReferralToast: "演示转诊凭证已准备。",
    referralIssued: "演示模式下已生成转诊凭证。",
    traceTabs: {
      records: "已授权病历",
      fhir: "FHIR 医院资源",
      ai: "AI 推理结果",
      safety: "安全护栏",
      chaincode: "链码证明",
      feedback: "医生反馈"
    },
    traceDescriptions: {
      records: "这些病历来自 MediChain 授权范围，AI 只能读取患者同意用于分诊的记录。",
      fhir: "FHIR 接口用于查询医院号源、科室、床位和排队状态。",
      ai: "AI 输出的是分诊建议，不是医学诊断。最终判断需要医生或分诊护士复核。",
      safety: "安全护栏负责识别胸痛、中风先兆、严重呼吸困难等高风险症状，并触发紧急引导。",
      chaincode: "链上记录证明该分诊结果在某一时间生成且未被篡改；它不证明医学判断一定正确。",
      feedback: "医生复核结果会在去识别化后用于模型校准，而不是直接让 AI 自主学习真实身份数据。"
    },
    tracePayloadLabels: {
      source: "来源",
      patientDID: "患者DID",
      consentStatus: "授权状态",
      authorizedRecords: "已授权记录",
      scope: "范围",
      expiresIn: "有效期",
      api: "接口",
      endpoint: "端点",
      hospital: "医院",
      departmentAvailability: "科室可用性",
      queueEstimate: "预计排队",
      bedCapacity: "床位容量",
      model: "模型",
      inputSource: "输入来源",
      riskLevel: "风险等级",
      confidence: "置信度",
      recommendedDepartment: "推荐科室",
      recommendedHospitalLevel: "推荐医院级别",
      humanReviewRequired: "需要人工复核",
      notDiagnosis: "非诊断",
      redFlagDetected: "检测到高风险信号",
      signals: "信号",
      action: "动作",
      message: "提示",
      channel: "通道",
      event: "事件",
      resultHash: "结果哈希",
      referralVoucher: "转诊凭证",
      timestamp: "时间戳",
      note: "说明",
      clinicianReview: "医生复核",
      reviewerRole: "复核角色",
      possibleActions: "可选动作",
      feedbackUse: "反馈用途"
    },
    pipeline: {
      consentCheck: "授权校验",
      retrieveAuthorizedRecords: "调取已授权病历",
      aiRiskScoring: "AI 风险评分",
      safetyGuardrail: "安全护栏",
      hospitalAvailability: "医院资源查询",
      recommendationRanking: "推荐排序",
      resultProof: "结果证明",
      mediChain: "MediChain",
      mediChainFhir: "MediChain + HL7 FHIR",
      medicalAiModel: "医疗 AI 模型",
      clinicalSafetyRules: "临床安全规则",
      hl7Fhir: "HL7 FHIR",
      aiMatchingEngine: "AI 匹配引擎",
      chaincode: "智能合约 / 链码",
      authorized: "已授权",
      pulled: "已调取",
      completed: "已完成",
      triggered: "已触发",
      notTriggered: "未触发",
      synced: "已同步",
      ranked: "已排序",
      recorded: "已记录",
      consentText: "读取病史前先确认患者授权。",
      recordsText: "通过兼容 FHIR 的接口读取已授权病历。",
      aiText: "结合症状和已授权病史，估算风险等级。",
      safetyText: "高风险症状触发紧急升级提示。",
      hospitalText: "查询科室可用性、排队时间、号源和床位容量。",
      rankingText: "根据临床匹配度、紧急程度、容量、距离和转诊路径对医院排序。",
      proofText: "将分诊结果哈希和转诊凭证写入审计记录。",
      consentPreview: "scope = 血液检查、过敏记录、就诊摘要",
      recordsPreview: "GET /fhir/R4/DocumentReference?patient=did:medlink:CN-2038-8841",
      rankingPreview: "临床匹配 + 紧急程度 + 容量 + 距离",
      proofPreview: "TRIAGE_RESULT_HASHED -> REFERRAL_VOUCHER_ISSUED"
    },
    cases: {
      normal: {
        label: "普通分诊案例",
        symptoms: "发热咳嗽3天，轻度乏力",
        risk: "中",
        riskTone: "amber",
        recommendation: "社区呼吸门诊",
        guardrail: "未触发",
        guardrailTriggered: false,
        hospital: "成都新华社区诊所",
        department: "呼吸相关门诊 / 全科门诊",
        action: "普通预约",
        availability: "呼吸相关门诊有号源，预计排队20分钟，暂不需要住院床位",
        confidence: "72%",
        humanReview: "常规医生复核",
        resultProof: "记录为分诊结果哈希，不代表医学诊断",
        duration: "3天",
        ageRisk: "60岁以上",
        history: "糖尿病、高血压",
        redFlags: "未发现高风险信号",
        hospitalCapacity: "成都新华社区诊所呼吸相关门诊可接诊",
        referralLogic: "建议先到社区呼吸门诊；如症状持续或加重再升级就医",
        reasoningFactors: ["发热咳嗽3天", "轻度乏力", "无严重呼吸困难", "已核对授权慢病史", "安全护栏未触发"],
        hospitalMatches: [
          { name: "成都新华社区诊所", badge: "推荐", department: "呼吸相关门诊 / 全科门诊", availability: "高", queue: "低，预计20分钟", bedCapacity: "不适用", distance: "1.3公里", fhirStatus: "实时同步" },
          { name: "成都锦江社区诊所", badge: "备选", department: "全科门诊", availability: "高", queue: "低，预计25分钟", bedCapacity: "不适用", distance: "1.1公里", fhirStatus: "实时同步" },
          { name: "四川大学华西医院", badge: "本案例不推荐", department: "急诊 / 呼吸科", availability: "中", queue: "中等", bedCapacity: "可用", distance: "4.2公里", fhirStatus: "实时同步", reason: "未出现高风险信号，优先使用社区资源，减少三甲医院挤兑" }
        ]
      },
      chest: {
        label: "高风险胸痛案例",
        symptoms: "胸闷3天，伴有气短",
        risk: "高",
        riskTone: "red",
        recommendation: "三甲医院心内科",
        guardrail: "已触发",
        guardrailTriggered: true,
        hospital: "四川大学华西医院",
        department: "心内科",
        action: "优先转诊至三甲医院",
        availability: "心内科有号源，预计排队15分钟，床位可用",
        confidence: "87%",
        humanReview: "必须复核",
        resultProof: "记录为分诊结果哈希，不代表医学诊断",
        duration: "3天",
        ageRisk: "60岁以上",
        history: "糖尿病、高血压",
        redFlags: "胸闷 + 气短",
        hospitalCapacity: "华西医院心内科可接诊",
        referralLogic: "因高风险信号，建议转三甲医院",
        reasoningFactors: ["胸闷持续3天", "伴有气短", "年龄超过60岁", "有糖尿病和高血压病史", "安全护栏已触发"],
        hospitalMatches: [
          { name: "四川大学华西医院", badge: "推荐", department: "心内科", availability: "高", queue: "低，预计15分钟", bedCapacity: "可用", distance: "4.2公里", fhirStatus: "实时同步" },
          { name: "成都市第二人民医院", badge: "备选", department: "心内科 / 内科", availability: "中", queue: "中等，预计45分钟", bedCapacity: "有限", distance: "2.8公里", fhirStatus: "实时同步" },
          { name: "成都锦江社区诊所", badge: "本案例不推荐", department: "全科门诊", availability: "高", queue: "低", bedCapacity: "不适用", distance: "1.1公里", fhirStatus: "实时同步", reason: "高风险症状建议转三甲医院" }
        ]
      },
      chronic: {
        label: "慢病复诊案例",
        symptoms: "糖尿病复诊与续药需求",
        risk: "低",
        riskTone: "emerald",
        recommendation: "二级医院或社区内分泌复诊",
        guardrail: "未触发",
        guardrailTriggered: false,
        hospital: "成都市第二人民医院",
        department: "内分泌复诊",
        action: "复诊随访",
        availability: "内分泌复诊有号源，预计排队35分钟，暂不需要住院床位",
        confidence: "80%",
        humanReview: "常规医生复核",
        resultProof: "记录为分诊结果哈希，不代表医学诊断",
        duration: "复诊需求",
        ageRisk: "60岁以上",
        history: "糖尿病、高血压",
        redFlags: "未发现急症高风险信号",
        hospitalCapacity: "成都市第二人民医院内分泌复诊可接诊",
        referralLogic: "建议复诊随访，保障用药连续性和血糖控制评估",
        reasoningFactors: ["糖尿病复诊与续药需求", "已有糖尿病病史", "存在连续用药需求", "无急症症状", "安全护栏未触发"],
        hospitalMatches: [
          { name: "成都市第二人民医院", badge: "推荐", department: "内分泌科 / 内科", availability: "高", queue: "中等，预计35分钟", bedCapacity: "暂不需要", distance: "2.8公里", fhirStatus: "实时同步" },
          { name: "成都锦江社区诊所", badge: "备选", department: "慢病随访", availability: "中", queue: "低，预计25分钟", bedCapacity: "不适用", distance: "1.1公里", fhirStatus: "实时同步" },
          { name: "四川大学华西医院", badge: "非首选", department: "内分泌科", availability: "中", queue: "中等", bedCapacity: "可用", distance: "4.2公里", fhirStatus: "实时同步", reason: "稳定复诊可以优先使用二级医院或社区资源" }
        ]
      }
    }
  },
  ko: {
    pageLabel: "MEDIROUTE",
    title: "MediRoute AI 분류 및 전원 데모",
    subtitle:
      "승인된 MediChain 의료기록, HL7 FHIR 병원 가용성, 고위험 안전 규칙, 온체인 결과 증명을 활용한 AI 진료 경로 추천을 시뮬레이션합니다.",
    decisionSupportOnly: "의사결정 보조용이며 의료 진단이 아닙니다.",
    techStackTitle: "MediRoute 기술 스택",
    techStack: [
      { title: "의료 AI 모델", badge: "증상 위험 점수화", description: "증상과 승인된 병력을 해석하여 위험 수준을 추정하고 진료 경로를 추천합니다." },
      { title: "MediChain 승인된 의료기록", badge: "신뢰 가능한 임상 맥락", description: "AI는 환자가 MediChain 동의를 통해 승인한 기록만 사용할 수 있습니다." },
      { title: "HL7 FHIR 인터페이스", badge: "병원 자원 인터페이스", description: "예약 가능 시간, 진료과 가용성, 대기 시간, 병상 용량을 조회합니다." },
      { title: "의료 안전 가드레일", badge: "고위험 에스컬레이션", description: "흉통, 뇌졸중 의심 증상, 심한 호흡곤란 등 고위험 증상을 감지합니다." },
      { title: "스마트 계약 / 체인코드", badge: "결과 증명 및 전원 바우처", description: "분류 결과 해시와 전원 바우처를 감사 가능하도록 기록하지만, 의학적 정확성을 검증하지는 않습니다." },
      { title: "의료진 검토 피드백", badge: "임상 검토 루프", description: "의료진의 확인 또는 수정 결과를 향후 모델 보정에 활용합니다." }
    ],
    careFlowTitle: "MediRoute 진료 경로 흐름",
    careFlow: [
      { label: "증상 입력", badge: "Input" },
      { label: "동의 확인", badge: "MediChain" },
      { label: "승인된 MediChain 의료기록", badge: "MediChain" },
      { label: "AI 위험 점수화", badge: "Medical AI" },
      { label: "FHIR 병원 가용성 조회", badge: "HL7 FHIR" },
      { label: "병원 추천", badge: "FHIR + AI" },
      { label: "전원 바우처", badge: "Chaincode" },
      { label: "온체인 결과 증명", badge: "Fabric" },
      { label: "의료진 검토 피드백", badge: "Human Review" }
    ],
    patientInputTitle: "환자 및 증상 입력",
    caseSelector: "사례 선택",
    patient: "환자",
    patientName: "Ms. Chen",
    age: "나이",
    ageValue: "62",
    location: "위치",
    locationValue: "Chengdu",
    authorizedHistory: "승인된 병력",
    consentStatus: "동의 상태",
    consentActive: "MediChain 의료기록 접근 승인됨",
    describeSymptoms: "증상 설명",
    runAiTriage: "AI 분류 실행",
    runningTriage: "AI 분류 실행 중...",
    triageCompletedToast: "AI 분류가 완료되었습니다. 의료진 검토용 추천 결과가 생성되었습니다.",
    customTriageCompletedToast: "사용자 증상 입력을 기반으로 AI 분류가 완료되었습니다.",
    customInput: "사용자 입력",
    sampleOrCustomTip: "팁: 예시 사례를 선택하거나 직접 증상을 입력할 수 있습니다. 데모 엔진은 입력된 텍스트에 따라 추천 결과를 조정합니다.",
    waitingToRun: "실행 대기 중",
    triageOutputPlaceholder: "AI 분류 실행 후 추천 결과가 표시됩니다.",
    technologyTraceRequiresRunToast: "기술 추적을 보려면 먼저 AI 분류를 실행하세요.",
    livePipelineTitle: "실시간 분류 파이프라인",
    recommendationOutputTitle: "추천 결과",
    riskLevel: "위험 수준",
    recommendedDepartment: "추천 진료과",
    recommendedHospital: "추천 병원",
    recommendedAction: "권장 조치",
    hospitalAvailabilityText: "병원 가용성",
    confidence: "신뢰도",
    humanReviewRequired: "의료진 검토",
    resultProof: "결과 증명",
    reasoningFactors: "추천 근거",
    issueReferralVoucher: "전원 바우처 발급",
    inspectTechnologyTrace: "기술 추적 보기",
    whyThisRecommendation: "왜 이렇게 추천하나요?",
    symptomSeverity: "증상 심각도",
    duration: "지속 시간",
    ageRisk: "연령 위험",
    redFlags: "고위험 신호",
    hospitalCapacity: "병원 자원",
    referralLogic: "전원 로직",
    medicalSafetyGuardrails: "의료 안전 가드레일",
    safetyItems: [
      "최종 진단이 아닙니다",
      "임상 조치 전 의료진 검토가 필요합니다",
      "고위험 증상은 긴급 에스컬레이션됩니다",
      "의료기록 접근에는 환자 동의가 필요합니다",
      "스마트 계약은 증명을 기록하지만 의학적 정확성을 검증하지 않습니다",
      "고위험 증상은 긴급 진료 경로로 안내됩니다"
    ],
    hospitalMatchingViaFhir: "HL7 FHIR 기반 병원 매칭",
    hospitalMatchingSubtitle:
      "FHIR은 예약 가능 시간, 진료과 가용성, 대기 시간, 병상 용량을 제공합니다. MediRoute는 추천 순위를 제시하지만 최종 접수 또는 입원을 보장하지 않습니다.",
    department: "진료과",
    availability: "가용성",
    queue: "대기",
    bedCapacity: "병상",
    distance: "거리",
    fhirStatus: "FHIR 상태",
    reason: "이유",
    technologyTrace: "MediRoute 기술 추적",
    close: "닫기",
    triageResultHashed: "TRIAGE_RESULT_HASHED 분류 결과 해시 기록됨",
    referralVoucherReady: "REFERRAL_VOUCHER_READY 전원 바우처 발급 가능",
    onchainProofDisclaimer: "온체인 증명은 분류 추천이 생성된 시점과 무결성을 기록합니다. 의학적 정확성을 증명하지는 않습니다.",
    referralVoucherGenerated: "전원 바우처가 생성되었습니다",
    voucherId: "바우처 ID",
    priority: "우선순위",
    validity: "유효기간",
    auditEvent: "감사 이벤트",
    copyVoucherId: "바우처 ID 복사",
    voucherIdCopied: "바우처 ID가 복사되었습니다.",
    voucherValidityValue: "24시간",
    copiedReferralToast: "데모 전원 바우처가 준비되었습니다.",
    referralIssued: "데모 모드에서 전원 바우처가 발급되었습니다.",
    traceTabs: {
      records: "승인된 의료기록",
      fhir: "FHIR 병원 가용성",
      ai: "AI 추론 결과",
      safety: "안전 가드레일",
      chaincode: "체인코드 증명",
      feedback: "의료진 피드백"
    },
    traceDescriptions: {
      records: "이 기록은 MediChain 동의 범위 내에서 제공되며, AI는 환자가 분류 목적으로 승인한 기록만 읽을 수 있습니다.",
      fhir: "FHIR 인터페이스는 예약 가능 시간, 진료과, 병상, 대기 상태를 조회하는 데 사용됩니다.",
      ai: "AI 결과는 분류 추천이며 의료 진단이 아닙니다. 최종 판단은 의사 또는 분류 간호사가 검토해야 합니다.",
      safety: "안전 가드레일은 흉통, 뇌졸중 의심 증상, 심한 호흡곤란 등 고위험 증상을 감지하고 긴급 진료 안내를 트리거합니다.",
      chaincode: "온체인 기록은 해당 분류 결과가 특정 시점에 생성되었고 변경되지 않았음을 증명합니다. 의학적 정확성을 증명하는 것은 아닙니다.",
      feedback: "의료진 검토 결과는 비식별화 후 모델 보정 데이터로 사용되며, AI가 실제 신원 데이터를 직접 학습하지 않습니다."
    },
    tracePayloadLabels: {
      source: "출처",
      patientDID: "환자 DID",
      consentStatus: "동의 상태",
      authorizedRecords: "승인된 기록",
      scope: "범위",
      expiresIn: "만료",
      api: "API",
      endpoint: "엔드포인트",
      hospital: "병원",
      departmentAvailability: "진료과 가용성",
      queueEstimate: "예상 대기",
      bedCapacity: "병상 용량",
      model: "모델",
      inputSource: "입력 출처",
      riskLevel: "위험 수준",
      confidence: "신뢰도",
      recommendedDepartment: "추천 진료과",
      recommendedHospitalLevel: "추천 병원 수준",
      humanReviewRequired: "의료진 검토 필요",
      notDiagnosis: "진단 아님",
      redFlagDetected: "고위험 신호 감지",
      signals: "신호",
      action: "조치",
      message: "메시지",
      channel: "채널",
      event: "이벤트",
      resultHash: "결과 해시",
      referralVoucher: "전원 바우처",
      timestamp: "타임스탬프",
      note: "설명",
      clinicianReview: "의료진 검토",
      reviewerRole: "검토 역할",
      possibleActions: "가능한 조치",
      feedbackUse: "피드백 용도"
    },
    pipeline: {
      consentCheck: "동의 확인",
      retrieveAuthorizedRecords: "승인된 기록 조회",
      aiRiskScoring: "AI 위험 점수화",
      safetyGuardrail: "안전 가드레일",
      hospitalAvailability: "병원 자원 조회",
      recommendationRanking: "추천 순위화",
      resultProof: "결과 증명",
      mediChain: "MediChain",
      mediChainFhir: "MediChain + HL7 FHIR",
      medicalAiModel: "의료 AI 모델",
      clinicalSafetyRules: "임상 안전 규칙",
      hl7Fhir: "HL7 FHIR",
      aiMatchingEngine: "AI 매칭 엔진",
      chaincode: "스마트 계약 / 체인코드",
      authorized: "승인됨",
      pulled: "조회됨",
      completed: "완료됨",
      triggered: "트리거됨",
      notTriggered: "트리거되지 않음",
      synced: "동기화됨",
      ranked: "순위화됨",
      recorded: "기록됨",
      consentText: "병력 조회 전에 환자 동의를 확인합니다.",
      recordsText: "FHIR 호환 API를 통해 승인된 의료기록을 불러옵니다.",
      aiText: "증상과 승인된 병력을 바탕으로 위험 수준을 추정합니다.",
      safetyText: "고위험 증상이 감지되면 긴급 진료로 안내합니다.",
      hospitalText: "진료과 가용성, 대기 시간, 예약 가능 시간, 병상 용량을 조회합니다.",
      rankingText: "임상 적합도, 긴급도, 수용력, 거리, 전원 경로를 기준으로 병원을 순위화합니다.",
      proofText: "분류 결과 해시와 전원 바우처를 감사 기록에 저장합니다.",
      consentPreview: "scope = 혈액 검사, 알레르기 기록, 진료 요약",
      recordsPreview: "GET /fhir/R4/DocumentReference?patient=did:medlink:CN-2038-8841",
      rankingPreview: "임상 적합도 + 긴급도 + 수용력 + 거리",
      proofPreview: "TRIAGE_RESULT_HASHED -> REFERRAL_VOUCHER_ISSUED"
    },
    cases: {
      normal: {
        label: "일반 분류 사례",
        symptoms: "3일간 발열과 기침, 경미한 피로",
        risk: "중간",
        riskTone: "amber",
        recommendation: "지역사회 호흡기 클리닉",
        guardrail: "트리거되지 않음",
        guardrailTriggered: false,
        hospital: "Chengdu Xinhua Community Clinic",
        department: "호흡기 / 일반 외래",
        action: "일반 예약",
        availability: "호흡기 진료 예약 가능, 예상 대기 20분, 입원 병상 불필요",
        confidence: "72%",
        humanReview: "일반 의료진 검토",
        resultProof: "의료 진단이 아니라 분류 결과 해시로 기록됨",
        duration: "3일",
        ageRisk: "60세 이상",
        history: "당뇨병, 고혈압",
        redFlags: "고위험 신호 감지 없음",
        hospitalCapacity: "Chengdu Xinhua Community Clinic 호흡기 진료 가능",
        referralLogic: "지역사회 호흡기 진료를 우선 추천하고 증상 지속 시 상급 진료로 안내",
        reasoningFactors: ["3일간 발열과 기침", "경미한 피로", "심한 호흡곤란 없음", "승인된 만성질환 병력 확인", "안전 가드레일 트리거되지 않음"],
        hospitalMatches: [
          { name: "Chengdu Xinhua Community Clinic", badge: "추천", department: "호흡기 / 일반 외래", availability: "높음", queue: "낮음, 예상 20분", bedCapacity: "해당 없음", distance: "1.3 km", fhirStatus: "실시간 동기화" },
          { name: "Chengdu Jinjiang Community Clinic", badge: "대안", department: "일반 외래", availability: "높음", queue: "낮음, 예상 25분", bedCapacity: "해당 없음", distance: "1.1 km", fhirStatus: "실시간 동기화" },
          { name: "West China Hospital, Sichuan University", badge: "이 사례에는 비추천", department: "응급 / 호흡기", availability: "중간", queue: "보통", bedCapacity: "가능", distance: "4.2 km", fhirStatus: "실시간 동기화", reason: "고위험 신호가 없어 지역사회 자원을 먼저 활용합니다" }
        ]
      },
      chest: {
        label: "고위험 흉통 사례",
        symptoms: "3일간 흉부 답답함, 호흡곤란",
        risk: "높음",
        riskTone: "red",
        recommendation: "상급 종합병원 심장내과",
        guardrail: "트리거됨",
        guardrailTriggered: true,
        hospital: "West China Hospital, Sichuan University",
        department: "심장내과",
        action: "상급 종합병원 우선 전원",
        availability: "심장내과 예약 가능, 예상 대기 15분, 병상 가능",
        confidence: "87%",
        humanReview: "필요",
        resultProof: "의료 진단이 아니라 분류 결과 해시로 기록됨",
        duration: "3일",
        ageRisk: "60세 이상",
        history: "당뇨병, 고혈압",
        redFlags: "흉부 답답함 + 호흡곤란",
        hospitalCapacity: "West China Hospital 심장내과 가능",
        referralLogic: "고위험 신호로 인해 상급 종합병원 추천",
        reasoningFactors: ["3일간 흉부 답답함", "호흡곤란 동반", "60세 이상", "당뇨병 및 고혈압 병력", "안전 가드레일 트리거됨"],
        hospitalMatches: [
          { name: "West China Hospital, Sichuan University", badge: "추천", department: "심장내과", availability: "높음", queue: "낮음, 예상 15분", bedCapacity: "가능", distance: "4.2 km", fhirStatus: "실시간 동기화" },
          { name: "Chengdu Second People's Hospital", badge: "대안", department: "심장내과 / 내과", availability: "중간", queue: "보통, 예상 45분", bedCapacity: "제한적", distance: "2.8 km", fhirStatus: "실시간 동기화" },
          { name: "Chengdu Jinjiang Community Clinic", badge: "이 사례에는 비추천", department: "일반 외래", availability: "높음", queue: "낮음", bedCapacity: "해당 없음", distance: "1.1 km", fhirStatus: "실시간 동기화", reason: "고위험 증상은 상급 종합병원 진료가 필요합니다" }
        ]
      },
      chronic: {
        label: "만성질환 추적 사례",
        symptoms: "당뇨병 추적 진료 및 약물 리필 요청",
        risk: "낮음",
        riskTone: "emerald",
        recommendation: "2차 병원 또는 지역사회 내분비 추적 진료",
        guardrail: "트리거되지 않음",
        guardrailTriggered: false,
        hospital: "Chengdu Second People's Hospital",
        department: "내분비 추적 진료",
        action: "추적 진료",
        availability: "내분비 추적 진료 예약 가능, 예상 대기 35분, 입원 병상 불필요",
        confidence: "80%",
        humanReview: "일반 의료진 검토",
        resultProof: "의료 진단이 아니라 분류 결과 해시로 기록됨",
        duration: "추적 진료 요청",
        ageRisk: "60세 이상",
        history: "당뇨병, 고혈압",
        redFlags: "긴급 고위험 신호 감지 없음",
        hospitalCapacity: "Chengdu Second People's Hospital 내분비 추적 진료 가능",
        referralLogic: "복약 지속성과 혈당 조절 평가를 위한 추적 진료 추천",
        reasoningFactors: ["당뇨병 추적 진료 및 약물 리필 요청", "당뇨병 병력 있음", "약물 지속 관리 필요", "응급 증상 없음", "안전 가드레일 트리거되지 않음"],
        hospitalMatches: [
          { name: "Chengdu Second People's Hospital", badge: "추천", department: "내분비내과 / 내과", availability: "높음", queue: "보통, 예상 35분", bedCapacity: "불필요", distance: "2.8 km", fhirStatus: "실시간 동기화" },
          { name: "Chengdu Jinjiang Community Clinic", badge: "대안", department: "만성질환 추적", availability: "중간", queue: "낮음, 예상 25분", bedCapacity: "해당 없음", distance: "1.1 km", fhirStatus: "실시간 동기화" },
          { name: "West China Hospital, Sichuan University", badge: "1순위 아님", department: "내분비내과", availability: "중간", queue: "보통", bedCapacity: "가능", distance: "4.2 km", fhirStatus: "실시간 동기화", reason: "안정적 추적 진료는 2차 병원 또는 지역사회 자원을 우선 활용할 수 있습니다" }
        ]
      }
    }
  }
};

function localeFromLanguage(language: string): Locale {
  if (language === "ko") {
    return "ko";
  }
  if (language === "zh-CN" || language === "zh-TW") {
    return "zh";
  }
  return "en";
}

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function riskClasses(tone: CaseCopy["riskTone"]) {
  if (tone === "red") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (tone === "amber") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

type PipelineTone = "pending" | "success" | "warning" | "proof";

function pipelineStatusClasses(tone: PipelineTone) {
  if (tone === "pending") {
    return "border-slate-200 bg-white text-slate-500";
  }
  if (tone === "warning") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (tone === "proof") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function buildPipeline(copy: PageCopy, caseData: CaseCopy, triageRun: boolean) {
  const pending = {
    status: copy.waitingToRun,
    tone: "pending" as PipelineTone
  };

  if (!triageRun) {
    return [
      {
        title: copy.pipeline.consentCheck,
        tech: copy.pipeline.mediChain,
        text: copy.pipeline.consentText,
        preview: copy.pipeline.consentPreview,
        ...pending
      },
      {
        title: copy.pipeline.retrieveAuthorizedRecords,
        tech: copy.pipeline.mediChainFhir,
        text: copy.pipeline.recordsText,
        preview: copy.pipeline.recordsPreview,
        ...pending
      },
      {
        title: copy.pipeline.aiRiskScoring,
        tech: copy.pipeline.medicalAiModel,
        text: copy.pipeline.aiText,
        preview: copy.waitingToRun,
        ...pending
      },
      {
        title: copy.pipeline.safetyGuardrail,
        tech: copy.pipeline.clinicalSafetyRules,
        text: copy.pipeline.safetyText,
        preview: copy.waitingToRun,
        ...pending
      },
      {
        title: copy.pipeline.hospitalAvailability,
        tech: copy.pipeline.hl7Fhir,
        text: copy.pipeline.hospitalText,
        preview: copy.waitingToRun,
        ...pending
      },
      {
        title: copy.pipeline.recommendationRanking,
        tech: copy.pipeline.aiMatchingEngine,
        text: copy.pipeline.rankingText,
        preview: copy.pipeline.rankingPreview,
        ...pending
      },
      {
        title: copy.pipeline.resultProof,
        tech: copy.pipeline.chaincode,
        text: copy.pipeline.proofText,
        preview: copy.pipeline.proofPreview,
        ...pending
      }
    ];
  }

  return [
    {
      title: copy.pipeline.consentCheck,
      tech: copy.pipeline.mediChain,
      status: copy.pipeline.authorized,
      tone: "success" as PipelineTone,
      text: copy.pipeline.consentText,
      preview: copy.pipeline.consentPreview
    },
    {
      title: copy.pipeline.retrieveAuthorizedRecords,
      tech: copy.pipeline.mediChainFhir,
      status: copy.pipeline.pulled,
      tone: "success" as PipelineTone,
      text: copy.pipeline.recordsText,
      preview: copy.pipeline.recordsPreview
    },
    {
      title: copy.pipeline.aiRiskScoring,
      tech: copy.pipeline.medicalAiModel,
      status: copy.pipeline.completed,
      tone: "success" as PipelineTone,
      text: copy.pipeline.aiText,
      preview: `riskLevel = ${caseData.risk}, confidence = ${caseData.confidence}`
    },
    {
      title: copy.pipeline.safetyGuardrail,
      tech: copy.pipeline.clinicalSafetyRules,
      status: caseData.guardrailTriggered ? copy.pipeline.triggered : copy.pipeline.notTriggered,
      tone: caseData.guardrailTriggered ? ("warning" as PipelineTone) : ("success" as PipelineTone),
      text: copy.pipeline.safetyText,
      preview: `redFlag = ${caseData.guardrailTriggered}`
    },
    {
      title: copy.pipeline.hospitalAvailability,
      tech: copy.pipeline.hl7Fhir,
      status: copy.pipeline.synced,
      tone: "success" as PipelineTone,
      text: copy.pipeline.hospitalText,
      preview: caseData.availability
    },
    {
      title: copy.pipeline.recommendationRanking,
      tech: copy.pipeline.aiMatchingEngine,
      status: copy.pipeline.ranked,
      tone: "success" as PipelineTone,
      text: copy.pipeline.rankingText,
      preview: copy.pipeline.rankingPreview
    },
    {
      title: copy.pipeline.resultProof,
      tech: copy.pipeline.chaincode,
      status: copy.pipeline.recorded,
      tone: "proof" as PipelineTone,
      text: copy.pipeline.proofText,
      preview: copy.pipeline.proofPreview
    }
  ];
}

function buildTracePayload(tab: TraceTabId, caseData: CaseCopy) {
  const departmentSlug = encodeURIComponent(caseData.department.toLowerCase().replace(/\s+/g, "-"));
  const safetySignals = caseData.guardrailTriggered
    ? caseData.redFlags
        .split(/\s*(?:\+|,|，|、|\/|;|；)\s*/)
        .map((signal) => signal.trim())
        .filter(Boolean)
    : [caseData.guardrail, caseData.redFlags].filter(Boolean);

  if (tab === "records") {
    return {
      source: "MediChain",
      patientDID: "did:medlink:patient:CN-2038-8841",
      consentStatus: "active",
      authorizedRecords: ["Blood Test", "Allergy Record", "Visit Summary"],
      scope: "triage-review-only",
      expiresIn: "72h"
    };
  }

  if (tab === "fhir") {
    return {
      api: "HL7 FHIR",
      endpoint: `/fhir/R4/Appointment?department=${departmentSlug}&city=chengdu`,
      hospital: caseData.hospital,
      departmentAvailability: caseData.availability,
      queueEstimate: caseData.hospitalMatches[0]?.queue ?? "15 min",
      bedCapacity: caseData.hospitalMatches[0]?.bedCapacity ?? "available"
    };
  }

  if (tab === "ai") {
    return {
      model: "MediRoute-Triage-v0.3",
      inputSource: "authorized_records_only",
      riskLevel: caseData.risk,
      confidence: caseData.confidence,
      recommendedDepartment: caseData.department,
      recommendedHospitalLevel: caseData.recommendation,
      humanReviewRequired: caseData.humanReview,
      notDiagnosis: true
    };
  }

  if (tab === "safety") {
    return {
      redFlagDetected: caseData.guardrailTriggered,
      signals: safetySignals,
      action: caseData.action,
      message: `${caseData.guardrail}: ${caseData.referralLogic}`
    };
  }

  if (tab === "chaincode") {
    return {
      channel: "triage-referral-channel",
      event: "TRIAGE_RESULT_HASHED",
      resultHash: "0x8f7a2b91e3c4d57f...",
      referralVoucher: "RV-CHEN-2026-0429",
      timestamp: "2026-04-29T10:42:18+08:00",
      note: "Hash proves the result was generated and not altered. It does not prove medical correctness."
    };
  }

  return {
    clinicianReview: caseData.humanReview,
    reviewerRole: `${caseData.department} clinician / triage nurse`,
    possibleActions: ["confirm recommendation", "modify department", "escalate to emergency", "reject AI suggestion"],
    feedbackUse: "de-identified calibration dataset"
  };
}

function localizeTracePayload(payload: Record<string, unknown>, labels: PageCopy["tracePayloadLabels"]) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [labels[key] ?? key, value]));
}

function mockTriageEngine(symptomText: string): CaseId {
  const normalized = symptomText.toLowerCase().replace(/\s+/g, " ");

  for (const rule of TRIAGE_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return rule.id;
    }
  }

  return "unknown";
}

function makeMatch(
  name: string,
  badge: string,
  department: string,
  availability: string,
  queue: string,
  bedCapacity: string,
  distance: string,
  fhirStatus: string,
  reason?: string
): HospitalMatch {
  return { name, badge, department, availability, queue, bedCapacity, distance, fhirStatus, reason };
}

function buildScenarioCases(copy: PageCopy, locale: Locale): Record<CaseId, CaseCopy> {
  const proof = copy.cases.chest.resultProof;
  const normalBase = copy.cases.normal;
  const chestBase = copy.cases.chest;
  const chronicBase = copy.cases.chronic;

  if (locale === "zh") {
    return {
      normal: {
        ...normalBase,
        label: "普通呼吸分诊案例",
        symptoms: "发热咳嗽3天，轻度乏力。",
        risk: "中",
        riskTone: "amber",
        recommendation: "社区呼吸门诊",
        guardrail: "未触发",
        guardrailTriggered: false,
        hospital: "成都新华社区诊所",
        department: "呼吸门诊",
        action: "普通预约",
        availability: "呼吸门诊可接诊，预计排队12分钟",
        confidence: "72%",
        humanReview: "建议复核",
        resultProof: proof,
        duration: "3天",
        ageRisk: "60岁以上",
        redFlags: "未发现高风险信号",
        hospitalCapacity: "成都新华社区诊所呼吸门诊可接诊",
        referralLogic: "中等风险呼吸道症状建议先到社区呼吸门诊",
        reasoningFactors: ["发热咳嗽3天", "轻度乏力", "未触发高风险安全护栏", "已结合糖尿病和高血压病史"],
        hospitalMatches: [
          makeMatch("成都新华社区诊所", "推荐", "呼吸门诊", "高", "低，预计12分钟", "不适用", "1.1公里", "实时同步"),
          makeMatch("成都市第二人民医院", "备选", "呼吸内科", "中", "中等，预计35分钟", "有限", "3.8公里", "实时同步"),
          makeMatch("四川大学华西医院", "本案例不推荐", "呼吸与危重症医学科", "高", "较高，预计60分钟", "可用", "7.4公里", "实时同步", "普通呼吸症状可先使用基层资源")
        ]
      },
      chest: chestBase,
      stroke: {
        ...chestBase,
        label: "卒中/神经急症案例",
        symptoms: "突然剧烈头痛，说话含糊，一侧肢体无力。",
        risk: "急诊",
        riskTone: "red",
        recommendation: "急诊 / 神经内科",
        guardrail: "已触发",
        guardrailTriggered: true,
        hospital: "四川大学华西医院急诊中心",
        department: "急诊 / 神经内科",
        action: "立即急诊转诊",
        availability: "急诊通道可用，建议走急救通道",
        confidence: "91%",
        humanReview: "必须立即复核",
        resultProof: proof,
        duration: "突然出现",
        redFlags: "说话含糊 + 一侧无力 + 突然剧烈头痛",
        hospitalCapacity: "华西医院急诊卒中通道可用",
        referralLogic: "神经系统高风险信号建议立即急诊转诊",
        reasoningFactors: ["突然剧烈头痛", "说话含糊", "一侧肢体无力", "安全护栏已触发"],
        hospitalMatches: [
          makeMatch("四川大学华西医院急诊中心", "推荐", "急诊 / 神经内科", "高", "急诊通道", "可用", "7.4公里", "实时同步"),
          makeMatch("成都市第二人民医院急诊", "备选", "急诊", "中", "预计18分钟", "有限", "3.8公里", "实时同步"),
          makeMatch("成都新华社区诊所", "本案例不推荐", "全科门诊", "高", "低", "不适用", "1.1公里", "实时同步", "疑似神经急症需急诊通道")
        ]
      },
      chronic: {
        ...chronicBase,
        symptoms: "糖尿病复诊与续药需求。",
        risk: "低",
        recommendation: "二级医院或社区内分泌复诊",
        department: "内分泌科",
        hospital: "成都市第二人民医院",
        availability: "内分泌科明日09:20有号",
        confidence: "80%",
        humanReview: "常规复核"
      },
      oncology: {
        ...chestBase,
        label: "肿瘤专科复核案例",
        symptoms: "肿瘤靶向药奥希替尼续药。",
        risk: "专科复核",
        riskTone: "amber",
        recommendation: "肿瘤专科复核",
        guardrail: "已触发专科复核",
        guardrailTriggered: true,
        hospital: "四川省肿瘤医院",
        department: "肿瘤科",
        action: "续药前需专科医生复核",
        availability: "肿瘤专科可复核，号源有限",
        confidence: "84%",
        humanReview: "必须复核",
        resultProof: proof,
        duration: "续药需求",
        redFlags: "高价靶向药需要专科复核",
        hospitalCapacity: "四川省肿瘤医院肿瘤专科可复核",
        referralLogic: "靶向药续方需要肿瘤专科医生确认",
        reasoningFactors: ["肿瘤靶向药续药", "奥希替尼属于专科用药", "需要确认适应证和用药安全", "专科复核护栏已触发"],
        hospitalMatches: [
          makeMatch("四川省肿瘤医院", "推荐", "肿瘤科", "中", "号源有限", "可用", "9.1公里", "实时同步"),
          makeMatch("四川大学华西医院", "备选", "肿瘤科", "中", "预计45分钟", "可用", "7.4公里", "实时同步"),
          makeMatch("成都新华社区诊所", "本案例不推荐", "全科门诊", "高", "低", "不适用", "1.1公里", "实时同步", "靶向药需专科复核")
        ]
      },
      allergy: {
        ...chestBase,
        label: "过敏/用药安全案例",
        symptoms: "服药后出现皮疹，有青霉素过敏史。",
        risk: "中",
        riskTone: "amber",
        recommendation: "用药安全复核",
        guardrail: "已触发用药安全提示",
        guardrailTriggered: true,
        hospital: "成都市第二人民医院",
        department: "过敏门诊 / 普通内科",
        action: "用药安全复核",
        availability: "今日内科可接诊",
        confidence: "78%",
        humanReview: "必须复核",
        resultProof: proof,
        duration: "服药后",
        redFlags: "皮疹 + 青霉素过敏史",
        hospitalCapacity: "成都市第二人民医院内科今日可接诊",
        referralLogic: "药物反应与过敏史需要医生复核",
        reasoningFactors: ["服药后出现皮疹", "有青霉素过敏史", "需要排查药物反应", "用药安全护栏已触发"],
        hospitalMatches: [
          makeMatch("成都市第二人民医院", "推荐", "过敏门诊 / 普通内科", "高", "预计20分钟", "门诊无需住院床位", "3.8公里", "实时同步"),
          makeMatch("成都新华社区诊所", "备选", "全科门诊", "中", "预计12分钟", "不适用", "1.1公里", "实时同步"),
          makeMatch("四川大学华西医院", "非首选", "变态反应科", "中", "预计60分钟", "可用", "7.4公里", "实时同步", "如出现呼吸困难再升级")
        ]
      },
      pediatric: {
        ...chestBase,
        label: "儿童发热案例",
        symptoms: "孩子从昨天开始发烧咳嗽。",
        risk: "中",
        riskTone: "amber",
        recommendation: "儿科门诊就诊",
        guardrail: "建议儿科复核",
        guardrailTriggered: false,
        hospital: "成都市妇女儿童中心医院",
        department: "儿科",
        action: "儿科门诊就诊",
        availability: "儿科有号源，预计排队25分钟",
        confidence: "76%",
        humanReview: "必须复核",
        resultProof: proof,
        duration: "1天",
        redFlags: "儿童发热需要儿科复核",
        hospitalCapacity: "成都市妇女儿童中心医院儿科有号源",
        referralLogic: "儿童发热咳嗽建议儿科门诊评估",
        reasoningFactors: ["儿童发热", "伴有咳嗽", "需要儿科医生评估", "FHIR 显示儿科号源可用"],
        hospitalMatches: [
          makeMatch("成都市妇女儿童中心医院", "推荐", "儿科", "高", "预计25分钟", "可用", "4.6公里", "实时同步"),
          makeMatch("成都市第二人民医院", "备选", "儿科", "中", "预计35分钟", "有限", "3.8公里", "实时同步"),
          makeMatch("成都新华社区诊所", "备选", "全科门诊", "中", "预计12分钟", "不适用", "1.1公里", "实时同步")
        ]
      },
      unknown: {
        ...chestBase,
        label: "不明确症状案例",
        symptoms: "我感觉不舒服，但说不清楚。",
        risk: "需人工复核",
        riskTone: "amber",
        recommendation: "全科门诊",
        guardrail: "信息不足",
        guardrailTriggered: false,
        hospital: "成都市第二人民医院",
        department: "全科门诊",
        action: "建议人工分诊复核",
        availability: "全科门诊可接诊",
        confidence: "55%",
        humanReview: "必须复核",
        resultProof: proof,
        duration: "不明确",
        redFlags: "信息不足",
        hospitalCapacity: "成都市第二人民医院全科门诊可接诊",
        referralLogic: "症状描述不明确，建议人工分诊复核",
        reasoningFactors: ["症状描述不清楚", "关键词不足", "需要人工补充问诊", "先推荐全科门诊评估"],
        hospitalMatches: [
          makeMatch("成都市第二人民医院", "推荐", "全科门诊", "高", "预计25分钟", "可用", "3.8公里", "实时同步"),
          makeMatch("成都新华社区诊所", "备选", "全科门诊", "高", "预计12分钟", "不适用", "1.1公里", "实时同步"),
          makeMatch("四川大学华西医院", "非首选", "急诊", "高", "按急诊分诊", "可用", "7.4公里", "实时同步", "如出现危险信号再升级")
        ]
      }
    };
  }

  if (locale === "ko") {
    return {
      normal: {
        ...normalBase,
        label: "일반 호흡기 분류 사례",
        symptoms: "3일간 발열과 기침이 있고 약간 피곤합니다.",
        risk: "중간",
        riskTone: "amber",
        recommendation: "지역사회 호흡기 클리닉",
        guardrail: "트리거되지 않음",
        guardrailTriggered: false,
        hospital: "Chengdu Xinhua Community Clinic",
        department: "호흡기 클리닉",
        action: "일반 예약",
        availability: "호흡기 클리닉 가능, 예상 대기 12분",
        confidence: "72%",
        humanReview: "권장",
        resultProof: proof,
        duration: "3일",
        ageRisk: "60세 이상",
        redFlags: "고위험 신호 없음",
        hospitalCapacity: "Chengdu Xinhua Community Clinic 호흡기 클리닉 가능",
        referralLogic: "중간 위험 호흡기 증상은 지역사회 호흡기 클리닉을 우선 추천합니다",
        reasoningFactors: ["3일간 발열과 기침", "경미한 피로", "안전 가드레일 미트리거", "당뇨병 및 고혈압 병력 확인"],
        hospitalMatches: [
          makeMatch("Chengdu Xinhua Community Clinic", "추천", "호흡기 클리닉", "높음", "낮음, 예상 12분", "해당 없음", "1.1 km", "실시간 동기화"),
          makeMatch("Chengdu Second People's Hospital", "대안", "호흡기내과", "중간", "보통, 예상 35분", "제한적", "3.8 km", "실시간 동기화"),
          makeMatch("West China Hospital, Sichuan University", "이 사례에는 비추천", "호흡기/중환자의학", "높음", "높음, 예상 60분", "가능", "7.4 km", "실시간 동기화", "일반 호흡기 증상은 1차 의료자원을 먼저 사용할 수 있습니다")
        ]
      },
      chest: chestBase,
      stroke: {
        ...chestBase,
        label: "뇌졸중/신경학적 응급 사례",
        symptoms: "갑작스러운 심한 두통과 말이 어눌하며 한쪽 힘이 빠집니다.",
        risk: "응급",
        riskTone: "red",
        recommendation: "응급실 / 신경과",
        guardrail: "트리거됨",
        guardrailTriggered: true,
        hospital: "West China Hospital Emergency Center",
        department: "응급실 / 신경과",
        action: "즉시 응급 전원",
        availability: "응급 채널 가능, 구급 경로 권장",
        confidence: "91%",
        humanReview: "즉시 필요",
        resultProof: proof,
        duration: "갑작스러움",
        redFlags: "말이 어눌함 + 한쪽 힘 빠짐 + 갑작스러운 심한 두통",
        hospitalCapacity: "West China Hospital 응급 뇌졸중 경로 가능",
        referralLogic: "신경학적 고위험 신호로 즉시 응급 전원을 추천합니다",
        reasoningFactors: ["갑작스러운 심한 두통", "말이 어눌함", "한쪽 힘 빠짐", "안전 가드레일 트리거됨"],
        hospitalMatches: [
          makeMatch("West China Hospital Emergency Center", "추천", "응급실 / 신경과", "높음", "응급 채널", "가능", "7.4 km", "실시간 동기화"),
          makeMatch("Chengdu Second People's Hospital Emergency", "대안", "응급실", "중간", "예상 18분", "제한적", "3.8 km", "실시간 동기화"),
          makeMatch("Chengdu Xinhua Community Clinic", "이 사례에는 비추천", "일반 외래", "높음", "낮음", "해당 없음", "1.1 km", "실시간 동기화", "신경학적 응급 의심 시 응급 경로 필요")
        ]
      },
      chronic: {
        ...chronicBase,
        symptoms: "당뇨병 추적 진료와 약물 리필이 필요합니다.",
        risk: "낮음",
        recommendation: "2차 병원 또는 지역사회 내분비 추적 진료",
        department: "내분비내과",
        hospital: "Chengdu Second People's Hospital",
        availability: "내분비내과 내일 09:20 예약 가능",
        confidence: "80%",
        humanReview: "일반 검토"
      },
      oncology: {
        ...chestBase,
        label: "종양 전문의 검토 사례",
        symptoms: "표적항암제 오시머티닙 리필이 필요합니다.",
        risk: "전문의 검토",
        riskTone: "amber",
        recommendation: "종양 전문의 검토",
        guardrail: "전문의 검토 트리거됨",
        guardrailTriggered: true,
        hospital: "Sichuan Cancer Hospital",
        department: "종양내과",
        action: "리필 전 전문의 검토 필요",
        availability: "종양 전문의 검토 가능, 예약 제한적",
        confidence: "84%",
        humanReview: "필요",
        resultProof: proof,
        duration: "리필 요청",
        redFlags: "고가 표적치료제는 전문의 검토 필요",
        hospitalCapacity: "Sichuan Cancer Hospital 종양 전문의 검토 가능",
        referralLogic: "표적치료제 리필은 종양 전문의 확인이 필요합니다",
        reasoningFactors: ["표적항암제 리필", "오시머티닙은 전문의 관리 약물", "적응증과 복약 안전 확인 필요", "전문의 검토 가드레일 트리거됨"],
        hospitalMatches: [
          makeMatch("Sichuan Cancer Hospital", "추천", "종양내과", "중간", "예약 제한적", "가능", "9.1 km", "실시간 동기화"),
          makeMatch("West China Hospital, Sichuan University", "대안", "종양내과", "중간", "예상 45분", "가능", "7.4 km", "실시간 동기화"),
          makeMatch("Chengdu Xinhua Community Clinic", "이 사례에는 비추천", "일반 외래", "높음", "낮음", "해당 없음", "1.1 km", "실시간 동기화", "표적치료제는 전문의 검토 필요")
        ]
      },
      allergy: {
        ...chestBase,
        label: "알레르기/복약 안전 사례",
        symptoms: "약 복용 후 발진이 생겼고 페니실린 알레르기 병력이 있습니다.",
        risk: "중간",
        riskTone: "amber",
        recommendation: "복약 안전 검토",
        guardrail: "복약 안전 경고",
        guardrailTriggered: true,
        hospital: "Chengdu Second People's Hospital",
        department: "알레르기 클리닉 / 일반내과",
        action: "복약 안전 검토",
        availability: "오늘 내과 진료 가능",
        confidence: "78%",
        humanReview: "필요",
        resultProof: proof,
        duration: "약 복용 후",
        redFlags: "발진 + 페니실린 알레르기 병력",
        hospitalCapacity: "Chengdu Second People's Hospital 오늘 내과 진료 가능",
        referralLogic: "약물 반응과 알레르기 병력은 의료진 검토가 필요합니다",
        reasoningFactors: ["약 복용 후 발진", "페니실린 알레르기 병력", "약물 반응 확인 필요", "복약 안전 가드레일 트리거됨"],
        hospitalMatches: [
          makeMatch("Chengdu Second People's Hospital", "추천", "알레르기 클리닉 / 일반내과", "높음", "예상 20분", "외래 진료", "3.8 km", "실시간 동기화"),
          makeMatch("Chengdu Xinhua Community Clinic", "대안", "일반 외래", "중간", "예상 12분", "해당 없음", "1.1 km", "실시간 동기화"),
          makeMatch("West China Hospital, Sichuan University", "비우선", "알레르기내과", "중간", "예상 60분", "가능", "7.4 km", "실시간 동기화", "호흡곤란이 있으면 상급 경로로 전환")
        ]
      },
      pediatric: {
        ...chestBase,
        label: "소아 발열 사례",
        symptoms: "아이가 어제부터 열이 나고 기침을 합니다.",
        risk: "중간",
        riskTone: "amber",
        recommendation: "소아과 외래 방문",
        guardrail: "소아과 검토 권장",
        guardrailTriggered: false,
        hospital: "Chengdu Women and Children's Medical Center",
        department: "소아과",
        action: "소아과 외래 방문",
        availability: "소아과 예약 가능, 예상 대기 25분",
        confidence: "76%",
        humanReview: "필요",
        resultProof: proof,
        duration: "1일",
        redFlags: "소아 발열은 소아과 검토 권장",
        hospitalCapacity: "Chengdu Women and Children's Medical Center 소아과 예약 가능",
        referralLogic: "소아 발열과 기침은 소아과 외래 평가를 추천합니다",
        reasoningFactors: ["소아 발열", "기침 동반", "소아과 의료진 평가 필요", "FHIR에서 소아과 예약 가능 확인"],
        hospitalMatches: [
          makeMatch("Chengdu Women and Children's Medical Center", "추천", "소아과", "높음", "예상 25분", "가능", "4.6 km", "실시간 동기화"),
          makeMatch("Chengdu Second People's Hospital", "대안", "소아과", "중간", "예상 35분", "제한적", "3.8 km", "실시간 동기화"),
          makeMatch("Chengdu Xinhua Community Clinic", "대안", "일반 외래", "중간", "예상 12분", "해당 없음", "1.1 km", "실시간 동기화")
        ]
      },
      unknown: {
        ...chestBase,
        label: "불명확한 증상 사례",
        symptoms: "몸이 불편하지만 정확히 설명하기 어렵습니다.",
        risk: "검토 필요",
        riskTone: "amber",
        recommendation: "일반 외래",
        guardrail: "정보 부족",
        guardrailTriggered: false,
        hospital: "Chengdu Second People's Hospital",
        department: "일반 외래",
        action: "의료진 분류 검토 권장",
        availability: "일반 외래 가능",
        confidence: "55%",
        humanReview: "필요",
        resultProof: proof,
        duration: "불명확",
        redFlags: "정보 부족",
        hospitalCapacity: "Chengdu Second People's Hospital 일반 외래 가능",
        referralLogic: "증상 정보가 부족하여 의료진 분류 검토를 추천합니다",
        reasoningFactors: ["증상 설명이 불명확함", "키워드 부족", "추가 문진 필요", "일반 외래 평가 우선 추천"],
        hospitalMatches: [
          makeMatch("Chengdu Second People's Hospital", "추천", "일반 외래", "높음", "예상 25분", "가능", "3.8 km", "실시간 동기화"),
          makeMatch("Chengdu Xinhua Community Clinic", "대안", "일반 외래", "높음", "예상 12분", "해당 없음", "1.1 km", "실시간 동기화"),
          makeMatch("West China Hospital, Sichuan University", "비우선", "응급실", "높음", "응급 분류", "가능", "7.4 km", "실시간 동기화", "위험 신호가 생기면 즉시 상급 경로")
        ]
      }
    };
  }

  return {
    normal: {
      ...normalBase,
      label: "Normal respiratory triage",
      symptoms: "Fever and cough for 3 days, mild fatigue.",
      risk: "Medium",
      riskTone: "amber",
      recommendation: "Community respiratory clinic",
      guardrail: "Not triggered",
      guardrailTriggered: false,
      hospital: "Chengdu Xinhua Community Clinic",
      department: "Respiratory Clinic",
      action: "Routine appointment",
      availability: "Respiratory clinic available, queue estimated 12 min",
      confidence: "72%",
      humanReview: "Recommended",
      resultProof: proof,
      duration: "3 days",
      ageRisk: "Age above 60",
      redFlags: "No red-flag signal detected",
      hospitalCapacity: "Chengdu Xinhua Community Clinic respiratory clinic available",
      referralLogic: "Community respiratory clinic recommended for medium-risk respiratory symptoms",
      reasoningFactors: ["Fever and cough for 3 days", "Mild fatigue", "No red-flag escalation detected", "Diabetes and hypertension history checked"],
      hospitalMatches: [
        makeMatch("Chengdu Xinhua Community Clinic", "Recommended", "Respiratory Clinic", "High", "Low, estimated 12 min", "Not applicable", "1.1 km", "Live"),
        makeMatch("Chengdu Second People's Hospital", "Alternative", "Respiratory Clinic", "Medium", "Moderate, estimated 35 min", "Limited", "3.8 km", "Live"),
        makeMatch("West China Hospital, Sichuan University", "Not recommended for this case", "Respiratory & Critical Care", "High", "High, estimated 60 min", "Available", "7.4 km", "Live", "Use primary care first for routine respiratory symptoms")
      ]
    },
    chest: chestBase,
    stroke: {
      ...chestBase,
      label: "Stroke / neurological emergency",
      symptoms: "Sudden severe headache with slurred speech and weakness on one side.",
      risk: "Emergency",
      riskTone: "red",
      recommendation: "Emergency / neurology pathway",
      guardrail: "Triggered",
      guardrailTriggered: true,
      hospital: "West China Hospital Emergency Center",
      department: "Emergency / Neurology",
      action: "Immediate emergency referral",
      availability: "Emergency channel available, ambulance pathway recommended",
      confidence: "91%",
      humanReview: "Required immediately",
      resultProof: proof,
      duration: "Sudden onset",
      redFlags: "Slurred speech + one-sided weakness + sudden severe headache",
      hospitalCapacity: "West China Hospital emergency stroke pathway available",
      referralLogic: "Immediate emergency referral recommended due to neurological red flags",
      reasoningFactors: ["Sudden severe headache", "Slurred speech", "One-sided weakness", "Safety guardrail triggered"],
      hospitalMatches: [
        makeMatch("West China Hospital Emergency Center", "Recommended", "Emergency / Neurology", "High", "Emergency channel", "Available", "7.4 km", "Live"),
        makeMatch("Chengdu Second People's Hospital Emergency", "Alternative", "Emergency", "Medium", "Estimated 18 min", "Limited", "3.8 km", "Live"),
        makeMatch("Chengdu Xinhua Community Clinic", "Not recommended for this case", "General outpatient", "High", "Low", "Not applicable", "1.1 km", "Live", "Neurological emergency signs require urgent care")
      ]
    },
    chronic: {
      ...chronicBase,
      symptoms: "Diabetes follow-up and medication refill request.",
      risk: "Low",
      recommendation: "Endocrinology follow-up at secondary hospital or community clinic",
      department: "Endocrinology",
      hospital: "Chengdu Second People's Hospital",
      availability: "Endocrinology slot available tomorrow 09:20",
      confidence: "80%",
      humanReview: "Standard review"
    },
    oncology: {
      ...chestBase,
      label: "Oncology specialist review",
      symptoms: "Cancer targeted drug refill, Osimertinib.",
      risk: "Specialist",
      riskTone: "amber",
      recommendation: "Oncology specialist review",
      guardrail: "Specialist review triggered",
      guardrailTriggered: true,
      hospital: "Sichuan Cancer Hospital",
      department: "Oncology",
      action: "Specialist review required before refill",
      availability: "Oncology specialist review available, limited slots",
      confidence: "84%",
      humanReview: "Required",
      resultProof: proof,
      duration: "Refill request",
      redFlags: "High-value targeted drug needs specialist review",
      hospitalCapacity: "Sichuan Cancer Hospital oncology review available",
      referralLogic: "Targeted therapy refill requires oncology specialist confirmation",
      reasoningFactors: ["Targeted therapy refill", "Osimertinib requires specialist oversight", "Medication safety and indication review needed", "Specialist review guardrail triggered"],
      hospitalMatches: [
        makeMatch("Sichuan Cancer Hospital", "Recommended", "Oncology", "Medium", "Limited slots", "Available", "9.1 km", "Live"),
        makeMatch("West China Hospital, Sichuan University", "Alternative", "Oncology", "Medium", "Estimated 45 min", "Available", "7.4 km", "Live"),
        makeMatch("Chengdu Xinhua Community Clinic", "Not recommended for this case", "General outpatient", "High", "Low", "Not applicable", "1.1 km", "Live", "Targeted therapy requires specialist review")
      ]
    },
    allergy: {
      ...chestBase,
      label: "Allergy / medication safety",
      symptoms: "Rash after taking medicine, history of penicillin allergy.",
      risk: "Medium",
      riskTone: "amber",
      recommendation: "Medication safety review",
      guardrail: "Medication safety warning",
      guardrailTriggered: true,
      hospital: "Chengdu Second People's Hospital",
      department: "Allergy / General Internal Medicine",
      action: "Medication safety review",
      availability: "Internal medicine available today",
      confidence: "78%",
      humanReview: "Required",
      resultProof: proof,
      duration: "After medication",
      redFlags: "Rash + penicillin allergy history",
      hospitalCapacity: "Chengdu Second People's Hospital internal medicine available today",
      referralLogic: "Drug reaction and allergy history require clinician review",
      reasoningFactors: ["Rash after taking medicine", "Penicillin allergy history", "Medication reaction needs review", "Medication safety guardrail triggered"],
      hospitalMatches: [
        makeMatch("Chengdu Second People's Hospital", "Recommended", "Allergy / General Internal Medicine", "High", "Estimated 20 min", "Outpatient", "3.8 km", "Live"),
        makeMatch("Chengdu Xinhua Community Clinic", "Alternative", "General outpatient", "Medium", "Estimated 12 min", "Not applicable", "1.1 km", "Live"),
        makeMatch("West China Hospital, Sichuan University", "Not first-line", "Allergy Clinic", "Medium", "Estimated 60 min", "Available", "7.4 km", "Live", "Escalate if breathing difficulty appears")
      ]
    },
    pediatric: {
      ...chestBase,
      label: "Pediatric fever",
      symptoms: "My child has fever and cough since yesterday.",
      risk: "Medium",
      riskTone: "amber",
      recommendation: "Pediatric outpatient visit",
      guardrail: "Pediatric review recommended",
      guardrailTriggered: false,
      hospital: "Chengdu Women and Children's Medical Center",
      department: "Pediatrics",
      action: "Pediatric outpatient visit",
      availability: "Pediatric slots available, queue estimated 25 min",
      confidence: "76%",
      humanReview: "Required",
      resultProof: proof,
      duration: "1 day",
      redFlags: "Pediatric fever needs pediatric review",
      hospitalCapacity: "Chengdu Women and Children's Medical Center pediatrics slots available",
      referralLogic: "Child fever and cough should be reviewed in pediatrics",
      reasoningFactors: ["Child fever", "Cough since yesterday", "Pediatric review recommended", "FHIR shows pediatric slots available"],
      hospitalMatches: [
        makeMatch("Chengdu Women and Children's Medical Center", "Recommended", "Pediatrics", "High", "Estimated 25 min", "Available", "4.6 km", "Live"),
        makeMatch("Chengdu Second People's Hospital", "Alternative", "Pediatrics", "Medium", "Estimated 35 min", "Limited", "3.8 km", "Live"),
        makeMatch("Chengdu Xinhua Community Clinic", "Alternative", "General outpatient", "Medium", "Estimated 12 min", "Not applicable", "1.1 km", "Live")
      ]
    },
    unknown: {
      ...chestBase,
      label: "Unknown / unclear symptoms",
      symptoms: "I feel uncomfortable but cannot describe clearly.",
      risk: "Needs review",
      riskTone: "amber",
      recommendation: "General outpatient",
      guardrail: "Not enough information",
      guardrailTriggered: false,
      hospital: "Chengdu Second People's Hospital",
      department: "General Outpatient",
      action: "Human triage review recommended",
      availability: "General outpatient available",
      confidence: "55%",
      humanReview: "Required",
      resultProof: proof,
      duration: "Unclear",
      redFlags: "Not enough information",
      hospitalCapacity: "Chengdu Second People's Hospital general outpatient available",
      referralLogic: "Unclear symptoms should be reviewed by a human triage clinician",
      reasoningFactors: ["Symptom description is unclear", "No specific keyword matched", "More history is needed", "General outpatient review recommended first"],
      hospitalMatches: [
        makeMatch("Chengdu Second People's Hospital", "Recommended", "General Outpatient", "High", "Estimated 25 min", "Available", "3.8 km", "Live"),
        makeMatch("Chengdu Xinhua Community Clinic", "Alternative", "General outpatient", "High", "Estimated 12 min", "Not applicable", "1.1 km", "Live"),
        makeMatch("West China Hospital, Sichuan University", "Not first-line", "Emergency", "High", "Emergency triage", "Available", "7.4 km", "Live", "Escalate if red flags appear")
      ]
    }
  };
}

export default function MediRoutePage() {
  const { language } = useLanguage();
  const locale = localeFromLanguage(language);
  const copy = COPY[locale];
  const scenarioCases = useMemo(() => buildScenarioCases(copy, locale), [copy, locale]);
  const [activeCase, setActiveCase] = useState<ActiveCaseId>("chest");
  const [triageResultId, setTriageResultId] = useState<CaseId | null>(null);
  const [symptoms, setSymptoms] = useState(copy.cases.chest.symptoms);
  const [triageRun, setTriageRun] = useState(false);
  const [isRunningTriage, setIsRunningTriage] = useState(false);
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [activeTraceTab, setActiveTraceTab] = useState<TraceTabId>("records");
  const [referralVoucherIssued, setReferralVoucherIssued] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const displayCaseId: CaseId = triageRun && triageResultId ? triageResultId : activeCase === "custom" ? "unknown" : activeCase;
  const caseData = scenarioCases[displayCaseId];
  const pipelineSteps = useMemo(() => buildPipeline(copy, caseData, triageRun), [caseData, copy, triageRun]);
  const tracePayload = useMemo(
    () => localizeTracePayload(buildTracePayload(activeTraceTab, caseData), copy.tracePayloadLabels),
    [activeTraceTab, caseData, copy.tracePayloadLabels]
  );

  useEffect(() => {
    if (activeCase !== "custom" && !triageRun) {
      setSymptoms(scenarioCases[activeCase].symptoms);
    }
  }, [activeCase, scenarioCases, triageRun]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const resetTriageState = () => {
    setTriageRun(false);
    setTriageResultId(null);
    setReferralVoucherIssued(false);
    setVoucherModalOpen(false);
    setTraceDrawerOpen(false);
    setActiveTraceTab("records");
  };

  const handleCaseChange = (nextCaseId: ShortcutCaseId) => {
    setActiveCase(nextCaseId);
    setSymptoms(scenarioCases[nextCaseId].symptoms);
    resetTriageState();
  };

  const handleSymptomChange = (value: string) => {
    setSymptoms(value);
    setActiveCase("custom");
    resetTriageState();
  };

  const runTriage = async () => {
    const nextResultId = mockTriageEngine(symptoms.trim());
    const usesCustomInput = activeCase === "custom";
    setReferralVoucherIssued(false);
    setVoucherModalOpen(false);
    setTraceDrawerOpen(false);
    setActiveTraceTab("records");
    setIsRunningTriage(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setTriageResultId(nextResultId);
    setTriageRun(true);
    setIsRunningTriage(false);
    setToast(usesCustomInput ? copy.customTriageCompletedToast : copy.triageCompletedToast);
  };

  const openTrace = (tab: TraceTabId = "records") => {
    if (!triageRun) {
      setToast(copy.technologyTraceRequiresRunToast);
      return;
    }
    setActiveTraceTab(tab);
    setTraceDrawerOpen(true);
  };

  const issueReferralVoucher = () => {
    if (!triageRun) {
      setToast(copy.technologyTraceRequiresRunToast);
      return;
    }
    setReferralVoucherIssued(true);
    setVoucherModalOpen(true);
    setToast(copy.referralIssued);
  };

  const copyReferralVoucherId = async () => {
    await navigator.clipboard?.writeText("RV-CHEN-2026-0429").catch(() => undefined);
    setToast(copy.voucherIdCopied);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-x-hidden px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-600">{copy.pageLabel}</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{copy.title}</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">{copy.subtitle}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {copy.decisionSupportOnly}
            </span>
          </div>
        </motion.div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">{copy.techStackTitle}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.techStack.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">{copy.careFlowTitle}</h2>
          <div className="mt-4 flex flex-wrap items-stretch gap-3">
            {copy.careFlow.map((node, index) => (
              <div key={`${node.label}-${index}`} className="flex min-w-[150px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{node.label}</p>
                  <p className="mt-1 text-xs font-semibold text-sky-600">{node.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{copy.patientInputTitle}</h2>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">{copy.caseSelector}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {CASE_SELECTOR_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleCaseChange(id)}
                    className={classNames(
                      "rounded-xl border px-3 py-3 text-left text-sm font-semibold transition",
                      activeCase === id
                        ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                    )}
                  >
                    {scenarioCases[id].label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={classNames(
                    "rounded-full border px-2.5 py-1 text-xs font-semibold",
                    activeCase === "custom"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  )}
                >
                  {copy.customInput}
                </span>
                <p className="min-w-[220px] flex-1 text-xs leading-5 text-slate-500">{copy.sampleOrCustomTip}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 md:grid-cols-2">
              <Field label={copy.patient} value={copy.patientName} />
              <Field label={copy.age} value={copy.ageValue} />
              <Field label={copy.location} value={copy.locationValue} />
              <Field label={copy.authorizedHistory} value={caseData.history} icon={<LockKeyhole className="h-4 w-4 text-emerald-700" />} />
              <Field label={copy.consentStatus} value={copy.consentActive} icon={<Check className="h-4 w-4 text-emerald-700" />} className="md:col-span-2" />
            </div>

            <label className="mt-5 grid gap-3 text-sm font-medium text-slate-700">
              {copy.describeSymptoms}
              <textarea
                value={symptoms}
                onChange={(event) => handleSymptomChange(event.target.value)}
                rows={8}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
            </label>

            <button type="button" onClick={runTriage} disabled={isRunningTriage} className="primary-button mt-5 h-12 disabled:cursor-not-allowed disabled:opacity-60">
              {isRunningTriage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isRunningTriage ? copy.runningTriage : copy.runAiTriage}
            </button>
          </section>

          <div className="grid min-w-0 gap-6">
            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{copy.livePipelineTitle}</h2>
              <div className="mt-4 grid gap-3">
                {pipelineSteps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{step.text}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-700">{step.tech}</span>
                        <span className={classNames("rounded-full border px-2.5 py-1 text-xs font-semibold", pipelineStatusClasses(step.tone))}>
                          {step.status}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-500">{step.preview}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{copy.recommendationOutputTitle}</h2>
                  <p className="mt-2 text-sm text-slate-500">{triageRun ? caseData.recommendation : copy.triageOutputPlaceholder}</p>
                </div>
                {triageRun ? (
                  <span className={classNames("rounded-full border px-3 py-1.5 text-sm font-semibold", riskClasses(caseData.riskTone))}>
                    {copy.riskLevel}: {caseData.risk}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-500">
                    {copy.waitingToRun}
                  </span>
                )}
              </div>

              {triageRun ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <InfoTile label={copy.recommendedDepartment} value={caseData.department} />
                    <InfoTile label={copy.recommendedHospital} value={caseData.hospital} />
                    <InfoTile label={copy.recommendedAction} value={caseData.action} />
                    <InfoTile label={copy.hospitalAvailabilityText} value={caseData.availability} />
                    <InfoTile label={copy.confidence} value={caseData.confidence} />
                    <InfoTile label={copy.humanReviewRequired} value={caseData.humanReview} />
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{copy.resultProof}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{caseData.resultProof}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {copy.triageResultHashed}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {copy.referralVoucherReady}
                      </span>
                      {referralVoucherIssued ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {copy.auditEvent}: REFERRAL_VOUCHER_ISSUED
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{copy.onchainProofDisclaimer}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-900">{copy.reasoningFactors}</p>
                    <div className="mt-3 grid gap-2">
                      {caseData.reasoningFactors.map((factor) => (
                        <p key={factor} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                          {factor}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-sky-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">{copy.triageOutputPlaceholder}</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={issueReferralVoucher}
                  disabled={!triageRun}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {copy.issueReferralVoucher}
                </button>
                <button
                  type="button"
                  onClick={() => openTrace("records")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  <GitBranch className="h-4 w-4" />
                  {copy.inspectTechnologyTrace}
                </button>
              </div>
              {referralVoucherIssued ? <p className="mt-3 text-sm font-semibold text-emerald-700">{copy.referralIssued}</p> : null}
            </section>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{copy.whyThisRecommendation}</h2>
            {triageRun ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [copy.symptomSeverity, caseData.risk],
                  [copy.duration, caseData.duration],
                  [copy.ageRisk, caseData.ageRisk],
                  [copy.authorizedHistory, caseData.history],
                  [copy.redFlags, caseData.redFlags],
                  [copy.hospitalCapacity, caseData.hospitalCapacity],
                  [copy.referralLogic, caseData.referralLogic]
                ].map(([label, value]) => (
                  <InfoTile key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                {copy.triageOutputPlaceholder}
              </p>
            )}
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{copy.medicalSafetyGuardrails}</h2>
            <div className="mt-4 grid gap-3">
              {copy.safetyItems.map((item) => (
                <p key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                  {item}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{copy.hospitalMatchingViaFhir}</h2>
            <p className="max-w-4xl text-sm leading-6 text-slate-500">{copy.hospitalMatchingSubtitle}</p>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            {caseData.hospitalMatches.map((hospital, index) => (
              <div
                key={`${displayCaseId}-${hospital.name}`}
                className={classNames(
                  "glass-card rounded-2xl p-5 transition",
                  triageRun && index === 0 ? "border-emerald-300 bg-emerald-50/40 shadow-md" : ""
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{hospital.name}</h3>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{hospital.badge}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                  <Metric label={copy.department} value={hospital.department} />
                  <Metric label={copy.availability} value={hospital.availability} />
                  <Metric label={copy.queue} value={hospital.queue} />
                  <Metric label={copy.bedCapacity} value={hospital.bedCapacity} />
                  <Metric label={copy.distance} value={hospital.distance} />
                  <Metric label={copy.fhirStatus} value={hospital.fhirStatus} />
                  {hospital.reason ? <Metric label={copy.reason} value={hospital.reason} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {traceDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm">
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">MEDIROUTE</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.technologyTrace}</h2>
              </div>
              <button
                type="button"
                onClick={() => setTraceDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-300 hover:text-sky-700"
                aria-label={copy.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {TRACE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTraceTab(tab)}
                  className={classNames(
                    "rounded-full border px-3 py-2 text-sm font-semibold transition",
                    activeTraceTab === tab
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  )}
                >
                  {copy.traceTabs[tab]}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-600">{copy.traceDescriptions[activeTraceTab]}</p>
              <pre className="mt-5 max-h-[460px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-sky-100">
                {JSON.stringify(tracePayload, null, 2)}
              </pre>
            </div>
          </motion.aside>
        </div>
      ) : null}

      {voucherModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">MEDIROUTE</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.referralVoucherGenerated}</h2>
              </div>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-300 hover:text-sky-700"
                aria-label={copy.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile label={copy.voucherId} value="RV-CHEN-2026-0429" />
              <InfoTile label={copy.patient} value={copy.patientName} />
              <InfoTile label={copy.recommendedHospital} value={caseData.hospital} />
              <InfoTile label={copy.department} value={caseData.department} />
              <InfoTile label={copy.priority} value={caseData.action} />
              <InfoTile label={copy.validity} value={copy.voucherValidityValue} />
              <InfoTile label={copy.resultProof} value="0x8f7a2b91e3c4d57f..." />
              <InfoTile label={copy.auditEvent} value="REFERRAL_VOUCHER_ISSUED" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyReferralVoucherId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                <ClipboardCheck className="h-4 w-4" />
                {copy.copyVoucherId}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoucherModalOpen(false);
                  openTrace("chaincode");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
              >
                <GitBranch className="h-4 w-4" />
                {copy.inspectTechnologyTrace}
              </button>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                {copy.close}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 right-6 z-[60] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toast}</span>
        </div>
      ) : null}

      <div className="fixed bottom-6 left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700 shadow-lg lg:block">
        {copy.decisionSupportOnly}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  className
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames("rounded-xl border border-emerald-100 bg-white/80 p-3", className)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
