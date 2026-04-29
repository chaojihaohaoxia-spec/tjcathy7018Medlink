export type Medicine = {
  id: string;
  genericName: string;
  brandName: string;
  form: string;
  strength: string;
  category: string;
  controlled: boolean;
  contraindications: string[];
  interactions: string[];
};

export type PharmacyRoute = {
  id: string;
  name: string;
  type: "hospital" | "retail" | "community";
  region: string;
  fhirEndpoint: string;
  fulfillmentScore: number;
  inventory: Record<string, number>;
};

export const mockMedicines: Medicine[] = [
  {
    id: "rx-metformin-500",
    genericName: "Metformin",
    brandName: "Glucophage",
    form: "tablet",
    strength: "500 mg",
    category: "Antidiabetic",
    controlled: false,
    contraindications: ["Severe renal impairment", "Metabolic acidosis"],
    interactions: ["Iodinated contrast", "Alcohol"]
  },
  {
    id: "rx-atorvastatin-20",
    genericName: "Atorvastatin",
    brandName: "Lipitor",
    form: "tablet",
    strength: "20 mg",
    category: "Lipid lowering",
    controlled: false,
    contraindications: ["Active liver disease", "Pregnancy"],
    interactions: ["Clarithromycin", "Cyclosporine", "Grapefruit juice"]
  },
  {
    id: "rx-salbutamol-inhaler",
    genericName: "Salbutamol",
    brandName: "Ventolin",
    form: "inhaler",
    strength: "100 mcg/dose",
    category: "Bronchodilator",
    controlled: false,
    contraindications: ["Tachyarrhythmia sensitivity"],
    interactions: ["Non-selective beta blockers"]
  },
  {
    id: "rx-budesonide-200",
    genericName: "Budesonide",
    brandName: "Pulmicort",
    form: "inhaler",
    strength: "200 mcg/dose",
    category: "Inhaled corticosteroid",
    controlled: false,
    contraindications: ["Untreated fungal infection"],
    interactions: ["Ketoconazole", "Ritonavir"]
  },
  {
    id: "rx-apixaban-25",
    genericName: "Apixaban",
    brandName: "Eliquis",
    form: "tablet",
    strength: "2.5 mg",
    category: "Anticoagulant",
    controlled: false,
    contraindications: ["Active pathological bleeding", "Severe hepatic impairment"],
    interactions: ["NSAIDs", "Warfarin", "Strong CYP3A4 inhibitors"]
  }
];

export const mockPharmacyRoutes: PharmacyRoute[] = [
  {
    id: "pharm-jinjiang-community",
    name: "Chengdu Jinjiang District Community Health Center Pharmacy",
    type: "community",
    region: "Chengdu, Sichuan",
    fhirEndpoint: "https://sandbox.medlink.local/fhir/pharmacy/jinjiang-community",
    fulfillmentScore: 91,
    inventory: {
      "rx-metformin-500": 120,
      "rx-atorvastatin-20": 42,
      "rx-salbutamol-inhaler": 17,
      "rx-budesonide-200": 12
    }
  },
  {
    id: "pharm-west-china",
    name: "West China Hospital, Sichuan University Pharmacy",
    type: "hospital",
    region: "Chengdu, Sichuan",
    fhirEndpoint: "https://sandbox.medlink.local/fhir/pharmacy/west-china",
    fulfillmentScore: 86,
    inventory: {
      "rx-metformin-500": 80,
      "rx-atorvastatin-20": 64,
      "rx-apixaban-25": 24
    }
  },
  {
    id: "pharm-xinhua-community",
    name: "Chengdu Xinhua Community Clinic Pharmacy",
    type: "community",
    region: "Chengdu, Sichuan",
    fhirEndpoint: "https://sandbox.medlink.local/fhir/pharmacy/xinhua-community",
    fulfillmentScore: 78,
    inventory: {
      "rx-salbutamol-inhaler": 8,
      "rx-budesonide-200": 6,
      "rx-apixaban-25": 10
    }
  }
];

export function getMockMedicineById(medicineId: string) {
  return mockMedicines.find((medicine) => medicine.id === medicineId) ?? null;
}
