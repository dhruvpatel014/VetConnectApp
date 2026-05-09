/**
 * MedicineEngine.ts
 *
 * Pure TypeScript module — symptom-to-medicine lookup, scoring, and species filter.
 */

import type { Medicine, Species, SuggestedMedicine } from '@/types/vetconnect';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MEDICINE_MAP: { medicines: Medicine[] } = require('@/assets/data/vetconnect-medicine-map.json');

const ALL_MEDICINES: Medicine[] = MEDICINE_MAP.medicines;

export function suggestMedicines(
  selectedSymptoms: string[],
  species: Species | null,
  limit = 5
): SuggestedMedicine[] {
  if (!selectedSymptoms || selectedSymptoms.length === 0) return [];
  const normalised = selectedSymptoms.map((s) => s.toLowerCase().trim());
  return ALL_MEDICINES
    .filter((med) => {
      if (!species) return true;
      return med.species.includes(species);
    })
    .map((med): SuggestedMedicine => {
      const medSymptoms = med.symptoms.map((s) => s.toLowerCase().trim());
      const score = normalised.filter((sym) =>
        medSymptoms.some((ms) => ms.includes(sym) || sym.includes(ms))
      ).length;
      return { ...med, score };
    })
    .filter((med) => med.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getAllMedicinesForSpecies(species: Species | null): Medicine[] {
  if (!species) return ALL_MEDICINES;
  return ALL_MEDICINES.filter((m) => m.species.includes(species));
}

export function getMedicineById(id: string): Medicine | undefined {
  return ALL_MEDICINES.find((m) => m.id === id);
}
