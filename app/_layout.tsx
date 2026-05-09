import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuthListener } from '@/services/firebase';
import { Alert } from 'react-native';

const globalErrorHandler = (error: Error) => {
  console.error('[Global API Error]:', error);
  Alert.alert(
    'Network Error', 
    error.message || 'An unexpected error occurred while communicating with the server.'
  );
};

// ─── QueryClient — staleTime 5 min, gcTime 24h per TRD §1.4 ──────────────
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: globalErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: globalErrorHandler,
  }),
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,       // 5 min
      gcTime:               1000 * 60 * 60 * 24, // 24h
      retry:                2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── AsyncStorage persister — survives app restarts per TRD §1.4 ──────────
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key:     'vetconnect-query-cache-v1',
});

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </PersistQueryClientProvider>
  );
}
