import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDaystead } from './context';
import { BILL_TEMPLATES } from './templates';

// Web version of mobile/src/SetupGuide.tsx: payday, first bill, reminders. Every step can be skipped.
// Step 3 points to the phone app, because phone reminders are set there.

const STEPS = 3;
const pad = (n: number) => String(n).padStart(2, '0');
// Local calendar date, not toISOString(): in UK summer time a local midnight is the previous day in UTC.
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const link = 'text-[var(--ds-accent)] font-semibold text-[15px] min-h-[44px] px-1';

export default function SetupGuide() {
  const { session, schedules, setupKnown, setEditor, closeSetup, now } = useDaystead();
  const userId = session.user.id;
  const [step, setStep] = useState(0);
  const [payday, setPayday] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } heading.current?.focus(); }, [step]);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 366);
  const firstBill = schedules.find((o) => o.kind === 'bill' && !setupKnown.includes(o.id))?.title || null;

  useEffect(() => {
    let active = true;
    supabase.from('daystead_preferences').select('payday').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (active && data?.payday && data.payday >= ymd(new Date())) setPayday((p) => p || data.payday);
    });
    return () => { active = false; };
  }, [userId]);

  const next = () => (step < STEPS - 1 ? setStep(step + 1) : closeSetup());

  async function savePayday() {
    if (!payday || payday < ymd(today)) return;
    setSaving(true);
    setMessage('');
    // Only the payday column is sent, so an existing row keeps its dismissed cards.
    const { error } = await supabase.from('daystead_preferences').upsert({ user_id: userId, payday });
    setSaving(false);
    if (error) setMessage('Could not save your payday. ' + error.message + ' You can set it later on the Today page.');
    else next();
  }

  const paydayLabel = payday ? new Date(payday + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

  return (
    <section aria-label="Setup guide" className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[.15em] text-[var(--ds-muted)]">STEP {step + 1} OF {STEPS}</p>
        <button onClick={closeSetup} className={link}>Skip setup</button>
      </div>
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`flex-1 h-1 rounded ${i <= step ? 'bg-[var(--ds-accent)]' : 'bg-[var(--ds-line)]'}`} />)}
      </div>

      {step === 0 && (
        <>
          <h1 ref={heading} tabIndex={-1} className="text-[30px] font-bold tracking-tight text-[var(--ds-ink)] outline-none">When are you next paid?</h1>
          <p className="text-[15px] leading-6">DayStead adds up the bills due before then, so you know how much to keep aside.</p>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Your next payday</span>
            <input type="date" min={ymd(today)} max={ymd(maxDay)} value={payday} onChange={(e) => setPayday(e.target.value)}
              className="w-full border border-[var(--ds-line)] rounded-xl p-3.5 text-base bg-white text-[var(--ds-ink)] outline-none focus:border-[var(--ds-accent)]" />
          </label>
          {payday && <p className="text-[15px]">Payday: {paydayLabel}</p>}
          {message && <p role="alert" className="text-sm text-[var(--ds-missed)]">{message}</p>}
          <Primary disabled={!payday || payday < ymd(today) || payday > ymd(maxDay) || saving} onClick={() => void savePayday()}>{saving ? 'Saving…' : 'Save and continue'}</Primary>
        </>
      )}

      {step === 1 && (
        <>
          <h1 ref={heading} tabIndex={-1} className="text-[30px] font-bold tracking-tight text-[var(--ds-ink)] outline-none">Add your first bill</h1>
          {firstBill ? (
            <div className="bg-[#EDF2E9] rounded-[18px] p-4 flex flex-col gap-1">
              <p className="font-semibold text-[var(--ds-accent)]">✓ {firstBill} added</p>
              <p className="text-[15px]">Add more any time with the + button.</p>
            </div>
          ) : (
            <>
              <p className="text-[15px] leading-6">Pick a common one to start. You add the amount and the date it is due.</p>
              <div className="flex flex-wrap gap-2.5">
                {BILL_TEMPLATES.map(([name, category]) => (
                  <button key={name} onClick={() => setEditor({ kind: 'bill', title: name, category, repeat_rule: 'monthly' })} aria-label={'Add ' + name}
                    className="min-h-[44px] px-4 rounded-full bg-white border border-[var(--ds-line)] text-[15px] text-[var(--ds-ink)]">{name}</button>
                ))}
                <button onClick={() => setEditor({ kind: 'bill' })} aria-label="Add a different bill"
                  className="min-h-[44px] px-4 rounded-full bg-white border border-[var(--ds-line)] text-[15px] font-semibold text-[var(--ds-accent)]">Something else</button>
              </div>
            </>
          )}
          {firstBill && <Primary onClick={next}>Continue</Primary>}
        </>
      )}

      {step === 2 && (
        <>
          <h1 ref={heading} tabIndex={-1} className="text-[30px] font-bold tracking-tight text-[var(--ds-ink)] outline-none">Turn on reminders</h1>
          <p className="text-[15px] leading-6">Reminders come from the DayStead phone app: 3 days before a bill is due, and at each medicine time you set.</p>
          <p className="text-[15px] leading-6">Sign in to the app with this same account, then turn them on in Account. Reminders say “DayStead reminder”, so your lock screen never shows what a bill or medicine is.</p>
          <p className="text-[15px] leading-6">While this website is open, it also shows urgent items at the top of the page.</p>
          <Primary onClick={closeSetup}>Finish</Primary>
        </>
      )}

      <div className="flex justify-between items-center">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className={link}>Back</button> : <span />}
        {step < STEPS - 1 && !(step === 1 && firstBill) && <button onClick={next} aria-label="Skip this step" className={link}>Skip for now</button>}
      </div>
      <p className="text-xs text-center text-[var(--ds-muted)]">You can change all of this later.</p>
    </section>
  );
}

function Primary({ children, onClick, disabled }: { children: string; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="min-h-[50px] rounded-[14px] bg-[var(--ds-accent)] text-white font-semibold text-[15px] disabled:opacity-45">{children}</button>;
}
