"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  BadgeCheck,
  Braces,
  CheckCircle2,
  Database,
  Eye,
  FileCheck2,
  FileLock2,
  History,
  KeyRound,
  ScrollText,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  Unlock,
  X,
  XCircle
} from "lucide-react";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type ConsentStatus = "No Active Access" | "Pending" | "Granted" | "Revoked";
type DemoRole = "patientWalletDemo" | "doctorPortal" | "hospitalAdmin" | "regulator" | "developerDemo";

type MedicalRecord = {
  id: string;
  type: string;
  hospital: string;
  date: string;
  encryption: string;
  ipfsCid: string;
  hash: string;
  consentStatus: ConsentStatus;
  authorizedTo: string;
  purposeKey: string;
  expiryKey: string;
  requestingInstitution: string;
  scopeKey: string;
};

type AccessLog = {
  id: string;
  time: string;
  actor: string;
  action: string;
  txHash: string;
  status: "Confirmed" | "Verified";
  recordId?: string;
};

const roleOptions: DemoRole[] = [
  "patientWalletDemo",
  "doctorPortal",
  "hospitalAdmin",
  "regulator",
  "developerDemo"
];

const initialRecords: MedicalRecord[] = [
  {
    id: "rec-blood",
    type: "Blood Test",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-11",
    encryption: "AES-256",
    ipfsCid: "bafkrei9c1f2a6b7e22a8b0c4d2fae791",
    hash: "0x61d4b02a8a88c30d95d28bc2d8e23ad8a12e9106629fd723a0f6edba8fa0f901",
    consentStatus: "Granted",
    authorizedTo: "westchina-cardiology-dr-li",
    purposeKey: "mc_purpose_referral_review",
    expiryKey: "mc_72h_left",
    requestingInstitution: "West China Hospital, Sichuan University",
    scopeKey: "mc_scope_blood"
  },
  {
    id: "rec-xray",
    type: "Chest X-ray",
    hospital: "Chengdu Second People's Hospital",
    date: "2026-04-13",
    encryption: "AES-256",
    ipfsCid: "bafkreib63a0d89f20e9f0134fd0cc9e2",
    hash: "0xaa8030cf81708d7bf188ee0d410db671a3e8d9db557a55033c19e0c9fb17e665",
    consentStatus: "Pending",
    authorizedTo: "",
    purposeKey: "mc_purpose_referral_review",
    expiryKey: "mc_requested_72h",
    requestingInstitution: "Chengdu Second People's Hospital",
    scopeKey: "mc_scope_xray"
  },
  {
    id: "rec-rx",
    type: "Prescription History",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-15",
    encryption: "AES-256",
    ipfsCid: "bafkreif12a35f21c7ac98d45cc651b72",
    hash: "0x1db615008e28922a4684f827d8ca42a75920bb102cbd828aee93cc42d358693b",
    consentStatus: "Revoked",
    authorizedTo: "westchina-pharmacy-review",
    purposeKey: "mc_purpose_medication_review",
    expiryKey: "mc_expired",
    requestingInstitution: "West China Hospital, Sichuan University",
    scopeKey: "mc_scope_selected_records"
  },
  {
    id: "rec-allergy",
    type: "Allergy Record",
    hospital: "Chengdu Second People's Hospital",
    date: "2026-04-18",
    encryption: "AES-256",
    ipfsCid: "bafkreia3d3c549de92324804ec97b830",
    hash: "0xf5516924807b1a35e73fb67699c122a818908a60f0915a7a37f89d160da07d5c",
    consentStatus: "No Active Access",
    authorizedTo: "",
    purposeKey: "mc_purpose_allergy_safe",
    expiryKey: "mc_not_shared",
    requestingInstitution: "",
    scopeKey: "mc_scope_allergy"
  },
  {
    id: "rec-chronic",
    type: "Chronic Disease Summary",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-21",
    encryption: "AES-256",
    ipfsCid: "bafkreibcb38fc62a020fdf1ef8e3cc22",
    hash: "0x86caa4b0e74a88f10ab8aefb1039ec42f11e8086a8f25962f39de4f3ecb0bbda",
    consentStatus: "Pending",
    authorizedTo: "",
    purposeKey: "mc_purpose_followup",
    expiryKey: "mc_requested_7d",
    requestingInstitution: "Chengdu Jinjiang District Community Health Center",
    scopeKey: "mc_scope_selected_records"
  }
];

const initialLogs: AccessLog[] = [
  {
    id: "log-1",
    time: "09:12:44",
    actor: "West China Hospital, Sichuan University",
    action: "RECORD_HASH_ANCHORED",
    txHash: "0xa2d8e1169348c70a7a3f87d8af808cb1262afbd03991564cb61eefa012c2f9ea",
    status: "Verified",
    recordId: "rec-blood"
  },
  {
    id: "log-2",
    time: "09:16:07",
    actor: "Patient DID Wallet",
    action: "GRANT_ACCESS",
    txHash: "0x356cad3e272a90be119fef4d75a780a15a3beec587bf10c32b8bf54d86c0a3b0",
    status: "Confirmed",
    recordId: "rec-blood"
  }
];

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function compactHash(value: string) {
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function isChineseLanguage(language: string) {
  return language === "zh-CN" || language === "zh-TW";
}

function isKoreanLanguage(language: string) {
  return language === "ko";
}

function statusClass(status: ConsentStatus) {
  if (status === "Granted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Revoked") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function displayRecordType(type: string, showChinese: boolean, showKorean = false) {
  const chineseLabels: Record<string, string> = {
    "Blood Test": "血液检查",
    "Chest X-ray": "胸部X光",
    "Prescription History": "处方记录",
    "Allergy Record": "过敏记录",
    "Chronic Disease Summary": "慢病摘要"
  };

  const koreanLabels: Record<string, string> = {
    "Blood Test": "혈액검사",
    "Chest X-ray": "흉부 X-ray",
    "Prescription History": "처방 기록",
    "Allergy Record": "알레르기 기록",
    "Chronic Disease Summary": "만성질환 요약"
  };

  if (showKorean) {
    return koreanLabels[type] ?? type;
  }

  return showChinese ? chineseLabels[type] ?? type : type;
}

function displayHospitalName(name: string, showChinese: boolean, showKorean = false) {
  if (!name) {
    return "";
  }

  if (name.includes("West China")) {
    return showKorean ? "쓰촨대학교 화시병원" : showChinese ? "华西医院" : name;
  }

  if (name.includes("Second People's")) {
    return showKorean ? "청두시 제2인민병원" : showChinese ? "成都市第二人民医院" : name;
  }

  if (name.includes("Jinjiang")) {
    return showKorean ? "청두 진장구 지역사회보건센터" : showChinese ? "成都市锦江区社区卫生服务中心" : name;
  }

  return name;
}

function displayProviderName(provider: string, showChinese: boolean, showKorean: boolean, translate: (key: string) => string) {
  if (!provider) {
    return translate("mc_not_shared");
  }

  const labels: Record<string, { en: string; zh: string; ko: string }> = {
    "westchina-cardiology-dr-li": {
      en: "Dr. Li, West China Cardiology",
      zh: "华西医院心内科李医生",
      ko: "화시병원 심장내과 리 의사"
    },
    "westchina-pharmacy-review": {
      en: "West China Pharmacy Review",
      zh: "华西医院药学审方团队",
      ko: "화시병원 약제 검토팀"
    },
    "westchina-referral-review": {
      en: "West China Hospital, Sichuan University",
      zh: "华西医院",
      ko: "쓰촨대학교 화시병원"
    },
    "jinjiang-primary-care": {
      en: "Chengdu Jinjiang District Community Health Center",
      zh: "成都市锦江区社区卫生服务中心",
      ko: "청두 진장구 지역사회보건센터"
    }
  };

  const label = labels[provider];
  if (!label) {
    return provider;
  }

  return showKorean ? label.ko : showChinese ? label.zh : label.en;
}

function displayConsentStatus(status: ConsentStatus, translate: (key: string) => string) {
  const labels: Record<ConsentStatus, string> = {
    "No Active Access": translate("mc_no_active_access"),
    Pending: translate("mc_status_pending"),
    Granted: translate("mc_status_granted"),
    Revoked: translate("mc_status_revoked")
  };

  return labels[status];
}

function displayActor(actor: string, showChinese: boolean, showKorean: boolean) {
  if (actor === "Patient DID Wallet") {
    return showKorean ? "환자 DID 지갑" : showChinese ? "患者 DID 钱包" : actor;
  }

  if (actor === "Smart Contract / Chaincode") {
    return showKorean ? "스마트 계약 / 체인코드" : showChinese ? "智能合约 / Chaincode" : actor;
  }

  return displayHospitalName(actor, showChinese, showKorean);
}

function displayAuditEvent(action: string, showChinese: boolean, showKorean: boolean) {
  const labels: Record<string, { zh: string; ko: string }> = {
    RECORD_HASH_ANCHORED: { zh: "病历哈希已写入链上证明", ko: "의료기록 해시가 온체인 증명으로 기록됨" },
    GRANT_ACCESS: { zh: "患者授权访问", ko: "환자가 접근 권한 부여" },
    ACCESS_LOGGED: { zh: "访问事件已记录", ko: "접근 이벤트 기록됨" },
    REVOKE_ACCESS: { zh: "患者撤销授权", ko: "환자가 동의 철회" },
    REQUEST_REJECTED: { zh: "患者拒绝访问请求", ko: "환자가 접근 요청 거절" },
    RECORD_METADATA_UPDATED: { zh: "病历元数据已更新", ko: "의료기록 메타데이터 업데이트됨" },
    MOCK_API_INSPECTED: { zh: "模拟 API 已查看", ko: "모의 API 확인됨" }
  };

  if (showKorean) {
    return labels[action]?.ko ?? action;
  }

  return showChinese ? labels[action]?.zh ?? action : action;
}

export default function MediChainPage() {
  const { language, t } = useLanguage();
  const showChinese = isChineseLanguage(language);
  const showKorean = isKoreanLanguage(language);
  const [currentRole, setCurrentRole] = useState<DemoRole>("patientWalletDemo");
  const [records, setRecords] = useState(initialRecords);
  const [accessLogs, setAccessLogs] = useState(initialLogs);
  const [consentRecord, setConsentRecord] = useState<MedicalRecord | null>(null);
  const [traceRecord, setTraceRecord] = useState<MedicalRecord | null>(null);
  const [auditRecord, setAuditRecord] = useState<MedicalRecord | null>(null);
  const [reviewRecord, setReviewRecord] = useState<MedicalRecord | null>(null);
  const [revokeRecord, setRevokeRecord] = useState<MedicalRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("westchina-cardiology-dr-li");
  const [selectedDepartment, setSelectedDepartment] = useState("Cardiology");
  const [selectedScope, setSelectedScope] = useState("mc_scope_blood");
  const [selectedPurpose, setSelectedPurpose] = useState("mc_purpose_referral_review");
  const [selectedDuration, setSelectedDuration] = useState("mc_duration_72h");

  const connectedHospitals = showKorean
    ? "쓰촨대학교 화시병원; 청두시 제2인민병원"
    : showChinese
    ? "华西医院；成都市第二人民医院"
    : "West China Hospital, Sichuan University; Chengdu Second People's Hospital";

  const addLog = (record: MedicalRecord, action: string, actor = "Patient DID Wallet", txHash = generateTxHash(`${action}:${record.id}:${Date.now()}`)) => {
    setAccessLogs((current) => [
      {
        id: `log-${Date.now()}`,
        time: nowTime(),
        actor,
        action,
        txHash,
        status: "Confirmed",
        recordId: record.id
      },
      ...current
    ]);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const openConsentModal = (record: MedicalRecord) => {
    setConsentRecord(record);
    setSelectedProvider(record.authorizedTo || "westchina-cardiology-dr-li");
    setSelectedScope(record.scopeKey || "mc_scope_blood");
    setSelectedPurpose(record.purposeKey || "mc_purpose_referral_review");
    setSelectedDuration(record.expiryKey === "mc_7d_left" ? "mc_duration_7d" : "mc_duration_72h");
  };

  const confirmAuthorization = () => {
    if (!consentRecord) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === consentRecord.id
          ? {
              ...record,
              consentStatus: "Granted",
              authorizedTo: selectedProvider,
              purposeKey: selectedPurpose,
              expiryKey: selectedDuration === "mc_duration_24h" ? "mc_24h_left" : selectedDuration === "mc_duration_7d" ? "mc_7d_left" : "mc_72h_left",
              requestingInstitution: selectedProvider.includes("jinjiang")
                ? "Chengdu Jinjiang District Community Health Center"
                : "West China Hospital, Sichuan University",
              scopeKey: selectedScope
            }
          : record
      )
    );
    addLog(consentRecord, "GRANT_ACCESS");
    setConsentRecord(null);
    setReviewRecord(null);
    showToast(t("mc_authorization_recorded"));
  };

  const confirmRevoke = () => {
    if (!revokeRecord) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === revokeRecord.id
          ? { ...record, consentStatus: "Revoked", expiryKey: "mc_expired" }
          : record
      )
    );
    addLog(revokeRecord, "REVOKE_ACCESS");
    setRevokeRecord(null);
    showToast(t("mc_consent_revoked"));
  };

  const rejectRequest = (record: MedicalRecord) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? { ...item, consentStatus: "No Active Access", authorizedTo: "", expiryKey: "mc_not_shared", requestingInstitution: "" }
          : item
      )
    );
    addLog(record, "REQUEST_REJECTED");
    setReviewRecord(null);
    showToast(t("mc_request_rejected"));
  };

  const handleUtilityAction = (record: MedicalRecord, action: string, toastKey: string, actor = "Smart Contract / Chaincode") => {
    addLog(record, action, actor);
    showToast(t(toastKey));
  };

  const getRoleActions = (record: MedicalRecord) => {
    if (currentRole === "doctorPortal") {
      return [
        {
          key: "request",
          label: t("mc_request_access"),
          icon: ShieldQuestion,
          onClick: () => handleUtilityAction(record, "ACCESS_LOGGED", "mc_request_access_toast")
        },
        ...(record.consentStatus === "Granted"
          ? [
              {
                key: "open",
                label: t("mc_open_authorized_record"),
                icon: Eye,
                onClick: () => handleUtilityAction(record, "ACCESS_LOGGED", "mc_open_authorized_toast")
              }
            ]
          : []),
        {
          key: "verify",
          label: t("mc_verify_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        }
      ];
    }

    if (currentRole === "hospitalAdmin") {
      return [
        {
          key: "issue",
          label: t("mc_issue_record"),
          icon: FileCheck2,
          onClick: () => handleUtilityAction(record, "RECORD_METADATA_UPDATED", "mc_issue_record_toast", record.hospital)
        },
        {
          key: "anchor",
          label: t("mc_anchor_hash"),
          icon: Database,
          onClick: () => handleUtilityAction(record, "RECORD_HASH_ANCHORED", "mc_anchor_hash_toast", record.hospital)
        },
        {
          key: "metadata",
          label: t("mc_update_metadata"),
          icon: SlidersHorizontal,
          onClick: () => handleUtilityAction(record, "RECORD_METADATA_UPDATED", "mc_metadata_toast", record.hospital)
        },
        {
          key: "verify",
          label: t("mc_verify_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        }
      ];
    }

    if (currentRole === "regulator") {
      return [
        {
          key: "audit",
          label: t("mc_view_audit_log"),
          icon: History,
          onClick: () => setAuditRecord(record)
        },
        {
          key: "compliance",
          label: t("mc_verify_compliance_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        }
      ];
    }

    if (currentRole === "developerDemo") {
      return [
        {
          key: "api",
          label: t("mc_inspect_mock_api"),
          icon: Braces,
          onClick: () => handleUtilityAction(record, "MOCK_API_INSPECTED", "mc_mock_api_toast")
        },
        {
          key: "event",
          label: t("mc_view_chaincode_event"),
          icon: ScrollText,
          onClick: () => setTraceRecord(record)
        },
        {
          key: "simulation",
          label: t("mc_run_simulation"),
          icon: Database,
          onClick: () => handleUtilityAction(record, "ACCESS_LOGGED", "mc_run_simulation_toast")
        }
      ];
    }

    if (record.consentStatus === "No Active Access") {
      return [
        {
          key: "authorize",
          label: t("mc_authorize_provider"),
          icon: Unlock,
          onClick: () => openConsentModal(record)
        },
        {
          key: "verify",
          label: t("mc_verify_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        }
      ];
    }

    if (record.consentStatus === "Pending") {
      return [
        {
          key: "review",
          label: t("mc_review_request"),
          icon: ShieldQuestion,
          onClick: () => setReviewRecord(record)
        },
        {
          key: "reject",
          label: t("mc_reject_request"),
          icon: XCircle,
          onClick: () => rejectRequest(record)
        },
        {
          key: "verify",
          label: t("mc_verify_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        }
      ];
    }

    if (record.consentStatus === "Granted") {
      return [
        {
          key: "manage",
          label: t("mc_manage_consent"),
          icon: SlidersHorizontal,
          onClick: () => openConsentModal(record)
        },
        {
          key: "revoke",
          label: t("mc_revoke_consent"),
          icon: KeyRound,
          onClick: () => setRevokeRecord(record)
        },
        {
          key: "verify",
          label: t("mc_verify_proof"),
          icon: ShieldCheck,
          onClick: () => setTraceRecord(record)
        },
        {
          key: "audit",
          label: t("mc_view_audit_trail"),
          icon: History,
          onClick: () => setAuditRecord(record)
        }
      ];
    }

    return [
      {
        key: "audit",
        label: t("mc_view_audit_trail"),
        icon: History,
        onClick: () => setAuditRecord(record)
      },
      {
        key: "verify",
        label: t("mc_verify_proof"),
        icon: ShieldCheck,
        onClick: () => setTraceRecord(record)
      }
    ];
  };

  const technologyStack = [
    { title: "Hyperledger Fabric", description: t("mc_tech_hyperledger_desc") },
    { title: "IPFS + AES-256", description: t("mc_tech_ipfs_desc") },
    { title: "Smart Contract / Chaincode", description: t("mc_tech_chaincode_desc") },
    { title: "DID Wallet", description: t("mc_tech_did_desc") },
    { title: "On-chain Audit", description: t("mc_tech_audit_desc") }
  ];

  const chainItems = [
    t("mc_chain_record_hash"),
    t("mc_chain_consent_scope"),
    t("mc_chain_tx_id"),
    t("mc_chain_access_timestamp"),
    t("mc_chain_audit_log")
  ];

  const offChainItems = [
    t("mc_offchain_ct_images"),
    t("mc_offchain_lab_reports"),
    t("mc_offchain_prescription_text"),
    t("mc_offchain_identifiable_content"),
    t("mc_offchain_full_documents")
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("page.medichain")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("medichain_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{t("medichain_description")}</p>
        </motion.div>

        <section className="glass-card mb-6 rounded-2xl border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-emerald-50/80 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:flex-1">
              <InfoRow label={t("mc_current_role")} value={t(`mc_role_${currentRole}`)} tone="blue" />
              <InfoRow label={t("mc_demo_patient")} value={showChinese ? "陈女士" : "Ms. Chen"} />
              <InfoRow label="DID" value="did:medlink:patient:CN-2038-8841" />
            </div>
            <div className="w-full lg:w-72">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="role-switcher">
                {t("mc_demo_role")}
              </label>
              <select
                id="role-switcher"
                value={currentRole}
                onChange={(event) => setCurrentRole(event.target.value as DemoRole)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {t(`mc_role_${role}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            {t("mc_demo_mode_note")}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.42fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 content-start gap-6">
            <section className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{t("patient_did")}</p>
                  <h2 className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-semibold leading-6 text-slate-900 break-all">
                    did:medlink:patient:CN-2038-8841
                  </h2>
                </div>
                <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-700" />
              </div>
              <div className="mt-5 grid gap-3">
                <InfoRow label={t("verification_status")} value={`${t("verified")} ✓`} tone="green" />
                <InfoRow label={t("private_key_note")} value={t("private_key_note_value")} />
                <InfoRow label={t("connected_hospitals")} value={connectedHospitals} />
              </div>
            </section>

            <section className="glass-card overflow-hidden rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("encryption_status")}</h2>
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center text-sky-700"
                >
                  <FileLock2 className="h-12 w-12" />
                  <p className="mt-3 text-sm font-semibold">{t("encrypted_file")}</p>
                </motion.div>

                <ArrowDown className="h-6 w-6 text-sky-600" />

                <motion.div
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="w-full max-w-xs rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center"
                >
                  <p className="font-mono text-sm font-semibold text-emerald-700">0x9FA3...C21B</p>
                  <p className="mt-2 text-xs font-medium text-slate-600">{t("record_integrity_hash")}</p>
                </motion.div>

                <ArrowDown className="h-6 w-6 text-sky-600" />

                <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center text-sky-700">
                  <Database className="h-12 w-12" />
                  <p className="mt-3 text-sm font-semibold">{t("blockchain_node")}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid min-w-0 gap-6">
            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("mc_technology_stack_title")}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {technologyStack.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("mc_boundary_title")}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <BoundaryList title={t("mc_on_chain")} items={chainItems} tone="sky" />
                <BoundaryList title={t("mc_off_chain")} items={offChainItems} tone="emerald" />
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                {t("mc_boundary_note")}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("medical_records")}</h2>
              <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1720px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="w-32 whitespace-nowrap px-4 py-4 font-medium">{t("type")}</th>
                      <th className="w-52 whitespace-nowrap px-4 py-4 font-medium">{t("hospital")}</th>
                      <th className="w-32 whitespace-nowrap px-4 py-4 font-medium">{t("date")}</th>
                      <th className="w-28 whitespace-nowrap px-4 py-4 font-medium">{t("encryption")}</th>
                      <th className="w-64 whitespace-nowrap px-4 py-4 font-medium">IPFS CID</th>
                      <th className="w-44 whitespace-nowrap px-4 py-4 font-medium">{t("mc_on_chain_hash")}</th>
                      <th className="w-36 whitespace-nowrap px-4 py-4 font-medium">{t("consent_status")}</th>
                      <th className="w-56 whitespace-nowrap px-4 py-4 font-medium">{t("mc_authorized_to")}</th>
                      <th className="w-44 whitespace-nowrap px-4 py-4 font-medium">{t("mc_purpose")}</th>
                      <th className="w-36 whitespace-nowrap px-4 py-4 font-medium">{t("mc_expiry")}</th>
                      <th className="w-56 whitespace-nowrap px-4 py-4 font-medium">{t("mc_requesting_institution")}</th>
                      <th className="min-w-[260px] px-4 py-4 font-medium">{t("mc_patient_consent_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-t border-slate-200 text-sm text-slate-600">
                        <td className="px-4 py-4 font-medium text-slate-900">{displayRecordType(record.type, showChinese, showKorean)}</td>
                        <td className="px-4 py-4 leading-6">{displayHospitalName(record.hospital, showChinese, showKorean)}</td>
                        <td className="whitespace-nowrap px-4 py-4">{record.date}</td>
                        <td className="whitespace-nowrap px-4 py-4">{record.encryption}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{record.ipfsCid}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{compactHash(record.hash)}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(record.consentStatus)}`}>
                            {displayConsentStatus(record.consentStatus, t)}
                          </span>
                        </td>
                        <td className="px-4 py-4 leading-6">{displayProviderName(record.authorizedTo, showChinese, showKorean, t)}</td>
                        <td className="px-4 py-4 leading-6">{t(record.purposeKey)}</td>
                        <td className="whitespace-nowrap px-4 py-4">{t(record.expiryKey)}</td>
                        <td className="px-4 py-4 leading-6">{record.requestingInstitution ? displayHospitalName(record.requestingInstitution, showChinese, showKorean) : t("mc_no_active_request")}</td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-[240px] flex-wrap gap-2">
                            {getRoleActions(record).map((action) => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={action.key}
                                  type="button"
                                  onClick={action.onClick}
                                  className="glass-button min-h-9 justify-center whitespace-nowrap px-3 py-1.5 text-xs"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("recent_access_events")}</h2>
              <div className="mt-4 grid gap-3">
                {accessLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-sm font-medium text-slate-900">{displayAuditEvent(log.action, showChinese, showKorean)}</p>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                        {log.status === "Confirmed" ? t("confirmed") : t("verified")}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-xs text-slate-500">
                      {log.time} · {displayActor(log.actor, showChinese, showKorean)} · {compactHash(log.txHash)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-slate-900">{t("mc_role_logic_title")}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {["patient", "doctor", "hospital", "regulator", "developer"].map((role) => (
                  <div key={role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{t(`mc_role_logic_${role}_title`)}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">{t(`mc_role_logic_${role}`)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                {t("mc_role_logic_note")}
              </p>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {consentRecord ? (
          <Modal onClose={() => setConsentRecord(null)} title={t("mc_authorization_modal_title")}>
            <div className="grid gap-4">
              <SelectRow label={t("mc_provider_institution")} value={selectedProvider} onChange={setSelectedProvider}>
                <option value="westchina-cardiology-dr-li">{displayProviderName("westchina-cardiology-dr-li", showChinese, showKorean, t)}</option>
                <option value="westchina-referral-review">{displayProviderName("westchina-referral-review", showChinese, showKorean, t)}</option>
                <option value="jinjiang-primary-care">{displayProviderName("jinjiang-primary-care", showChinese, showKorean, t)}</option>
              </SelectRow>
              <SelectRow label={t("department")} value={selectedDepartment} onChange={setSelectedDepartment}>
                <option value="Cardiology">{showKorean ? "심장내과" : showChinese ? "心内科" : "Cardiology"}</option>
                <option value="Respiratory">{showKorean ? "호흡기내과" : showChinese ? "呼吸科" : "Respiratory"}</option>
                <option value="General Practice">{showKorean ? "일반 외래" : showChinese ? "全科 / 普通门诊" : "General Practice"}</option>
              </SelectRow>
              <SelectRow label={t("mc_record_scope")} value={selectedScope} onChange={setSelectedScope}>
                <option value="mc_scope_blood">{t("mc_scope_blood")}</option>
                <option value="mc_scope_xray">{t("mc_scope_xray")}</option>
                <option value="mc_scope_selected_records">{t("mc_scope_selected_records")}</option>
              </SelectRow>
              <SelectRow label={t("mc_purpose")} value={selectedPurpose} onChange={setSelectedPurpose}>
                <option value="mc_purpose_referral_review">{t("mc_purpose_referral_review")}</option>
                <option value="mc_purpose_followup">{t("mc_purpose_followup")}</option>
                <option value="mc_purpose_medication_review">{t("mc_purpose_medication_review")}</option>
              </SelectRow>
              <SelectRow label={t("duration")} value={selectedDuration} onChange={setSelectedDuration}>
                <option value="mc_duration_24h">{t("mc_duration_24h")}</option>
                <option value="mc_duration_72h">{t("mc_duration_72h")}</option>
                <option value="mc_duration_7d">{t("mc_duration_7d")}</option>
              </SelectRow>
              <button type="button" onClick={confirmAuthorization} className="primary-button h-12 w-full">
                <ShieldCheck className="h-4 w-4" />
                {t("mc_confirm_authorization")}
              </button>
            </div>
          </Modal>
        ) : null}

        {reviewRecord ? (
          <Modal onClose={() => setReviewRecord(null)} title={t("mc_request_detail_title")}>
            <div className="grid gap-3">
              <InfoRow label={t("mc_requesting_institution")} value={displayHospitalName(reviewRecord.requestingInstitution, showChinese, showKorean)} />
              <InfoRow label={t("mc_purpose")} value={t(reviewRecord.purposeKey)} />
              <InfoRow label={t("mc_requested_scope")} value={t(reviewRecord.scopeKey)} />
              <InfoRow label={t("mc_requested_duration")} value={t(reviewRecord.expiryKey)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setReviewRecord(null);
                    openConsentModal(reviewRecord);
                  }}
                  className="primary-button h-12"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t("mc_approve_request")}
                </button>
                <button type="button" onClick={() => rejectRequest(reviewRecord)} className="glass-button h-12 justify-center text-red-700">
                  <XCircle className="h-4 w-4" />
                  {t("mc_reject_request")}
                </button>
              </div>
            </div>
          </Modal>
        ) : null}

        {revokeRecord ? (
          <Modal onClose={() => setRevokeRecord(null)} title={t("mc_revoke_confirm_title")}>
            <div className="space-y-4">
              <p className="text-sm leading-7 text-slate-600">{t("mc_revoke_confirm_text")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={confirmRevoke} className="primary-button h-12 bg-red-600 hover:bg-red-700">
                  <KeyRound className="h-4 w-4" />
                  {t("mc_revoke_consent")}
                </button>
                <button type="button" onClick={() => setRevokeRecord(null)} className="glass-button h-12 justify-center">
                  {t("cancel")}
                </button>
              </div>
            </div>
          </Modal>
        ) : null}

        {auditRecord ? (
          <Modal onClose={() => setAuditRecord(null)} title={t("mc_view_audit_trail")}>
            <div className="grid gap-3">
              {accessLogs
                .filter((log) => log.recordId === auditRecord.id)
                .map((log) => (
                  <InfoRow
                    key={log.id}
                    label={`${log.time} · ${displayActor(log.actor, showChinese, showKorean)}`}
                    value={`${displayAuditEvent(log.action, showChinese, showKorean)} · ${compactHash(log.txHash)}`}
                  />
                ))}
              {accessLogs.filter((log) => log.recordId === auditRecord.id).length === 0 ? (
                <InfoRow label={t("mc_audit_log_title")} value={t("mc_no_audit_events")} />
              ) : null}
            </div>
          </Modal>
        ) : null}

        {traceRecord ? (
          <TraceDrawer
            record={traceRecord}
            showChinese={showChinese}
            showKorean={showKorean}
            t={t}
            onClose={() => setTraceRecord(null)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-medium text-emerald-700 shadow-2xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function BoundaryList({ title, items, tone }: { title: string; items: string[]; tone: "sky" | "emerald" }) {
  const toneClass = tone === "sky" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraceDrawer({
  record,
  showChinese,
  showKorean,
  t,
  onClose
}: {
  record: MedicalRecord;
  showChinese: boolean;
  showKorean: boolean;
  t: (key: string) => string;
  onClose: () => void;
}) {
  const traceItems = [
    {
      title: "AES-256 Encryption",
      body: t("mc_trace_aes_desc")
    },
    {
      title: "IPFS Off-chain Storage",
      body: `${t("mc_trace_ipfs_desc")} ${t("mc_cid")}: ${record.ipfsCid}`
    },
    {
      title: "Hyperledger Fabric",
      body: `${t("mc_trace_fabric_desc")} ${t("channel")}: medical-record-channel · ${t("mc_block")}: #1027 · ${t("tx_hash")}: 0x944b5e28...`
    },
    {
      title: "Smart Contract / Chaincode",
      body: `${t("mc_trace_chaincode_desc")} ${t("mc_scope")}: ${t(record.scopeKey)} · ${t("mc_purpose")}: ${t(record.purposeKey)} · ${t("mc_expiry")}: ${t(record.expiryKey)} · ${t("mc_revocation")}: ${t("mc_revocation_anytime")}`
    },
    {
      title: "DID Consent Signature",
      body: `${t("mc_trace_did_desc")} did:medlink:patient:CN-2038-8841`
    },
    {
      title: "Audit Log",
      body: `${t("mc_trace_audit_desc")} RECORD_HASH_ANCHORED · GRANT_ACCESS · ACCESS_LOGGED · REVOKE_ACCESS`
    }
  ];

  const mockJson = `{
  "channel": "medical-record-channel",
  "event": "GRANT_ACCESS",
  "patientDID": "did:medlink:patient:CN-2038-8841",
  "providerID": "westchina-cardiology-dr-li",
  "recordHash": "${compactHash(record.hash)}",
  "scope": ["${displayRecordType(record.type, showChinese, showKorean)}"],
  "purpose": "${t(record.purposeKey)}",
  "expiresIn": "72h",
  "txHash": "0x944b5e28..."
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/30"
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">{t("mc_verify_proof")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("mc_technology_trace")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {displayRecordType(record.type, showChinese, showKorean)} · {displayHospitalName(record.hospital, showChinese, showKorean)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {traceItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>

        <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-sky-100">
          <code>{mockJson}</code>
        </pre>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          {t("mc_mock_data_only")}
        </p>
      </motion.aside>
    </motion.div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      >
        {children}
      </select>
    </label>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: "green" | "blue" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-medium ${tone === "green" ? "text-emerald-700" : tone === "blue" ? "text-sky-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
