import { LayoutGrid, FileText, Plus, CalendarDays, Plus as PlusIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { user } from '../lib/sampleData';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/bills', label: 'Bills & payments', icon: FileText },
  { to: '/dashboard/medicines', label: 'Medicines', icon: Plus },
  { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[var(--ds-bg)]">
      <aside className="w-72 shrink-0 border-r border-[var(--ds-line)] flex flex-col p-6">
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

      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function AddNewButton() {
  return (
    <button className="flex items-center gap-2 bg-[var(--ds-accent)] text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90">
      <PlusIcon size={16} /> Add new
    </button>
  );
}
