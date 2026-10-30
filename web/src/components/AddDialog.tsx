import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { CalendarDays, FileText, Pill, Plus, X } from 'lucide-react';
import { BILL_CATEGORIES, addAppointment, addBill, addMedicine, ymd, type BillCategory } from '../lib/store';

export type AddKind = 'bill' | 'medicine' | 'appointment';

const KINDS: { kind: AddKind; label: string; icon: typeof Pill }[] = [
  { kind: 'bill', label: 'Bill', icon: FileText },
  { kind: 'medicine', label: 'Medicine', icon: Pill },
  { kind: 'appointment', label: 'Appointment', icon: CalendarDays },
];

const inputClass =
  'w-full border border-[var(--ds-line)] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[var(--ds-accent)]';

/** The "+" button every tab shows. With no kind it asks what to add first. */
export function AddButton({ kind, label = 'Add' }: { kind?: AddKind; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={label}
        className="flex items-center gap-2 bg-[var(--ds-accent)] text-white font-semibold rounded-xl px-4 md:px-5 py-2.5 hover:opacity-90 text-sm md:text-base"
      >
        <Plus size={18} /> <span className="hidden sm:inline">{label}</span>
      </button>
      {open && <AddDialog initialKind={kind} onClose={() => setOpen(false)} />}
    </>
  );
}

function AddDialog({ initialKind, onClose }: { initialKind?: AddKind; onClose: () => void }) {
  const [kind, setKind] = useState<AddKind | undefined>(initialKind);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const title = kind ? `Add ${KINDS.find((k) => k.kind === kind)!.label.toLowerCase()}` : 'What would you like to add?';
  return (
    <div
      className="fixed inset-0 z-30 bg-black/30 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--ds-muted)] hover:text-[var(--ds-ink)]">
            <X size={20} />
          </button>
        </div>
        {!kind && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            {KINDS.map(({ kind: k, label, icon: Icon }) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="flex flex-col items-center gap-2 border border-[var(--ds-line)] rounded-xl py-4 text-sm font-medium hover:bg-[var(--ds-accent-tint)]"
              >
                <Icon size={20} className="text-[var(--ds-accent)]" />
                {label}
              </button>
            ))}
          </div>
        )}
        {kind === 'bill' && <BillForm onDone={onClose} />}
        {kind === 'medicine' && <MedicineForm onDone={onClose} />}
        {kind === 'appointment' && <AppointmentForm onDone={onClose} />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function FormShell({ onSubmit, error, children }: { onSubmit: (e: FormEvent) => void; error: string; children: ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
      {children}
      {error && <p className="text-sm text-[var(--ds-risk)]">{error}</p>}
      <button type="submit" className="bg-[var(--ds-accent)] text-white font-semibold rounded-xl py-3 hover:opacity-90">
        Save
      </button>
    </form>
  );
}

function BillForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => ymd(new Date()));
  const [category, setCategory] = useState<BillCategory>('Utilities');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!name.trim()) return setError('Add a name for the bill.');
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount above £0.');
    if (!dueDate) return setError('Pick a due date.');
    addBill({ name: name.trim(), amount: Math.round(value * 100) / 100, dueDate, category });
    onDone();
  };
  return (
    <FormShell onSubmit={submit} error={error}>
      <Field label="Bill name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Council tax" maxLength={60} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (£)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" type="number" min="0.01" step="0.01" placeholder="0.00" />
        </Field>
        <Field label="Due date">
          <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Category">
        <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as BillCategory)}>
          {BILL_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
    </FormShell>
  );
}

function MedicineForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('08:00');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Add the medicine name.');
    if (!time) return setError('Pick a time.');
    addMedicine({ name: name.trim(), dose: dose.trim(), time });
    onDone();
  };
  return (
    <FormShell onSubmit={submit} error={error}>
      <Field label="Medicine">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D" maxLength={60} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Dose (optional)">
          <input className={inputClass} value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 1 tablet" maxLength={40} />
        </Field>
        <Field label="Time each day">
          <input className={inputClass} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
    </FormShell>
  );
}

function AppointmentForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => ymd(new Date()));
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Add what the appointment is for.');
    if (!date || !time) return setError('Pick a date and time.');
    addAppointment({ title: title.trim(), date, time, location: location.trim() });
    onDone();
  };
  return (
    <FormShell onSubmit={submit} error={error}>
      <Field label="Appointment">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GP check-up" maxLength={60} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <input className={inputClass} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Where (optional)">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Riverside Surgery" maxLength={80} />
      </Field>
    </FormShell>
  );
}
