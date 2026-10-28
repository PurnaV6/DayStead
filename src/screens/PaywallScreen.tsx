import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { PLUS_PRICE_MONTHLY_GBP, PLUS_PRICE_YEARLY_GBP } from '../lib/plan';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

/**
 * Billing is not wired up yet — this screen is the UI and the plan-gating
 * logic (src/lib/plan.ts) that RevenueCat's purchase callbacks will call
 * into once store products exist. Today, "Upgrade" just flips a local flag
 * so the free/paid gating can be tested end to end.
 */
export default function PaywallScreen({ route, navigation }: Props) {
  const { updateSettings } = useAppData();
  const reason = route.params?.reason;

  async function upgrade() {
    await updateSettings({ plan: 'plus' });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {reason && <Text style={styles.reason}>{reason}</Text>}
      <Text style={styles.title}>DayStead Plus</Text>
      <Text style={styles.subtitle}>
        Unlimited bills, medications and appointments, payday-based planning, and spending
        exports.
      </Text>

      <View style={styles.planCard}>
        <Text style={styles.planName}>Monthly</Text>
        <Text style={styles.planPrice}>£{PLUS_PRICE_MONTHLY_GBP.toFixed(2)}/mo</Text>
      </View>
      <View style={[styles.planCard, styles.planCardHighlight]}>
        <Text style={styles.planName}>Annual</Text>
        <Text style={styles.planPrice}>£{PLUS_PRICE_YEARLY_GBP.toFixed(2)}/yr</Text>
        <Text style={styles.planSave}>
          ~{Math.round((1 - PLUS_PRICE_YEARLY_GBP / (PLUS_PRICE_MONTHLY_GBP * 12)) * 100)}% off
          monthly
        </Text>
      </View>

      <Pressable style={styles.upgradeBtn} onPress={upgrade}>
        <Text style={styles.upgradeBtnText}>Upgrade to Plus</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.notNow}>Not now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  reason: { ...typography.caption, color: colors.risk, marginBottom: spacing.md, textAlign: 'center' },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: {
    ...typography.subtitle,
    textAlign: 'center',
    marginVertical: spacing.md,
    color: colors.muted,
  },
  planCard: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  planCardHighlight: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  planName: { ...typography.label },
  planPrice: { ...typography.sectionTitle, marginTop: 2 },
  planSave: { ...typography.caption, color: colors.accent, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  upgradeBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  notNow: { textAlign: 'center', color: colors.muted, marginTop: spacing.md },
});
