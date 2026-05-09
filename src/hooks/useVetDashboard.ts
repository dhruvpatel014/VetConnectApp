/**
 * useVetDashboard.ts
 *
 * React Query hooks for the Vet Dashboard screen.
 * Covers: today's visit queue, recent treatments, PD-check alert queue.
 *
 * Per TRD §2.1: useQuery: visits, treatments, ivf_cycles; Zustand session.
 * Per TRD §1.4: staleTime 5 min, gcTime 24h — served from AsyncStorage when offline.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTreatmentsByVet,
  getIVFCyclesByVet,
  updateTreatmentStatus,
} from '@/services/firestoreService';
import { useAuthStore } from '@/store/authStore';
import type { TreatmentStatus } from '@/types/vetconnect';

// ─── Query Key factory ─────────────────────────────────────────────────────
export const vetKeys = {
  all:        ['vet'] as const,
  treatments: (vetId: string) => ['vet', 'treatments', vetId] as const,
  ivfCycles:  (vetId: string, status?: string) => ['vet', 'ivfCycles', vetId, status] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/**
 * Recent treatments timeline for a specific vet.
 */
export function useVetTreatments(overrideId?: string) {
  const authenticatedId = useAuthStore((s) => s.user?.uid);
  const vetId = overrideId ?? authenticatedId;

  return useQuery({
    queryKey: vetKeys.treatments(vetId ?? ''),
    queryFn:  () => getTreatmentsByVet(vetId!),
    enabled:  !!vetId,
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 60 * 24,
  });
}

/**
 * IVF PD-Check due-date alert queue for a specific vet.
 */
export function useVetPDCheckQueue(overrideId?: string) {
  const authenticatedId = useAuthStore((s) => s.user?.uid);
  const vetId = overrideId ?? authenticatedId;

  return useQuery({
    queryKey: vetKeys.ivfCycles(vetId ?? '', 'Inseminated'),
    queryFn:  () => getIVFCyclesByVet(vetId!, 'Inseminated'),
    enabled:  !!vetId,
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 60 * 24,
  });
}

/**
 * Mutation to approve or reject a treatment.
 */
export function useUpdateTreatmentStatus(overrideId?: string) {
  const qc = useQueryClient();
  const authenticatedId = useAuthStore((s) => s.user?.uid);
  const vetId = overrideId ?? authenticatedId;

  return useMutation({
    mutationFn: ({ treatmentId, status, adminComments }: {
      treatmentId: string;
      status: TreatmentStatus;
      adminComments?: string;
    }) => updateTreatmentStatus(treatmentId, status, adminComments),

    onMutate: async ({ treatmentId, status }) => {
      const key = vetKeys.treatments(vetId ?? '');
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old: any[]) =>
        old?.map((t) => t.treatmentId === treatmentId ? { ...t, status } : t) ?? []
      );
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      const key = vetKeys.treatments(vetId ?? '');
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: vetKeys.treatments(vetId ?? '') });
    },
  });
}
