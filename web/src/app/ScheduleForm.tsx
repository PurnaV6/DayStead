import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { formatDoseTime, type Schedule } from '../lib/domain';
import { useDaystead } from './context';
import { Button, Small } from './ui';
import { BILL_TEMPLATES } from './templates';

// Web version of ScheduleForm in mobile/App.tsx. Same fields, checks and saved payload.


const input = 'w-full border border-[var(--ds-line)] rounded-xl p-3.5 text-base bg-[#FCFCF8] text-[var(--ds-ink)] outline-none focus:border-[var(--ds-accent)]';
const pad = (n: number) => String(n).padStart(2, '0');
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const minutesOf = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const timeOf = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-semibold text-[var(--ds-ink)]">{children}</p>;
}

function Chips({ options, value, onPick }: { options: [string, string][]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([label, v]) => (
        <button key={label} type="button" aria-pressed={value === v} onClick={() => onPick(v)}
          className={`py-2.5 px-3.5 rounded-full border border-[var(--ds-line)] text-[var(--ds-ink)] ${value === v ? 'bg-[#DDEBDD]' : 'bg-white'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function ScheduleForm() {
  const { editor, setEditor, save, busy, error } = useDaystead();
  if (!editor) return null;
  return <Form key={editor.id || editor.kind} item={editor} busy={busy} error={error} onCancel={() => setEditor(null)} onSave={save} />;
}

function Form({ item, busy, error, onCancel, onSave }: { item: Partial<Schedule>; busy: boolean; error: string; onCancel: () => void; onSave: (v: Partial<Schedule>) => Promise<void> }) {
  const kind = item.kind || 'bill';
  const [title, setTitle] = useState(item.title || '');
  const [amount, setAmount] = useState(item.amount_pence != null ? String(item.amount_pence / 100) : '');
  const [category, setCategory] = useState(item.category || (kind === 'bill' ? 'Rent' : kind === 'medicine' ? 'Medicine' : 'Appointment'));
  const [notes, setNotes] = useState(item.notes || '');
  const [priority, setPriority] = useState(item.priority || false);
  const [forPerson, setForPerson] = useState(item.for_person || '');
  const [repeat, setRepeat] = useState<Schedule['repeat_rule']>(item.repeat_rule || (kind === 'medicine' ? 'daily' : kind === 'bill' ? 'monthly' : 'none'));
  const [date, setDate] = useState(() => (item.due_at ? new Date(item.due_at) : new Date(Date.now() + 3600000)));
  const [end, setEnd] = useState(item.end_at ? toDateInput(new Date(item.end_at)) : '');
  const [times, setTimes] = useState<number[]>(() => item.dose_minutes?.length ? [...item.dose_minutes] : [item.due_at ? new Date(item.due_at).getHours() * 60 + new Date(item.due_at).getMinutes() : 8 * 60]);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  function setDay(value: string) {
    if (!value) return;
    const [y, m, d] = value.split('-').map(Number);
    const next = new Date(date); next.setFullYear(y, m - 1, d); setDate(next);
  }
  function setTime(value: string) {
    if (!value) return;
    const next = new Date(date); next.setHours(Math.floor(minutesOf(value) / 60), minutesOf(value) % 60, 0, 0); setDate(next);
  }

  function submit() {
    setProblem('');
    if (!title.trim()) return setProblem('Add a name.');
    if (kind === 'bill' && (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) > 10000000)) return setProblem('Enter a valid amount. Use pounds with up to two decimal places.');
    if (kind === 'medicine' && new Set(times).size !== times.length) return setProblem('Duplicate reminder times. Choose a different time or remove the duplicate.');
    const first = new Date(date); if (kind === 'medicine') first.setHours(0, 0, 0, 0);
    let endAt: Date | null = null;
    if (end) { const [y, m, d] = end.split('-').map(Number); endAt = new Date(y, m - 1, d, 23, 59, 59, 999); }
    if (endAt && endAt < first) return setProblem('End date must be on or after the start date.');
    const person = forPerson.trim();
    void onSave({
      ...(person || item.for_person ? { for_person: person || null } : {}),
      kind, priority, reminder_mode: kind === 'medicine' ? item.reminder_mode || 'gentle' : 'gentle',
      title: title.trim(), amount_pence: kind === 'bill' ? Math.round(Number(amount) * 100) : null,
      category: category.trim() || 'Other', due_at: first.toISOString(), end_at: endAt?.toISOString() || null,
      repeat_rule: repeat, notes, dose_minutes: kind === 'medicine' ? [...times].sort((a, b) => a - b) : null,
    });
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/35 flex items-end sm:items-center justify-center" onClick={() => !busy && onCancel()}>
      <div role="dialog" aria-modal="true" aria-label={`${item.id ? 'Edit' : 'Add'} ${kind}`} onClick={(e) => e.stopPropagation()}
        className="bg-[var(--ds-paper)] w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        <div className="sticky top-0 bg-[var(--ds-paper)] flex items-center justify-between px-6 py-3 border-b border-[var(--ds-line)]">
          <h2 className="text-lg font-semibold">{item.id ? 'Edit' : 'Add'} {kind === 'todo' ? 'to-do' : kind}</h2>
          <button onClick={onCancel} disabled={busy} aria-label="Close schedule form" className="p-2 text-[var(--ds-accent)]"><X size={22} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {item.id && <Small>Editing changes the schedule, including generated occurrences. Historical corrections and “this occurrence only” editing are not yet available.</Small>}
          {kind === 'bill' && !item.id && (
            <>
              <Label>Quick add a common bill</Label>
              <Chips options={BILL_TEMPLATES.map(([n]) => [n, n])} value={title} onPick={(n) => { setTitle(n); setCategory(BILL_TEMPLATES.find(([t]) => t === n)![1]); setRepeat('monthly'); }} />
              <Small>Fills in the name and category. Add your own amount and due date.</Small>
            </>
          )}
          <Button secondary onClick={() => setPriority(!priority)}>{priority ? '★ Important · tap to unpin' : '☆ Mark as important'}</Button>
          <label className="flex flex-col gap-1.5"><Label>{kind === 'medicine' ? 'Medicine name' : 'Name'}</Label><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></label>
          <Label>Who is this for?</Label>
          <Chips options={[['Me', ''], ['Mum', 'Mum'], ['Dad', 'Dad'], ['Partner', 'Partner']]} value={forPerson} onPick={setForPerson} />
          <label className="flex flex-col gap-1.5"><Label>Or type a name (optional)</Label><input className={input} value={forPerson} onChange={(e) => setForPerson(e.target.value)} maxLength={60} /></label>
          {kind === 'bill' && <label className="flex flex-col gap-1.5"><Label>Amount (£)</Label><input className={input} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" /></label>}
          {kind !== 'medicine' && (
            <>
              <Label>Category</Label>
              <Chips options={(kind === 'bill' ? ['Rent', 'Credit card', 'Car insurance', 'Mortgage', 'Utilities', 'Subscriptions'] : ['Appointment', 'Personal', 'Work']).map((c) => [c, c])} value={category} onPick={setCategory} />
              <label className="flex flex-col gap-1.5"><Label>Category (or type your own)</Label><input className={input} value={category} onChange={(e) => setCategory(e.target.value)} /></label>
            </>
          )}
          <label className="flex flex-col gap-1.5"><Label>{kind === 'medicine' ? 'Start date' : 'Date'}</Label><input type="date" className={input} value={toDateInput(date)} onChange={(e) => setDay(e.target.value)} /></label>
          {kind === 'medicine' ? (
            <>
              <Label>Times each day</Label>
              {times.map((minutes, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input type="time" aria-label={`Time ${index + 1}`} className={input} value={timeOf(minutes)} onChange={(e) => e.target.value && setTimes((t) => t.map((v, i) => (i === index ? minutesOf(e.target.value) : v)))} />
                  {times.length > 1 && <button type="button" aria-label={`Remove time ${index + 1}`} onClick={() => setTimes((t) => t.filter((_, i) => i !== index))} className="text-[var(--ds-accent)] font-semibold px-2">Remove</button>}
                </div>
              ))}
              <Button secondary disabled={times.length >= 12} onClick={() => { const last = times[times.length - 1]; let next = (last + 60) % 1440; while (times.includes(next)) next = (next + 1) % 1440; setTimes((t) => [...t, next]); }}>+ Add time</Button>
              <Small>Alarm-style reminders are set in the phone app. {times.length} {times.length === 1 ? 'time' : 'times'} per day: {[...times].sort((a, b) => a - b).map(formatDoseTime).join(', ')}.</Small>
            </>
          ) : (
            <label className="flex flex-col gap-1.5"><Label>Time</Label><input type="time" className={input} value={toTimeInput(date)} onChange={(e) => setTime(e.target.value)} /></label>
          )}
          <Label>Repeat</Label>
          <Chips options={[['Once', 'none'], ['Every day', 'daily'], ['weekly', 'weekly'], ['monthly', 'monthly']]} value={repeat} onPick={(v) => setRepeat(v as Schedule['repeat_rule'])} />
          {repeat !== 'none' && <label className="flex flex-col gap-1.5"><Label>End date (optional)</Label><input type="date" className={input} value={end} onChange={(e) => setEnd(e.target.value)} /></label>}
          <label className="flex flex-col gap-1.5"><Label>{kind === 'medicine' ? 'Prescribed instructions (optional)' : 'Notes (optional)'}</Label><textarea className={input} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          <Small>{kind === 'medicine' ? 'Phone reminders: 10 minutes, 5 minutes and at each selected time.' : kind === 'bill' ? 'Phone reminder: 3 days before the due date. Monthly dates are clamped to the last day of shorter months.' : 'Phone reminders: 1 hour and 10 minutes before.'}</Small>
          {(problem || error) && <p role="alert" className="text-sm text-[var(--ds-missed)]">{problem || error}</p>}
          <Button disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save schedule'}</Button>
        </div>
      </div>
    </div>
  );
}
