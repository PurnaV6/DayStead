import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { hasFullAccess } from '../lib/plan';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Appointments'>;

export default function AppointmentsScreen({ navigation }: Props) {
  const { appointments, settings, deleteAppointment } = useAppData();
  const canAdd = hasFullAccess(settings);
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<Text style={styles.empty}>No appointments yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.meta}>
              {new Date(item.dateTime).toLocaleString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {item.location ? ` · ${item.location}` : ''}
            </Text>
            <Pressable onPress={() => deleteAppointment(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
        onPress={() =>
          canAdd
            ? navigation.navigate('AddAppointment')
            : navigation.navigate('Paywall', {
                reason: 'Your free trial has ended',
              })
        }
      >
        <Text style={styles.addBtnText}>{canAdd ? '+ Add appointment' : 'Subscribe to add more'}</Text>
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
  deleteText: { color: colors.risk, fontSize: 12 },
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
