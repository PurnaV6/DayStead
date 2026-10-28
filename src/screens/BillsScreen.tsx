import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { formatGBP } from '../lib/money';
import { canAddBill, FREE_LIMITS } from '../lib/plan';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Bill, PaymentStatus } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Bills'>;

const STATUS_COLOR: Record<PaymentStatus, string> = {
  scheduled: colors.muted,
  paid: colors.ok,
  overdue: colors.risk,
};

export default function BillsScreen({ navigation }: Props) {
  const { bills, settings, markBillPaid, deleteBill } = useAppData();
  const sorted = [...bills].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime(),
  );
  const canAdd = canAddBill(settings, bills.length);

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <Text style={styles.empty}>No bills yet. Add your first one to get reminders.</Text>
        }
        renderItem={({ item }: { item: Bill }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {new Date(item.nextDueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                · {item.frequency}
              </Text>
              <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>
                {item.amountIsEstimate ? '~' : ''}
                {formatGBP(item.amount)}
              </Text>
              {item.status !== 'paid' && (
                <Pressable onPress={() => markBillPaid(item.id)} style={styles.payBtn}>
                  <Text style={styles.payBtnText}>Mark paid</Text>
                </Pressable>
              )}
              <Pressable onPress={() => deleteBill(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable
        style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
        onPress={() =>
          canAdd
            ? navigation.navigate('AddBill')
            : navigation.navigate('Paywall', { reason: `Free plan is limited to ${FREE_LIMITS.maxBills} bills` })
        }
      >
        <Text style={styles.addBtnText}>{canAdd ? '+ Add bill' : 'Upgrade to add more bills'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.muted },
  status: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  amount: { ...typography.body, fontWeight: '700' },
  payBtn: { marginTop: 6 },
  payBtnText: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  deleteText: { color: colors.risk, fontSize: 12, marginTop: 4 },
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
