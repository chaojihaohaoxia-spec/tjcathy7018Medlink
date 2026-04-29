import { mockPatients } from "@/data/mockPatients";

export type LedgerEventType = "CONSENT_GRANTED" | "RECORD_HASHED" | "PRESCRIPTION_ROUTED" | "AUDIT_REVIEWED";

export type LedgerEvent = {
  id: string;
  type: LedgerEventType;
  patientId: string;
  actor: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  summary: string;
  metadata: Record<string, string | number | boolean>;
};

const HEX = "0123456789abcdef";

export function generateTxHash(seed = "") {
  const entropy = `${seed}:${Date.now()}:${Math.random()}`;
  let hash = "";

  for (let index = 0; index < 64; index += 1) {
    const charCode = entropy.charCodeAt(index % entropy.length);
    const mixed = (charCode + index * 17 + Math.floor(Math.random() * 16)) % 16;
    hash += HEX[mixed];
  }

  return `0x${hash}`;
}

const ledgerEvents: LedgerEvent[] = [
  {
    id: "evt-001",
    type: "CONSENT_GRANTED",
    patientId: "pat-1001",
    actor: "Dr. Mira Wong",
    txHash: "0x9f4d0e6b0c92a7b10de81fb27f806bbef2f889c84bd936a7c145f01e30f0aa93",
    blockNumber: 1482291,
    timestamp: "2026-04-12T09:35:00Z",
    summary: "Consent granted for diabetes care coordination.",
    metadata: {
      scopes: "records.read,triage.write,prescription.route",
      channel: "sichuan-consent-channel",
      fabricOrg: "West China Hospital, Sichuan University"
    }
  },
  {
    id: "evt-002",
    type: "RECORD_HASHED",
    patientId: "pat-1001",
    actor: "FHIR Gateway",
    txHash: "0xa42f0b91fbd873c5f06e81e4cbe281f4fb45ed6c7a926fd831c53a46d512a9c2",
    blockNumber: 1482304,
    timestamp: "2026-04-12T09:38:00Z",
    summary: "HbA1c lab record hash anchored to ledger.",
    metadata: {
      storage: "IPFS",
      encryption: "AES-256",
      fhirResource: "Observation"
    }
  },
  {
    id: "evt-003",
    type: "PRESCRIPTION_ROUTED",
    patientId: "pat-1002",
    actor: "MediRx Routing Engine",
    txHash: "0x778aa597447f98dfb208b6db7d4d61ef39355f1618238177af6aa02027d856ae",
    blockNumber: 1482449,
    timestamp: "2026-04-21T13:10:00Z",
    summary: "Asthma medication routed to available pharmacy.",
    metadata: {
      pharmacy: "Chengdu Xinhua Community Clinic Pharmacy",
      medication: "Salbutamol",
      consentChecked: true
    }
  }
];

export function getLedgerEvents() {
  return ledgerEvents;
}

export function getPatientAuditTrail(patientId: string) {
  return ledgerEvents.filter((event) => event.patientId === patientId);
}

export function recordConsentGrant(input: {
  patientId: string;
  actor: string;
  scopes: string[];
  expiresAt: string;
}) {
  const patient = mockPatients.find((item) => item.id === input.patientId);
  if (!patient) {
    throw new Error("Patient not found for consent grant.");
  }

  const event: LedgerEvent = {
    id: `evt-${ledgerEvents.length + 1}`.padStart(7, "0"),
    type: "CONSENT_GRANTED",
    patientId: input.patientId,
    actor: input.actor,
    txHash: generateTxHash(input.patientId),
    blockNumber: 1482450 + ledgerEvents.length,
    timestamp: new Date().toISOString(),
    summary: `Consent granted for ${patient.name}.`,
    metadata: {
      scopes: input.scopes.join(","),
      expiresAt: input.expiresAt,
      consentChecked: true
    }
  };

  ledgerEvents.unshift(event);
  return event;
}

export function verifyRecordHash(recordHash: string) {
  const patient = mockPatients.find((item) => item.records.some((record) => record.hash === recordHash));
  const record = patient?.records.find((item) => item.hash === recordHash);

  return {
    verified: Boolean(patient && record),
    patientId: patient?.id ?? null,
    recordId: record?.id ?? null,
    checkedAt: new Date().toISOString(),
    proof: record ? generateTxHash(record.hash) : null
  };
}
