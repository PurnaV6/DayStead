import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { occurrences, monthBills, type Completion, type Schedule } from '../lib/domain';
import { Ctx, errorText, type Daystead, type Editor } from './context';

// Mirrors the mobile app's data flow in mobile/App.tsx: same tables, same optimistic
// version check on edits, same completion upsert.

export function DaysteadProvider({ session, children }: { session: Session; children: ReactNode }) {
  const userId = session.user.id;
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [done, setDone] = useState<Completion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<Editor>(null);
  const [clock, setClock] = useState(() => Date.now());
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupKnown, setSetupKnown] = useState<string[]>([]);
  const setupChecked = useRef(false);
  const navigate = useNavigate();
  const setupKey = 'daystead:setup:' + userId;

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from('daystead_schedules').select('*').eq('user_id', userId).order('due_at'),
      supabase.from('daystead_completions').select('*').eq('user_id', userId),
    ]);
    if (a.error || b.error) throw a.error || b.error;
    setSchedules(a.data || []);
    setDone(b.data || []);
    // Show the setup guide once per browser to a new account: first load done and nothing added yet.
    if (!setupChecked.current) {
      setupChecked.current = true;
      let seen = false;
      try { seen = localStorage.getItem(setupKey) === 'done'; } catch { /* storage blocked: show it */ }
      if (!a.data?.length && !seen) { setSetupKnown([]); setSetupOpen(true); }
    }
  }, [userId, setupKey]);

  const run = useCallback(async (task: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load().catch((e) => setError(errorText(e)));
    const tick = setInterval(() => setClock(Date.now()), 30000);
    // Pick up changes made on the phone when the tab comes back into view.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setClock(Date.now());
        void load().catch((e) => setError(errorText(e)));
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const now = new Date(clock);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const current = monthBills(schedules, month, done);
  const previous = monthBills(schedules, new Date(now.getFullYear(), now.getMonth() - 1, 1), done);
  const total = current.reduce((n, o) => n + (o.schedule.amount_pence || 0), 0);
  const remaining = current.filter((o) => o.status !== 'paid').reduce((n, o) => n + (o.schedule.amount_pence || 0), 0);
  const upcoming = occurrences(schedules, new Date(now.getFullYear(), now.getMonth(), now.getDate()), new Date(+now + 35 * 86400000), done);

  const value: Daystead = {
    session,
    schedules,
    done,
    busy,
    error,
    now,
    current,
    previous,
    upcoming,
    total,
    remaining,
    editor,
    setEditor,
    setupOpen,
    setupKnown,
    openSetup: () => { setSetupKnown(schedules.map((o) => o.id)); setSetupOpen(true); },
    closeSetup: () => {
      try { localStorage.setItem(setupKey, 'done'); } catch { /* storage blocked */ }
      setSetupOpen(false);
      navigate('/app');
    },
    refresh: () => run(load),
    complete: (o, status) =>
      run(async () => {
        const { error } = await supabase
          .from('daystead_completions')
          .upsert({ user_id: userId, schedule_id: o.schedule.id, occurrence_at: o.at.toISOString(), status });
        if (error) throw error;
        await load();
      }),
    remove: (item) =>
      run(async () => {
        const { data, error } = await supabase.from('daystead_schedules').delete().eq('id', item.id).eq('version', item.version).select('id');
        if (error) throw error;
        if (!data?.length) throw new Error('This schedule changed on another device. Refresh and try again.');
        await load();
      }),
    save: (values) =>
      run(async () => {
        const payload = { ...values, user_id: userId, version: (editor?.version || 0) + 1 };
        const result = editor?.id
          ? await supabase.from('daystead_schedules').update(payload).eq('id', editor.id).eq('version', editor.version!).select('id')
          : await supabase.from('daystead_schedules').insert(payload).select('id');
        if (result.error) {
          if (String(result.error.message).includes('for_person'))
            throw new Error('"Who is this for?" needs a quick database update. Choose "Me" for now, or ask the app owner to run supabase/for-person.sql.');
          throw result.error;
        }
        if (!result.data?.length) throw new Error('This schedule changed on another device. Refresh before editing.');
        setEditor(null);
        await load();
      }),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
