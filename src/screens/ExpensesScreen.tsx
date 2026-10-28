import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { formatGBP } from '../lib/money';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export default function ExpensesScreen({ navigation }: Props) {
  const { expenses, deleteExpense } = useAppData();
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of thisMonth as typeof expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [thisMonth]);

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Spent this month</Text>
        <Text style={styles.summaryAmount}>{formatGBP(total)}</Text>
        {byCategory.length > 0 && (
          <View style={{ marginTop: spacing.sm }}>
            {byCategory.map(([cat, amt]) => (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catAmount}>{formatGBP(amt)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses logged yet. Add one to start tracking.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{item.description}</Text>
              <Text style={styles.rowMeta}>
                {item.category} ·{' '}
                {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowAmount}>{formatGBP(item.amount)}</Text>
              <Pressable onPress={() => deleteExpense(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.addBtnText}>+ Log expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summaryCard: {
    backgroundColor: colors.accentTint,
    borderRadius: 16,
    padding: spacing.lg,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  summaryLabel: { ...typography.label, color: colors.accent },
  summaryAmount: { ...typography.hero, marginVertical: 4 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  catName: { ...typography.caption, textTransform: 'capitalize' },
  catAmount: { ...typography.caption, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowTitle: { ...typography.body, fontWeight: '600' },
  rowMeta: { ...typography.caption, color: colors.muted },
  rowAmount: { ...typography.body, fontWeight: '700' },
  deleteText: { color: colors.risk, fontSize: 12, marginTop: 4 },
  empty: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: 20 },
  addBtn: {
    backgroundColor: colors.accent,
    margin: spacing.lg,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
