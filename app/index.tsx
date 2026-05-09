import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  switch (user.role) {
    case 'vet':
      return <Redirect href="/vet-dashboard" />;
    case 'farmer':
      return <Redirect href="/farmer-dashboard" />;
    case 'admin':
      return <Redirect href="/admin-dashboard" />;
    default:
      return <Redirect href="/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
