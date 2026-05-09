/**
 * useTreatment.ts
 *
 * React Query hooks for treatment logging and management.
 * Covers: create treatment log, update treatment status.
 *
 * Per TRD §5.1: Create treatment log.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTreatment } from '@/services/firestoreService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import type { Treatment } from '@/types/vetconnect';
import { vetKeys } from './useVetDashboard';
import { farmerKeys } from './useFarmerDashboard';

export function useLogTreatment() {
  const qc = useQueryClient();
  const vetId = useAuthStore((s) => s.user?.uid);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: Omit<Treatment, 'treatmentId' | 'createdAt' | 'updatedAt' | 'vetId'>) =>
      createTreatment({ ...data, vetId: vetId! }),

    onSuccess: () => {
      showToast('Treatment logged successfully! 🩺', 'success');
      // Invalidate both vet and farmer dashboard queries to show fresh data
      qc.invalidateQueries({ queryKey: vetKeys.all });
      qc.invalidateQueries({ queryKey: farmerKeys.all });
    },

    onError: (error: any) => {
      console.error('Treatment log error:', error);
      showToast('Failed to log treatment. Check connection.', 'error');
    },
  });
}
