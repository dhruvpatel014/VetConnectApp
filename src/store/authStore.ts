import { create } from 'zustand';

export type UserRole = 'admin' | 'vet' | 'farmer' | null;

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  specialty?: string; // e.g. 'ivf_specialist', 'general'
  isApproved: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  logout: () =>
    set({
      user: null,
      error: null,
      isLoading: false,
    }),
}));
