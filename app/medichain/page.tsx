"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  BadgeCheck,
  Database,
  Eye,
  FileLock2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Unlock,
  X
} from "lucide-react";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type AccessStatus = "Granted" | "Revoked" | "Pending";

type MedicalRecord = {
  id: string;
  type: string;
  hospital: string;
  date: string;
  encryption: string;
  ipfsCid: string;
  hash: string;
  accessStatus: AccessStatus;
};

type AccessLog = {
  id: string;
  time: string;
  actor: string;
  action: string;
  txHash: string;
  status: "Confirmed" | "Verified";
};

const initialRecords: MedicalRecord[] = [
  {
    id: "rec-blood",
    type: "Blood Test",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-11",
    encryption: "AES-256",
    ipfsCid: "bafkrei9c1f2a6b7e22a8b0c4d2fae791",
    hash: "0x61d4b02a8a88c30d95d28bc2d8e23ad8a12e9106629fd723a0f6edba8fa0f901",
    accessStatus: "Granted"
  },
  {
    id: "rec-xray",
    type: "Chest X-ray",
    hospital: "Chengdu Second People's Hospital",
    date: "2026-04-13",
    encryption: "AES-256",
    ipfsCid: "bafkreib63a0d89f20e9f0134fd0cc9e2",
    hash: "0xaa8030cf81708d7bf188ee0d410db671a3e8d9db557a55033c19e0c9fb17e665",
    accessStatus: "Pending"
  },
  {
    id: "rec-rx",
    type: "Prescription History",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-15",
    encryption: "AES-256",
    ipfsCid: "bafkreif12a35f21c7ac98d45cc651b72",
    hash: "0x1db615008e28922a4684f827d8ca42a75920bb102cbd828aee93cc42d358693b",
    accessStatus: "Revoked"
  },
  {
    id: "rec-allergy",
    type: "Allergy Record",
    hospital: "Chengdu Second People's Hospital",
    date: "2026-04-18",
    encryption: "AES-256",
    ipfsCid: "bafkreia3d3c549de92324804ec97b830",
    hash: "0xf5516924807b1a35e73fb67699c122a818908a60f0915a7a37f89d160da07d5c",
    accessStatus: "Granted"
  },
  {
    id: "rec-chronic",
    type: "Chronic Disease Summary",
    hospital: "West China Hospital, Sichuan University",
    date: "2026-04-21",
    encryption: "AES-256",
    ipfsCid: "bafkreibcb38fc62a020fdf1ef8e3cc22",
    hash: "0x86caa4b0e74a88f10ab8aefb1039ec42f11e8086a8f25962f39de4f3ecb0bbda",
    accessStatus: "Pending"
  }
];

const initialLogs: AccessLog[] = [
  {
    id: "log-1",
    time: "09:12:44",
    actor: "MediRoute AI",
    action: "Read Allergy Record",
    txHash: "0xa2d8e1169348c70a7a3f87d8af808cb1262afbd03991564cb61eefa012c2f9ea",
    status: "Verified"
  },
  {
    id: "log-2",
    time: "09:16:07",
    actor: "West China Hospital, Sichuan University",
    action: "Anchored Blood Test hash",
    txHash: "0x356cad3e272a90be119fef4d75a780a15a3beec587bf10c32b8bf54d86c0a3b0",
    status: "Confirmed"
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

function statusClass(status: AccessStatus) {
  if (status === "Granted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Revoked") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function isChineseLanguage(language: string) {
  return language === "zh-CN" || language === "zh-TW";
}

function isKoreanLanguage(language: string) {
  return language === "ko";
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
  if (name.includes("West China")) {
    return showKorean ? "쓰촨대학교 화시병원" : showChinese ? "华西医院" : name;
  }

  if (name.includes("Second People's")) {
    return showKorean ? "청두시 제2인민병원" : showChinese ? "成都市第二人民医院" : name;
  }

  return name;
}

function displayAccessStatus(status: AccessStatus, showChinese: boolean, showKorean: boolean, translate: (key: string) => string) {
  if (!showChinese && !showKorean) {
    return status;
  }
  const labels: Record<AccessStatus, string> = {
    Granted: translate("granted"),
    Pending: translate("pending"),
    Revoked: translate("revoked")
  };

  return labels[status];
}

function displayLogStatus(status: AccessLog["status"], showChinese: boolean, showKorean: boolean, translate: (key: string) => string) {
  if (!showChinese && !showKorean) {
    return status;
  }

  return status === "Confirmed" ? translate("confirmed") : translate("verified");
}

function displayLogActor(actor: string, showChinese: boolean, showKorean = false) {
  if (!showChinese && !showKorean) {
    return actor;
  }

  if (actor === "MediRoute AI") {
    return showKorean ? "MediRoute AI 분류 서비스" : "MediRoute 智能分诊";
  }

  if (actor === "Smart Contract") {
    return showKorean ? "권한 서비스" : "授权服务";
  }

  return displayHospitalName(actor, showChinese, showKorean);
}

function displayLogAction(action: string, showChinese: boolean, showKorean = false) {
  if (!showChinese && !showKorean) {
    return action;
  }

  if (action === "Read Allergy Record") {
    return showKorean ? "알레르기 기록 조회" : "读取过敏记录";
  }

  if (action === "Anchored Blood Test hash") {
    return showKorean ? "혈액검사 검증 기록 저장" : "写入血液检查校验记录";
  }

  if (action.startsWith("Granted temporary access to ")) {
    const type = action.replace("Granted temporary access to ", "");
    return showKorean
      ? `${displayRecordType(type, false, true)} 임시 접근 권한 부여`
      : `已临时授权访问${displayRecordType(type, true)}`;
  }

  if (action.startsWith("Revoked access to ")) {
    const type = action.replace("Revoked access to ", "");
    return showKorean
      ? `${displayRecordType(type, false, true)} 접근 권한 취소`
      : `已撤销${displayRecordType(type, true)}访问`;
  }

  return action;
}

export default function MediChainPage() {
  const { language, t } = useLanguage();
  const showChinese = isChineseLanguage(language);
  const showKorean = isKoreanLanguage(language);
  const connectedHospitals = showKorean
    ? "쓰촨대학교 화시병원; 청두시 제2인민병원"
    : showChinese
    ? "华西医院；成都市第二人民医院"
    : "West China Hospital, Sichuan University; Chengdu Second People's Hospital";
  const [records, setRecords] = useState(initialRecords);
  const [accessLogs, setAccessLogs] = useState(initialLogs);
  const [grantRecord, setGrantRecord] = useState<MedicalRecord | null>(null);
  const [hashRecord, setHashRecord] = useState<MedicalRecord | null>(null);
  const [granting, setGranting] = useState(false);
  const [grantTxHash, setGrantTxHash] = useState<string | null>(null);

  const addLog = (record: MedicalRecord, action: string, txHash = generateTxHash(record.id)) => {
    setAccessLogs((current) => [
      {
        id: `log-${Date.now()}`,
        time: nowTime(),
        actor: "Smart Contract",
        action,
        txHash,
        status: "Confirmed"
      },
      ...current
    ]);
  };

  const executeGrant = async () => {
    if (!grantRecord) {
      return;
    }

    setGranting(true);
    setGrantTxHash(null);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const txHash = generateTxHash(`grant:${grantRecord.id}`);
    setRecords((current) =>
      current.map((record) =>
        record.id === grantRecord.id ? { ...record, accessStatus: "Granted" } : record
      )
    );
    setGrantTxHash(txHash);
    addLog(grantRecord, `Granted temporary access to ${grantRecord.type}`, txHash);
    setGranting(false);
  };

  const revokeAccess = (record: MedicalRecord) => {
    const txHash = generateTxHash(`revoke:${record.id}`);
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? { ...item, accessStatus: "Revoked" } : item))
    );
    addLog(record, `Revoked access to ${record.type}`, txHash);
  };

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
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("medichain_description")}
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.42fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 content-start gap-6">
            <section className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{showChinese ? "患者身份编号" : t("patient_did")}</p>
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
              <h2 className="text-lg font-semibold text-slate-900">{t("medical_records")}</h2>
              <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1180px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="w-36 whitespace-nowrap px-4 py-4 font-medium">{t("type")}</th>
                      <th className="w-52 whitespace-nowrap px-4 py-4 font-medium">{t("hospital")}</th>
                      <th className="w-32 whitespace-nowrap px-4 py-4 font-medium">{t("date")}</th>
                      <th className="w-28 whitespace-nowrap px-4 py-4 font-medium">{t("encryption")}</th>
                      <th className="w-72 whitespace-nowrap px-4 py-4 font-medium">{showKorean ? "파일 저장 ID (IPFS CID)" : showChinese ? "文件存储编号" : "IPFS CID"}</th>
                      <th className="w-44 whitespace-nowrap px-4 py-4 font-medium">{t("hash")}</th>
                      <th className="w-32 whitespace-nowrap px-4 py-4 font-medium">{t("access_status")}</th>
                      <th className="min-w-[190px] px-4 py-4 font-medium">{t("actions")}</th>
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
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(record.accessStatus)}`}>
                            {displayAccessStatus(record.accessStatus, showChinese, showKorean, t)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="grid min-w-[170px] gap-2">
                            <button type="button" onClick={() => setGrantRecord(record)} className="glass-button h-9 justify-center whitespace-nowrap px-3 py-1.5 text-xs">
                              <Unlock className="h-3.5 w-3.5" />
                              {t("grant_access")}
                            </button>
                            <button type="button" onClick={() => revokeAccess(record)} className="glass-button h-9 justify-center whitespace-nowrap px-3 py-1.5 text-xs">
                              <KeyRound className="h-3.5 w-3.5" />
                              {t("revoke_access")}
                            </button>
                            <button type="button" onClick={() => setHashRecord(record)} className="glass-button h-9 justify-center whitespace-nowrap px-3 py-1.5 text-xs">
                              <Eye className="h-3.5 w-3.5" />
                              {t("view_hash")}
                            </button>
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
                      <p className="text-sm font-medium text-slate-900">{displayLogAction(log.action, showChinese, showKorean)}</p>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                        {displayLogStatus(log.status, showChinese, showKorean, t)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{log.time} · {displayLogActor(log.actor, showChinese, showKorean)} · {compactHash(log.txHash)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {grantRecord ? (
          <Modal onClose={() => setGrantRecord(null)} title={t("smart_contract_authorization")}>
            <div className="space-y-4">
              <p className="text-sm leading-7 text-slate-600">
                {t("grant_temp_access_text")}
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {t("grant_scope_text")}
              </div>
              {grantTxHash ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-700">{t("access_granted_confirmed")}</p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-600">{grantTxHash}</p>
                </div>
              ) : null}
              <button type="button" onClick={executeGrant} disabled={granting} className="primary-button h-12 w-full disabled:opacity-60">
                {granting ? <LockKeyhole className="h-4 w-4 animate-pulse" /> : <ShieldCheck className="h-4 w-4" />}
                {granting ? `${t("loading")}...` : t("grant_access")}
              </button>
            </div>
          </Modal>
        ) : null}

        {hashRecord ? (
          <Modal onClose={() => setHashRecord(null)} title={t("off_chain_explanation")}>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                {t("offchain_storage_text")}
              </p>
              <InfoRow label={t("record")} value={displayRecordType(hashRecord.type, showChinese, showKorean)} />
              <InfoRow label={showKorean ? "파일 저장 ID (IPFS CID)" : showChinese ? "文件存储编号" : "IPFS CID"} value={hashRecord.ipfsCid} />
              <InfoRow label={t("hash")} value={hashRecord.hash} />
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-700">
                {t("hash_verification_text")}
              </div>
            </div>
          </Modal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-medium ${tone === "green" ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5 "
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="glass-card w-full max-w-2xl rounded-2xl p-6"
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
