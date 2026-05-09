import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, ClipboardList, Activity, User, PlusCircle } from 'lucide-react-native';
import { colors } from '@/theme';

export const ModernBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', icon: Home, path: '/vet-dashboard' },
    { name: 'Reports', icon: ClipboardList, path: '/treatment-log' },
    { name: 'IVF', icon: Activity, path: '/ivf-treatment' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;
        return (
          <TouchableOpacity key={tab.path} onPress={() => router.push(tab.path)} style={styles.tab}>
            <Icon size={24} color={isActive ? colors.primary.main : colors.text.tertiary} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border.light, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 12, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 4 },
  label: { fontSize: 10, color: colors.text.tertiary, fontWeight: '500' },
  activeLabel: { color: colors.primary.main, fontWeight: 'bold' }
});
