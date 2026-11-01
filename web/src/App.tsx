import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import SignInPage from './pages/SignInPage';
import AccountServicePage from './pages/AccountServicePage';
import InfoPage from './pages/InfoPage';
import VerifiedPage from './pages/VerifiedPage';
import { DaysteadProvider } from './app/data';
import AppShell from './app/AppShell';
import { AccountPage, BillsPage, DashboardPage, MedicinesPage, PlannerPage, TodayPage } from './app/pages';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [boot, setBoot] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBoot(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  if (boot) return <p className="p-8 text-[var(--ds-muted)]">Opening your day…</p>;

  return (
    <HashRouter>
      <Routes>
        <Route path="/delete-account" element={<AccountServicePage />} />
        <Route path="/owner" element={<AccountServicePage owner />} />
        <Route path="/verified" element={<VerifiedPage />} />
        {(['pricing', 'privacy', 'terms', 'support'] as const).map((page) => <Route key={page} path={'/' + page} element={<InfoPage page={page} />} />)}
        <Route path="/" element={session ? <Navigate to="/app" replace /> : <SignInPage />} />
        <Route
          path="/app"
          element={session ? <DaysteadProvider key={session.user.id} session={session}><AppShell /></DaysteadProvider> : <Navigate to="/" replace />}
        >
          <Route index element={<TodayPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
        {/* Old preview links */}
        <Route path="/dashboard/*" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
