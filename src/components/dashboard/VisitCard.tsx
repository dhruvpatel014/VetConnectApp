import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { Badge, BadgeVariant } from '../common/Badge';

interface VisitCardProps {
  name: string;
  village: string;
  time: string;
  status: string;
  statusVariant: BadgeVariant;
  emergency?: boolean;
}

export const VisitCard = ({ name, village, time, status, statusVariant, emergency }: VisitCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.container, emergency && styles.emergencyBorder]}>
      <View style={styles.leftLine} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {emergency && (
            <View style={styles.emergencyBadge}>
              <AlertTriangle size={12} color="#B91C1C" />
              <Text style={styles.emergencyText}>EMERGENCY</Text>
            </View>
          )}
        </View>

        <View style={styles.detailRow}>
          <MapPin size={14} color={colors.text.tertiary} />
          <Text style={styles.detailText}>{village}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeBox}>
            <Clock size={14} color={colors.text.tertiary} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <Badge label={status} variant={statusVariant} />
        </View>
      </View>
      <ChevronRight size={20} color={colors.border.default} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingRight: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, marginBottom: 12, overflow: 'hidden' },
  emergencyBorder: { borderColor: colors.status.error.border, borderWidth: 1 },
  leftLine: { width: 4, height: '100%', backgroundColor: colors.primary.main },
  content: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
  emergencyText: { color: '#B91C1C', fontSize: 9, fontWeight: '900' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  detailText: { color: colors.text.secondary, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { color: colors.text.tertiary, fontSize: 13, fontWeight: '500' }
});
