/**
 * firestoreService.ts
 *
 * Thin Firestore operation catalogue per TRD §5.1.
 * Each function is a pure async wrapper — no React hooks here.
 * These are called from React Query fetcher functions in hooks/.
 *
 * Collections: users | animals | treatments | ivf_cycles | emergencies
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Treatment,
  IVFCycle,
  IVFCycleStatus,
  Species,
  TreatmentStatus,
} from '@/types/vetconnect';

// ─── Helpers ───────────────────────────────────────────────────────────────
const col = (name: string) => collection(db, name);
const toDate = (ts: Timestamp | undefined): Date | undefined =>
  ts ? ts.toDate() : undefined;

// ─── Animals ───────────────────────────────────────────────────────────────

/** Load a single animal by tagId. */
export async function getAnimal(tagId: string) {
  const snap = await getDoc(doc(db, 'animals', tagId));
  if (!snap.exists()) return null;
  return { tagId: snap.id, ...snap.data() };
}

/** Search animals by NFC, barcode, or tag ID (Parallel lookup per code review). */
export async function searchAnimal(searchTerm: string) {
  const fields = ['tagId', 'nfcId', 'barcodeId'];
  
  // Parallel execution for 3x speedup on mobile networks
  const queryPromises = fields.map((field) => 
    getDocs(query(col('animals'), where(field, '==', searchTerm), limit(1)))
  );
  
  const snapshots = await Promise.all(queryPromises);
  const foundSnapshot = snapshots.find((snap) => !snap.empty);
  
  if (foundSnapshot) {
    const doc = foundSnapshot.docs[0];
    return { tagId: doc.id, ...doc.data() };
  }
  
  return null;
}

/** Fetch all animals for a farmer, optionally filtered by species. */
export async function getAnimalsByFarmer(farmerId: string, species?: Species) {
  const constraints: QueryConstraint[] = [where('farmerId', '==', farmerId)];
  if (species) constraints.push(where('species', '==', species));
  const snap = await getDocs(query(col('animals'), ...constraints));
  return snap.docs.map((d) => ({ tagId: d.id, ...d.data() }));
}

// ─── Treatments ────────────────────────────────────────────────────────────

/** Vet's recent treatments timeline (TRD index: vetId ASC + createdAt DESC). */
export async function getTreatmentsByVet(vetId: string, pageLimit = 20) {
  const q = query(
    col('treatments'),
    where('vetId', '==', vetId),
    orderBy('createdAt', 'desc'),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ treatmentId: d.id, ...d.data() })) as Treatment[];
}

/** Farmer's health records filtered by status (TRD index: farmerId+status+createdAt). */
export async function getTreatmentsByFarmer(
  farmerId: string,
  status?: TreatmentStatus,
  pageLimit = 20
) {
  const constraints: QueryConstraint[] = [
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc'),
    limit(pageLimit),
  ];
  if (status) constraints.splice(1, 0, where('status', '==', status));
  const snap = await getDocs(query(col('treatments'), ...constraints));
  return snap.docs.map((d) => ({ treatmentId: d.id, ...d.data() })) as Treatment[];
}

/** Admin approval queue (TRD index: status+createdAt). */
export async function getPendingTreatments() {
  const q = query(
    col('treatments'),
    where('status', '==', 'PendingApproval'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ treatmentId: d.id, ...d.data() })) as Treatment[];
}

/** Treatment history for a specific animal (TRD index: animalTagId+createdAt). */
export async function getTreatmentsByAnimal(animalTagId: string) {
  const q = query(
    col('treatments'),
    where('animalTagId', '==', animalTagId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ treatmentId: d.id, ...d.data() })) as Treatment[];
}

/**
 * Create a new treatment log (TRD §5.1: Create treatment log).
 * If vaccinationGiven=true, also updates animals/{tagId}.lastVaccinationDate via writeBatch.
 */
export async function createTreatment(
  data: Omit<Treatment, 'treatmentId' | 'createdAt' | 'updatedAt'>
) {
  const batch = writeBatch(db);

  // Treatment document
  const treatmentRef = doc(collection(db, 'treatments'));
  batch.set(treatmentRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Vaccination side effect: update animal's lastVaccinationDate
  if (data.vaccinationGiven) {
    const animalRef = doc(db, 'animals', data.animalTagId);
    batch.update(animalRef, { lastVaccinationDate: serverTimestamp() });
  }

  await batch.commit();
  return treatmentRef.id;
}

/** Admin approve or reject a treatment. */
export async function updateTreatmentStatus(
  treatmentId: string,
  status: TreatmentStatus,
  adminComments?: string
) {
  await updateDoc(doc(db, 'treatments', treatmentId), {
    status,
    ...(adminComments ? { adminComments } : {}),
    updatedAt: serverTimestamp(),
  });
}

// ─── IVF Cycles ────────────────────────────────────────────────────────────

/** Vet's PD Check due-date alert queue (TRD index: vetId+status+pdCheckDate). */
export async function getIVFCyclesByVet(vetId: string, status?: IVFCycleStatus) {
  const constraints: QueryConstraint[] = [where('vetId', '==', vetId)];
  if (status) constraints.push(where('status', '==', status));
  constraints.push(orderBy('pdCheckDate', 'asc'));
  const snap = await getDocs(query(col('ivf_cycles'), ...constraints));
  return snap.docs.map((d) => ({ cycleId: d.id, ...d.data() })) as IVFCycle[];
}

/** Farmer's active IVF cycles (TRD index: farmerId+status). */
export async function getIVFCyclesByFarmer(farmerId: string, status?: IVFCycleStatus) {
  const constraints: QueryConstraint[] = [where('farmerId', '==', farmerId)];
  if (status) constraints.push(where('status', '==', status));
  const snap = await getDocs(query(col('ivf_cycles'), ...constraints));
  return snap.docs.map((d) => ({ cycleId: d.id, ...d.data() })) as IVFCycle[];
}

/**
 * Create a new IVF cycle.
 * Auto-calculates pdCheckDate = inseminationDate + 21 days (client-side, per TRD §5.1).
 */
export async function createIVFCycle(
  data: Omit<IVFCycle, 'cycleId' | 'pdCheckDate' | 'status' | 'createdAt' | 'updatedAt'>
) {
  const pdCheckDate = new Date(data.inseminationDate);
  pdCheckDate.setDate(pdCheckDate.getDate() + 21);

  const batch = writeBatch(db);

  // 1. Create IVF cycle document
  const ivfRef = doc(collection(db, 'ivf_cycles'));
  batch.set(ivfRef, {
    ...data,
    pdCheckDate: Timestamp.fromDate(pdCheckDate),
    status: 'Inseminated' satisfies IVFCycleStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2. Atomic update to the animal's record
  const animalRef = doc(db, 'animals', data.animalTagId);
  batch.update(animalRef, {
    lastIVFStatus: 'Inseminated',
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return ivfRef.id;
}

/**
 * Log PD Check result — transitions status (TRD §5.1: Log PD Check result).
 * Positive → 'Pregnant' | Negative → 'NotPregnant'.
 */
export async function logPDCheck(
  cycleId: string,
  result: 'Positive' | 'Negative',
  notes?: string
) {
  const status: IVFCycleStatus = result === 'Positive' ? 'Pregnant' : 'NotPregnant';
  await updateDoc(doc(db, 'ivf_cycles', cycleId), {
    pdCheckResult: result,
    pdCheckDate_actual: serverTimestamp(),
    pdCheckNotes: notes ?? '',
    status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Emergencies (SOS) ─────────────────────────────────────────────────────

/** Submit a new SOS emergency. */
export async function createSOS(data: {
  farmerId: string;
  animalTagId?: string;
  description: string;
}) {
  const ref = await addDoc(col('emergencies'), {
    ...data,
    status: 'Open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Users / Specialist Routing ────────────────────────────────────────────

/** Fetch available vets by speciality for specialist routing modal (TRD §5.1 + §2.6). */
export async function getVetsBySpeciality(speciality: string) {
  const q = query(
    col('users'),
    where('role', '==', 'vet'),
    where('speciality', '==', speciality),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
