import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { formatGBP } from '../lib/money';
import { trialDaysRemaining } from '../lib/plan';
import { colors, spacing, typography } from '../theme';

export default function SettingsScreen() {
  const { settings, updateSettings, balance, setBalance } = useAppData();
  const [payday, setPayday] = useState(String(settings.paydayDayOfMonth));
  const [buffer, setBuffer] = useState(String(settings.cashBuffer));
  const [balanceInput, setBalanceInput] = useState(balance ? String(balance.amount) : '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Payday planning</Text>
      <Text style={styles.label}>Payday (day of month)</Text>
      <TextInput
        style={styles.input}
        value={payday}
        onChangeText={setPayday}
        keyboardType="number-pad"
        onBlur={() => updateSettings({ paydayDayOfMonth: parseInt(payday, 10) || 1 })}
      />

      <Text style={styles.label}>Cash buffer to always keep aside</Text>
      <TextInput
        style={styles.input}
        value={buffer}
        onChangeText={setBuffer}
        keyboardType="decimal-pad"
        onBlur={() => updateSettings({ cashBuffer: parseFloat(buffer) || 0 })}
      />

      <Text style={styles.sectionTitle}>Your balance</Text>
      <Text style={styles.helper}>
        Entered manually — not synced to your bank. Last updated:{' '}
        {balance ? new Date(balance.updatedAt).toLocaleString('en-GB') : 'never'}
      </Text>
      <TextInput
        style={styles.input}
        value={balanceInput}
        onChangeText={setBalanceInput}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <Pressable
        style={styles.saveBtn}
        onPress={() => setBalance(parseFloat(balanceInput) || 0)}
      >
        <Text style={styles.saveBtnText}>
          Update balance{balance ? ` (currently ${formatGBP(balance.amount)})` : ''}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Plan</Text>
      <View style={styles.planRow}>
        <Text style={styles.body}>Current plan</Text>
        <Text style={styles.planBadge}>
          {settings.plan === 'paid'
            ? 'Subscribed'
            : `Trial — ${trialDaysRemaining(settings.trialStartedAt)} day${
                trialDaysRemaining(settings.trialStartedAt) === 1 ? '' : 's'
              } left`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { ...typography.sectionTitle, marginTop: spacing.lg, marginBottom: spacing.sm },
  label: { ...typography.label, color: colors.muted, marginTop: spacing.sm, marginBottom: 6 },
  helper: { ...typography.caption, color: colors.muted, marginBottom: spacing.sm },
  body: { ...typography.body },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.panel,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planBadge: { ...typography.label, color: colors.accent },
});
