import type { ReactNode } from 'react';
import { Check, Trash2 } from 'lucide-react';
import PageHeader, { EmptyState } from '../components/PageHeader';
import {
  CATEGORY_COLORS,
  formatDay,
  formatGBP,
  removeAppointment,
  removeBill,
  removeMedicine,
  toggleBillPaid,
  toggleMedicineTaken,
  todayYmd,
  useStore,
} from '../lib/store';

function Row({ children, onRemove, label }: { children: ReactNode; onRemove: () => void; label: string }) {
  return (
    <li className="flex items-center gap-4 bg-white border border-[var(--ds-line)] rounded-2xl px-5 py-4">
      {children}
      <button onClick={onRemove} aria-label={`Delete ${label}`} className="text-[var(--ds-muted)] hover:text-[var(--ds-risk)]">
        <Trash2 size={18} />
      </button>
    </li>
  );
}

function DoneToggle({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={done}
      className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border ${
        done
          ? 'bg-[var(--ds-accent)] text-white border-[var(--ds-accent)]'
          : 'border-[var(--ds-line)] text-[var(--ds-ink)] hover:bg-[var(--ds-accent-tint)]'
      }`}
    >
      <Check size={14} /> {label}
    </button>
  );
}

export function BillsPage() {
  const { bills } = useStore();
  const today = todayYmd();
  const sorted = [...bills].sort((a, b) => Number(a.paid) - Number(b.paid) || a.dueDate.localeCompare(b.dueDate));
  return (
    <div>
      <PageHeader eyebrow="Money" title="Bills & payments" sub="Every bill and when it's due." addKind="bill" addLabel="Add bill" />
      {!sorted.length ? (
        <EmptyState text="No bills yet. Press + Add bill to add rent, council tax, energy or anything else you pay." />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {sorted.map((b) => (
            <Row key={b.id} onRemove={() => removeBill(b.id)} label={b.name}>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[b.category] }} />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${b.paid ? 'line-through text-[var(--ds-muted)]' : ''}`}>{b.name}</p>
                <p className={`text-xs mt-0.5 ${!b.paid && b.dueDate < today ? 'text-[var(--ds-risk)]' : 'text-[var(--ds-muted)]'}`}>
                  {b.category} · {!b.paid && b.dueDate < today ? 'Overdue, ' : 'Due '}
                  {b.dueDate === today ? 'today' : formatDay(b.dueDate)}
                </p>
              </div>
              <p className="font-bold">{formatGBP(b.amount)}</p>
              <DoneToggle done={b.paid} onToggle={() => toggleBillPaid(b.id)} label={b.paid ? 'Paid' : 'Mark paid'} />
            </Row>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MedicinesPage() {
  const { medicines } = useStore();
  const today = todayYmd();
  const sorted = [...medicines].sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div>
      <PageHeader eyebrow="Health" title="Medicines" sub="Your daily doses, in time order." addKind="medicine" addLabel="Add medicine" />
      {!sorted.length ? (
        <EmptyState text="No medicines yet. Press + Add medicine and pick the time you take it each day." />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {sorted.map((m) => {
            const taken = m.takenOn === today;
            return (
              <Row key={m.id} onRemove={() => removeMedicine(m.id)} label={m.name}>
                <p className="font-bold w-14 shrink-0">{m.time}</p>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-[var(--ds-muted)] mt-0.5">{m.dose || 'Every day'}</p>
                </div>
                <DoneToggle done={taken} onToggle={() => toggleMedicineTaken(m.id)} label={taken ? 'Taken' : 'Mark taken'} />
              </Row>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AppointmentsPage() {
  const { appointments } = useStore();
  const today = todayYmd();
  const sorted = [...appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return (
    <div>
      <PageHeader eyebrow="Calendar" title="Appointments" sub="What's coming up and where." addKind="appointment" addLabel="Add appointment" />
      {!sorted.length ? (
        <EmptyState text="No appointments yet. Press + Add appointment for a GP visit, dentist or anything else." />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {sorted.map((a) => (
            <Row key={a.id} onRemove={() => removeAppointment(a.id)} label={a.title}>
              <div className="w-16 shrink-0 text-center">
                <p className="text-xs text-[var(--ds-muted)]">{a.date === today ? 'Today' : formatDay(a.date)}</p>
                <p className="font-bold">{a.time}</p>
              </div>
              <div className={`flex-1 min-w-0 ${a.date < today ? 'opacity-50' : ''}`}>
                <p className="font-semibold truncate">{a.title}</p>
                {a.location && <p className="text-xs text-[var(--ds-muted)] mt-0.5 truncate">{a.location}</p>}
              </div>
            </Row>
          ))}
        </ul>
      )}
    </div>
  );
}
