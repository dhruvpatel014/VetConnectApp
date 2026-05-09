// ─── Species ───────────────────────────────────────────────────────────────
export type Species = 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Other';

// ─── Symptom Category ──────────────────────────────────────────────────────
export type SymptomCategoryId =
  | 'digestive'
  | 'respiratory'
  | 'reproductive'
  | 'musculoskeletal'
  | 'skin'
  | 'systemic'
  | 'other';

export interface SymptomCategory {
  id: SymptomCategoryId;
  label: string;
  emoji: string;
  color: string;
  symptoms: string[];
}

// ─── Medicine ──────────────────────────────────────────────────────────────
export interface Medicine {
  id: string;
  name: string;
  category: string;
  species: Species[];
  symptoms: string[];
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  route: string;
  contraindications: string[];
}

export interface SuggestedMedicine extends Medicine {
  score: number; // how many matching symptoms
}

// ─── Prescription line item ────────────────────────────────────────────────
export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// ─── Vaccine types ─────────────────────────────────────────────────────────
export type VaccineType =
  | 'FMD'
  | 'BQ'
  | 'HS'
  | 'Anthrax'
  | 'PPR'
  | 'Brucellosis'
  | 'Theileriosis'
  | 'Other';

// ─── IVF Cycle ─────────────────────────────────────────────────────────────
export type IVFCycleStatus = 'Inseminated' | 'Pregnant' | 'NotPregnant' | 'Closed';

export interface IVFCycle {
  cycleId: string;
  animalTagId: string;
  farmerId: string;
  vetId: string;
  sireId: string;
  semenStrawId: string;
  inseminationDate: Date;
  pdCheckDate: Date; // inseminationDate + 21 days
  status: IVFCycleStatus;
  pdCheckResult?: 'Positive' | 'Negative';
  pdCheckDate_actual?: Date;
  pdCheckNotes?: string;
  flaggedForReview?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Treatment ─────────────────────────────────────────────────────────────
export type TreatmentStatus =
  | 'AwaitingReport'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'DeletionRequested';

export type TreatmentUrgency = 'Routine' | 'Urgent' | 'Surgery';

export interface Treatment {
  treatmentId: string;
  animalTagId: string;
  vetId: string;
  farmerId: string;
  species: Species;
  breed: string;
  symptoms: string[];
  urgency: TreatmentUrgency;
  prescription?: PrescriptionItem[];
  status: TreatmentStatus;
  awaitingReport: boolean;
  reportSummary?: string;
  reportPhotoUrl?: string;
  reportReceivedAt?: Date;
  suggestedMedicines?: string[];
  nextDueDate?: Date;
  notes?: string;
  adminComments?: string;
  symptomCategory?: SymptomCategoryId;
  vaccinationGiven?: boolean;
  vaccineType?: VaccineType;
  vaccinationRecommended?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
