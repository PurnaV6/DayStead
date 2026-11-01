import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { pounds, type Occurrence } from '../lib/domain';

// Same charts as mobile/src/Charts.tsx: category donut with the total in the middle,
// and this month vs last month (last month dashed).
const palette = ['#2D6554', '#9CBCA6', '#D4A864', '#809EB7', '#AD91B9', '#D0CCC2'];
const sum = (items: Occurrence[]) => items.reduce((s, o) => s + (o.schedule.amount_pence || 0), 0);

export function BillDonut({ current, size = 170 }: { current: Occurrence[]; size?: number }) {
  const groups: Record<string, number> = {};
  current.forEach((o) => (groups[o.schedule.category] = (groups[o.schedule.category] || 0) + (o.schedule.amount_pence || 0)));
  const entries = Object.entries(groups).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = sum(current);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {entries.length ? (
              <Pie data={entries.map(([category, value]) => ({ category, value }))} dataKey="value" nameKey="category" innerRadius="68%" outerRadius="100%" stroke="none" isAnimationActive={false}>
                {entries.map(([category], i) => <Cell key={category} fill={palette[i % palette.length]} />)}
              </Pie>
            ) : (
              <Pie data={[{ value: 1 }]} dataKey="value" innerRadius="68%" outerRadius="100%" stroke="none" fill="#EEEDE7" isAnimationActive={false} />
            )}
            {entries.length > 0 && <Tooltip formatter={(v) => (typeof v === 'number' ? pounds(v) : v)} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[11px] text-[#68756E]">Total</p>
          <p className="text-lg font-bold text-[var(--ds-ink)]">{pounds(total)}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 w-full">
        {entries.map(([label, value], i) => (
          <p key={label} className="text-sm text-[var(--ds-ink)]">
            <span style={{ color: palette[i % palette.length] }}>●</span> {label} · {pounds(value)}
          </p>
        ))}
        {!entries.length && <p className="text-sm text-[#68756E] leading-6">No bills this month yet. Tap + to add your first bill and the chart fills in.</p>}
      </div>
    </div>
  );
}

export function BillTrend({ current, previous }: { current: Occurrence[]; previous: Occurrence[] }) {
  const upTo = (items: Occurrence[], day: number) => items.filter((o) => o.at.getDate() <= day).reduce((s, o) => s + (o.schedule.amount_pence || 0), 0);
  const data = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    current: current.length ? upTo(current, i + 1) : null,
    previous: previous.length ? upTo(previous, i + 1) : null,
  }));
  const now = sum(current), prior = sum(previous);
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-[var(--ds-ink)]">This month vs last month</h2>
      <p className="text-sm text-[#68756E]">Cumulative bills by day of the month · last month dashed</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E4E8DF" />
            <XAxis dataKey="day" ticks={[1, 15, 31]} interval={0} padding={{ left: 12, right: 12 }} tickFormatter={(d) => (d === 1 ? '1st' : d === 15 ? '15th' : '31st')} stroke="#68756E" fontSize={12} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => (typeof v === 'number' ? pounds(v) : v)} labelFormatter={(d) => `Day ${d}`} />
            <Line dataKey="previous" name="Last month" stroke="#B1B6AD" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
            <Line dataKey="current" name="This month" stroke="#2D6554" strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[var(--ds-ink)]">
        {!previous.length
          ? 'No previous-month data to compare.'
          : `${pounds(Math.abs(now - prior))} ${now >= prior ? 'more' : 'less'} than last month${prior ? ' · ' + Math.abs(((now - prior) / prior) * 100).toFixed(1) + '%' : ''}`}
      </p>
    </div>
  );
}
