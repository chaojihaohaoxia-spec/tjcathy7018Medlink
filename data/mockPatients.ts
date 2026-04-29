export type RiskLevel = "low" | "medium" | "high";
export type ConsentStatus = "verified" | "pending" | "expired";

export type PatientRecord = {
  id: string;
  type: "lab" | "imaging" | "consultation" | "discharge" | "prescription";
  title: string;
  hash: string;
  createdAt: string;
  sourceHospitalId: string;
};

export type Patient = {
  id: string;
  did: string;
  name: string;
  age: number;
  gender: "female" | "male" | "non-binary";
  bloodType: string;
  insurancePlan: string;
  primaryCondition: string;
  allergies: string[];
  riskLevel: RiskLevel;
  riskScore: number;
  vitals: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    temperatureC: number;
    oxygenSaturation: number;
  };
  consent: {
    status: ConsentStatus;
    scopes: string[];
    authorizedHospitalIds: string[];
    expiresAt: string;
    txHash: string;
  };
  careTeam: Array<{
    name: string;
    role: string;
    hospitalId: string;
  }>;
  records: PatientRecord[];
  activePrescriptionIds: string[];
};

export const mockPatients: Patient[] = [
  {
    id: "pat-1001",
    did: "did:medlink:patient:CN-2038-1001",
    name: "Avery Chen",
    age: 42,
    gender: "female",
    bloodType: "A+",
    insurancePlan: "CampusCare Gold",
    primaryCondition: "Type 2 diabetes with elevated HbA1c",
    allergies: ["Penicillin"],
    riskLevel: "medium",
    riskScore: 64,
    vitals: {
      heartRate: 92,
      systolic: 136,
      diastolic: 86,
      temperatureC: 37.2,
      oxygenSaturation: 97
    },
    consent: {
      status: "verified",
      scopes: ["records.read", "triage.write", "prescription.route"],
      authorizedHospitalIds: ["hosp-west-china", "hosp-jinjiang-community"],
      expiresAt: "2026-07-30T23:59:59Z",
      txHash: "0x9f4d0e6b0c92a7b10de81fb27f806bbef2f889c84bd936a7c145f01e30f0aa93"
    },
    careTeam: [
      { name: "Dr. Mira Wong", role: "Endocrinologist", hospitalId: "hosp-west-china" },
      { name: "Nurse Leo Park", role: "Care coordinator", hospitalId: "hosp-jinjiang-community" }
    ],
    records: [
      {
        id: "rec-a1",
        type: "lab",
        title: "HbA1c and lipid panel",
        hash: "bafkreih5d2f9d6d1f0e4c4b65fef99a942a44f6b79d15e2d6fadc5d5c2ef4f1c",
        createdAt: "2026-04-12T09:32:00Z",
        sourceHospitalId: "hosp-west-china"
      },
      {
        id: "rec-a2",
        type: "prescription",
        title: "Metformin refill",
        hash: "bafkreia9c8b1a01f3349ad0fb886a8612a3b784574ab64df7467f3ab82fd192f",
        createdAt: "2026-04-14T16:20:00Z",
        sourceHospitalId: "hosp-jinjiang-community"
      }
    ],
    activePrescriptionIds: ["rx-metformin-500", "rx-atorvastatin-20"]
  },
  {
    id: "pat-1002",
    did: "did:medlink:patient:CN-2038-1002",
    name: "Min-jun Park",
    age: 29,
    gender: "male",
    bloodType: "O+",
    insurancePlan: "Student Health Plus",
    primaryCondition: "Asthma exacerbation follow-up",
    allergies: ["Ibuprofen"],
    riskLevel: "high",
    riskScore: 82,
    vitals: {
      heartRate: 118,
      systolic: 128,
      diastolic: 82,
      temperatureC: 37.7,
      oxygenSaturation: 93
    },
    consent: {
      status: "verified",
      scopes: ["records.read", "triage.write", "claims.prepare"],
      authorizedHospitalIds: ["hosp-chengdu-second", "hosp-jinjiang-community"],
      expiresAt: "2026-05-18T23:59:59Z",
      txHash: "0x3c6b7f4e1289c1f9cdb847fbd89c881375457d482cf7cd1354553b8d78994a2e"
    },
    careTeam: [
      { name: "Dr. Hana Kim", role: "Pulmonologist", hospitalId: "hosp-chengdu-second" },
      { name: "Tara Singh", role: "Respiratory therapist", hospitalId: "hosp-jinjiang-community" }
    ],
    records: [
      {
        id: "rec-b1",
        type: "consultation",
        title: "Acute wheeze assessment",
        hash: "bafkreic5c3119d77b6d5e47c50cab916a1d6c947f63f28fb04e74ec80ad66eba",
        createdAt: "2026-04-21T12:45:00Z",
        sourceHospitalId: "hosp-chengdu-second"
      }
    ],
    activePrescriptionIds: ["rx-salbutamol-inhaler", "rx-budesonide-200"]
  },
  {
    id: "pat-1003",
    did: "did:medlink:patient:CN-2038-1003",
    name: "Jamie Lau",
    age: 67,
    gender: "non-binary",
    bloodType: "B-",
    insurancePlan: "ElderCare Bridge",
    primaryCondition: "Post-operative knee replacement monitoring",
    allergies: ["Sulfonamides"],
    riskLevel: "low",
    riskScore: 31,
    vitals: {
      heartRate: 76,
      systolic: 124,
      diastolic: 78,
      temperatureC: 36.8,
      oxygenSaturation: 98
    },
    consent: {
      status: "pending",
      scopes: ["records.read"],
      authorizedHospitalIds: ["hosp-chengdu-second"],
      expiresAt: "2026-05-01T23:59:59Z",
      txHash: "0x7d02bb5f8420f63f4f9af3d884f5ec64f6b7f980d4718a7dcde4273510b129af"
    },
    careTeam: [
      { name: "Dr. Isaac Ho", role: "Orthopedic surgeon", hospitalId: "hosp-chengdu-second" },
      { name: "Mei Tan", role: "Physiotherapist", hospitalId: "hosp-xinhua-community" }
    ],
    records: [
      {
        id: "rec-c1",
        type: "discharge",
        title: "Post-op discharge packet",
        hash: "bafkreif53c1fd6231f17dc75af7a1a9d771dd48a41d20ad59667b89fb1091a67",
        createdAt: "2026-04-08T11:05:00Z",
        sourceHospitalId: "hosp-chengdu-second"
      }
    ],
    activePrescriptionIds: ["rx-apixaban-25"]
  }
];

export function getMockPatientById(patientId: string) {
  return mockPatients.find((patient) => patient.id === patientId) ?? null;
}
