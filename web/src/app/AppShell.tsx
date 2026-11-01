import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, Calendar, CheckSquare, FileText, PieChart, Plus, PlusSquare, Sun, User, X } from 'lucide-react';
import { occurrences, type Kind } from '../lib/domain';
import { playAlarm } from '../lib/alarmSound';
import { useDaystead } from './context';
import ScheduleForm from './ScheduleForm';
import SetupGuide from './SetupGuide';

// Same tabs, order and icons as NAV_TABS in mobile/App.tsx.
const TABS = [
  { to: '/app', label: 'Today', icon: Sun, end: true },
  { to: '/app/dashboard', label: 'Dashboard', icon: PieChart },
  { to: '/app/bills', label: 'Bills', icon: FileText },
  { to: '/app/medicines', label: 'Medicines', icon: PlusSquare },
  { to: '/app/planner', label: 'Planner', icon: Calendar },
  { to: '/app/account', label: 'Account', icon: User },
];

const ADD_KINDS: [Kind, string, typeof Sun][] = [['bill', 'Bill', FileText], ['medicine', 'Medicine', PlusSquare], ['appointment', 'Appointment', Calendar], ['todo', 'To-do', CheckSquare]];

export default function AppShell() {
  const { setEditor, error, editor, setupOpen } = useDaystead();
  const { pathname } = useLocation();
  const [chooser, setChooser] = useState(false);
  const tab = pathname.split('/')[2] || 'today';

  function add() {
    if (tab === 'bills') setEditor({ kind: 'bill' });
    else if (tab === 'medicines') setEditor({ kind: 'medicine' });
    else setChooser(true);
  }

  return (
    <div className="min-h-screen bg-[var(--ds-paper)] md:flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 p-6 border-r border-[var(--ds-line)] bg-white">
        <div>
          <p className="text-[27px] font-bold tracking-tight text-[var(--ds-ink)]">daystead.</p>
          <p className="text-[10px] font-bold tracking-[.18em] text-[var(--ds-muted)]">BY PROVIFI</p>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-[#EDF2E9] text-[var(--ds-accent)]' : 'text-[var(--ds-ink)] hover:bg-[var(--ds-paper)]'}`}>
              <Icon size={20} /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto text-xs text-[var(--ds-muted)]">Same account and data as the Daystead phone app.</p>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-5 md:px-10 pt-6 pb-32 md:pb-16 flex flex-col gap-5">
          <div className="md:hidden flex items-center justify-between">
            <p className="text-[27px] font-bold tracking-tight text-[var(--ds-ink)]">daystead.</p>
            <span className="border border-[var(--ds-line)] rounded-full px-3 py-1 text-[11px] text-[var(--ds-muted)]">BY PROVIFI</span>
          </div>
          <PriorityAlerts />
          {error && !editor && <p role="alert" className="bg-[#FDF0EE] border border-[#E8B4AC] text-[var(--ds-missed)] rounded-xl px-4 py-3 text-sm">{error}</p>}
          {setupOpen ? <SetupGuide /> : <Outlet />}
          <p className="text-center text-xs text-[var(--ds-muted)] mt-2">Your day, in order.</p>
        </div>
      </main>

      {!setupOpen && <button onClick={add} aria-label={tab === 'bills' ? 'Add a bill' : tab === 'medicines' ? 'Add a medicine' : 'Add something'}
        className="fixed right-5 bottom-24 md:bottom-8 md:right-8 z-30 w-[58px] h-[58px] rounded-full bg-[var(--ds-accent)] text-white flex items-center justify-center shadow-lg hover:opacity-90">
        <Plus size={28} />
      </button>}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-[var(--ds-line)] flex py-3">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-[var(--ds-accent)] font-bold' : 'text-[var(--ds-muted)]'}`}>
            {({ isActive }) => (<><Icon size={22} color={isActive ? 'var(--ds-accent)' : '#98A098'} />{label}</>)}
          </NavLink>
        ))}
      </nav>

      {chooser && (
        <div className="fixed inset-0 z-40 bg-black/35 flex items-end sm:items-center justify-center" onClick={() => setChooser(false)}>
          <div role="dialog" aria-modal="true" aria-label="What would you like to add?" onClick={(e) => e.stopPropagation()} className="bg-[var(--ds-paper)] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">What would you like to add?</h2>
              <button onClick={() => setChooser(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="flex gap-2">
              {ADD_KINDS.filter(([kind]) => tab !== 'planner' || kind === 'appointment' || kind === 'todo').map(([kind, label, Icon]) => (
                <button key={kind} onClick={() => { setChooser(false); setEditor({ kind }); }} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-white border border-[var(--ds-line)] text-[13px] font-semibold text-[var(--ds-ink)]">
                  <Icon size={22} color="var(--ds-accent)" /> {label}
                </button>
              ))}
            </div>
            <button onClick={() => setChooser(false)} className="min-h-[46px] rounded-[14px] bg-[#EDF2E9] font-semibold">Cancel</button>
          </div>
        </div>
      )}
      <ScheduleForm />
    </div>
  );
}

// The phone app uses phone notifications and alarms. While the website is open it shows
// the same urgent items here and beeps for 5 seconds when a new one appears.
function PriorityAlerts() {
  const { schedules, done, now } = useDaystead();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const seen = useRef<Set<string> | null>(null);
  const today = now.toDateString();
  const alerts = occurrences(schedules, new Date(now.getFullYear(), now.getMonth(), now.getDate()), new Date(+now + 86400000), done)
    .filter((o) => !o.status && o.at.toDateString() === today)
    .filter((o) => (o.schedule.kind === 'bill') || (o.schedule.kind === 'medicine' && +o.at - +now <= 5 * 60000 && +now - +o.at <= 60000))
    .filter((o) => !dismissed.includes(o.key));
  const ids = alerts.map((o) => o.key).join(',');

  useEffect(() => {
    const current = ids ? ids.split(',') : [];
    // Nothing rings on first load; only items that become urgent while the page is open.
    if (seen.current && current.some((id) => !seen.current!.has(id))) playAlarm(5000);
    seen.current = new Set([...(seen.current || []), ...current]);
  }, [ids]);

  if (!alerts.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((o) => (
        <div key={o.key} className="flex items-start gap-3 bg-[#FDF0EE] border border-[#E8B4AC] rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-[var(--ds-missed)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#7A2E22]">{o.schedule.kind === 'bill' ? `${o.schedule.title} is due today` : `Take ${o.schedule.title} ${+o.at > +now ? 'in ' + Math.ceil((+o.at - +now) / 60000) + ' min' : 'now'}`}</p>
            <p className="text-xs text-[#7A2E22]/80">{o.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, o.key])} aria-label="Dismiss" className="text-[#7A2E22]/60"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
