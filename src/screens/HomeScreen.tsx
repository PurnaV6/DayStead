import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { formatGBP, moneyNeededBeforePayday, overdueBills, upcomingBills } from '../lib/money';
import { colors, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { bills, medications, appointments, settings, refresh, loading } = useAppData();

  const overdue = overdueBills(bills);
  const upcoming = upcomingBills(bills, 14);
  const needed = moneyNeededBeforePayday(bills, settings.paydayDayOfMonth, settings.cashBuffer);

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const todaysMeds = medications.filter((m) => m.doses.length > 0);
  const nextAppointment = appointments
    .filter((a) => new Date(a.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <Text style={styles.greeting}>Today</Text>
      <Text style={styles.date}>{todayStr}</Text>

      <View style={styles.quickLinks}>
        <Pressable style={styles.quickLink} onPress={() => navigation.navigate('Appointments')}>
          <Text style={styles.quickLinkText}>📅 Appointments</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.heroCard]}>
        <Text style={styles.heroLabel}>Money needed before payday</Text>
        <Text style={styles.heroAmount}>{formatGBP(needed.amount)}</Text>
        <Text style={styles.heroSub}>
          {needed.billCount} payment{needed.billCount === 1 ? '' : 's'} due in the next{' '}
          {needed.daysLeft} day{needed.daysLeft === 1 ? '' : 's'}, plus your {formatGBP(
            settings.cashBuffer,
          )} buffer
        </Text>
      </View>

      {overdue.length > 0 && (
        <View style={[styles.card, styles.overdueCard]}>
          <Text style={styles.sectionTitle}>Overdue</Text>
          {overdue.map((b) => (
            <View key={b.id} style={styles.row}>
              <Text style={styles.rowTitle}>{b.name}</Text>
              <Text style={styles.rowAmount}>{formatGBP(b.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Upcoming payments</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>Nothing due in the next 14 days.</Text>
        ) : (
          upcoming.map((b) => (
            <View key={b.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{b.name}</Text>
                <Text style={styles.rowMeta}>
                  {new Date(b.nextDueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <Text style={styles.rowAmount}>
                {b.amountIsEstimate ? '~' : ''}
                {formatGBP(b.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

      {todaysMeds.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medication today</Text>
          {todaysMeds.map((m) => (
            <View key={m.id} style={styles.row}>
              <Text style={styles.rowTitle}>{m.name}</Text>
              <Text style={styles.rowMeta}>{m.doses.map((d) => d.time).join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

      {nextAppointment && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Next appointment</Text>
          <Text style={styles.rowTitle}>{nextAppointment.title}</Text>
          <Text style={styles.rowMeta}>
            {new Date(nextAppointment.dateTime).toLocaleString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {nextAppointment.location ? ` · ${nextAppointment.location}` : ''}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  greeting: { ...typography.title },
  date: { ...typography.subtitle, marginBottom: spacing.md, color: colors.muted },
  quickLinks: { flexDirection: 'row', marginBottom: spacing.md },
  quickLink: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickLinkText: { ...typography.caption, color: colors.ink, fontWeight: '600' },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroCard: { backgroundColor: colors.accentTint, borderColor: colors.accentLine },
  overdueCard: { backgroundColor: '#FDEDEC', borderColor: colors.risk },
  heroLabel: { ...typography.label, color: colors.accent },
  heroAmount: { ...typography.hero, marginVertical: 4 },
  heroSub: { ...typography.caption, color: colors.muted },
  sectionTitle: { ...typography.sectionTitle, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  rowTitle: { ...typography.body },
  rowMeta: { ...typography.caption, color: colors.muted },
  rowAmount: { ...typography.body, fontWeight: '600' },
  empty: { ...typography.caption, color: colors.muted },
});
