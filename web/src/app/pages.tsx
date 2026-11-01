import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isMissed, occurrences, pounds, todayMedicines, type Occurrence } from '../lib/domain';
import { supabase } from '../lib/supabase';
import { errorText, useDaystead } from './context';
import { BillDonut, BillTrend } from './Charts';
import { Button, Card, DarkCard, Heading, MissedTag, OccurrenceCard, ScheduleCard, Small } from './ui';

// The six tabs of the phone app (mobile/App.tsx), one component each.

function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  const { now } = useDaystead();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold tracking-[.18em] text-[var(--ds-muted)]">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
      <h1 className="text-[34px] leading-[41px] font-semibold tracking-tight text-[var(--ds-ink)]">{title}</h1>
      <p className="text-[15px] text-[var(--ds-muted)]">{subtitle}</p>
    </div>
  );
}

const monthName = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase();

function SetAside() {
  const { now, total, remaining } = useDaystead();
  return <DarkCard label={`STILL TO SET ASIDE · ${monthName(now)}`} big={pounds(remaining)} left={['MONTH TOTAL', pounds(total)]} right={['REPORTED PAID', pounds(total - remaining)]} />;
}

function List({ items, empty }: { items: Occurrence[]; empty?: ReactNode }) {
  return <>{items.map((o) => <OccurrenceCard key={o.key} item={o} />)}{!items.length && empty}</>;
}

export function TodayPage() {
  const { session, upcoming, now, schedules } = useDaystead();
  const first = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0] || 'there';
  const meds = todayMedicines(upcoming, now);
  return (
    <>
      <Hero title={`Hello, ${first}.`} subtitle="Make room for the rest of your day." />
      <Attention />
      <SetAside />
      <div className="flex justify-between items-center"><Heading>Bills & appointments</Heading><Small>Next 7 days</Small></div>
      <List items={upcoming.filter((o) => o.schedule.kind !== 'medicine' && +o.at < +now + 7 * 86400000).slice(0, 12)} />
      <Heading>Today’s medicines</Heading>
      <List items={meds} empty={<Small>No medicines scheduled for today.</Small>} />
      {!upcoming.length && <Card><Heading>A fresh start</Heading><p className="text-[var(--ds-muted)]">Tap + to add your bills first, then medicines and appointments. Your upcoming items will appear here.</p></Card>}
      <Heading>Appointments</Heading>
      {schedules.filter((o) => o.kind === 'appointment').map((o) => <ScheduleCard key={o.id} item={o} confirmText="Delete appointment? This removes the schedule and its history." />)}
    </>
  );
}

// Web version of mobile/src/AttentionPanel.tsx: daily briefing, needs-attention list
// (missed first) and money needed before payday. Uses the same daystead_preferences row.
function Attention() {
  const { session, schedules, done, now, busy, complete } = useDaystead();
  const userId = session.user.id;
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [payday, setPayday] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [all, setAll] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    let active = true;
    supabase.from('daystead_preferences').select('*').eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) { setProblem('Preferences unavailable: ' + error.message); return; }
      setDismissed(data?.dismissed || []);
      setPayday(data?.payday || '');
      setReady(true);
    });
    return () => { active = false; };
  }, [userId]);

  async function persist(keys: string[], date: string) {
    setSaving(true);
    setProblem('');
    try {
      const { error } = await supabase.from('daystead_preferences').upsert({ user_id: userId, dismissed: keys.slice(-500), payday: date || null });
      if (error) throw error;
      setDismissed(keys.slice(-500));
      setPayday(date);
      return true;
    } catch (e) {
      setProblem('Could not save: ' + errorText(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1), end = new Date(+now + 3 * 86400000);
  const items = occurrences(schedules, start, end, done).filter((o) => !o.status);
  const today = items.filter((o) => o.at.toDateString() === now.toDateString());
  const attention = items
    .filter((o) => !dismissed.includes(o.key) && (o.schedule.kind === 'bill' || o.at.toDateString() === now.toDateString()))
    .sort((a, b) => Number(isMissed(b, now)) - Number(isMissed(a, now)) || Number(!!b.schedule.priority) - Number(!!a.schedule.priority) || +a.at - +b.at);
  const missedCount = attention.filter((o) => isMissed(o, now)).length;
  const dateEnd = payday ? new Date(payday + 'T23:59:59') : null;
  const beforePayday = dateEnd && dateEnd >= now ? occurrences(schedules, start, dateEnd, done).filter((o) => o.schedule.kind === 'bill' && !o.status) : [];
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayInput = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const maxDay = new Date(+now + 366 * 86400000);
  const maxInput = `${maxDay.getFullYear()}-${pad(maxDay.getMonth() + 1)}-${pad(maxDay.getDate())}`;

  return (
    <div className="flex flex-col gap-3.5">
      <Heading>Your daily briefing</Heading>
      <p>{today.filter((o) => o.schedule.kind === 'medicine').length} unrecorded doses · {today.filter((o) => o.schedule.kind === 'appointment').length} appointments · {today.filter((o) => o.schedule.kind === 'todo').length} to-dos today</p>
      <p>{pounds(items.filter((o) => o.schedule.kind === 'bill' && o.at >= now).reduce((n, o) => n + (o.schedule.amount_pence || 0), 0))} in unpaid bills due in the next 3 days.</p>
      <Heading>Needs your attention</Heading>
      {missedCount > 0 && <p className="text-[var(--ds-missed)] font-semibold">● {missedCount} missed {missedCount === 1 ? 'item' : 'items'} shown first</p>}
      {attention.slice(0, all ? attention.length : 3).map((o) => {
        const missed = isMissed(o, now);
        const kind = o.schedule.kind;
        return (
          <div key={o.key} className={`bg-white rounded-2xl p-4 flex flex-col gap-2 border border-[var(--ds-line)] ${missed ? 'bg-[#FDF0EE] border-[#E8B4AC] border-l-[6px] border-l-[var(--ds-missed)]' : ''}`}>
            {missed && <MissedTag item={o} />}
            <div className="flex items-center">
              <p className="flex-1 font-semibold">{o.schedule.priority ? '★ ' : ''}{o.schedule.title}</p>
              <button aria-label={'Dismiss ' + o.schedule.title + ' from dashboard'} disabled={!ready || saving} className="p-2" onClick={() => void persist([...dismissed, o.key], payday).then((ok) => ok && setUndo(o.key))}>×</button>
            </div>
            <p>{o.at.toLocaleString('en-GB')} · {kind === 'bill' ? pounds(o.schedule.amount_pence || 0) : 'Scheduled'}</p>
            <button disabled={busy} className="text-left py-2 text-[var(--ds-accent)]" onClick={() => void complete(o, kind === 'bill' ? 'paid' : kind === 'medicine' ? 'taken' : 'completed')}>
              Mark {kind === 'bill' ? 'paid' : kind === 'medicine' ? 'taken' : 'complete'}
            </button>
          </div>
        );
      })}
      {attention.length > 3 && <button className="text-left" onClick={() => setAll(!all)}>{all ? 'Show fewer' : 'View all (' + attention.length + ')'}</button>}
      {!attention.length && <p>No outstanding items in this attention window.</p>}
      {undo && <button className="text-left" disabled={saving} onClick={() => void persist(dismissed.filter((k) => k !== undo), payday).then((ok) => ok && setUndo(null))}>Card dismissed · Undo</button>}
      <p className="text-xs">Dismissing a card does not complete it or turn off its reminders.</p>
      <div className="bg-[#EDF2E9] p-[18px] rounded-[18px] flex flex-col gap-3">
        <Heading>Money needed before payday</Heading>
        <label className="bg-white p-3.5 rounded-[10px] flex items-center justify-between gap-3">
          <span className="text-[var(--ds-ink)]">Payday</span>
          <input type="date" aria-label="Choose your next payday" disabled={!ready || saving} min={todayInput} max={maxInput} value={payday} onChange={(e) => e.target.value && void persist(dismissed, e.target.value)} className="text-[var(--ds-accent)] font-semibold bg-transparent" />
        </label>
        {dateEnd && dateEnd >= now ? (
          <>
            <p className="text-[28px] font-semibold">{pounds(beforePayday.reduce((n, o) => n + (o.schedule.amount_pence || 0), 0))}</p>
            <p>Unpaid entered bills from this month’s start through {payday}, including that day. Not your bank balance; earlier overdue bills are not included.</p>
          </>
        ) : <p>Set your next payday to calculate the amount to set aside.</p>}
      </div>
      {problem && <p role="alert" className="text-sm text-[var(--ds-missed)]">{problem}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { now, total, remaining, current, previous, upcoming } = useDaystead();
  const meds = todayMedicines(upcoming, now);
  return (
    <>
      <Hero title="Dashboard" subtitle="Your month at a glance." />
      <DarkCard label={`BILLS THIS MONTH · ${monthName(now)}`} big={pounds(total)} left={['STILL TO PAY', pounds(remaining)]} right={['MARKED PAID', pounds(total - remaining)]} />
      <Card><Heading>Where your money goes</Heading><BillDonut current={current} /></Card>
      <Card><BillTrend current={current} previous={previous} /></Card>
      <div className="grid grid-cols-2 gap-3">
        <Card><Small>Medicines today</Small><Heading>{meds.filter((o) => o.status === 'taken').length}/{meds.length} taken</Heading></Card>
        <Card><Small>Next 7 days</Small><Heading>{upcoming.filter((o) => (o.schedule.kind === 'appointment' || o.schedule.kind === 'todo') && +o.at < +now + 7 * 86400000).length} planned</Heading></Card>
      </div>
    </>
  );
}

export function BillsPage() {
  const { current, previous, schedules } = useDaystead();
  const bills = schedules.filter((o) => o.kind === 'bill');
  return (
    <>
      <Hero title="Bills" subtitle="Know what is due. Keep what you need." />
      <SetAside />
      <Card>
        <h2 className="text-xl font-semibold text-[var(--ds-ink)]">Where your money goes</h2>
        <BillDonut current={current} size={146} />
        <BillTrend current={current} previous={previous} />
      </Card>
      <Heading>This month’s payments</Heading>
      <List items={current} />
      <Heading>Bill schedules</Heading>
      {!bills.length && <Small>No bills yet. Tap + to add one.</Small>}
      {bills.map((o) => <ScheduleCard key={o.id} item={o} confirmText="Delete bill schedule? This also removes recorded payment history." />)}
      <Small>Payments are marked by you. Direct Debit dates do not confirm payment.</Small>
    </>
  );
}

export function MedicinesPage() {
  const { upcoming, now, schedules } = useDaystead();
  const meds = schedules.filter((o) => o.kind === 'medicine');
  return (
    <>
      <Hero title="Medicines" subtitle="Your schedule, as prescribed." />
      <Heading>Today’s schedule</Heading>
      <List items={todayMedicines(upcoming, now)} />
      <Heading>Your medicines</Heading>
      {!meds.length && <Small>No medicines yet. Tap + to add one.</Small>}
      {meds.map((o) => <ScheduleCard key={o.id} item={o} confirmText="Remove medicine schedule? This also removes its recorded history." />)}
      <Small>Enter the instructions you were prescribed. Taken and skipped are your own reports. Daystead does not recommend doses.</Small>
    </>
  );
}

export function PlannerPage() {
  const { upcoming, schedules } = useDaystead();
  const plans = schedules.filter((o) => o.kind === 'appointment' || o.kind === 'todo');
  return (
    <>
      <Hero title="Planner" subtitle="Appointments and to-dos, in order." />
      <Heading>Appointments & to-dos</Heading>
      {!plans.length && <Small>Nothing planned yet. Tap + to add an appointment or a to-do.</Small>}
      <List items={upcoming.filter((o) => o.schedule.kind === 'appointment' || o.schedule.kind === 'todo')} />
      {plans.map((o) => <ScheduleCard key={o.id} item={o} confirmText="Delete item? This removes its history." />)}
    </>
  );
}

export function AccountPage() {
  const { session, refresh, busy } = useDaystead();
  const [message, setMessage] = useState('');
  async function exportData() {
    if (!window.confirm('Your export includes bill and medicine details. Save it somewhere private.')) return;
    try {
      const tables = ['daystead_schedules', 'daystead_completions', 'daystead_subscriptions', 'daystead_preferences'];
      const records = await Promise.all(tables.map(async (table) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        return [table, data || []] as const;
      }));
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), ...Object.fromEntries(records) }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'daystead-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setMessage('Export failed: ' + errorText(e));
    }
  }
  return (
    <>
      <Hero title="Account" subtitle="Your space. Your preferences." />
      <Card>
        <Heading>{(session.user.user_metadata?.full_name as string) || 'Your account'}</Heading>
        <p className="text-[var(--ds-muted)]">{session.user.email}</p>
        <Button secondary disabled={busy} onClick={() => void refresh()}>Refresh changes from your phone</Button>
        <Button secondary disabled={busy} onClick={() => void supabase.auth.signOut()}>Sign out</Button>
      </Card>
      <Card>
        <Heading>Reminders</Heading>
        <p className="text-[var(--ds-muted)]">Phone reminders and alarm-style medicine alerts are set in the Daystead phone app. While this page is open, the website also shows urgent items at the top and beeps when one becomes due.</p>
      </Card>
      <Card>
        <Heading>Daystead Premium</Heading>
        <p>1 month free for new subscribers, then £3.99 a month or £35.99 a year (save 25%).</p>
        <Small>Subscriptions are bought, restored and cancelled in the phone app through Apple or Google. Deleting your account does not cancel store billing.</Small>
      </Card>
      <Card>
        <Heading>Account & help</Heading>
        <button className="text-left text-[var(--ds-accent)] font-semibold py-2" onClick={() => void exportData()}>Export my data</button>
        <Link className="text-[var(--ds-accent)] font-semibold py-2" to="/privacy">Privacy information</Link>
        <Link className="text-[var(--ds-accent)] font-semibold py-2" to="/terms">Terms</Link>
        <Link className="text-[var(--ds-accent)] font-semibold py-2" to="/support">Help & support</Link>
        <Link className="text-[var(--ds-missed)] font-semibold py-2" to="/delete-account">Delete account</Link>
        {message && <p role="alert" className="text-sm text-[var(--ds-missed)]">{message}</p>}
      </Card>
    </>
  );
}
