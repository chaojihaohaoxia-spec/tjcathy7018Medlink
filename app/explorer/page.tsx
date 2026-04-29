"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Blocks,
  Building2,
  Check,
  ChevronDown,
  Filter,
  PackageCheck,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  UserRound,
  X
} from "lucide-react";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type Module = "MediChain" | "MediRoute" | "MediRx";
type Channel = "medical-record-channel" | "prescription-channel" | "drug-supply-channel" | "consent-channel";
type Status = "Confirmed" | "Pending" | "Rejected";

type Transaction = {
  txHash: string;
  timestamp: string;
  channel: Channel;
  module: Module;
  actor: string;
  action: string;
  status: Status;
  blockNumber: number;
  endorsingNodes: string[];
  smartContractFunction: string;
  payloadSummary: string;
  hashBefore: string;
  hashAfter: string;
};

const modules: Module[] = ["MediChain", "MediRoute", "MediRx"];
const channels: Channel[] = ["medical-record-channel", "prescription-channel", "drug-supply-channel", "consent-channel"];
const statuses: Status[] = ["Confirmed", "Pending", "Rejected"];

const actors = [
  "West China Hospital, Sichuan University",
  "Chengdu Second People's Hospital",
  "MediRoute AI",
  "MediRx Router",
  "Patient DID Wallet",
  "Regulator Observer",
  "Hospital Pharmacy"
];

const actions = [
  "Granted record access",
  "Anchored encrypted record hash",
  "Generated triage summary",
  "Verified drug batch",
  "Issued referral voucher",
  "Revoked consent scope",
  "Synced prescription inventory",
  "Confirmed pharmacy pickup route"
];

const kpis = [
  ["total_transactions", "1,247", Activity],
  ["active_contracts", "38", Blocks],
  ["connected_nodes", "5", Building2],
  ["verified_batches", "412", PackageCheck],
  ["patient_authorizations", "89", UserRound],
  ["failed_tamper", "0", ShieldCheck]
];

const nodes = [
  { labelKey: "hospital_node", x: "15%", y: "24%", icon: Building2 },
  { labelKey: "regulator_node", x: "52%", y: "12%", icon: ShieldCheck },
  { labelKey: "insurer_node", x: "82%", y: "38%", icon: BadgeCheck },
  { labelKey: "pharmacy_node", x: "64%", y: "78%", icon: PackageCheck },
  { labelKey: "patient_did_node", x: "25%", y: "72%", icon: UserRound }
];

function compactHash(hash: string) {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function isKoreanLanguage(language: string) {
  return language === "ko";
}

function displayChannel(channel: string, korean: boolean) {
  if (!korean) {
    return channel;
  }
  const labels: Record<string, string> = {
    "medical-record-channel": "의료기록 채널",
    "prescription-channel": "처방 채널",
    "drug-supply-channel": "의약품 공급 채널",
    "consent-channel": "동의 채널"
  };
  return labels[channel] ?? channel;
}

function displayStatus(status: string, korean: boolean) {
  if (!korean) {
    return status;
  }
  const labels: Record<string, string> = {
    All: "전체",
    Confirmed: "확인됨",
    Pending: "대기 중",
    Rejected: "거부됨"
  };
  return labels[status] ?? status;
}

function displayActor(actor: string, korean: boolean) {
  if (!korean) {
    return actor;
  }
  const labels: Record<string, string> = {
    "West China Hospital, Sichuan University": "쓰촨대학교 화시병원",
    "Chengdu Second People's Hospital": "청두시 제2인민병원",
    "MediRoute AI": "MediRoute AI 분류 서비스",
    "MediRx Router": "MediRx 처방 라우터",
    "Patient DID Wallet": "환자 DID 지갑",
    "Regulator Observer": "규제기관 관찰 노드",
    "Hospital Pharmacy": "병원 약국",
    "Hospital Node": "병원 노드",
    "Regulator Node": "규제기관 노드",
    "Pharmacy Node": "약국 노드",
    "Insurer Node": "보험자 노드"
  };
  return labels[actor] ?? actor;
}

function displayAction(action: string, korean: boolean) {
  if (!korean) {
    return action;
  }
  const labels: Record<string, string> = {
    "Granted record access": "기록 접근 권한 부여",
    "Anchored encrypted record hash": "암호화 기록 검증 정보 저장",
    "Generated triage summary": "분류 요약 생성",
    "Verified drug batch": "의약품 배치 검증",
    "Issued referral voucher": "의뢰 바우처 발급",
    "Revoked consent scope": "동의 범위 취소",
    "Synced prescription inventory": "처방 재고 동기화",
    "Confirmed pharmacy pickup route": "약 수령 경로 확인"
  };
  return labels[action] ?? action;
}

function displayPayloadSummary(transaction: Transaction, korean: boolean) {
  if (!korean) {
    return transaction.payloadSummary;
  }
  return `${displayActor(transaction.actor, true)}가 ${displayChannel(transaction.channel, true)}에서 '${displayAction(transaction.action, true)}' 작업을 수행했습니다.`;
}

function dateTime(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function makeTransaction(index: number): Transaction {
  const txModule = modules[index % modules.length];
  const channel = channels[index % channels.length];
  const action = actions[index % actions.length];
  const actor = actors[index % actors.length];
  const txHash = generateTxHash(`${txModule}:${channel}:${action}:${index}`);

  return {
    txHash,
    timestamp: dateTime(index * 7),
    channel,
    module: txModule,
    actor,
    action,
    status: index % 11 === 0 ? "Pending" : index % 17 === 0 ? "Rejected" : "Confirmed",
    blockNumber: 1482900 + index,
    endorsingNodes: ["Hospital Node", "Regulator Node", index % 2 === 0 ? "Pharmacy Node" : "Insurer Node"],
    smartContractFunction:
      txModule === "MediChain"
        ? "recordVault.commitHash"
        : txModule === "MediRoute"
          ? "triageReferral.writeSummary"
          : "prescriptionRoute.verifyBatch",
    payloadSummary: `${action} by ${actor} on ${channel}`,
    hashBefore: generateTxHash(`before:${index}`),
    hashAfter: generateTxHash(`after:${index}`)
  };
}

function statusClass(status: Status) {
  if (status === "Confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

export default function ExplorerPage() {
  const { language, t } = useLanguage();
  const showKorean = isKoreanLanguage(language);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [live, setLive] = useState(false);
  const [networkPulse, setNetworkPulse] = useState(0);

  useEffect(() => {
    setTransactions(Array.from({ length: 24 }, (_, index) => makeTransaction(index)));
  }, []);

  useEffect(() => {
    if (!live) {
      return;
    }

    const interval = window.setInterval(() => {
      setTransactions((current) => [makeTransaction(current.length + 1), ...current]);
      setNetworkPulse((current) => current + 1);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [live]);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const moduleMatch = moduleFilter === "All" || transaction.module === moduleFilter;
        const statusMatch = statusFilter === "All" || transaction.status === statusFilter;
        const channelMatch = channelFilter === "All" || transaction.channel === channelFilter;
        const searchMatch = !search.trim() || transaction.txHash.toLowerCase().includes(search.trim().toLowerCase());
        return moduleMatch && statusMatch && channelMatch && searchMatch;
      }),
    [channelFilter, moduleFilter, search, statusFilter, transactions]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{t("explorer_title")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("explorer_monitor_title")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {t("explorer_description")}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {kpis.map(([label, value, Icon]) => (
            <motion.div key={label as string} whileHover={{ y: -4 }} className="glass-card rounded-2xl p-4">
              <Icon className="h-5 w-5 text-sky-600" />
              <p className="mt-4 text-2xl font-semibold text-slate-900">{value as string}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t(label as string)}</p>
            </motion.div>
          ))}
        </div>

        <section className="glass-card mt-6 overflow-hidden rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("live_node_network")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("live_node_desc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setLive((value) => !value)}
              className={`glass-button h-11 ${live ? "border-emerald-300/40 text-emerald-700" : ""}`}
            >
              {live ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              {t("live_mode")} {live ? t("on") : t("off")}
            </button>
          </div>

          <div className="relative mt-5 h-80 rounded-2xl border border-slate-200 bg-slate-50">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
              {[
                ["15", "24", "52", "12"],
                ["52", "12", "82", "38"],
                ["82", "38", "64", "78"],
                ["64", "78", "25", "72"],
                ["25", "72", "15", "24"],
                ["52", "12", "25", "72"]
              ].map(([x1, y1, x2, y2], index) => (
                <g key={`${x1}-${y1}-${x2}-${y2}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#BAE6FD" strokeWidth="0.35" />
                  <motion.circle
                    key={`${networkPulse}-${index}`}
                    r="0.9"
                    fill="#0EA5E9"
                    initial={{ cx: x1, cy: y1, opacity: 0 }}
                    animate={{ cx: x2, cy: y2, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: index * 0.12, ease: "easeInOut" }}
                  />
                </g>
              ))}
            </svg>
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.labelKey}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: node.x, top: node.y }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 shadow-[0_0_35px_rgba(14,165,233,0.18)] ">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-2 whitespace-nowrap text-center text-xs font-medium text-slate-900">{t(node.labelKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <h2 className="text-lg font-semibold text-slate-900">{t("transactions")}</h2>
            <div className="grid gap-3 md:grid-cols-4 xl:w-[760px]">
              <SelectFilter value={moduleFilter} onChange={setModuleFilter} options={["All", ...modules]} label={t("module_filter")} getOptionLabel={(option) => (option === "All" ? t("all") : option)} />
              <SelectFilter value={statusFilter} onChange={setStatusFilter} options={["All", ...statuses]} label={t("status_filter")} getOptionLabel={(option) => displayStatus(option, showKorean)} />
              <SelectFilter value={channelFilter} onChange={setChannelFilter} options={["All", ...channels]} label={t("channel_filter")} getOptionLabel={(option) => (option === "All" ? t("all") : displayChannel(option, showKorean))} />
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder={t("search_by_hash")}
                />
              </label>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">{t("tx_hash")}</th>
                  <th className="px-4 py-4 font-medium">{t("timestamp")}</th>
                  <th className="px-4 py-4 font-medium">{t("channel")}</th>
                  <th className="px-4 py-4 font-medium">{t("module")}</th>
                  <th className="px-4 py-4 font-medium">{t("actor")}</th>
                  <th className="px-4 py-4 font-medium">{t("action")}</th>
                  <th className="px-4 py-4 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.txHash}
                    onClick={() => setSelectedTx(transaction)}
                    className="cursor-pointer border-t border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-sky-700">{compactHash(transaction.txHash)}</td>
                    <td className="px-4 py-4">{new Date(transaction.timestamp).toLocaleString(showKorean ? "ko-KR" : undefined)}</td>
                    <td className="px-4 py-4">{displayChannel(transaction.channel, showKorean)}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{transaction.module}</td>
                    <td className="px-4 py-4">{displayActor(transaction.actor, showKorean)}</td>
                    <td className="px-4 py-4">{displayAction(transaction.action, showKorean)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(transaction.status)}`}>
                        {displayStatus(transaction.status, showKorean)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedTx ? (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/30 "
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{t("transaction_detail")}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{compactHash(selectedTx.txHash)}</h2>
                </div>
                <button type="button" onClick={() => setSelectedTx(null)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                <Detail label={t("tx_hash")} value={selectedTx.txHash} />
                <Detail label={t("block_number")} value={`${selectedTx.blockNumber}`} />
                <Detail label={t("endorsing_nodes")} value={selectedTx.endorsingNodes.map((node) => displayActor(node, showKorean)).join(", ")} />
                <Detail label={t("timestamp")} value={new Date(selectedTx.timestamp).toLocaleString(showKorean ? "ko-KR" : undefined)} />
                <Detail label={t("smart_contract_function")} value={selectedTx.smartContractFunction} />
                <Detail label={t("payload_summary")} value={displayPayloadSummary(selectedTx, showKorean)} />
                <Detail label={t("hash_before")} value={selectedTx.hashBefore} />
                <Detail label={t("hash_after")} value={selectedTx.hashAfter} />
                <div className={`rounded-xl border p-4 ${statusClass(selectedTx.status)}`}>
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-700">{t("status")}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Check className="h-4 w-4" />
                    {displayStatus(selectedTx.status, showKorean)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  label,
  getOptionLabel
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  getOptionLabel?: (value: string) => string;
}) {
  return (
    <label className="relative">
      <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none focus:border-sky-400"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-slate-900">
            {getOptionLabel ? getOptionLabel(option) : option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
