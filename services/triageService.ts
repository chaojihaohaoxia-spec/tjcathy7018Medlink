import { Patient, RiskLevel, mockPatients } from "@/data/mockPatients";

export type TriageInput = {
  patientId?: string;
  symptoms: string[];
  vitals?: Partial<Patient["vitals"]>;
  notes?: string;
};

export type TriageResult = {
  patientId?: string;
  riskLevel: RiskLevel;
  riskScore: number;
  recommendedAction: string;
  flags: string[];
  explanation: string;
  disclaimer: string;
};

const highRiskTerms = ["chest pain", "shortness of breath", "confusion", "stroke", "severe bleeding"];
const mediumRiskTerms = ["fever", "wheeze", "dizziness", "dehydration", "post-operative pain"];

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 75) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

export function runTriage(input: TriageInput): TriageResult {
  const symptomsText = input.symptoms.join(" ").toLowerCase();
  const patient = input.patientId ? mockPatients.find((item) => item.id === input.patientId) : undefined;
  const vitals = { ...patient?.vitals, ...input.vitals };
  const flags: string[] = [];
  let score = patient?.riskScore ?? 25;

  highRiskTerms.forEach((term) => {
    if (symptomsText.includes(term)) {
      score += 22;
      flags.push(`High-risk symptom: ${term}`);
    }
  });

  mediumRiskTerms.forEach((term) => {
    if (symptomsText.includes(term)) {
      score += 11;
      flags.push(`Clinical attention term: ${term}`);
    }
  });

  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 94) {
    score += 18;
    flags.push("Oxygen saturation below 94%");
  }

  if (vitals.heartRate && vitals.heartRate > 110) {
    score += 12;
    flags.push("Heart rate above 110 bpm");
  }

  if (vitals.temperatureC && vitals.temperatureC >= 38.3) {
    score += 10;
    flags.push("Temperature above 38.3C");
  }

  const riskScore = clampScore(score);
  const riskLevel = riskFromScore(riskScore);
  const recommendedAction =
    riskLevel === "high"
      ? "Escalate to emergency review and notify the care coordinator."
      : riskLevel === "medium"
        ? "Schedule clinician review, confirm consent scope, and monitor vitals."
        : "Continue routine monitoring and provide self-care guidance.";

  return {
    patientId: input.patientId,
    riskLevel,
    riskScore,
    recommendedAction,
    flags,
    explanation: "The prototype model combines symptoms, recent vitals, and baseline patient risk to prioritize care coordination.",
    disclaimer: "AI triage is decision support only and is not a final diagnosis."
  };
}

export function getTriageQueue() {
  return [...mockPatients]
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((patient) => ({
      patientId: patient.id,
      name: patient.name,
      did: patient.did,
      riskLevel: patient.riskLevel,
      riskScore: patient.riskScore,
      consentStatus: patient.consent.status,
      primaryCondition: patient.primaryCondition
    }));
}

export function getPatientTriageSnapshot(patientId: string) {
  const patient = mockPatients.find((item) => item.id === patientId);
  if (!patient) {
    return null;
  }

  return runTriage({
    patientId: patient.id,
    symptoms: [patient.primaryCondition],
    vitals: patient.vitals
  });
}
