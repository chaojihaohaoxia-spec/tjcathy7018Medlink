"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Check,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileCheck2,
  Fingerprint,
  GitBranch,
  Loader2,
  LockKeyhole,
  PackageCheck,
  Pill,
  Route,
  ShieldCheck,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type Locale = "en" | "zh" | "ko";
type CaseId = "diabetes" | "oncology" | "antibiotic" | "mental";
type TraceTabId = "authority" | "fhir" | "chaincode" | "batch" | "safety" | "audit";

const CASE_IDS: CaseId[] = ["diabetes", "oncology", "antibiotic", "mental"];
const TRACE_TAB_IDS: TraceTabId[] = ["authority", "fhir", "chaincode", "batch", "safety", "audit"];

const iconMap: Record<string, LucideIcon> = {
  ledger: Database,
  chaincode: GitBranch,
  fhir: Activity,
  authority: ClipboardCheck,
  batch: PackageCheck,
  safety: ShieldCheck
};

const MEDIRX_COPY = {
  en: {
    pageLabel: "MEDIRX",
    title: "MediRx Prescription Authority & Dispensing Route",
    subtitle:
      "Verify prescribing authority, sync medicine inventory through HL7 FHIR, match authorized dispensing routes, and anchor batch traceability proof on-chain.",
    noPrescriptionChip: "MedLink does not issue prescriptions — it verifies authority and routing proof.",
    techStackTitle: "MediRx Technology Stack",
    techStack: [
      {
        icon: "ledger",
        title: "Hyperledger Fabric Drug Channel",
        badge: "Medicine ledger",
        description:
          "Records prescription authority proof, batch traceability events, route proof, and pickup confirmation."
      },
      {
        icon: "chaincode",
        title: "Smart Contract / Chaincode",
        badge: "Route matching rules",
        description:
          "Checks prescriber role, department authority, drug category, inventory proof, and pickup eligibility."
      },
      {
        icon: "fhir",
        title: "HL7 FHIR API",
        badge: "Inventory interface",
        description:
          "Syncs hospital pharmacy stock, MedicationRequest, MedicationDispense, and available pickup slots."
      },
      {
        icon: "authority",
        title: "Prescription Authority Registry",
        badge: "Who is allowed to prescribe",
        description:
          "Verifies whether the doctor or institution is authorized to prescribe this medicine category."
      },
      {
        icon: "batch",
        title: "Batch Traceability",
        badge: "Anti-counterfeit proof",
        description:
          "Tracks manufacturer, distributor, hospital pharmacy receipt, and patient pickup events."
      },
      {
        icon: "safety",
        title: "MediChain Safety Context",
        badge: "Authorized patient history",
        description:
          "Uses patient-authorized allergy, chronic disease, and medication history to support safety checks."
      }
    ],
    flowTitle: "MediRx Dispensing Flow",
    flowNodes: [
      ["Prescription need", "MediChain"],
      ["MediChain safety context", "MediChain"],
      ["Prescriber authority check", "Authority Registry"],
      ["FHIR inventory sync", "HL7 FHIR"],
      ["Smart contract route matching", "Chaincode"],
      ["Batch proof verification", "Batch Traceability"],
      ["Pickup route issued", "Fabric Drug Channel"],
      ["Drug channel audit proof", "Hyperledger Fabric"]
    ],
    leftPanelTitle: "Prescription Need & Patient Context",
    caseSelector: "Case selector",
    fields: {
      patient: "Patient",
      location: "Location",
      need: "Prescription need",
      category: "Medicine category",
      urgency: "Urgency",
      history: "Authorized history",
      medication: "Current medication",
      requester: "Requested by",
      consent: "Consent status",
      authority: "Authority required",
      inventory: "Inventory",
      batch: "Batch proof",
      status: "Status"
    },
    patientName: "Ms. Chen",
    locationValue: "Chengdu",
    authorizedHistory: "Diabetes, hypertension, penicillin allergy",
    currentMedication: "Metformin, atorvastatin",
    requestedBy: "West China Hospital / Endocrinology doctor",
    consentStatus: "MediChain safety context authorized",
    verifyGenerateDispensingRoute: "Verify & Generate Dispensing Route",
    verifyButton: "Verify & Generate Dispensing Route",
    verifyingRoute: "Verifying route...",
    routePendingStatus: "Pending",
    dispensingRouteVerifiedToast: "Dispensing route verified. You can now issue a pickup voucher.",
    routePanelTitle: "Live Authority + Inventory Routing Flow",
    pipeline: [
      {
        title: "Patient Consent Check",
        tech: "MediChain",
        status: "Authorized",
        text: "Confirm patient consent before using allergy and medication history.",
        preview: "scope = allergy + chronic condition + medication list"
      },
      {
        title: "Prescriber Authority Check",
        tech: "Authority Registry + Chaincode",
        status: "Verified",
        text: "Verify the doctor’s department and medicine category permission.",
        preview: "Endocrinology doctor → chronic refill allowed"
      },
      {
        title: "Prescription Metadata Sync",
        tech: "HL7 FHIR",
        status: "Synced",
        text: "Read MedicationRequest and prescription metadata through FHIR-compatible APIs.",
        preview: "GET /fhir/R4/MedicationRequest?id=RX-2026-0418"
      },
      {
        title: "Inventory Availability Check",
        tech: "HL7 FHIR",
        status: "Live",
        text: "Query hospital and pharmacy stock, pickup slots, and dispense availability.",
        preview: "insulin glargine available, pickup today 16:00"
      },
      {
        title: "Drug Safety Check",
        tech: "MediChain + Safety Rules",
        status: "Passed",
        text: "Check allergy, chronic disease, and current medication conflicts.",
        preview: "no contraindication flagged"
      },
      {
        title: "Batch Proof Verification",
        tech: "Fabric Drug Channel",
        status: "Verified",
        text: "Verify batch origin, distributor handoff, hospital receipt, and tamper proof.",
        preview: "BATCH-INS-2026-0418 verified"
      },
      {
        title: "Route Matching",
        tech: "Smart Contract / Chaincode",
        status: "Matched",
        text: "Match the nearest authorized institution with valid authority and available stock.",
        preview: "West China Hospital Pharmacy → Chengdu Jinjiang pickup route"
      },
      {
        title: "Audit Proof",
        tech: "Hyperledger Fabric",
        status: "Recorded",
        text: "Anchor prescription authority proof, inventory proof, route proof, and pickup voucher.",
        preview: "RX_ROUTE_MATCHED → PICKUP_VOUCHER_ISSUED"
      }
    ],
    outputTitle: "Dispensing Route Output",
    recommendedRoute: "Recommended route",
    whyThisRoute: "Why this route?",
    pickupVoucher: "Pickup voucher",
    routeProof: "Route proof",
    issuePickupVoucher: "Issue Pickup Voucher",
    pickupVoucherDisabledTooltip: "Verify the dispensing route before issuing a pickup voucher.",
    pickupVoucherGenerated: "Pickup Voucher Generated",
    voucherId: "Voucher ID",
    patient: "Patient",
    medication: "Medication",
    medicineCategory: "Medicine Category",
    prescribingVerificationSource: "Prescribing / Verification Source",
    recommendedPickupPoint: "Recommended Pickup Point",
    pickupWindow: "Pickup Window",
    voucherValidity: "Voucher Validity",
    batchProof: "Batch Proof",
    onchainAuditEvent: "On-chain Audit Event",
    copyVoucherId: "Copy Voucher ID",
    close: "Close",
    voucherIdCopiedToast: "Voucher ID copied.",
    pickupVoucherIssuedStatus: "Pickup voucher issued — ready for authorized dispensing",
    pickupVoucherIssuedToast: "Pickup voucher issued and audit event recorded.",
    viewPickupVoucher: "View Pickup Voucher",
    notIssuedYet: "Not issued yet",
    routeVerifiedReadyToIssue: "Route verified — ready to issue pickup voucher",
    pickupVoucherIssuedEvent: "PICKUP_VOUCHER_ISSUED",
    rxRouteMatchedEvent: "RX_ROUTE_MATCHED",
    voucherDetails: {
      id: "PV-CHEN-2026-0418",
      patient: "Ms. Chen",
      medication: "Insulin glargine",
      category: "Chronic disease refill",
      source: "West China Hospital / Endocrinology Doctor",
      pickupPoint: "Chengdu Jinjiang District Community Health Center Pharmacy",
      pickupWindow: "Today 16:00–18:00",
      validity: "24 hours",
      batchProof: "BATCH-INS-2026-0418 verified",
      routeProof: "0x4119dccb...bdb4db",
      auditEvent: "PICKUP_VOUCHER_ISSUED"
    },
    inspectTechnologyTrace: "Inspect Technology Trace",
    institutionMatchingTitle: "Institution Matching",
    filterChips: ["Authorized prescriber only", "Stock available", "Batch proof verified", "Within 24 hours"],
    tableHeaders: {
      institution: "Institution",
      level: "Level",
      distance: "Distance",
      authority: "Prescriber Authority",
      stock: "FHIR Stock Status",
      batch: "Batch Proof",
      slot: "Next Pickup Slot",
      score: "Route Score",
      notes: "Notes"
    },
    inventoryTitle: "Inventory Snapshot via HL7 FHIR",
    inventorySubtitle:
      "Inventory is queried through pharmacy systems via FHIR. The blockchain anchors signed inventory proof and batch events, not full real-time stock tables.",
    inventoryFields: {
      fhir: "FHIR status",
      proof: "Inventory proof",
      sync: "Last sync",
      batch: "Batch proof",
      live: "Live sync",
      signed: "Signed",
      verified: "Verified",
      pending: "Pending"
    },
    batchTimelineTitle: "Drug Batch Traceability Timeline",
    batchTimelineSubtitle:
      "Batch events are anchored on the Fabric drug channel to support anti-counterfeit proof, procurement audit, and regulator traceability.",
    batchTimeline: [
      {
        title: "Manufacturer release",
        event: "MANUFACTURER_RELEASED",
        text: "Manufacturer certificate issued and batch ID created.",
        proof: "Batch certificate hash recorded."
      },
      {
        title: "Distributor handoff",
        event: "DISTRIBUTOR_HANDOFF",
        text: "Distributor records custody transfer and cold-chain status.",
        proof: "Handoff event signed."
      },
      {
        title: "Hospital pharmacy receipt",
        event: "HOSPITAL_RECEIPT",
        text: "Hospital pharmacy scans package, verifies batch, and updates inventory.",
        proof: "Receipt proof anchored."
      },
      {
        title: "IPFS batch document",
        event: "BATCH_DOC_ANCHORED",
        text: "Encrypted batch document stored off-chain; CID referenced on-chain.",
        proof: "IPFS CID + document hash."
      },
      {
        title: "Route matched",
        event: "RX_ROUTE_MATCHED",
        text: "Smart contract matches authority, inventory, route, and batch proof.",
        proof: "Route proof generated."
      },
      {
        title: "Patient pickup confirmation",
        event: "PICKUP_CONFIRMED",
        text: "Patient pickup confirmed and dispensing audit finalized.",
        proof: "Pickup voucher recorded."
      }
    ],
    safetyTitle: "Safety & Compliance Boundary",
    safetyItems: [
      "MedLink does not issue prescriptions.",
      "Final prescribing authority remains with licensed physicians.",
      "Inventory is queried via FHIR; blockchain stores signed proof and batch events.",
      "Smart contracts match route eligibility; they do not make clinical prescribing decisions.",
      "Patient safety checks use only authorized MediChain records.",
      "Batch traceability supports anti-counterfeit proof, procurement audit, and regulator review."
    ],
    traceTitle: "MediRx Technology Trace",
    traceTabs: {
      authority: "Prescription Authority",
      fhir: "FHIR Inventory",
      chaincode: "Chaincode Route Matching",
      batch: "Batch Traceability",
      safety: "Drug Safety Context",
      audit: "Audit & Compliance"
    },
    traceNotes: {
      authority:
        "This step verifies whether the doctor or institution is authorized to prescribe this medicine category. MedLink does not issue prescriptions; it verifies authority and route eligibility only.",
      fhir:
        "Inventory is queried through hospital pharmacy systems and FHIR interfaces. On-chain records store signed inventory proof and related events, not full stock details.",
      chaincode:
        "Chaincode generates route proof based on prescribing authority, stock, batch proof, patient safety context, and pickup slot availability.",
      batch:
        "Batch traceability supports anti-counterfeit proof, regulator review, and hospital procurement verification. This is the core value behind medicine batch certification fees.",
      safety:
        "Medication safety context comes from patient-authorized MediChain records and supports allergy and medication conflict checks.",
      audit:
        "On-chain records are used for audit and compliance proof. They do not store plaintext prescriptions or full patient privacy data."
    },
    cases: {
      diabetes: {
        label: "Chronic diabetes refill",
        need: "Insulin glargine refill for diabetes medication continuity",
        category: "Chronic disease refill",
        urgency: "Within 24 hours",
        authority: "Endocrinology or chronic care physician",
        inventory: "Available",
        route: "West China Hospital Pharmacy → Chengdu Jinjiang District Community Health Center Pharmacy",
        batch: "Verified",
        status: "Ready for authorized dispensing",
        routeProof: "0x4119dccb...bdb4db",
        voucher: "PV-CHEN-2026-0418",
        reasons: [
          "Prescriber authority verified",
          "Medicine stock available",
          "Batch proof verified",
          "Patient safety context passed",
          "Nearest authorized pickup point",
          "Pickup slot available today"
        ],
        caseNote: "Routine chronic refill with signed route proof and today’s pickup slot."
      },
      oncology: {
        label: "Oncology targeted drug",
        need: "Targeted therapy refill",
        category: "High-value oncology drug",
        urgency: "Specialist review",
        authority: "Class A tertiary oncology specialist",
        inventory: "Limited",
        route: "Sichuan Cancer Hospital specialist pharmacy",
        batch: "Required and verified",
        status: "Specialist review required",
        routeProof: "0x8d62aa19...04ce91",
        voucher: "PV-CHEN-ONC-0418",
        reasons: [
          "Specialist authority required",
          "High-value oncology stock is limited",
          "Batch proof must be verified",
          "Specialist review is required before dispensing",
          "Hospital pharmacy can verify oncology batch documents"
        ],
        caseNote: "High-value oncology refill routes to a specialist hospital review."
      },
      antibiotic: {
        label: "Common antibiotic",
        need: "Common antibiotic request",
        category: "General outpatient medicine",
        urgency: "Routine",
        authority: "Primary care doctor",
        inventory: "Available",
        route: "Chengdu Jinjiang District Community Health Center Pharmacy",
        batch: "Verified",
        status: "Routine dispensing allowed",
        routeProof: "0x35cf1d29...ab9021",
        voucher: "PV-CHEN-ABX-0418",
        reasons: [
          "Primary care prescriber authority is sufficient",
          "Stock available at a nearby clinic pharmacy",
          "Batch proof verified",
          "No restricted medicine rule triggered",
          "Routine pickup route reduces hospital burden"
        ],
        caseNote: "General outpatient medicine can be routed to primary care if authority and stock are valid."
      },
      mental: {
        label: "Restricted mental health medication",
        need: "Mental health medication refill",
        category: "Restricted medication",
        urgency: "Authority review required",
        authority: "Psychiatry specialist",
        inventory: "Hidden until authority verified",
        route: "Specialist hospital review",
        batch: "Required",
        status: "Authority review required",
        routeProof: "0x7b91fa54...5e22ac",
        voucher: "PV-CHEN-MH-0418",
        reasons: [
          "Restricted medicine requires specialist authority",
          "Inventory remains hidden until authority is verified",
          "Batch proof required before pickup route is shown",
          "Compliance review prevents casual route generation"
        ],
        caseNote: "Restricted medication stays gated until specialist authority is reviewed."
      }
    },
    institutionRows: [
      {
        institution: "West China Hospital, Sichuan University",
        level: "Class A Tertiary Hospital",
        distance: "7.4 km",
        authority: "Verified",
        stock: "Available",
        batch: "Verified",
        slot: "Today 16:00",
        score: "92",
        notes: "Full authority, FHIR inventory live"
      },
      {
        institution: "Chengdu Second People’s Hospital",
        level: "Class B Secondary Hospital",
        distance: "3.8 km",
        authority: "Verified",
        stock: "34 pens",
        batch: "Verified",
        slot: "Tomorrow 09:20",
        score: "83",
        notes: "Stock available, later slot"
      },
      {
        institution: "Chengdu Jinjiang District Community Health Center",
        level: "Primary Care Clinic",
        distance: "1.2 km",
        authority: "Limited",
        stock: "Available",
        batch: "Verified",
        slot: "Today 18:30",
        score: "78",
        notes: "Pickup allowed after tertiary prescription confirmation"
      },
      {
        institution: "Sichuan Cancer Hospital",
        level: "Class A Specialist Hospital",
        distance: "9.1 km",
        authority: "Not required for this chronic refill",
        stock: "Available",
        batch: "Verified",
        slot: "May 1 10:00",
        score: "62",
        notes: "Not optimal for diabetes refill"
      },
      {
        institution: "Chengdu Xinhua Primary Care Clinic",
        level: "Primary Care Clinic",
        distance: "0.8 km",
        authority: "Insufficient",
        stock: "Available",
        batch: "Pending",
        slot: "Today 15:10",
        score: "45",
        notes: "Connector review needed"
      }
    ],
    inventoryCards: [
      {
        name: "Chengdu Jinjiang District Community Health Center Pharmacy",
        type: "Community pharmacy",
        score: "91",
        medicines: ["insulin glargine: 42 pens", "metformin-500: 120 packs", "atorvastatin-20: 42 packs"]
      },
      {
        name: "West China Hospital, Sichuan University Pharmacy",
        type: "Hospital pharmacy",
        score: "86",
        medicines: ["insulin glargine: 80 pens", "apixaban-2.5: 24 packs", "oncology cold-chain cabinet: limited"]
      },
      {
        name: "Chengdu Xinhua Primary Care Clinic Pharmacy",
        type: "Primary care pharmacy",
        score: "78",
        medicines: ["amoxicillin-clavulanate: available", "budesonide-200: 6 units", "salbutamol inhaler: 8 units"]
      }
    ]
  },
  zh: {
    pageLabel: "MEDIRX",
    title: "MediRx 处方权限与取药路径",
    subtitle:
      "验证医生/机构处方权限，通过 HL7 FHIR 同步药品库存，匹配有权限、有库存的取药路径，并将药品批次溯源证明记录上链。",
    noPrescriptionChip: "MedLink 不开具处方——只验证权限、库存和路径证明。",
    techStackTitle: "MediRx 技术栈",
    techStack: [
      {
        icon: "ledger",
        title: "药品联盟链通道",
        badge: "Hyperledger Fabric Drug Channel",
        description: "记录处方权限证明、药品批次流转事件、路径证明和取药确认。"
      },
      {
        icon: "chaincode",
        title: "智能合约 / 链码",
        badge: "路径匹配规则",
        description: "校验医生角色、科室权限、药品类别、库存证明和取药资格。"
      },
      {
        icon: "fhir",
        title: "HL7 FHIR 接口",
        badge: "库存数据接口",
        description: "同步医院药房库存、处方请求、发药状态和可取药时段。"
      },
      {
        icon: "authority",
        title: "处方权限注册表",
        badge: "谁有资格开具",
        description: "验证医生或机构是否有权限开具该类药品。"
      },
      {
        icon: "batch",
        title: "药品批次溯源",
        badge: "防伪追溯证明",
        description: "追踪制造商、流通商、医院药房入库和患者取药事件。"
      },
      {
        icon: "safety",
        title: "MediChain 安全上下文",
        badge: "已授权患者病史",
        description: "读取患者授权的过敏史、慢病史和现有用药，用于用药安全核对。"
      }
    ],
    flowTitle: "MediRx 取药路径流程",
    flowNodes: [
      ["处方需求", "MediChain"],
      ["MediChain 安全上下文", "MediChain"],
      ["处方权限校验", "权限注册表"],
      ["FHIR 库存同步", "HL7 FHIR"],
      ["智能合约路径匹配", "链码"],
      ["批次证明验证", "批次溯源"],
      ["生成取药路径", "药品通道"],
      ["药品通道审计证明", "Hyperledger Fabric"]
    ],
    leftPanelTitle: "处方需求与患者上下文",
    caseSelector: "案例选择",
    fields: {
      patient: "患者",
      location: "位置",
      need: "处方需求",
      category: "药品类别",
      urgency: "紧急程度",
      history: "已授权病史",
      medication: "当前用药",
      requester: "发起方",
      consent: "授权状态",
      authority: "所需权限",
      inventory: "库存",
      batch: "批次证明",
      status: "状态"
    },
    patientName: "陈女士",
    locationValue: "成都",
    authorizedHistory: "糖尿病、高血压、青霉素过敏",
    currentMedication: "二甲双胍、阿托伐他汀",
    requestedBy: "华西医院 / 内分泌科医生",
    consentStatus: "MediChain 用药安全上下文已授权",
    verifyGenerateDispensingRoute: "验证并生成取药路径",
    verifyButton: "验证并生成取药路径",
    verifyingRoute: "正在验证路径...",
    routePendingStatus: "待验证",
    dispensingRouteVerifiedToast: "取药路径已验证，现在可以生成取药凭证。",
    routePanelTitle: "实时权限与库存路由流程",
    pipeline: [
      {
        title: "患者授权校验",
        tech: "MediChain",
        status: "已授权",
        text: "使用过敏史和用药史前先确认患者授权。",
        preview: "scope = 过敏史 + 慢病史 + 当前用药"
      },
      {
        title: "处方权限校验",
        tech: "权限注册表 + 链码",
        status: "已验证",
        text: "验证医生科室权限和药品类别权限。",
        preview: "内分泌科医生 → 慢病续方允许"
      },
      {
        title: "处方元数据同步",
        tech: "HL7 FHIR",
        status: "已同步",
        text: "通过兼容 FHIR 的接口读取处方请求和处方元数据。",
        preview: "GET /fhir/R4/MedicationRequest?id=RX-2026-0418"
      },
      {
        title: "库存可用性查询",
        tech: "HL7 FHIR",
        status: "实时",
        text: "查询医院和药房库存、可取药时段和发药状态。",
        preview: "胰岛素甘精可用，今日16:00可取"
      },
      {
        title: "用药安全核对",
        tech: "MediChain + 安全规则",
        status: "已通过",
        text: "检查过敏史、慢病史和当前用药冲突。",
        preview: "未发现禁忌冲突"
      },
      {
        title: "批次证明验证",
        tech: "Fabric 药品通道",
        status: "已验证",
        text: "验证批次来源、流通商交接、医院入库和防篡改证明。",
        preview: "BATCH-INS-2026-0418 已验证"
      },
      {
        title: "路径匹配",
        tech: "智能合约 / 链码",
        status: "已匹配",
        text: "匹配最近的、有处方权限且有库存的机构。",
        preview: "华西医院药房 → 成都锦江取药路径"
      },
      {
        title: "审计证明",
        tech: "Hyperledger Fabric",
        status: "已记录",
        text: "记录处方权限证明、库存证明、路径证明和取药凭证。",
        preview: "RX_ROUTE_MATCHED → PICKUP_VOUCHER_ISSUED"
      }
    ],
    outputTitle: "取药路径结果",
    recommendedRoute: "推荐路径",
    whyThisRoute: "为什么推荐这条路径？",
    pickupVoucher: "取药凭证",
    routeProof: "路径证明",
    issuePickupVoucher: "生成取药凭证",
    pickupVoucherDisabledTooltip: "请先完成取药路径验证，再生成取药凭证。",
    pickupVoucherGenerated: "取药凭证已生成",
    voucherId: "凭证编号",
    patient: "患者",
    medication: "药品",
    medicineCategory: "药品类别",
    prescribingVerificationSource: "处方确认方",
    recommendedPickupPoint: "推荐取药点",
    pickupWindow: "取药时间",
    voucherValidity: "凭证有效期",
    batchProof: "批次证明",
    onchainAuditEvent: "链上审计事件",
    copyVoucherId: "复制凭证编号",
    close: "关闭",
    voucherIdCopiedToast: "取药凭证编号已复制。",
    pickupVoucherIssuedStatus: "取药凭证已生成——可进行授权发药",
    pickupVoucherIssuedToast: "取药凭证已生成，审计事件已记录。",
    viewPickupVoucher: "查看取药凭证",
    notIssuedYet: "尚未生成",
    routeVerifiedReadyToIssue: "路径已验证——可生成取药凭证",
    pickupVoucherIssuedEvent: "PICKUP_VOUCHER_ISSUED 取药凭证已生成",
    rxRouteMatchedEvent: "RX_ROUTE_MATCHED 路径匹配已完成",
    voucherDetails: {
      id: "PV-CHEN-2026-0418",
      patient: "陈女士",
      medication: "胰岛素甘精",
      category: "慢病续方",
      source: "华西医院 / 内分泌科医生",
      pickupPoint: "成都锦江区社区卫生服务中心药房",
      pickupWindow: "今日 16:00–18:00",
      validity: "24小时",
      batchProof: "BATCH-INS-2026-0418 已验证",
      routeProof: "0x4119dccb...bdb4db",
      auditEvent: "PICKUP_VOUCHER_ISSUED"
    },
    inspectTechnologyTrace: "查看技术追踪",
    institutionMatchingTitle: "机构匹配",
    filterChips: ["仅显示有处方权限", "有库存", "批次证明已验证", "24小时内可取"],
    tableHeaders: {
      institution: "机构",
      level: "等级",
      distance: "距离",
      authority: "处方权限",
      stock: "FHIR 库存状态",
      batch: "批次证明",
      slot: "下一取药时段",
      score: "路径评分",
      notes: "备注"
    },
    inventoryTitle: "基于 HL7 FHIR 的库存快照",
    inventorySubtitle:
      "库存通过医院药房系统和 FHIR 接口查询；区块链记录经签名的库存证明和批次事件，而不是完整实时库存明细。",
    inventoryFields: {
      fhir: "FHIR状态",
      proof: "库存证明",
      sync: "最近同步",
      batch: "批次证明",
      live: "实时同步",
      signed: "已签名",
      verified: "已验证",
      pending: "待验证"
    },
    batchTimelineTitle: "药品批次溯源时间线",
    batchTimelineSubtitle:
      "批次事件记录在 Fabric 药品通道，用于防伪证明、医院采购审计和监管追溯。",
    batchTimeline: [
      {
        title: "制造商放行",
        event: "MANUFACTURER_RELEASED",
        text: "制造商签发批次证书并生成批次编号。",
        proof: "批次证书哈希已记录。"
      },
      {
        title: "流通商交接",
        event: "DISTRIBUTOR_HANDOFF",
        text: "流通商记录货权交接和冷链状态。",
        proof: "交接事件已签名。"
      },
      {
        title: "医院药房入库",
        event: "HOSPITAL_RECEIPT",
        text: "医院药房扫码收货，验证批次并更新库存。",
        proof: "入库证明已上链。"
      },
      {
        title: "IPFS 批次文件",
        event: "BATCH_DOC_ANCHORED",
        text: "加密批次文件存储在链下，链上引用 CID。",
        proof: "IPFS CID + 文件哈希。"
      },
      {
        title: "路径匹配",
        event: "RX_ROUTE_MATCHED",
        text: "智能合约匹配处方权限、库存、路径和批次证明。",
        proof: "路径证明已生成。"
      },
      {
        title: "患者取药确认",
        event: "PICKUP_CONFIRMED",
        text: "患者取药完成，发药审计闭环。",
        proof: "取药凭证已记录。"
      }
    ],
    safetyTitle: "安全与合规边界",
    safetyItems: [
      "MedLink 不开具处方。",
      "最终处方权属于持牌医生。",
      "库存通过 FHIR 查询；区块链记录经签名的库存证明和批次事件。",
      "智能合约匹配路径资格，但不做临床开药决策。",
      "用药安全核对只使用患者授权的 MediChain 病历。",
      "批次溯源支持防伪证明、医院采购审计和监管核查。"
    ],
    traceTitle: "MediRx 技术追踪",
    traceTabs: {
      authority: "处方权限",
      fhir: "FHIR 库存",
      chaincode: "链码路径匹配",
      batch: "批次溯源",
      safety: "用药安全上下文",
      audit: "审计与合规"
    },
    traceNotes: {
      authority: "该步骤验证医生或机构是否有权限开具该类药品。MedLink 不开具处方，只验证处方权限和路径资格。",
      fhir: "库存通过医院药房系统和 FHIR 接口查询；链上只记录经签名的库存证明和相关事件，不记录完整库存明细。",
      chaincode: "链码根据处方权限、库存、批次证明、患者安全上下文和取药时段生成路径证明。",
      batch: "批次溯源用于防伪、监管追责和医院采购核查，这也是药品上链认证费的核心价值来源。",
      safety: "用药安全上下文来自患者授权的 MediChain 病历，主要用于过敏史和用药冲突核对。",
      audit: "链上记录用于审计和合规证明，不保存处方明文或完整患者隐私数据。"
    },
    cases: {
      diabetes: {
        label: "慢病糖尿病续药",
        need: "糖尿病患者胰岛素甘精续药",
        category: "慢病续方",
        urgency: "24小时内",
        authority: "内分泌科或慢病管理医生",
        inventory: "可用",
        route: "华西医院药房 → 成都锦江区社区卫生服务中心药房",
        batch: "已验证",
        status: "可进行授权发药",
        routeProof: "0x4119dccb...bdb4db",
        voucher: "PV-CHEN-2026-0418",
        reasons: ["处方权限已验证", "药品库存可用", "批次证明已验证", "患者用药安全核对通过", "最近的授权取药点", "今日可取药"],
        caseNote: "慢病续方已完成权限、库存和批次证明核对。"
      },
      oncology: {
        label: "肿瘤靶向药",
        need: "肿瘤靶向药续方",
        category: "高价肿瘤药",
        urgency: "需要专科复核",
        authority: "三甲医院肿瘤专科医生",
        inventory: "有限",
        route: "四川省肿瘤医院专科药房",
        batch: "必须验证，已验证",
        status: "需要专科医生复核",
        routeProof: "0x8d62aa19...04ce91",
        voucher: "PV-CHEN-ONC-0418",
        reasons: ["需要专科处方权限", "高价肿瘤药库存有限", "批次证明必须验证", "发药前需要专科复核", "专科药房可核验批次文件"],
        caseNote: "高价靶向药不会直接走普通药房，需要专科复核。"
      },
      antibiotic: {
        label: "普通抗生素",
        need: "普通抗生素用药需求",
        category: "普通门诊药",
        urgency: "常规",
        authority: "基层医生",
        inventory: "可用",
        route: "成都锦江区社区卫生服务中心药房",
        batch: "已验证",
        status: "可常规发药",
        routeProof: "0x35cf1d29...ab9021",
        voucher: "PV-CHEN-ABX-0418",
        reasons: ["基层医生权限足够", "附近社区药房有库存", "批次证明已验证", "没有触发限制类药品规则", "普通取药路径可减少大医院压力"],
        caseNote: "普通门诊药在权限和库存有效时可匹配基层取药点。"
      },
      mental: {
        label: "精神类限制药",
        need: "精神类药物续方",
        category: "限制类药品",
        urgency: "需要权限复核",
        authority: "精神专科医生",
        inventory: "权限验证前不展示",
        route: "专科医院复核",
        batch: "必须验证",
        status: "需要权限复核",
        routeProof: "0x7b91fa54...5e22ac",
        voucher: "PV-CHEN-MH-0418",
        reasons: ["限制类药品需要专科权限", "权限验证前不展示库存", "展示取药路径前必须验证批次证明", "合规复核防止随意生成路径"],
        caseNote: "限制类药品先进入权限复核，不直接展示普通取药路径。"
      }
    },
    institutionRows: [
      {
        institution: "华西医院",
        level: "三甲医院",
        distance: "7.4 公里",
        authority: "已验证",
        stock: "可用",
        batch: "已验证",
        slot: "今天16:00",
        score: "92",
        notes: "完整处方权限，FHIR 库存实时同步"
      },
      {
        institution: "成都市第二人民医院",
        level: "二级医院",
        distance: "3.8 公里",
        authority: "已验证",
        stock: "34支",
        batch: "已验证",
        slot: "明天09:20",
        score: "83",
        notes: "有库存，但取药时间较晚"
      },
      {
        institution: "成都锦江区社区卫生服务中心",
        level: "基层医疗机构",
        distance: "1.2 公里",
        authority: "有限",
        stock: "可用",
        batch: "已验证",
        slot: "今天18:30",
        score: "78",
        notes: "上级医院确认处方后可取药"
      },
      {
        institution: "四川省肿瘤医院",
        level: "三甲专科医院",
        distance: "9.1 公里",
        authority: "本慢病续方无需选择",
        stock: "可用",
        batch: "已验证",
        slot: "5月1日10:00",
        score: "62",
        notes: "不适合糖尿病续药作为首选"
      },
      {
        institution: "成都新华社区诊所",
        level: "基层医疗机构",
        distance: "0.8 公里",
        authority: "不足",
        stock: "可用",
        batch: "待验证",
        slot: "今天15:10",
        score: "45",
        notes: "需要接口复核"
      }
    ],
    inventoryCards: [
      {
        name: "成都锦江区社区卫生服务中心药房",
        type: "社区药房",
        score: "91",
        medicines: ["胰岛素甘精：42支", "二甲双胍 500mg：120盒", "阿托伐他汀 20mg：42盒"]
      },
      {
        name: "华西医院药房",
        type: "医院药房",
        score: "86",
        medicines: ["胰岛素甘精：80支", "阿哌沙班 2.5mg：24盒", "肿瘤冷链柜：库存有限"]
      },
      {
        name: "成都新华社区诊所药房",
        type: "基层药房",
        score: "78",
        medicines: ["阿莫西林克拉维酸：可用", "布地奈德 200：6盒", "沙丁胺醇吸入剂：8支"]
      }
    ]
  },
  ko: {
    pageLabel: "MEDIRX",
    title: "MediRx 처방 권한 및 조제 경로",
    subtitle:
      "처방 권한을 검증하고, HL7 FHIR로 의약품 재고를 동기화하며, 승인된 조제 경로를 매칭하고, 의약품 배치 추적 증명을 온체인에 기록합니다.",
    noPrescriptionChip: "MedLink는 처방전을 발급하지 않으며, 권한·재고·경로 증명만 검증합니다.",
    techStackTitle: "MediRx 기술 스택",
    techStack: [
      {
        icon: "ledger",
        title: "의약품 컨소시엄 체인 채널",
        badge: "Hyperledger Fabric Drug Channel",
        description: "처방 권한 증명, 의약품 배치 추적 이벤트, 경로 증명, 픽업 확인을 기록합니다."
      },
      {
        icon: "chaincode",
        title: "스마트 계약 / 체인코드",
        badge: "경로 매칭 규칙",
        description: "처방자 역할, 진료과 권한, 의약품 유형, 재고 증명, 픽업 자격을 검증합니다."
      },
      {
        icon: "fhir",
        title: "HL7 FHIR 인터페이스",
        badge: "재고 데이터 인터페이스",
        description: "병원 약국 재고, 처방 요청, 조제 상태, 픽업 가능 시간을 동기화합니다."
      },
      {
        icon: "authority",
        title: "처방 권한 등록부",
        badge: "처방 가능 여부 확인",
        description: "의사 또는 기관이 해당 의약품 유형을 처방할 권한이 있는지 확인합니다."
      },
      {
        icon: "batch",
        title: "의약품 배치 추적",
        badge: "위조 방지 증명",
        description: "제조사, 유통사, 병원 약국 입고, 환자 픽업 이벤트를 추적합니다."
      },
      {
        icon: "safety",
        title: "MediChain 안전 맥락",
        badge: "승인된 환자 병력",
        description: "환자가 승인한 알레르기, 만성질환, 기존 복약 기록을 사용하여 안전성을 확인합니다."
      }
    ],
    flowTitle: "MediRx 조제 경로 흐름",
    flowNodes: [
      ["처방 수요", "MediChain"],
      ["MediChain 안전 맥락", "MediChain"],
      ["처방 권한 확인", "권한 등록부"],
      ["FHIR 재고 동기화", "HL7 FHIR"],
      ["스마트 계약 경로 매칭", "체인코드"],
      ["배치 증명 검증", "배치 추적"],
      ["픽업 경로 발급", "의약품 채널"],
      ["의약품 채널 감사 증명", "Hyperledger Fabric"]
    ],
    leftPanelTitle: "처방 수요 및 환자 맥락",
    caseSelector: "사례 선택",
    fields: {
      patient: "환자",
      location: "위치",
      need: "처방 수요",
      category: "의약품 유형",
      urgency: "긴급도",
      history: "승인된 병력",
      medication: "현재 복약",
      requester: "요청자",
      consent: "동의 상태",
      authority: "필요 권한",
      inventory: "재고",
      batch: "배치 증명",
      status: "상태"
    },
    patientName: "Ms. Chen",
    locationValue: "Chengdu",
    authorizedHistory: "당뇨병, 고혈압, 페니실린 알레르기",
    currentMedication: "메트포르민, 아토르바스타틴",
    requestedBy: "West China Hospital / 내분비내과 의사",
    consentStatus: "MediChain 복약 안전 맥락 승인됨",
    verifyGenerateDispensingRoute: "검증 후 조제 경로 생성",
    verifyButton: "검증 후 조제 경로 생성",
    verifyingRoute: "경로를 검증하는 중...",
    routePendingStatus: "대기 중",
    dispensingRouteVerifiedToast: "조제 경로가 검증되었습니다. 이제 픽업 바우처를 발급할 수 있습니다.",
    routePanelTitle: "실시간 권한 및 재고 라우팅 흐름",
    pipeline: [
      {
        title: "환자 동의 확인",
        tech: "MediChain",
        status: "승인됨",
        text: "알레르기 및 복약 이력을 사용하기 전에 환자 동의를 확인합니다.",
        preview: "scope = 알레르기 + 만성질환 + 현재 복약"
      },
      {
        title: "처방 권한 확인",
        tech: "권한 등록부 + 체인코드",
        status: "검증됨",
        text: "의사의 진료과 권한과 의약품 유형 권한을 확인합니다.",
        preview: "내분비내과 의사 → 만성질환 리필 허용"
      },
      {
        title: "처방 메타데이터 동기화",
        tech: "HL7 FHIR",
        status: "동기화됨",
        text: "FHIR 호환 API를 통해 처방 요청과 메타데이터를 읽습니다.",
        preview: "GET /fhir/R4/MedicationRequest?id=RX-2026-0418"
      },
      {
        title: "재고 가용성 조회",
        tech: "HL7 FHIR",
        status: "실시간",
        text: "병원 및 약국 재고, 픽업 가능 시간, 조제 가능 상태를 조회합니다.",
        preview: "인슐린 글라진 재고 있음, 오늘 16:00 픽업 가능"
      },
      {
        title: "복약 안전 확인",
        tech: "MediChain + 안전 규칙",
        status: "통과",
        text: "알레르기, 만성질환, 현재 복약 충돌을 확인합니다.",
        preview: "금기 충돌 없음"
      },
      {
        title: "배치 증명 검증",
        tech: "Fabric 의약품 채널",
        status: "검증됨",
        text: "배치 출처, 유통사 인계, 병원 입고, 변조 방지 증명을 검증합니다.",
        preview: "BATCH-INS-2026-0418 검증됨"
      },
      {
        title: "경로 매칭",
        tech: "스마트 계약 / 체인코드",
        status: "매칭됨",
        text: "처방 권한과 재고가 있는 가장 가까운 기관을 매칭합니다.",
        preview: "West China Hospital Pharmacy → Chengdu Jinjiang 픽업 경로"
      },
      {
        title: "감사 증명",
        tech: "Hyperledger Fabric",
        status: "기록됨",
        text: "처방 권한 증명, 재고 증명, 경로 증명, 픽업 바우처를 기록합니다.",
        preview: "RX_ROUTE_MATCHED → PICKUP_VOUCHER_ISSUED"
      }
    ],
    outputTitle: "조제 경로 결과",
    recommendedRoute: "추천 경로",
    whyThisRoute: "이 경로를 추천하는 이유",
    pickupVoucher: "픽업 바우처",
    routeProof: "경로 증명",
    issuePickupVoucher: "픽업 바우처 발급",
    pickupVoucherDisabledTooltip: "픽업 바우처를 발급하기 전에 조제 경로를 먼저 검증하세요.",
    pickupVoucherGenerated: "픽업 바우처가 생성되었습니다",
    voucherId: "바우처 ID",
    patient: "환자",
    medication: "의약품",
    medicineCategory: "의약품 유형",
    prescribingVerificationSource: "처방 확인 기관",
    recommendedPickupPoint: "추천 픽업 지점",
    pickupWindow: "픽업 시간",
    voucherValidity: "바우처 유효기간",
    batchProof: "배치 증명",
    onchainAuditEvent: "온체인 감사 이벤트",
    copyVoucherId: "바우처 ID 복사",
    close: "닫기",
    voucherIdCopiedToast: "바우처 ID가 복사되었습니다.",
    pickupVoucherIssuedStatus: "픽업 바우처 발급 완료 — 승인된 조제 가능",
    pickupVoucherIssuedToast: "픽업 바우처가 발급되었고 감사 이벤트가 기록되었습니다.",
    viewPickupVoucher: "픽업 바우처 보기",
    notIssuedYet: "아직 발급되지 않음",
    routeVerifiedReadyToIssue: "경로 검증 완료 — 픽업 바우처 발급 가능",
    pickupVoucherIssuedEvent: "PICKUP_VOUCHER_ISSUED 픽업 바우처 발급됨",
    rxRouteMatchedEvent: "RX_ROUTE_MATCHED 경로 매칭 완료",
    voucherDetails: {
      id: "PV-CHEN-2026-0418",
      patient: "Ms. Chen",
      medication: "인슐린 글라진",
      category: "만성질환 리필",
      source: "West China Hospital / 내분비내과 의사",
      pickupPoint: "Chengdu Jinjiang District Community Health Center Pharmacy",
      pickupWindow: "오늘 16:00–18:00",
      validity: "24시간",
      batchProof: "BATCH-INS-2026-0418 검증됨",
      routeProof: "0x4119dccb...bdb4db",
      auditEvent: "PICKUP_VOUCHER_ISSUED"
    },
    inspectTechnologyTrace: "기술 추적 보기",
    institutionMatchingTitle: "기관 매칭",
    filterChips: ["처방 권한 있음", "재고 있음", "배치 증명 검증됨", "24시간 이내 픽업"],
    tableHeaders: {
      institution: "기관",
      level: "등급",
      distance: "거리",
      authority: "처방 권한",
      stock: "FHIR 재고 상태",
      batch: "배치 증명",
      slot: "다음 픽업 시간",
      score: "경로 점수",
      notes: "비고"
    },
    inventoryTitle: "HL7 FHIR 기반 재고 스냅샷",
    inventorySubtitle:
      "재고는 병원 약국 시스템과 FHIR 인터페이스를 통해 조회됩니다. 블록체인은 전체 실시간 재고표가 아니라 서명된 재고 증명과 배치 이벤트를 기록합니다.",
    inventoryFields: {
      fhir: "FHIR 상태",
      proof: "재고 증명",
      sync: "최근 동기화",
      batch: "배치 증명",
      live: "실시간 동기화",
      signed: "서명됨",
      verified: "검증됨",
      pending: "대기 중"
    },
    batchTimelineTitle: "의약품 배치 추적 타임라인",
    batchTimelineSubtitle:
      "배치 이벤트는 Fabric 의약품 채널에 기록되어 위조 방지 증명, 병원 조달 감사, 규제기관 추적을 지원합니다.",
    batchTimeline: [
      {
        title: "제조사 출고",
        event: "MANUFACTURER_RELEASED",
        text: "제조사가 배치 인증서를 발급하고 배치 ID를 생성합니다.",
        proof: "배치 인증서 해시 기록됨."
      },
      {
        title: "유통사 인계",
        event: "DISTRIBUTOR_HANDOFF",
        text: "유통사가 보관 이전과 콜드체인 상태를 기록합니다.",
        proof: "인계 이벤트 서명됨."
      },
      {
        title: "병원 약국 입고",
        event: "HOSPITAL_RECEIPT",
        text: "병원 약국이 패키지를 스캔하고 배치를 검증하며 재고를 업데이트합니다.",
        proof: "입고 증명 온체인 기록됨."
      },
      {
        title: "IPFS 배치 문서",
        event: "BATCH_DOC_ANCHORED",
        text: "암호화된 배치 문서는 오프체인에 저장되고 CID는 온체인에서 참조됩니다.",
        proof: "IPFS CID + 문서 해시."
      },
      {
        title: "경로 매칭",
        event: "RX_ROUTE_MATCHED",
        text: "스마트 계약이 처방 권한, 재고, 경로, 배치 증명을 매칭합니다.",
        proof: "경로 증명 생성됨."
      },
      {
        title: "환자 픽업 확인",
        event: "PICKUP_CONFIRMED",
        text: "환자 픽업이 확인되고 조제 감사가 완료됩니다.",
        proof: "픽업 바우처 기록됨."
      }
    ],
    safetyTitle: "안전 및 컴플라이언스 경계",
    safetyItems: [
      "MedLink는 처방전을 발급하지 않습니다.",
      "최종 처방 권한은 면허를 가진 의사에게 있습니다.",
      "재고는 FHIR를 통해 조회되며, 블록체인은 서명된 재고 증명과 배치 이벤트를 기록합니다.",
      "스마트 계약은 경로 자격을 매칭하지만 임상 처방 결정을 내리지 않습니다.",
      "복약 안전 확인은 환자가 승인한 MediChain 기록만 사용합니다.",
      "배치 추적은 위조 방지 증명, 병원 조달 감사, 규제기관 검토를 지원합니다."
    ],
    traceTitle: "MediRx 기술 추적",
    traceTabs: {
      authority: "처방 권한",
      fhir: "FHIR 재고",
      chaincode: "체인코드 경로 매칭",
      batch: "배치 추적",
      safety: "복약 안전 맥락",
      audit: "감사 및 컴플라이언스"
    },
    traceNotes: {
      authority:
        "이 단계는 의사 또는 기관이 해당 의약품 유형을 처방할 권한이 있는지 확인합니다. MedLink는 처방전을 발급하지 않고 처방 권한과 경로 자격만 검증합니다.",
      fhir:
        "재고는 병원 약국 시스템과 FHIR 인터페이스를 통해 조회됩니다. 온체인에는 전체 재고 세부정보가 아니라 서명된 재고 증명과 관련 이벤트만 기록됩니다.",
      chaincode:
        "체인코드는 처방 권한, 재고, 배치 증명, 환자 안전 맥락, 픽업 가능 시간을 기준으로 경로 증명을 생성합니다.",
      batch:
        "배치 추적은 위조 방지, 규제기관 추적, 병원 조달 검증을 지원하며, 의약품 온체인 인증 수수료의 핵심 가치입니다.",
      safety:
        "복약 안전 맥락은 환자가 승인한 MediChain 의료기록에서 제공되며, 알레르기와 복약 충돌 확인에 사용됩니다.",
      audit:
        "온체인 기록은 감사와 컴플라이언스 증명에 사용되며, 처방전 평문이나 전체 환자 개인정보를 저장하지 않습니다."
    },
    cases: {
      diabetes: {
        label: "만성 당뇨병 리필",
        need: "당뇨병 약물 지속성을 위한 인슐린 글라진 리필",
        category: "만성질환 리필",
        urgency: "24시간 이내",
        authority: "내분비내과 또는 만성질환 관리 의사",
        inventory: "있음",
        route: "West China Hospital Pharmacy → Chengdu Jinjiang District Community Health Center Pharmacy",
        batch: "검증됨",
        status: "승인된 조제 가능",
        routeProof: "0x4119dccb...bdb4db",
        voucher: "PV-CHEN-2026-0418",
        reasons: ["처방 권한 검증 완료", "의약품 재고 있음", "배치 증명 검증 완료", "환자 복약 안전 확인 통과", "가장 가까운 승인된 픽업 지점", "오늘 픽업 가능"],
        caseNote: "만성질환 리필은 권한, 재고, 배치 증명을 확인한 뒤 오늘 픽업 경로를 생성합니다."
      },
      oncology: {
        label: "표적 항암제",
        need: "표적 항암제 리필",
        category: "고가 항암제",
        urgency: "전문의 검토 필요",
        authority: "상급 종합병원 종양 전문의",
        inventory: "제한적",
        route: "Sichuan Cancer Hospital 전문 약국",
        batch: "필수, 검증됨",
        status: "전문의 검토 필요",
        routeProof: "0x8d62aa19...04ce91",
        voucher: "PV-CHEN-ONC-0418",
        reasons: ["전문의 처방 권한 필요", "고가 항암제 재고 제한", "배치 증명 필수", "조제 전 전문의 검토 필요", "전문 약국에서 배치 문서 검증 가능"],
        caseNote: "고가 표적 항암제는 일반 약국이 아니라 전문 병원 검토 경로로 이동합니다."
      },
      antibiotic: {
        label: "일반 항생제",
        need: "일반 항생제 요청",
        category: "일반 외래 의약품",
        urgency: "일반",
        authority: "1차 진료 의사",
        inventory: "있음",
        route: "Chengdu Jinjiang District Community Health Center Pharmacy",
        batch: "검증됨",
        status: "일반 조제 가능",
        routeProof: "0x35cf1d29...ab9021",
        voucher: "PV-CHEN-ABX-0418",
        reasons: ["1차 진료 의사 권한으로 충분", "가까운 지역사회 약국에 재고 있음", "배치 증명 검증됨", "제한 의약품 규칙이 트리거되지 않음", "일반 픽업 경로로 대형 병원 부담 감소"],
        caseNote: "일반 외래 의약품은 권한과 재고가 유효하면 1차 병원 약국으로 매칭됩니다."
      },
      mental: {
        label: "정신건강 제한 의약품",
        need: "정신건강 의약품 리필",
        category: "제한 의약품",
        urgency: "권한 검토 필요",
        authority: "정신건강의학과 전문의",
        inventory: "권한 확인 전 비공개",
        route: "전문 병원 검토",
        batch: "필수",
        status: "권한 검토 필요",
        routeProof: "0x7b91fa54...5e22ac",
        voucher: "PV-CHEN-MH-0418",
        reasons: ["제한 의약품은 전문의 권한 필요", "권한 확인 전 재고 비공개", "픽업 경로 표시 전 배치 증명 필수", "컴플라이언스 검토로 임의 경로 생성을 방지"],
        caseNote: "제한 의약품은 전문의 권한 검토 전에는 일반 픽업 경로를 표시하지 않습니다."
      }
    },
    institutionRows: [
      {
        institution: "West China Hospital, Sichuan University",
        level: "3차 병원 (상급종합병원)",
        distance: "7.4 km",
        authority: "검증됨",
        stock: "있음",
        batch: "검증됨",
        slot: "오늘 16:00",
        score: "92",
        notes: "전체 권한, FHIR 재고 실시간 동기화"
      },
      {
        institution: "Chengdu Second People’s Hospital",
        level: "2차 병원 (일반 종합병원)",
        distance: "3.8 km",
        authority: "검증됨",
        stock: "34펜",
        batch: "검증됨",
        slot: "내일 09:20",
        score: "83",
        notes: "재고 있음, 픽업 시간이 더 늦음"
      },
      {
        institution: "Chengdu Jinjiang District Community Health Center",
        level: "1차 병원 (의원, 보건소)",
        distance: "1.2 km",
        authority: "제한적",
        stock: "있음",
        batch: "검증됨",
        slot: "오늘 18:30",
        score: "78",
        notes: "상급 병원 처방 확인 후 픽업 가능"
      },
      {
        institution: "Sichuan Cancer Hospital",
        level: "3차 병원 (상급종합병원) / 전문병원",
        distance: "9.1 km",
        authority: "이 만성질환 리필에는 불필요",
        stock: "있음",
        batch: "검증됨",
        slot: "5월 1일 10:00",
        score: "62",
        notes: "당뇨병 리필에는 최적 선택이 아님"
      },
      {
        institution: "Chengdu Xinhua Primary Care Clinic",
        level: "1차 병원 (의원, 보건소)",
        distance: "0.8 km",
        authority: "부족",
        stock: "있음",
        batch: "대기 중",
        slot: "오늘 15:10",
        score: "45",
        notes: "커넥터 검토 필요"
      }
    ],
    inventoryCards: [
      {
        name: "Chengdu Jinjiang District Community Health Center Pharmacy",
        type: "지역사회 약국",
        score: "91",
        medicines: ["인슐린 글라진: 42펜", "메트포르민 500mg: 120팩", "아토르바스타틴 20mg: 42팩"]
      },
      {
        name: "West China Hospital, Sichuan University Pharmacy",
        type: "병원 약국",
        score: "86",
        medicines: ["인슐린 글라진: 80펜", "아픽사반 2.5mg: 24팩", "항암제 콜드체인 캐비닛: 제한적"]
      },
      {
        name: "Chengdu Xinhua Primary Care Clinic Pharmacy",
        type: "1차 병원 약국",
        score: "78",
        medicines: ["아목시실린-클라불라네이트: 있음", "부데소니드 200: 6개", "살부타몰 흡입제: 8개"]
      }
    ]
  }
};

type MedirxCopy = typeof MEDIRX_COPY.en;
type MedirxCase = MedirxCopy["cases"][CaseId];

function localeFromLanguage(language: string): Locale {
  if (language === "ko") {
    return "ko";
  }
  if (language === "zh-CN" || language === "zh-TW") {
    return "zh";
  }
  return "en";
}

function statusClasses(caseId: CaseId) {
  if (caseId === "oncology" || caseId === "mental") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function tracePayloadFor(tabId: TraceTabId, selectedCase: MedirxCase, voucherIssued: boolean) {
  const routeProof = selectedCase.routeProof;
  const auditEvents = [
    "AUTHORITY_VERIFIED",
    "FHIR_INVENTORY_SYNCED",
    "BATCH_PROOF_VERIFIED",
    "RX_ROUTE_MATCHED",
    ...(voucherIssued ? ["PICKUP_VOUCHER_ISSUED"] : [])
  ];

  const payloads = {
    authority: {
      doctorId: "westchina-endo-dr-li",
      department: selectedCase.authority,
      medicineCategory: selectedCase.category,
      authorityStatus: selectedCase.status,
      authorityScope: ["diabetes medication", "chronic refill"],
      validUntil: "2026-12-31"
    },
    fhir: {
      api: "HL7 FHIR",
      endpoint: "/fhir/R4/MedicationDispense?medicine=insulin-glargine&city=chengdu",
      inventorySource: "hospital-pharmacy-system",
      stockStatus: selectedCase.inventory,
      pickupSlot: "2026-04-29T16:00:00+08:00",
      signedInventoryProof: "0x9fa3...c21b"
    },
    chaincode: {
      channel: "drug-supply-channel",
      event: "RX_ROUTE_MATCHED",
      rules: [
        "prescriber_authority_verified",
        "stock_available",
        "batch_proof_verified",
        "pickup_slot_available",
        "patient_safety_context_passed"
      ],
      recommendedRoute: selectedCase.route,
      routeProof
    },
    batch: {
      batchId: "BATCH-INS-2026-0418",
      manufacturer: "Sichuan Pharma Co.",
      distributor: "Sichuan Verified Medical Distributor",
      hospitalReceipt: "West China Hospital Pharmacy",
      ipfsCid: "bafkrei97991dced31867822e18c5",
      events: ["MANUFACTURER_RELEASED", "DISTRIBUTOR_HANDOFF", "HOSPITAL_RECEIPT", "BATCH_DOC_ANCHORED"]
    },
    safety: {
      source: "MediChain",
      consentStatus: "active",
      authorizedContext: ["allergy record", "chronic disease history", "current medication"],
      allergy: "penicillin",
      currentMedication: ["metformin", "atorvastatin"],
      interactionCheck: "passed"
    },
    audit: {
      auditEvents,
      privacyBoundary: "no plaintext prescription stored on-chain",
      complianceUse: ["procurement audit", "anti-counterfeit proof", "prescription compliance review"]
    }
  };

  return payloads[tabId];
}

export default function MediRxPage() {
  const { language } = useLanguage();
  const locale = localeFromLanguage(language);
  const copy = MEDIRX_COPY[locale];
  const [selectedCaseId, setSelectedCaseId] = useState<CaseId>("diabetes");
  const [traceOpen, setTraceOpen] = useState(false);
  const [activeTraceTab, setActiveTraceTab] = useState<TraceTabId>("authority");
  const [routeSeed, setRouteSeed] = useState("medirx-initial");
  const [routeVerified, setRouteVerified] = useState(false);
  const [voucherIssued, setVoucherIssued] = useState(false);
  const [isVerifyingRoute, setIsVerifyingRoute] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const verificationRunRef = useRef(0);

  const selectedCase = copy.cases[selectedCaseId];
  const routeTxHash = useMemo(() => generateTxHash(`${routeSeed}:${selectedCase.need}`), [routeSeed, selectedCase.need]);
  const displayedVoucher = voucherIssued ? copy.voucherDetails.id : copy.notIssuedYet;
  const displayedStatus = voucherIssued
    ? copy.pickupVoucherIssuedStatus
    : routeVerified
      ? copy.routeVerifiedReadyToIssue
      : selectedCase.status;
  const displayedTimeline = voucherIssued
    ? [
        ...copy.batchTimeline,
        {
          title: copy.pickupVoucherIssuedEvent,
          event: "PICKUP_VOUCHER_ISSUED",
          text: copy.pickupVoucherIssuedToast,
          proof: copy.voucherDetails.id
        }
      ]
    : copy.batchTimeline;

  const openTrace = (tab: TraceTabId = "authority") => {
    setActiveTraceTab(tab);
    setTraceOpen(true);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2600);
  };

  const handleSelectCase = (caseId: CaseId) => {
    verificationRunRef.current += 1;
    setSelectedCaseId(caseId);
    setRouteVerified(false);
    setVoucherIssued(false);
    setIsVerifyingRoute(false);
    setVoucherModalOpen(false);
    setTraceOpen(false);
    setRouteSeed(`medirx-${caseId}-reset`);
  };

  const handleRunRoute = () => {
    if (isVerifyingRoute) {
      return;
    }
    setIsVerifyingRoute(true);
    setRouteVerified(false);
    setVoucherIssued(false);
    setVoucherModalOpen(false);
    const runId = verificationRunRef.current + 1;
    verificationRunRef.current = runId;
    setRouteSeed(`medirx-${selectedCaseId}-${Date.now()}`);
    window.setTimeout(() => {
      if (verificationRunRef.current !== runId) {
        return;
      }
      setRouteVerified(true);
      setIsVerifyingRoute(false);
      showToast(copy.dispensingRouteVerifiedToast);
    }, 1200);
  };

  const handleIssuePickupVoucher = () => {
    if (!routeVerified) {
      showToast(copy.pickupVoucherDisabledTooltip);
      return;
    }
    if (!voucherIssued) {
      setVoucherIssued(true);
      showToast(copy.pickupVoucherIssuedToast);
    }
    setVoucherModalOpen(true);
  };

  const handleCopyVoucherId = async () => {
    try {
      await navigator.clipboard.writeText(copy.voucherDetails.id);
    } catch {
      // Clipboard may be unavailable in some browser previews; the visible ID remains on screen.
    }
    showToast(copy.voucherIdCopiedToast);
  };

  const handleInspectTraceFromVoucher = () => {
    setVoucherModalOpen(false);
    openTrace("audit");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden px-5 pb-16 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{copy.pageLabel}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{copy.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">{copy.subtitle}</p>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="min-w-0">{copy.noPrescriptionChip}</span>
          </div>
        </motion.header>

        <section className="mt-7">
          <SectionHeading title={copy.techStackTitle} />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.techStack.map((item) => {
              const Icon = iconMap[item.icon];
              return <TechStackCard key={item.title} item={item} icon={Icon} />;
            })}
          </div>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <SectionHeading title={copy.flowTitle} />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {copy.flowNodes.map(([label, badge], index) => (
              <div key={label} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <span className="mt-2 inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                      {badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="glass-card min-w-0 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                <Pill className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{copy.leftPanelTitle}</h2>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">{copy.caseSelector}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {CASE_IDS.map((caseId) => {
                  const item = copy.cases[caseId];
                  const active = selectedCaseId === caseId;
                  return (
                    <button
                      key={caseId}
                      type="button"
                      onClick={() => handleSelectCase(caseId)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                        active
                          ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{item.caseNote}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label={copy.fields.patient} value={copy.patientName} />
                <FieldRow label={copy.fields.location} value={copy.locationValue} />
                <FieldRow label={copy.fields.need} value={selectedCase.need} wide />
                <FieldRow label={copy.fields.category} value={selectedCase.category} />
                <FieldRow label={copy.fields.urgency} value={selectedCase.urgency} />
                <FieldRow label={copy.fields.authority} value={selectedCase.authority} wide />
                <FieldRow label={copy.fields.inventory} value={selectedCase.inventory} />
                <FieldRow label={copy.fields.batch} value={selectedCase.batch} />
                <FieldRow label={copy.fields.history} value={copy.authorizedHistory} wide icon={LockKeyhole} />
                <FieldRow label={copy.fields.medication} value={copy.currentMedication} wide />
                <FieldRow label={copy.fields.requester} value={copy.requestedBy} wide />
                <FieldRow label={copy.fields.consent} value={copy.consentStatus} wide icon={Fingerprint} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunRoute}
              disabled={isVerifyingRoute}
              className="primary-button mt-5 h-12 disabled:cursor-wait disabled:opacity-75"
            >
              {isVerifyingRoute ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
              {isVerifyingRoute ? copy.verifyingRoute : copy.verifyGenerateDispensingRoute}
            </button>
          </section>

          <section className="glass-card min-w-0 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{copy.routePanelTitle}</h2>
            <div className="mt-5 grid gap-3">
              {copy.pipeline.map((step, index) => (
                <PipelineStep
                  key={step.title}
                  index={index + 1}
                  step={step}
                  selectedCaseId={selectedCaseId}
                  routeVerified={routeVerified}
                  pendingStatus={copy.routePendingStatus}
                />
              ))}
            </div>
          </section>
        </div>

        <section className="glass-card mt-6 rounded-2xl p-5">
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading title={copy.outputTitle} />
              <div className="mt-4 grid gap-3">
                <InfoCard icon={Route} label={copy.recommendedRoute} value={selectedCase.route} />
                <InfoCard icon={ClipboardList} label={copy.pickupVoucher} value={displayedVoucher} />
                <InfoCard icon={Fingerprint} label={copy.routeProof} value={selectedCase.routeProof} mono />
                <div className={`rounded-2xl border p-4 ${statusClasses(selectedCaseId)}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">{copy.fields.status}</p>
                  <p className="mt-2 text-base font-semibold">{displayedStatus}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{copy.whyThisRoute}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selectedCase.reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleIssuePickupVoucher}
                  disabled={!routeVerified || isVerifyingRoute}
                  title={!routeVerified ? copy.pickupVoucherDisabledTooltip : undefined}
                  className={`h-11 ${
                    routeVerified && !isVerifyingRoute
                      ? "primary-button"
                      : "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400"
                  }`}
                >
                  <BadgeCheck className="h-4 w-4" />
                  {voucherIssued ? copy.viewPickupVoucher : copy.issuePickupVoucher}
                </button>
                <button type="button" onClick={() => openTrace("chaincode")} className="secondary-button h-11">
                  <FileCheck2 className="h-4 w-4" />
                  {copy.inspectTechnologyTrace}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card mt-6 min-w-0 rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <SectionHeading title={copy.institutionMatchingTitle} />
            <div className="flex flex-wrap gap-2">
              {copy.filterChips.map((chip) => (
                <span key={chip} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <TableHead width="18%">{copy.tableHeaders.institution}</TableHead>
                  <TableHead width="12%">{copy.tableHeaders.level}</TableHead>
                  <TableHead width="8%">{copy.tableHeaders.distance}</TableHead>
                  <TableHead width="13%">{copy.tableHeaders.authority}</TableHead>
                  <TableHead width="12%">{copy.tableHeaders.stock}</TableHead>
                  <TableHead width="10%">{copy.tableHeaders.batch}</TableHead>
                  <TableHead width="10%">{copy.tableHeaders.slot}</TableHead>
                  <TableHead width="7%">{copy.tableHeaders.score}</TableHead>
                  <TableHead width="10%">{copy.tableHeaders.notes}</TableHead>
                </tr>
              </thead>
              <tbody>
                {copy.institutionRows.map((row) => {
                  const highlightedRoute =
                    routeVerified &&
                    (row.institution.includes("West China") ||
                      row.institution.includes("华西") ||
                      row.institution.includes("Jinjiang") ||
                      row.institution.includes("锦江"));

                  return (
                  <tr
                    key={row.institution}
                    className={`border-t align-top text-sm transition ${
                      highlightedRoute
                        ? "border-sky-200 bg-sky-50/70 text-slate-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <TableCell className="font-semibold text-slate-900">{row.institution}</TableCell>
                    <TableCell>{row.level}</TableCell>
                    <TableCell>{row.distance}</TableCell>
                    <TableCell>{row.authority}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.batch.includes("Pending") || row.batch.includes("待") || row.batch.includes("대기") ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {row.batch}
                      </span>
                    </TableCell>
                    <TableCell>{row.slot}</TableCell>
                    <TableCell>
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{row.score}</span>
                    </TableCell>
                    <TableCell>{row.notes}</TableCell>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-card rounded-2xl p-5">
            <SectionHeading title={copy.inventoryTitle} subtitle={copy.inventorySubtitle} />
            <div className="mt-5 grid gap-4">
              {copy.inventoryCards.map((card, index) => (
                <div key={card.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{card.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{card.type}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {card.score}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {card.medicines.map((medicine) => (
                      <span key={medicine} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                        {medicine}
                      </span>
                    ))}
                    <MiniProof label={copy.inventoryFields.fhir} value={copy.inventoryFields.live} />
                    <MiniProof label={copy.inventoryFields.proof} value={copy.inventoryFields.signed} />
                    <MiniProof label={copy.inventoryFields.sync} value={index === 0 ? "09:42" : index === 1 ? "09:39" : "09:31"} />
                    <MiniProof label={copy.inventoryFields.batch} value={index === 2 ? copy.inventoryFields.pending : copy.inventoryFields.verified} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <SectionHeading title={copy.batchTimelineTitle} subtitle={copy.batchTimelineSubtitle} />
            <ol className="mt-5 grid gap-4">
              {displayedTimeline.map((item, index) => {
                const highlightedEvent =
                  (routeVerified && item.event === "RX_ROUTE_MATCHED") || item.event === "PICKUP_VOUCHER_ISSUED";
                const eventLabel =
                  item.event === "RX_ROUTE_MATCHED" && routeVerified
                    ? copy.rxRouteMatchedEvent
                    : item.event === "PICKUP_VOUCHER_ISSUED"
                      ? copy.pickupVoucherIssuedEvent
                      : item.event;

                return (
                <li
                  key={`${item.event}-${index}`}
                  className={`relative rounded-r-2xl border-l pl-5 ${
                    highlightedEvent ? "border-emerald-400 bg-emerald-50/60 py-3 pr-3" : "border-sky-200"
                  }`}
                >
                  <span
                    className={`absolute -left-2 top-4 flex h-4 w-4 rounded-full shadow-[0_0_18px_rgba(14,165,233,0.35)] ${
                      highlightedEvent ? "bg-emerald-500" : "bg-sky-500"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{index + 1}. {item.title}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                        highlightedEvent
                          ? "border-emerald-200 bg-white text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {eventLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">{item.proof}</p>
                </li>
                );
              })}
            </ol>
          </section>
        </div>

        <section className="glass-card mt-6 rounded-2xl border-emerald-100 bg-emerald-50/40 p-5">
          <SectionHeading title={copy.safetyTitle} />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {copy.safetyItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-sm leading-6 text-slate-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <TechnologyTraceDrawer
        copy={copy}
        selectedCase={selectedCase}
        open={traceOpen}
        activeTab={activeTraceTab}
        onSelectTab={setActiveTraceTab}
        onClose={() => setTraceOpen(false)}
        routeTxHash={routeTxHash}
        voucherIssued={voucherIssued}
      />

      <PickupVoucherModal
        copy={copy}
        open={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        onCopy={handleCopyVoucherId}
        onInspectTrace={handleInspectTraceFromVoucher}
      />

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-2xl shadow-slate-900/15">
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function TechStackCard({
  item,
  icon: Icon
}: {
  item: MedirxCopy["techStack"][number];
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{item.title}</p>
          <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {item.badge}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
    </div>
  );
}

function FieldRow({
  label,
  value,
  wide = false,
  icon: Icon
}: {
  label: string;
  value: string;
  wide?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {Icon ? <Icon className="h-3.5 w-3.5 text-emerald-600" /> : null}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function PipelineStep({
  index,
  step,
  selectedCaseId,
  routeVerified,
  pendingStatus
}: {
  index: number;
  step: MedirxCopy["pipeline"][number];
  selectedCaseId: CaseId;
  routeVerified: boolean;
  pendingStatus: string;
}) {
  const warningStep = selectedCaseId === "mental" && index === 2;
  const completed = routeVerified;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        completed
          ? warningStep
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            completed ? (warningStep ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-300"
          } text-white`}
        >
          {completed ? <Check className="h-4 w-4" /> : <span className="text-sm font-semibold">{index}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{step.title}</p>
            <span className="rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              {step.tech}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                completed
                  ? warningStep
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {completed ? step.status : pendingStatus}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
          <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-[11px] leading-5 text-slate-500">{step.preview}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  mono = false
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className={`mt-2 text-sm font-semibold leading-6 text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, width }: { children: ReactNode; width: string }) {
  return (
    <th style={{ width }} className="px-4 py-4 font-medium">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`break-words px-4 py-4 leading-6 ${className}`}>{children}</td>;
}

function MiniProof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PickupVoucherModal({
  copy,
  open,
  onClose,
  onCopy,
  onInspectTrace
}: {
  copy: MedirxCopy;
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
  onInspectTrace: () => void;
}) {
  if (!open) {
    return null;
  }

  const details = [
    [copy.voucherId, copy.voucherDetails.id],
    [copy.patient, copy.voucherDetails.patient],
    [copy.medication, copy.voucherDetails.medication],
    [copy.medicineCategory, copy.voucherDetails.category],
    [copy.prescribingVerificationSource, copy.voucherDetails.source],
    [copy.recommendedPickupPoint, copy.voucherDetails.pickupPoint],
    [copy.pickupWindow, copy.voucherDetails.pickupWindow],
    [copy.voucherValidity, copy.voucherDetails.validity],
    [copy.batchProof, copy.voucherDetails.batchProof],
    [copy.routeProof, copy.voucherDetails.routeProof],
    [copy.onchainAuditEvent, copy.voucherDetails.auditEvent]
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">MEDIRX</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{copy.pickupVoucherGenerated}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
              <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onInspectTrace} className="secondary-button h-11">
            <FileCheck2 className="h-4 w-4" />
            {copy.inspectTechnologyTrace}
          </button>
          <button type="button" onClick={onCopy} className="secondary-button h-11">
            <ClipboardList className="h-4 w-4" />
            {copy.copyVoucherId}
          </button>
          <button type="button" onClick={onClose} className="primary-button h-11">
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function TechnologyTraceDrawer({
  copy,
  selectedCase,
  open,
  activeTab,
  onSelectTab,
  onClose,
  routeTxHash,
  voucherIssued
}: {
  copy: MedirxCopy;
  selectedCase: MedirxCase;
  open: boolean;
  activeTab: TraceTabId;
  onSelectTab: (tab: TraceTabId) => void;
  onClose: () => void;
  routeTxHash: string;
  voucherIssued: boolean;
}) {
  if (!open) {
    return null;
  }

  const payload = {
    ...tracePayloadFor(activeTab, selectedCase, voucherIssued),
    demoTxHash: routeTxHash
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">MEDIRX</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{copy.traceTitle}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {TRACE_TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => onSelectTab(tabId)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tabId
                    ? "border-sky-300 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-700"
                }`}
              >
                {copy.traceTabs[tabId]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm leading-7 text-slate-700">{copy.traceNotes[activeTab]}</p>
          </div>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-sky-100">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
