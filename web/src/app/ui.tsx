import type { ReactNode } from 'react';
import { isMissed, pounds, formatDoseTime, type Occurrence, type Schedule } from '../lib/domain';
import { useDaystead } from './context';

// Shared pieces for the signed-in web app. Same wording and colours as mobile/App.tsx.

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-[var(--ds-line)] rounded-[22px] p-5 flex flex-col gap-3 ${className}`}>{children}</div>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-[var(--ds-ink)]">{children}</h2>;
}

export function Small({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-[var(--ds-muted)]">{children}</p>;
}

export function Button({ children, onClick, secondary, disabled }: { children: ReactNode; onClick: () => void; secondary?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[46px] rounded-[14px] px-4 font-semibold text-[15px] disabled:opacity-45 ${
        secondary ? 'bg-[#EDF2E9] text-[var(--ds-ink)]' : 'bg-[var(--ds-accent)] text-white'
      }`}
    >
      {children}
    </button>
  );
}

const missedStyle = 'bg-[#FDF0EE] border-[#E8B4AC] border-l-[6px] border-l-[var(--ds-missed)]';

export function MissedTag({ item }: { item: Occurrence }) {
  return (
    <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-[var(--ds-missed)]" aria-label={item.schedule.kind === 'bill' ? 'Missed payment' : 'Missed dose'}>
      <span className="w-2.5 h-2.5 rounded-full bg-[var(--ds-missed)]" />
      {item.schedule.kind === 'bill' ? 'MISSED · NOT MARKED PAID' : 'MISSED DOSE · NOT MARKED TAKEN'}
    </p>
  );
}

export function OccurrenceCard({ item: o }: { item: Occurrence }) {
  const { busy, complete, now } = useDaystead();
  const missed = isMissed(o, now);
  const kind = o.schedule.kind;
  return (
    <div className={`bg-white border border-[var(--ds-line)] rounded-[22px] p-5 flex flex-col gap-3 ${missed ? missedStyle : ''}`}>
      {missed && <MissedTag item={o} />}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex-1">{o.schedule.priority ? '★ ' : ''}{o.schedule.title}</h3>
        {kind === 'bill' && <p className="text-lg font-semibold">{pounds(o.schedule.amount_pence || 0)}</p>}
      </div>
      <Small>
        {o.at.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {o.schedule.category}
        {o.schedule.for_person ? ' · For ' + o.schedule.for_person : ''}
      </Small>
      {o.status ? (
        <p className="text-[var(--ds-accent)] font-semibold">✓ Reported {o.status}</p>
      ) : (
        <div className="flex flex-wrap gap-3 items-center">
          <Button secondary disabled={busy} onClick={() => void complete(o, kind === 'bill' ? 'paid' : kind === 'medicine' ? 'taken' : 'completed')}>
            {kind === 'bill' ? 'Mark as paid' : kind === 'medicine' ? 'Mark as taken' : 'Mark complete'}
          </Button>
          {kind === 'medicine' && (
            <button disabled={busy} onClick={() => void complete(o, 'skipped')} className="text-[var(--ds-accent)] font-semibold">
              Skip
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const repeatLabel = (r: Schedule['repeat_rule']) => (r === 'none' ? 'One time' : r);

export function ScheduleCard({ item, confirmText }: { item: Schedule; confirmText: string }) {
  const { setEditor, remove } = useDaystead();
  const due = new Date(item.due_at);
  const times = item.kind === 'medicine' ? (item.dose_minutes?.length ? item.dose_minutes : [due.getHours() * 60 + due.getMinutes()]) : null;
  return (
    <Card>
      <h3 className="text-lg font-semibold">{item.priority ? '★ ' : ''}{item.title}</h3>
      <Small>
        {repeatLabel(item.repeat_rule)} · {times ? times.map(formatDoseTime).join(', ') : due.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        {item.amount_pence != null ? ' · ' + pounds(item.amount_pence) : ''}
        {item.for_person ? ' · For ' + item.for_person : ''}
      </Small>
      <div className="flex gap-5">
        <button onClick={() => setEditor(item)} className="text-[var(--ds-accent)] font-semibold">Edit</button>
        <button onClick={() => { if (window.confirm(confirmText)) void remove(item); }} className="text-[var(--ds-missed)] font-semibold">Delete</button>
      </div>
    </Card>
  );
}

export function DarkCard({ label, big, left, right }: { label: string; big: string; left: [string, string]; right: [string, string] }) {
  return (
    <div className="bg-[var(--ds-ink)] rounded-[25px] p-6 flex flex-col gap-3">
      <p className="text-[10px] font-bold tracking-widest text-[#ACC7B7]">{label}</p>
      <p className="text-white text-5xl font-medium tracking-tight">{big}</p>
      <div className="flex justify-between mt-2">
        {[left, right].map(([l, v]) => (
          <div key={l}>
            <p className="text-[10px] font-bold tracking-widest text-[#ACC7B7]">{l}</p>
            <p className="text-white text-xl mt-1">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
