import type { ReactNode } from 'react';

// Interface fragments of the DayStead phone app, drawn in HTML with the app's own colours,
// wording and layout (mobile/App.tsx). Sample data for illustration; amounts add up.

const C = { ink: '#193D31', green: '#2D6554', paper: '#F7F7F0', line: '#E4E8DF', muted: '#5E6E66', red: '#B3261E', soft: '#EDF2E9' };

export function Phone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div data-ui aria-hidden="true" className={`w-[300px] rounded-[46px] p-[10px] bg-[#0f2a21] shadow-[0_40px_80px_-20px_rgba(15,42,33,.45)] ${className}`}>
      <div className="relative rounded-[37px] overflow-hidden h-[610px]" style={{ background: C.paper, color: C.ink }}>
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[92px] h-[26px] rounded-full bg-[#0f2a21]" />
        <div className="pt-12 px-4 flex flex-col gap-3 h-full">{children}</div>
      </div>
    </div>
  );
}

function Top({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div className="flex justify-between items-center"><span className="text-[19px] font-bold tracking-[-0.04em]">DayStead.</span><span className="text-[8px] rounded-full px-2 py-0.5" style={{ border: `1px solid ${C.line}`, color: C.muted }}>BY PROVIFI</span></div>
      <p className="text-[9px] font-bold tracking-[.12em]" style={{ color: C.muted }}>MONDAY 2 NOVEMBER</p>
      <p className="text-[27px] font-semibold tracking-[-0.03em] leading-none">{title}</p>
      <p className="text-[11px]" style={{ color: C.muted }}>{sub}</p>
    </>
  );
}

function Row({ title, right, sub, missed, done }: { title: string; right: string; sub: string; missed?: boolean; done?: boolean }) {
  return (
    <div className="rounded-[16px] p-3" style={{ background: missed ? '#FDF0EE' : '#fff', border: `1px solid ${missed ? '#E8B4AC' : C.line}`, borderLeft: missed ? `5px solid ${C.red}` : undefined }}>
      {missed && <p className="text-[8px] font-bold tracking-wide mb-1" style={{ color: C.red }}>● MISSED · NOT MARKED PAID</p>}
      <div className="flex justify-between text-[12.5px] font-semibold"><span>{title}</span><span>{right}</span></div>
      <p className="text-[9.5px] mt-0.5" style={{ color: C.muted }}>{sub}</p>
      {done && <p className="text-[10px] font-semibold mt-1" style={{ color: C.green }}>✓ Reported taken</p>}
    </div>
  );
}

function TabBar({ active }: { active: string }) {
  return (
    <div className="mt-auto -mx-4 px-3 pt-2 pb-5 bg-white flex justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
      {['Today', 'Dashboard', 'Bills', 'Medicines', 'Planner', 'Account'].map((t) => (
        <span key={t} className="flex flex-col items-center gap-1 text-[7.5px]" style={{ color: t === active ? C.green : C.muted, fontWeight: t === active ? 700 : 400 }}>
          <span className="w-3.5 h-3.5 rounded-[4px]" style={{ border: `1.6px solid ${t === active ? C.green : '#98A098'}` }} />{t}
        </span>
      ))}
    </div>
  );
}

export function TodayScreen() {
  return (
    <>
      <Top title="Hello, Sam." sub="Make room for the rest of your day." />
      <div className="rounded-[18px] p-3.5" style={{ background: C.soft }}>
        <p className="text-[11.5px] font-semibold">Money needed before payday</p>
        <p className="text-[24px] font-semibold tnum leading-tight mt-0.5">£276.00</p>
        <p className="text-[9px]" style={{ color: C.muted }}>Payday · Wednesday 18 November</p>
      </div>
      <div className="rounded-[18px] p-3.5 text-white" style={{ background: C.ink }}>
        <p className="text-[8px] font-bold tracking-[.14em] text-[#ACC7B7]">STILL TO SET ASIDE · NOVEMBER</p>
        <p className="text-[28px] font-medium tnum leading-tight">£308.00</p>
      </div>
      <Row title="Council tax" right="£148.00" sub="Fri 6 Nov · Council tax" />
      <Row title="Morning tablets" right="08:00" sub="Today · Medicine · For Mum" done />
      <Row title="Dentist" right="14:30" sub="Thu 5 Nov · Appointment" />
      <TabBar active="Today" />
    </>
  );
}

export function BillsScreen() {
  const parts: [string, number, string][] = [['Rent', 850, C.ink], ['Council tax', 148, C.green], ['Utilities', 128, '#7FA08C'], ['Subscriptions', 32, '#C9D8C4']];
  const total = parts.reduce((n, p) => n + p[1], 0);
  let acc = 0;
  const r = 52, c = 2 * Math.PI * r;
  return (
    <>
      <Top title="Bills" sub="Know what is due. Keep what you need." />
      <div className="rounded-[18px] bg-white p-3.5 flex items-center gap-3" style={{ border: `1px solid ${C.line}` }}>
        <svg width="124" height="124" viewBox="0 0 124 124" className="-rotate-90 shrink-0">
          {parts.map(([k, v, col]) => {
            const len = (v / total) * c; const el = <circle key={k} cx="62" cy="62" r={r} fill="none" stroke={col} strokeWidth="16" strokeDasharray={`${len - 2} ${c}`} strokeDashoffset={-acc} />;
            acc += len; return el;
          })}
        </svg>
        <div className="flex flex-col gap-1">
          <p className="text-[9px]" style={{ color: C.muted }}>November total</p>
          <p className="text-[19px] font-semibold tnum">£{total.toLocaleString('en-GB')}.00</p>
          {parts.map(([k, v, col]) => <p key={k} className="text-[9px] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: col }} />{k} £{v}</p>)}
        </div>
      </div>
      <Row title="Water" right="£32.00" sub="Fri 30 Oct · Utilities" missed />
      <Row title="Rent" right="£850.00" sub="Sun 1 Nov · Rent · Reported paid" />
      <Row title="Council tax" right="£148.00" sub="Fri 6 Nov · Council tax" />
      <TabBar active="Bills" />
    </>
  );
}

export function MedicinesScreen() {
  return (
    <>
      <Top title="Medicines" sub="Your schedule, as prescribed." />
      <Row title="Morning tablets" right="08:00" sub="Daily · For Mum" done />
      <div className="rounded-[16px] p-3" style={{ background: '#FDF0EE', border: '1px solid #E8B4AC', borderLeft: `5px solid ${C.red}` }}>
        <p className="text-[8px] font-bold tracking-wide mb-1" style={{ color: C.red }}>● MISSED DOSE · NOT MARKED TAKEN</p>
        <div className="flex justify-between text-[12.5px] font-semibold"><span>Inhaler</span><span>12:00</span></div>
        <p className="text-[9.5px] mt-0.5" style={{ color: C.muted }}>Daily · Me</p>
      </div>
      <div className="rounded-[16px] bg-white p-3 flex flex-col gap-2" style={{ border: `1px solid ${C.line}` }}>
        <div className="flex justify-between text-[12.5px] font-semibold"><span>Evening tablets</span><span>20:00</span></div>
        <p className="text-[9.5px]" style={{ color: C.muted }}>Daily · For Mum · Alarm</p>
        <span className="rounded-[10px] text-center py-2 text-[11px] font-semibold" style={{ background: C.soft }}>Mark as taken</span>
        <div className="flex gap-4 text-[10.5px] font-semibold" style={{ color: C.green }}><span>Skip</span><span>Snooze 5 min</span></div>
      </div>
      <p className="text-[9px] leading-snug" style={{ color: C.muted }}>Enter the instructions you were prescribed. DayStead does not recommend doses.</p>
      <TabBar active="Medicines" />
    </>
  );
}

export function LockScreen() {
  return (
    <div data-ui aria-hidden="true" className="w-[300px] rounded-[46px] p-[10px] bg-[#0f2a21]">
      <div className="rounded-[37px] h-[420px] px-4 pt-14 flex flex-col items-center text-white" style={{ background: '#2D6554' }}>
        <p className="text-[13px] opacity-80">Monday 2 November</p>
        <p className="text-[64px] font-semibold tracking-[-0.04em] leading-none mt-1 tnum">07:50</p>
        <div className="mt-8 w-full rounded-[20px] bg-white/90 text-[#193D31] p-3.5 flex gap-3">
          <span className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-[11px] font-bold text-white" style={{ background: C.ink }}>DS</span>
          <div className="flex-1">
            <div className="flex justify-between text-[11px]"><span className="font-semibold">DAYSTEAD</span><span className="opacity-60">now</span></div>
            <p className="text-[13px] font-semibold">DayStead reminder</p>
            <p className="text-[12px] opacity-80">You have a scheduled item. Open DayStead to review it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
