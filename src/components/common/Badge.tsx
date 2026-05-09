import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  const styles_variant = styles[variant] || styles.default;
  return (
    <View style={[styles.container, styles_variant.bg]}>
      <Text style={[styles.label, styles_variant.text]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  success: {
    bg: { backgroundColor: colors.status.success.bg },
    text: { color: colors.status.success.text },
  },
  warning: {
    bg: { backgroundColor: colors.status.warning.bg },
    text: { color: colors.status.warning.text },
  },
  error: {
    bg: { backgroundColor: colors.status.error.bg },
    text: { color: colors.status.error.text },
  },
  info: {
    bg: { backgroundColor: colors.status.info.bg },
    text: { color: colors.status.info.text },
  },
  default: {
    bg: { backgroundColor: colors.status.neutral.bg },
    text: { color: colors.status.neutral.text },
  },
});
