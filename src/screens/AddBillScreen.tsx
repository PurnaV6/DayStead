import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Bill, RecurrenceFrequency } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBill'>;

const TEMPLATES: Array<{
  label: string;
  category: Bill['category'];
  frequency: RecurrenceFrequency;
}> = [
  { label: 'Rent', category: 'rent', frequency: 'monthly' },
  { label: 'Credit card', category: 'credit_card', frequency: 'monthly' },
  { label: 'Electricity', category: 'utility', frequency: 'monthly' },
  { label: 'Water', category: 'utility', frequency: 'monthly' },
  { label: 'Phone', category: 'subscription', frequency: 'monthly' },
  { label: 'Streaming', category: 'subscription', frequency: 'monthly' },
];

export default function AddBillScreen({ navigation }: Props) {
  const { addOrUpdateBill } = useAppData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Bill['category']>('other');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [amount, setAmount] = useState('');
  const [amountIsEstimate, setAmountIsEstimate] = useState(false);
  const [dueInDays, setDueInDays] = useState('7');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState('2');

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setName(t.label);
    setCategory(t.category);
    setFrequency(t.frequency);
  }

  async function save() {
    if (!name.trim() || !amount.trim()) return;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + (parseInt(dueInDays, 10) || 0));
    const bill: Bill = {
      id: uuid(),
      name: name.trim(),
      category,
      amount: parseFloat(amount) || 0,
      amountIsEstimate,
      frequency,
      nextDueDate: nextDueDate.toISOString(),
      status: 'scheduled',
      remindersEnabled,
      reminderDaysBefore: parseInt(reminderDaysBefore, 10) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addOrUpdateBill(bill);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Quick templates</Text>
      <View style={styles.templateRow}>
        {TEMPLATES.map((t) => (
          <Pressable key={t.label} style={styles.templateChip} onPress={() => applyTemplate(t)}>
            <Text style={styles.templateChipText}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Rent" />

      <Text style={styles.label}>Amount (£)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>This is an estimate, not a confirmed amount</Text>
        <Switch value={amountIsEstimate} onValueChange={setAmountIsEstimate} />
      </View>

      <Text style={styles.label}>Due in how many days</Text>
      <TextInput
        style={styles.input}
        value={dueInDays}
        onChangeText={setDueInDays}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Repeats</Text>
      <View style={styles.templateRow}>
        {(['once', 'weekly', 'monthly', 'yearly'] as RecurrenceFrequency[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.templateChip, frequency === f && styles.templateChipActive]}
            onPress={() => setFrequency(f)}
          >
            <Text
              style={[styles.templateChipText, frequency === f && styles.templateChipTextActive]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Remind me</Text>
        <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
      </View>
      {remindersEnabled && (
        <>
          <Text style={styles.label}>Days before due date</Text>
          <TextInput
            style={styles.input}
            value={reminderDaysBefore}
            onChangeText={setReminderDaysBefore}
            keyboardType="number-pad"
          />
        </>
      )}

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Save bill</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { ...typography.sectionTitle, marginBottom: spacing.sm },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  templateChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.panel,
  },
  templateChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  templateChipText: { color: colors.ink, fontSize: 13 },
  templateChipTextActive: { color: colors.white },
  label: { ...typography.label, color: colors.muted, marginTop: spacing.md, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.panel,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
