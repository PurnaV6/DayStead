import { useState, type FormEvent } from 'react';
import { Calendar, FileText, PlusSquare } from 'lucide-react';
import { AUTH_REDIRECT, supabase } from '../lib/supabase';

// Same sign-in, sign-up and reset flow as the auth screen in mobile/App.tsx.
const FEATURES = [
  { icon: FileText, label: 'Know what is due and what to keep available' },
  { icon: PlusSquare, label: 'Organise your own medication schedule' },
  { icon: Calendar, label: 'Keep your upcoming commitments together' },
];

const input = 'w-full border border-[var(--ds-line)] rounded-xl px-4 py-3 bg-[#FCFCF8] outline-none focus:border-[var(--ds-accent)]';

export default function SignInPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Enter your name.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: AUTH_REDIRECT } });
        if (error) throw error;
        if (!data.session) setMessage('Check your email to confirm your account, then sign in here or in the phone app.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) return setMessage('Enter your email first.');
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: AUTH_REDIRECT });
    setBusy(false);
    setMessage(error ? error.message : 'If your account exists, a reset link will arrive.');
  }

  return (
    <div className="min-h-screen flex bg-[var(--ds-paper)]">
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-16 py-12 bg-[#EDF2E9]">
        <p className="text-[10px] font-bold tracking-[.18em] text-[var(--ds-muted)]">PROVIFI PRESENTS</p>
        <p className="text-[43px] font-bold tracking-tighter text-[var(--ds-ink)]">daystead.</p>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight mt-8 text-[var(--ds-ink)]">A little order.<br />A lighter day.</h1>
        <p className="mt-6 text-lg text-[var(--ds-muted)] max-w-sm">Your bills, medicines and appointments. One calm place to stay on top of life.</p>
        <div className="mt-10 divide-y divide-[var(--ds-line)]">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 py-4"><Icon size={18} className="text-[var(--ds-accent)] shrink-0" /><span>{label}</span></div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md bg-white border border-[var(--ds-line)] rounded-[22px] p-6 flex flex-col gap-4">
          <p className="md:hidden text-[34px] font-bold tracking-tighter text-[var(--ds-ink)]">daystead.</p>
          <h2 className="text-2xl font-semibold">{mode === 'signup' ? 'Make yourself at home' : 'Welcome back'}</h2>
          <p className="text-sm text-[var(--ds-muted)] -mt-2">Use the same account as the Daystead phone app.</p>
          {mode === 'signup' && <label className="flex flex-col gap-1.5 text-sm font-semibold">Your name<input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Email<input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Password<input className={input} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          <button disabled={busy || password.length < 8} className="min-h-[50px] rounded-[14px] bg-[var(--ds-accent)] text-white font-semibold disabled:opacity-45">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); }} className="min-h-[50px] rounded-[14px] bg-[#EDF2E9] font-semibold">
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create account'}
          </button>
          <button type="button" onClick={() => void forgot()} disabled={busy} className="text-[var(--ds-accent)] font-semibold text-left">Forgot your password?</button>
          {message && <p role="status" className="text-sm">{message}</p>}
          <p className="text-xs text-[var(--ds-muted)]">1 month free for new subscribers, then £3.99 a month or £35.99 a year. Subscriptions are managed in the phone app.</p>
        </form>
      </div>
    </div>
  );
}
