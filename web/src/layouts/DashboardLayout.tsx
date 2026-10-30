import { LayoutGrid, FileText, Plus, CalendarDays, Plus as PlusIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { user } from '../lib/sampleData';
import PriorityAlertBanner from '../components/PriorityAlertBanner';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/bills', label: 'Bills & payments', icon: FileText },
  { to: '/dashboard/medicines', label: 'Medicines', icon: Plus },
  { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:flex bg-[var(--ds-bg)]">
      {/* Desktop sidebar, hidden below md, where the bottom tab bar takes over */}
      <aside className="hidden md:flex w-72 shrink-0 border-r border-[var(--ds-line)] flex-col p-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold tracking-tight text-[var(--ds-accent)]">
              daystead
            </span>
            <span className="text-[var(--ds-accent)]">•</span>
          </div>
          <p className="text-[11px] tracking-widest uppercase text-[var(--ds-muted)] mt-1 leading-relaxed">
            by Provifi · your day,
            <br />
            in order
          </p>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--ds-accent-tint)] text-[var(--ds-accent)]'
                    : 'text-[var(--ds-ink)] hover:bg-[var(--ds-bg)]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="bg-[var(--ds-accent-tint)] rounded-xl p-4">
            <p className="font-semibold text-sm">Your day. A little lighter.</p>
            <p className="text-sm text-[var(--ds-muted)] mt-2">
              One place for the things that matter.
            </p>
            <p className="text-xs text-[var(--ds-muted)] mt-2">Interactive design preview</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="border border-[var(--ds-line)] rounded-xl py-2.5 text-sm font-medium hover:bg-[var(--ds-bg)]"
          >
            ← Back to sign in
          </button>
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[var(--ds-accent)] text-white flex items-center justify-center text-sm font-semibold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{user.name} Vemula</p>
              <p className="text-xs text-[var(--ds-muted)] leading-tight">{user.workspace}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar, hidden at md and above */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-[var(--ds-line)] bg-white sticky top-0 z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-extrabold tracking-tight text-[var(--ds-accent)]">
            daystead
          </span>
          <span className="text-[var(--ds-accent)]">•</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--ds-accent)] text-white flex items-center justify-center text-xs font-semibold">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
      </header>

      <main className="flex-1 p-5 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        <PriorityAlertBanner />
        <Outlet />
      </main>

      {/* Mobile bottom tab bar, hidden at md and above, mirrors the native app's nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[var(--ds-line)] flex justify-around py-2 z-10">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium ${
                isActive ? 'text-[var(--ds-accent)]' : 'text-[var(--ds-muted)]'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-center leading-tight">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AddNewButton() {
  return (
    <button className="flex items-center gap-2 bg-[var(--ds-accent)] text-white font-semibold rounded-xl px-4 md:px-5 py-2.5 hover:opacity-90 text-sm md:text-base">
      <PlusIcon size={16} /> <span className="hidden sm:inline">Add new</span>
    </button>
  );
}
