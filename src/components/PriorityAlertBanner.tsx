import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { getPriorityAlerts, type PriorityAlert } from '../lib/alerts';
import { triggerAlarm } from '../lib/alarm';
import { colors, spacing, typography } from '../theme';

const CHECK_INTERVAL_MS = 15_000;

export default function PriorityAlertBanner() {
  const { bills, medications, medicationLog } = useAppData();
  const [alerts, setAlerts] = useState<PriorityAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    function check() {
      const current = getPriorityAlerts(bills, medications, medicationLog);
      const newOnes = current.filter((a) => !seenIds.current.has(a.id));
      if (newOnes.length > 0) {
        triggerAlarm(newOnes[0].title, newOnes[0].detail);
      }
      seenIds.current = new Set(current.map((a) => a.id));
      setAlerts(current);
    }
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [bills, medications, medicationLog]);

  const visible = alerts.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  return (
    <View style={styles.container}>
      {visible.map((alert) => (
        <View key={alert.id} style={styles.banner}>
          <Text style={styles.icon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.detail}>{alert.detail}</Text>
          </View>
          <Pressable
            onPress={() => setDismissedIds((prev) => new Set(prev).add(alert.id))}
            hitSlop={8}
          >
            <Text style={styles.dismiss}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FBECEA',
    borderWidth: 1,
    borderColor: '#E3A79C',
    borderRadius: 14,
    padding: spacing.md,
  },
  icon: { fontSize: 16, marginTop: 1 },
  title: { ...typography.body, fontWeight: '700', color: '#7A2E22' },
  detail: { ...typography.caption, color: '#7A2E22', opacity: 0.8, marginTop: 2 },
  dismiss: { color: '#7A2E22', fontSize: 14, opacity: 0.6 },
});
