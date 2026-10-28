import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Medication } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

const COURSE_TEMPLATES = [
  { label: 'Once daily', times: ['09:00'] },
  { label: 'Twice daily', times: ['09:00', '21:00'] },
  { label: 'Three times daily', times: ['08:00', '14:00', '20:00'] },
];

export default function AddMedicationScreen({ navigation }: Props) {
  const { addOrUpdateMedication } = useAppData();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  async function save() {
    if (!name.trim()) return;
    const med: Medication = {
      id: uuid(),
      name: name.trim(),
      dosage: dosage.trim(),
      doses: times.map((time) => ({ time })),
      courseStartDate: new Date().toISOString(),
      courseEndDate: null,
      remindersEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addOrUpdateMedication(med);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.label}>Medication name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Metformin" />

      <Text style={styles.label}>Dosage</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g. 500mg" />

      <Text style={styles.sectionTitle}>Schedule</Text>
      <View style={styles.templateRow}>
        {COURSE_TEMPLATES.map((t) => (
          <Pressable key={t.label} style={styles.templateChip} onPress={() => setTimes(t.times)}>
            <Text style={styles.templateChipText}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      {times.map((t, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={t}
            onChangeText={(val) => {
              const next = [...times];
              next[i] = val;
              setTimes(next);
            }}
            placeholder="HH:mm"
          />
        </View>
      ))}
      <Pressable onPress={() => setTimes([...times, '12:00'])}>
        <Text style={styles.addTimeText}>+ add another time</Text>
      </Pressable>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Remind me</Text>
        <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
      </View>

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Save medication</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { ...typography.sectionTitle, marginTop: spacing.lg, marginBottom: spacing.sm },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  templateChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.panel,
  },
  templateChipText: { color: colors.ink, fontSize: 13 },
  label: { ...typography.label, color: colors.muted, marginTop: spacing.md, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.panel,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addTimeText: { color: colors.accent, fontWeight: '600', marginBottom: spacing.sm },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
