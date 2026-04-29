import { getMockPatientById } from "@/data/mockPatients";
import {
  Medicine,
  PharmacyRoute,
  getMockMedicineById,
  mockMedicines,
  mockPharmacyRoutes
} from "@/data/mockMedicines";
import { generateTxHash } from "@/services/blockchainService";

export type PrescriptionRouteRequest = {
  patientId: string;
  medicineIds: string[];
  preferredRegion?: string;
};

export type InteractionWarning = {
  medicineId: string;
  medicineName: string;
  warning: string;
  severity: "medium" | "high";
};

export type PrescriptionRouteResult = {
  patientId: string;
  medicines: Medicine[];
  selectedRoute: PharmacyRoute | null;
  candidateRoutes: PharmacyRoute[];
  warnings: InteractionWarning[];
  txHash: string;
  status: "ready" | "needs-review" | "blocked";
};

export function checkMedicineInteractions(medicineIds: string[], patientAllergies: string[] = []) {
  const medicines = medicineIds.map(getMockMedicineById).filter(Boolean) as Medicine[];
  const warnings: InteractionWarning[] = [];

  medicines.forEach((medicine) => {
    medicine.interactions.forEach((interaction) => {
      const interactingMedicine = medicines.find((candidate) =>
        interaction.toLowerCase().includes(candidate.genericName.toLowerCase())
      );

      if (interactingMedicine) {
        warnings.push({
          medicineId: medicine.id,
          medicineName: medicine.genericName,
          warning: `Potential interaction with ${interactingMedicine.genericName}.`,
          severity: "high"
        });
      }
    });

    patientAllergies.forEach((allergy) => {
      const matchesContraindication = medicine.contraindications.some((contraindication) =>
        contraindication.toLowerCase().includes(allergy.toLowerCase())
      );

      if (matchesContraindication) {
        warnings.push({
          medicineId: medicine.id,
          medicineName: medicine.genericName,
          warning: `Allergy or contraindication match: ${allergy}.`,
          severity: "high"
        });
      }
    });
  });

  return warnings;
}

function routeCanFulfill(route: PharmacyRoute, medicineIds: string[]) {
  return medicineIds.every((medicineId) => (route.inventory[medicineId] ?? 0) > 0);
}

export function routePrescription(request: PrescriptionRouteRequest): PrescriptionRouteResult {
  const patient = getMockPatientById(request.patientId);
  if (!patient) {
    throw new Error("Patient not found for prescription routing.");
  }

  const medicines = request.medicineIds.map(getMockMedicineById).filter(Boolean) as Medicine[];
  const warnings = checkMedicineInteractions(request.medicineIds, patient.allergies);
  const candidateRoutes = mockPharmacyRoutes
    .filter((route) => routeCanFulfill(route, request.medicineIds))
    .sort((a, b) => {
      const regionBoostA = request.preferredRegion && a.region === request.preferredRegion ? 8 : 0;
      const regionBoostB = request.preferredRegion && b.region === request.preferredRegion ? 8 : 0;
      return b.fulfillmentScore + regionBoostB - (a.fulfillmentScore + regionBoostA);
    });

  const selectedRoute = candidateRoutes[0] ?? null;
  const hasHighWarning = warnings.some((warning) => warning.severity === "high");
  const status = !selectedRoute ? "blocked" : hasHighWarning ? "needs-review" : "ready";

  return {
    patientId: patient.id,
    medicines,
    selectedRoute,
    candidateRoutes,
    warnings,
    txHash: generateTxHash(`${patient.id}:${request.medicineIds.join(",")}`),
    status
  };
}

export function getMedicineCatalog() {
  return mockMedicines;
}
