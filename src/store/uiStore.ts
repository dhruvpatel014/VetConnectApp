import { create } from 'zustand';

interface UIState {
  // Global loading overlay
  isGlobalLoading: boolean;
  loadingMessage: string;

  // Toast / snackbar
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Selected farmer/animal context (for vet navigating to patient)
  selectedFarmerId: string | null;
  selectedAnimalId: string | null;
  isOffline: boolean;

  setGlobalLoading: (loading: boolean, message?: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setSelectedFarmer: (id: string | null) => void;
  setSelectedAnimal: (id: string | null) => void;
  setOffline: (offline: boolean) => void;
  clearContext: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  loadingMessage: '',
  toast: null,
  selectedFarmerId: null,
  selectedAnimalId: null,
  isOffline: false,

  setGlobalLoading: (loading, message = '') =>
    set({ isGlobalLoading: loading, loadingMessage: message }),

  showToast: (message, type = 'info') =>
    set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  setSelectedFarmer: (id) => set({ selectedFarmerId: id }),
  setSelectedAnimal: (id) => set({ selectedAnimalId: id }),

  setOffline: (offline) => set({ isOffline: offline }),

  clearContext: () =>
    set({ selectedFarmerId: null, selectedAnimalId: null }),
}));
