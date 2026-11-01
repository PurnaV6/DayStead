import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Completion, Occurrence, Schedule } from '../lib/domain';

export type Editor = Partial<Schedule> | null;

export interface Daystead {
  session: Session;
  schedules: Schedule[];
  done: Completion[];
  busy: boolean;
  error: string;
  now: Date;
  current: Occurrence[];
  previous: Occurrence[];
  upcoming: Occurrence[];
  total: number;
  remaining: number;
  editor: Editor;
  setEditor: (e: Editor) => void;
  refresh: () => Promise<void>;
  complete: (o: Occurrence, status: string) => Promise<void>;
  remove: (item: Schedule) => Promise<void>;
  save: (values: Partial<Schedule>) => Promise<void>;
  // First-run setup guide (same as mobile/src/SetupGuide.tsx).
  setupOpen: boolean;
  setupKnown: string[];
  openSetup: () => void;
  closeSetup: () => void;
}

export const Ctx = createContext<Daystead | null>(null);

export function useDaystead() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useDaystead must be used inside DaysteadProvider');
  return value;
}

export function errorText(e: unknown) {
  return e instanceof Error ? e.message : String((e as { message?: string })?.message || e);
}

