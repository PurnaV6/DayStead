import { FileText, Plus, Grid3x3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: FileText, label: 'Know what is due and what to keep available' },
  { icon: Plus, label: 'Organise your own medication schedule' },
  { icon: Grid3x3, label: 'Keep your upcoming commitments together' },
];

export default function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-16 py-12 bg-[var(--ds-accent-tint)]">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[var(--ds-accent)]">
              daystead
            </span>
            <span className="text-[var(--ds-accent)]">•</span>
          </div>
          <p className="text-xs tracking-widest uppercase text-[var(--ds-muted)] mt-1">
            by Provifi
          </p>

          <h1 className="text-5xl font-extrabold leading-tight mt-10 text-[var(--ds-ink)]">
            A clearer day.
            <br />A lighter mind.
          </h1>

          <p className="mt-6 text-lg text-[var(--ds-muted)] max-w-sm">
            Your bills, medication schedules and appointments. One calm place to keep life in
            order.
          </p>

          <div className="mt-10 divide-y divide-[var(--ds-accent-line)]">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 py-4">
                <Icon size={18} className="text-[var(--ds-ink)] shrink-0" />
                <span className="text-[var(--ds-ink)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-widest uppercase text-[var(--ds-muted)] mb-2">
            Your personal workspace
          </p>
          <h2 className="text-3xl font-extrabold">Welcome back</h2>
          <p className="text-[var(--ds-muted)] mt-2 mb-8">Sign in to your Daystead account.</p>

          <label className="block text-sm font-medium mb-1">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-[var(--ds-line)] rounded-xl px-4 py-3 mb-5 outline-none focus:border-[var(--ds-accent)]"
            disabled
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative mb-6">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-[var(--ds-line)] rounded-xl px-4 py-3 outline-none focus:border-[var(--ds-accent)]"
              disabled
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--ds-muted)]">
              Show
            </span>
          </div>

          <button
            disabled
            className="w-full bg-[var(--ds-accent)] text-white font-semibold rounded-xl py-3 opacity-80 cursor-not-allowed"
          >
            Sign in — setup pending
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <a href="#" className="text-[var(--ds-accent)] font-medium">
              Create an account
            </a>
            <a href="#" className="text-[var(--ds-accent)] font-medium">
              Forgot password?
            </a>
          </div>

          <div className="mt-6 bg-[#FBF4E3] border border-[#EADFC0] rounded-xl p-4 text-sm text-[#5B4E2B]">
            Account setup is pending. This preview does not collect passwords or create
            accounts. Cloud login and device synchronisation will be enabled after the database
            is connected.
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-6 border border-[var(--ds-line)] rounded-xl py-3 font-medium hover:bg-[var(--ds-bg)] flex items-center justify-center gap-2"
          >
            Explore the sample dashboard <span aria-hidden>→</span>
          </button>
          <p className="text-center text-xs text-[var(--ds-muted)] mt-3">
            Demo changes stay in this browser only.
          </p>
        </div>
      </div>
    </div>
  );
}
