import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { formatGBP, moneyNeededBeforePayday, overdueBills, upcomingBills } from '../lib/money';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { bills, medications, medicationLog, appointments, settings, refresh, loading } = useAppData();

  const overdue = overdueBills(bills);
  const upcoming = upcomingBills(bills, 14);
  const needed = moneyNeededBeforePayday(bills, settings.paydayDayOfMonth, settings.cashBuffer);

  const remainingBills = bills.filter((b) => b.status !== 'paid');
  const remainingTotal = remainingBills.reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter((b) => b.status === 'paid');
  const paidTotal = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const scheduledTotal = bills.reduce((sum, b) => sum + b.amount, 0);

  const todayKey = new Date().toISOString().slice(0, 10);
  const dosesToday = medications.flatMap((m) => m.doses.map((d) => ({ medId: m.id, time: d.time })));
  const takenToday = dosesToday.filter((d) =>
    medicationLog.some(
      (l) => l.medicationId === d.medId && l.scheduledFor === `${todayKey}T${d.time}` && l.takenAt,
    ),
  ).length;

  const upcomingAppointments = appointments.filter((a) => new Date(a.dateTime) > new Date());

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = 'there'; // no account/name capture yet, see PRODUCT_SPEC.md §2

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>YOUR EVERYDAY, ORGANISED</Text>
          <Text style={styles.greeting}>
            {greeting}, {firstName} ☀️
          </Text>
          <Text style={styles.date}>{todayStr}</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddBill')}>
          <Feather name="plus" size={16} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.statGrid}>
        <StatCard
          icon="arrow-up-right"
          label="Remaining bills"
          value={formatGBP(remainingTotal)}
          sub={`${remainingBills.length} to record`}
          highlight
        />
        <StatCard
          icon="check"
          label="Marked paid"
          value={formatGBP(paidTotal)}
          sub={`Of ${formatGBP(scheduledTotal)} scheduled`}
        />
        <StatCard
          icon="plus-circle"
          label="Medication check-ins"
          value={`${takenToday}/${dosesToday.length}`}
          sub="Taken today"
        />
        <StatCard
          icon="calendar"
          label="Appointments"
          value={String(upcomingAppointments.length)}
          sub="Upcoming"
          onPress={() => navigation.navigate('Appointments')}
        />
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

      {medications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medication today</Text>
          {medications.map((m) => (
            <View key={m.id} style={styles.row}>
              <Text style={styles.rowTitle}>{m.name}</Text>
              <Text style={styles.rowMeta}>{m.doses.map((d) => d.time).join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

      {upcomingAppointments[0] && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Next appointment</Text>
          <Text style={styles.rowTitle}>{upcomingAppointments[0].title}</Text>
          <Text style={styles.rowMeta}>
            {new Date(upcomingAppointments[0].dateTime).toLocaleString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {upcomingAppointments[0].location ? ` · ${upcomingAppointments[0].location}` : ''}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={[styles.statCard, highlight && styles.statCardHighlight]} onPress={onPress}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Feather name={icon} size={14} color={colors.muted} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  eyebrow: typography.eyebrow,
  greeting: { ...typography.title, marginTop: spacing.sm },
  date: { ...typography.subtitle, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  statCardHighlight: { backgroundColor: colors.accentTint, borderColor: colors.accentLine },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { ...typography.caption, flex: 1, marginRight: 4 },
  statValue: { ...typography.sectionTitle, fontSize: 22, marginTop: 8 },
  statSub: { ...typography.caption, marginTop: 4 },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
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
