import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Plus, Grid3x3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { AddNewButton } from '../layouts/DashboardLayout';
import {
  appointments,
  bills,
  medications,
  paidTotal,
  remainingTotal,
  scheduledTotal,
  trend,
  user,
} from '../lib/sampleData';

function formatGBP(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

const remainingCount = bills.filter((b) => b.status !== 'paid').length;
const takenCount = medications.filter((m) => m.taken).length;

const chartData = trend.current.points.map((v, i) => ({ day: i + 1, october: v }));

export default function OverviewPage() {
  const today = new Date();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase text-[var(--ds-muted)]">
            Your everyday, organised
          </p>
          <h1 className="text-3xl font-extrabold mt-3">Good morning, {user.name} ☀️</h1>
          <p className="text-[var(--ds-muted)] mt-2">
            A clear view of your day. One less thing to remember.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs border border-[var(--ds-line)] rounded-full px-3 py-1.5 text-[var(--ds-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--ds-ink)]" /> Demo · Sample data
          </span>
          <AddNewButton />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Remaining bills this month"
          value={formatGBP(remainingTotal)}
          sub={`${remainingCount} payment${remainingCount === 1 ? '' : 's'} still to record`}
          icon={ArrowUpRight}
          highlight
        />
        <StatCard
          label="Marked paid this month"
          value={formatGBP(paidTotal)}
          sub={`Of ${formatGBP(scheduledTotal)} scheduled`}
          icon={Check}
        />
        <StatCard
          label="Medication check-ins today"
          value={
            <>
              {takenCount}
              <span className="text-[var(--ds-muted)]">/{medications.length}</span>
            </>
          }
          sub="Recorded as taken by you"
          icon={Plus}
        />
        <StatCard
          label="Upcoming appointments"
          value={String(appointments.length)}
          sub="Across your calendar"
          icon={Grid3x3}
        />
      </div>

      <div className="bg-white border border-[var(--ds-line)] rounded-2xl p-6 mt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Bill payment trends</h2>
            <p className="text-sm text-[var(--ds-muted)] mt-1">
              Cumulative monthly totals · compared on matching day numbers
            </p>
          </div>
          <select className="border border-[var(--ds-line)] rounded-lg px-3 py-1.5 text-sm">
            <option>Scheduled bills</option>
            <option>Paid bills</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div>
            <p className="text-sm text-[var(--ds-muted)]">{trend.current.label}</p>
            <p className="text-2xl font-extrabold mt-1">{formatGBP(trend.current.total)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--ds-muted)]">{trend.previous.label}</p>
            <p className="text-2xl font-extrabold mt-1">
              {trend.previous.total === null ? 'No data' : formatGBP(trend.previous.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--ds-muted)]">Difference</p>
            <p className="text-2xl font-extrabold mt-1">Not available</p>
            <p className="text-xs text-[var(--ds-muted)] mt-1">Add records for both months to compare</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ds-accent)]" /> {trend.current.label}
          </span>
          <span className="flex items-center gap-2 text-[var(--ds-muted)]">
            <span className="w-2.5 h-2.5 rounded-full border border-[var(--ds-muted)]" />{' '}
            {trend.previous.label} · dashed
          </span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} stroke="var(--ds-line)" />
              <XAxis dataKey="day" hide />
              <YAxis
                domain={[0, 1400]}
                ticks={[0, 350, 700, 1050, 1400]}
                tickFormatter={(v) => `£${v}`}
                stroke="var(--ds-muted)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v: number) => formatGBP(v)} />
              <Line
                type="monotone"
                dataKey="october"
                stroke="var(--ds-accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-[var(--ds-muted)] mt-6">
        {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon: typeof ArrowUpRight;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        highlight
          ? 'bg-[var(--ds-accent-tint)] border-[var(--ds-accent-line)]'
          : 'bg-white border-[var(--ds-line)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--ds-muted)]">{label}</p>
        <Icon size={16} className="text-[var(--ds-muted)]" />
      </div>
      <p className="text-2xl font-extrabold mt-3">{value}</p>
      <p className="text-xs text-[var(--ds-muted)] mt-2">{sub}</p>
    </div>
  );
}
