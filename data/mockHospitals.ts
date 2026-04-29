export type Hospital = {
  id: string;
  name: string;
  chineseName: string;
  level: string;
  englishLevel: string;
  koreanLevel: string;
  location: string;
  distance: string;
  specialty: string;
  region: string;
  type: "public" | "private" | "university" | "community" | "specialist";
  specialties: string[];
  integration: {
    fhirVersion: string;
    hisConnector: string;
    status: "live" | "sandbox" | "pending";
    lastSyncAt: string;
  };
  capacity: {
    emergencyBeds: number;
    wardBeds: number;
    averageWaitMinutes: number;
  };
  blockchainNode: {
    peerId: string;
    channel: string;
    endorsementPolicy: string;
  };
};

export const mockHospitals: Hospital[] = [
  {
    id: "hosp-west-china",
    name: "West China Hospital, Sichuan University",
    chineseName: "华西医院",
    level: "三甲",
    englishLevel: "Class A Tertiary Hospital (Top-Tier)",
    koreanLevel: "3차 병원 (상급종합병원)",
    location: "Chengdu, Sichuan",
    distance: "7.4 km",
    specialty: "General + Oncology + Cardiology",
    region: "Chengdu, Sichuan",
    type: "university",
    specialties: ["General medicine", "Emergency medicine", "Oncology", "Cardiology"],
    integration: {
      fhirVersion: "R4",
      hisConnector: "HL7v2 ADT + FHIR Observation bridge",
      status: "live",
      lastSyncAt: "2026-04-25T08:15:00Z"
    },
    capacity: {
      emergencyBeds: 24,
      wardBeds: 430,
      averageWaitMinutes: 42
    },
    blockchainNode: {
      peerId: "peer0.westchina.medlink.fabric",
      channel: "sichuan-consent-channel",
      endorsementPolicy: "2-of-5 Sichuan hospital peers"
    }
  },
  {
    id: "hosp-chengdu-second",
    name: "Chengdu Second People's Hospital",
    chineseName: "成都市第二人民医院",
    level: "二甲",
    englishLevel: "Class B Secondary Hospital",
    koreanLevel: "2차 병원 (일반 종합병원)",
    location: "Chengdu, Sichuan",
    distance: "3.8 km",
    specialty: "General medicine, respiratory",
    region: "Chengdu, Sichuan",
    type: "public",
    specialties: ["General medicine", "Respiratory", "Dermatology", "General outpatient"],
    integration: {
      fhirVersion: "R4",
      hisConnector: "FHIR facade over regional HIS connector",
      status: "live",
      lastSyncAt: "2026-04-25T07:58:00Z"
    },
    capacity: {
      emergencyBeds: 10,
      wardBeds: 156,
      averageWaitMinutes: 29
    },
    blockchainNode: {
      peerId: "peer0.chengdu-second.medlink.fabric",
      channel: "sichuan-consent-channel",
      endorsementPolicy: "Class B secondary hospital peer + regulator observer"
    }
  },
  {
    id: "hosp-jinjiang-community",
    name: "Chengdu Jinjiang District Community Health Center",
    chineseName: "成都市锦江区社区卫生服务中心",
    level: "基层",
    englishLevel: "Primary Care Clinic",
    koreanLevel: "1차 병원 (의원, 보건소)",
    location: "Chengdu, Sichuan",
    distance: "1.2 km",
    specialty: "General outpatient, chronic disease management",
    region: "Chengdu, Sichuan",
    type: "community",
    specialties: ["General outpatient", "Chronic disease management", "Vaccination", "Primary care"],
    integration: {
      fhirVersion: "R4",
      hisConnector: "Cloud FHIR API gateway",
      status: "live",
      lastSyncAt: "2026-04-25T08:20:00Z"
    },
    capacity: {
      emergencyBeds: 2,
      wardBeds: 24,
      averageWaitMinutes: 18
    },
    blockchainNode: {
      peerId: "peer0.jinjiang-community.medlink.fabric",
      channel: "sichuan-consent-channel",
      endorsementPolicy: "primary care clinic peer + hospital peer"
    }
  },
  {
    id: "hosp-sichuan-cancer",
    name: "Sichuan Cancer Hospital",
    chineseName: "四川省肿瘤医院",
    level: "三甲专科",
    englishLevel: "Class A Specialist Hospital",
    koreanLevel: "3차 병원 (상급종합병원)",
    location: "Chengdu, Sichuan",
    distance: "9.1 km",
    specialty: "Oncology, targeted therapy",
    region: "Chengdu, Sichuan",
    type: "specialist",
    specialties: ["Oncology", "Targeted therapy", "Radiation oncology", "Specialist outpatient"],
    integration: {
      fhirVersion: "R4",
      hisConnector: "FHIR Bulk Data + oncology order connector",
      status: "live",
      lastSyncAt: "2026-04-24T17:35:00Z"
    },
    capacity: {
      emergencyBeds: 8,
      wardBeds: 210,
      averageWaitMinutes: 51
    },
    blockchainNode: {
      peerId: "peer0.sichuan-cancer.medlink.fabric",
      channel: "sichuan-prescription-channel",
      endorsementPolicy: "specialist hospital peer + regulator observer"
    }
  },
  {
    id: "hosp-xinhua-community",
    name: "Chengdu Xinhua Community Clinic",
    chineseName: "成都新华社区诊所",
    level: "基层",
    englishLevel: "Primary Care Clinic",
    koreanLevel: "1차 병원 (의원, 보건소)",
    location: "Chengdu, Sichuan",
    distance: "0.8 km",
    specialty: "General outpatient, minor illness",
    region: "Chengdu, Sichuan",
    type: "community",
    specialties: ["General outpatient", "Minor illness", "Prescription refill", "Primary care"],
    integration: {
      fhirVersion: "R4",
      hisConnector: "Lightweight FHIR clinic connector",
      status: "sandbox",
      lastSyncAt: "2026-04-25T08:05:00Z"
    },
    capacity: {
      emergencyBeds: 0,
      wardBeds: 8,
      averageWaitMinutes: 12
    },
    blockchainNode: {
      peerId: "peer0.xinhua-community.medlink.fabric",
      channel: "sichuan-consent-channel",
      endorsementPolicy: "primary care clinic peer + district health node"
    }
  }
];

export function getMockHospitalById(hospitalId: string) {
  return mockHospitals.find((hospital) => hospital.id === hospitalId) ?? null;
}
