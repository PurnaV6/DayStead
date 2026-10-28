import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { canAddMedication, FREE_LIMITS } from '../lib/plan';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Medications'>;

export default function MedicationsScreen({ navigation }: Props) {
  const { medications, settings, deleteMedication, logDoseTaken } = useAppData();
  const canAdd = canAddMedication(settings, medications.length);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.empty}>No medications yet. Add one to get dose reminders.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.dosage}</Text>
            {item.doses.map((d) => (
              <View key={d.time} style={styles.doseRow}>
                <Text style={styles.doseTime}>{d.time}</Text>
                <Pressable
                  style={styles.takenBtn}
                  onPress={() => logDoseTaken(item.id, `${todayKey}T${d.time}`)}
                >
                  <Text style={styles.takenBtnText}>Mark taken</Text>
                </Pressable>
              </View>
            ))}
            <Pressable onPress={() => deleteMedication(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
        onPress={() =>
          canAdd
            ? navigation.navigate('AddMedication')
            : navigation.navigate('Paywall', {
                reason: `Free plan is limited to ${FREE_LIMITS.maxMedications} medications`,
              })
        }
      >
        <Text style={styles.addBtnText}>
          {canAdd ? '+ Add medication' : 'Upgrade to add more medications'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.muted, marginBottom: 6 },
  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  doseTime: { ...typography.body },
  takenBtn: {
    backgroundColor: colors.accentTint,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  takenBtnText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  deleteText: { color: colors.risk, fontSize: 12, marginTop: 8 },
  empty: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: 40 },
  addBtn: {
    backgroundColor: colors.accent,
    margin: spacing.lg,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.muted },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
