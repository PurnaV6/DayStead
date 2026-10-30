import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { backendURL, publishableKey } from '../lib/backend';

// Supabase may append values as a query string or as a second fragment
// (e.g. #/verified#access_token=...), so read them from anywhere in the URL.
function param(name: string): string | null {
  const match = window.location.href.match(new RegExp(`[?&#]${name}=([^&#]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

export default function VerifiedPage() {
  const error = param('error_description');
  const accessToken = param('access_token');
  const isRecovery = param('type') === 'recovery' && !!accessToken;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--ds-bg)]">
      <div className="w-full max-w-md bg-white border border-[var(--ds-line)] rounded-2xl p-8 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-xl font-extrabold tracking-tight text-[var(--ds-accent)]">daystead</span>
          <span className="text-[var(--ds-accent)]">•</span>
        </div>
        {error ? (
          <>
            <h1 className="text-2xl font-extrabold mt-6">This link didn't work</h1>
            <p className="text-[var(--ds-muted)] mt-3">{error}</p>
            <p className="text-[var(--ds-muted)] mt-3">
              Links expire after a while. Open the Daystead app and request a new one.
            </p>
          </>
        ) : isRecovery ? (
          <ResetPassword accessToken={accessToken} />
        ) : (
          <>
            <CheckCircle2 size={40} className="mx-auto mt-6 text-[var(--ds-accent)]" />
            <h1 className="text-2xl font-extrabold mt-4">You're verified</h1>
            <p className="text-[var(--ds-muted)] mt-3">
              Go back to the Daystead app on your phone and sign in with your email and password.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ResetPassword({ accessToken }: { accessToken: string }) {
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState('saving');
    try {
      const res = await fetch(`${backendURL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.msg || body.error_description || 'Could not update your password.');
      }
      setState('done');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update your password.');
      setState('failed');
    }
  }

  if (state === 'done') {
    return (
      <>
        <CheckCircle2 size={40} className="mx-auto mt-6 text-[var(--ds-accent)]" />
        <h1 className="text-2xl font-extrabold mt-4">Password updated</h1>
        <p className="text-[var(--ds-muted)] mt-3">Go back to the Daystead app and sign in with your new password.</p>
      </>
    );
  }

  return (
    <form onSubmit={save} className="text-left mt-6">
      <h1 className="text-2xl font-extrabold text-center">Choose a new password</h1>
      <label htmlFor="new-password" className="block text-sm font-medium mt-6 mb-1">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-[var(--ds-line)] rounded-xl px-4 py-3 outline-none focus:border-[var(--ds-accent)]"
      />
      {state === 'failed' && <p className="text-sm text-[var(--ds-risk)] mt-3">{message}</p>}
      <button
        type="submit"
        disabled={state === 'saving' || password.length < 8}
        className="w-full mt-5 bg-[var(--ds-accent)] text-white font-semibold rounded-xl py-3 disabled:opacity-50"
      >
        {state === 'saving' ? 'Saving…' : 'Save password'}
      </button>
    </form>
  );
}
