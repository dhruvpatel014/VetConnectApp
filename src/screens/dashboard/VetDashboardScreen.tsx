import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, ClipboardList, Calendar, Activity, User, Stethoscope } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { VisitCard } from '@/components/dashboard/VisitCard';
import { ModernBottomNav } from '@/components/layout/ModernBottomNav';
import { Badge } from '@/components/common/Badge';
import { useVetTreatments, useVetPDCheckQueue } from '@/hooks/useVetDashboard';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export const VetDashboardScreen = () => {
  const user = useAuthStore((s) => s.user);
  const isOffline = useUIStore((s) => s.isOffline);
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  const {
    data: treatments,
    isLoading: treatmentsLoading,
    isError: treatmentsError,
    dataUpdatedAt,
  } = useVetTreatments();

  const { data: pdQueue } = useVetPDCheckQueue();

  const displayName  = user?.displayName ?? 'Dr. Patel';
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <LinearGradient
          colors={[colors.primary.main, colors.primary.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
            <View>
              <View style={styles.avatarWrapper}>
                <User size={20} color={colors.white} />
              </View>
              <View style={styles.onlineIndicator} />
            </View>
          </View>
          
          <View style={styles.syncBadge}>
            <View style={[styles.syncDot, isOffline && { backgroundColor: '#9CA3AF' }]} />
            <Text style={styles.syncText}>
              {!isOffline ? `Online · Synced` : 'Offline · Cache active'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/cattle-search')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                <Search size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionLabel}>Search Cattle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/register-cattle')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: colors.primary.emerald100 }]}>
                <Plus size={24} color={colors.primary.emerald600} />
              </View>
              <Text style={styles.actionLabel}>Add Animal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/treatment-log')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#F3E8FF' }]}>
                <ClipboardList size={24} color="#9333EA" />
              </View>
              <Text style={styles.actionLabel}>Log Treatment</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={16} color={colors.primary.light} />
                <Text style={styles.sectionTitle}>Today's Visits</Text>
              </View>
            </View>
            <View style={styles.cardsContainer}>
              <VisitCard name="Hardev Singh" village="Nadiad Village" time="9:00 AM" status="In Progress" statusVariant="success" emergency />
              <VisitCard name="Jayaben Desai" village="Anand Dist." time="11:30 AM" status="Pending" statusVariant="warning" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Activity size={16} color={colors.primary.light} />
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
            </View>

            {treatmentsLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.loadingText}>Loading treatments...</Text>
              </View>
            )}
            
            <View style={styles.cardsContainer}>
              {treatments?.slice(0, 3).map((item) => (
                <TouchableOpacity key={item.treatmentId} style={styles.activityCard}>
                  <View style={styles.activityIconWrapper}>
                    <Stethoscope size={20} color={colors.text.tertiary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTag}>{item.animalTagId}</Text>
                    <Text style={styles.activitySymptom} numberOfLines={1}>{item.symptoms?.join(', ')}</Text>
                  </View>
                  <Badge label={item.status} variant="info" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <ModernBottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.surface },
  scrollContent: { paddingBottom: spacing.xxl },
  header: { paddingTop: Platform.OS === 'ios' ? spacing.lg : 48, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: colors.primary.emerald100, fontSize: 12 },
  userName: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  avatarWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  onlineIndicator: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, backgroundColor: '#10B981', borderRadius: 6, borderWidth: 2, borderColor: '#1B5E3B' },
  syncBadge: { marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
  syncText: { color: '#fff', fontSize: 10 },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  actionCard: { backgroundColor: colors.white, borderRadius: 16, padding: 12, alignItems: 'center', flex: 1, marginHorizontal: 4, elevation: 2 },
  actionIconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 10, fontWeight: 'bold', color: colors.text.secondary },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text.primary },
  cardsContainer: { gap: 12 },
  activityCard: { backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIconWrapper: { width: 40, height: 40, backgroundColor: '#F8FAF9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTag: { fontSize: 12, fontWeight: 'bold', color: colors.text.primary },
  activitySymptom: { fontSize: 10, color: colors.text.muted },
  loadingRow: { padding: 20, alignItems: 'center' },
});
