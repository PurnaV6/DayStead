import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Pill, Grid3x3 } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import PageHeader from '../components/PageHeader';
import { CATEGORY_COLORS, formatGBP, parseYmd, useStore, ymd, type BillCategory } from '../lib/store';
import { user } from '../lib/sampleData';


export default function OverviewPage() {
  const { bills, medicines, appointments } = useStore();
  const now = new Date();
  const today = ymd(now);

  const monthBills = bills.filter((b) => {
    const d = parseYmd(b.dueDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthTotal = monthBills.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = monthBills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);
  const remaining = monthBills.filter((b) => !b.paid);
  const takenCount = medicines.filter((m) => m.takenOn === today).length;
  const upcoming = appointments.filter((a) => a.date >= today).length;

  const slices = Object.entries(
    monthBills.reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] ?? 0) + b.amount;
      return acc;
    }, {}),
  )
    .map(([category, amount]) => ({ category, amount, color: CATEGORY_COLORS[category as BillCategory] ?? CATEGORY_COLORS.Other }))
    .sort((a, b) => b.amount - a.amount);
  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div>
      <PageHeader
        eyebrow="Your everyday, organised"
        title={<>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}</>}
        sub="A clear view of your day. One less thing to remember."
        addLabel="Add new"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Bills this month"
          value={formatGBP(monthTotal)}
          sub={monthBills.length ? `${monthBills.length} bill${monthBills.length === 1 ? '' : 's'} due in ${now.toLocaleDateString('en-GB', { month: 'long' })}` : 'No bills added yet'}
          icon={ArrowUpRight}
          highlight
        />
        <StatCard
          label="Still to pay"
          value={formatGBP(monthTotal - paidTotal)}
          sub={`${formatGBP(paidTotal)} marked paid · ${remaining.length} left`}
          icon={Check}
        />
        <StatCard
          label="Medicines taken today"
          value={
            <>
              {takenCount}
              <span className="text-[var(--ds-muted)]">/{medicines.length}</span>
            </>
          }
          sub={medicines.length ? 'Marked as taken by you' : 'No medicines added yet'}
          icon={Pill}
        />
        <StatCard
          label="Upcoming appointments"
          value={String(upcoming)}
          sub={appointments.length ? 'From today onwards' : 'No appointments added yet'}
          icon={Grid3x3}
        />
      </div>

      <div className="bg-white border border-[var(--ds-line)] rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-bold">Where your money goes</h2>
        <p className="text-sm text-[var(--ds-muted)] mt-1">Bills due in {monthName}, by category</p>

        <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
          <div className="relative w-56 h-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {slices.length ? (
                  <Pie data={slices} dataKey="amount" nameKey="category" innerRadius="68%" outerRadius="100%" paddingAngle={slices.length > 1 ? 2 : 0} stroke="none">
                    {slices.map((s) => (
                      <Cell key={s.category} fill={s.color} />
                    ))}
                  </Pie>
                ) : (
                  <Pie data={[{ amount: 1 }]} dataKey="amount" innerRadius="68%" outerRadius="100%" stroke="none" fill="var(--ds-line)" isAnimationActive={false} />
                )}
                {slices.length > 0 && <Tooltip formatter={(v) => (typeof v === 'number' ? formatGBP(v) : v)} />}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-[var(--ds-muted)]">Total</p>
              <p className="text-2xl font-extrabold">{formatGBP(monthTotal)}</p>
            </div>
          </div>

          {slices.length ? (
            <ul className="flex-1 w-full flex flex-col gap-3">
              {slices.map((s) => (
                <li key={s.category} className="flex items-center gap-3 text-sm">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="flex-1">{s.category}</span>
                  <span className="text-[var(--ds-muted)]">{Math.round((s.amount / monthTotal) * 100)}%</span>
                  <span className="font-semibold w-24 text-right">{formatGBP(s.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex-1 text-[var(--ds-muted)] text-center sm:text-left">
              Nothing here yet. Press <span className="font-semibold text-[var(--ds-ink)]">+ Add new</span> to add your first bill and the chart fills in.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--ds-muted)] mt-6">
        {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
