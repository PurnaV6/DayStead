import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Appointment,
  Bill,
  Expense,
  Medication,
  MedicationLogEntry,
  UserBalance,
  UserSettings,
} from '../types';

/**
 * Local-first storage layer. Every screen reads/writes through here, never
 * AsyncStorage directly, so swapping this for Supabase later touches one
 * file instead of every screen.
 */

const KEYS = {
  bills: 'daystead:bills',
  medications: 'daystead:medications',
  medicationLog: 'daystead:medicationLog',
  appointments: 'daystead:appointments',
  expenses: 'daystead:expenses',
  balance: 'daystead:balance',
  settings: 'daystead:settings',
} as const;

async function getAll<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function setAll<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export const billsRepo = {
  list: () => getAll<Bill>(KEYS.bills),
  save: async (bill: Bill) => {
    const items = await getAll<Bill>(KEYS.bills);
    const idx = items.findIndex((b) => b.id === bill.id);
    if (idx >= 0) items[idx] = bill;
    else items.push(bill);
    await setAll(KEYS.bills, items);
  },
  remove: async (id: string) => {
    const items = await getAll<Bill>(KEYS.bills);
    await setAll(KEYS.bills, items.filter((b) => b.id !== id));
  },
};

export const medicationsRepo = {
  list: () => getAll<Medication>(KEYS.medications),
  save: async (med: Medication) => {
    const items = await getAll<Medication>(KEYS.medications);
    const idx = items.findIndex((m) => m.id === med.id);
    if (idx >= 0) items[idx] = med;
    else items.push(med);
    await setAll(KEYS.medications, items);
  },
  remove: async (id: string) => {
    const items = await getAll<Medication>(KEYS.medications);
    await setAll(KEYS.medications, items.filter((m) => m.id !== id));
  },
};

export const medicationLogRepo = {
  list: () => getAll<MedicationLogEntry>(KEYS.medicationLog),
  save: async (entry: MedicationLogEntry) => {
    const items = await getAll<MedicationLogEntry>(KEYS.medicationLog);
    const idx = items.findIndex((e) => e.id === entry.id);
    if (idx >= 0) items[idx] = entry;
    else items.push(entry);
    await setAll(KEYS.medicationLog, items);
  },
};

export const appointmentsRepo = {
  list: () => getAll<Appointment>(KEYS.appointments),
  save: async (appt: Appointment) => {
    const items = await getAll<Appointment>(KEYS.appointments);
    const idx = items.findIndex((a) => a.id === appt.id);
    if (idx >= 0) items[idx] = appt;
    else items.push(appt);
    await setAll(KEYS.appointments, items);
  },
  remove: async (id: string) => {
    const items = await getAll<Appointment>(KEYS.appointments);
    await setAll(KEYS.appointments, items.filter((a) => a.id !== id));
  },
};

export const expensesRepo = {
  list: () => getAll<Expense>(KEYS.expenses),
  save: async (expense: Expense) => {
    const items = await getAll<Expense>(KEYS.expenses);
    items.push(expense);
    await setAll(KEYS.expenses, items);
  },
  remove: async (id: string) => {
    const items = await getAll<Expense>(KEYS.expenses);
    await setAll(KEYS.expenses, items.filter((e) => e.id !== id));
  },
};

export const balanceRepo = {
  get: async (): Promise<UserBalance | null> => {
    const raw = await AsyncStorage.getItem(KEYS.balance);
    return raw ? (JSON.parse(raw) as UserBalance) : null;
  },
  set: async (balance: UserBalance) => {
    await AsyncStorage.setItem(KEYS.balance, JSON.stringify(balance));
  },
};

const defaultSettings: UserSettings = {
  paydayDayOfMonth: 28,
  cashBuffer: 100,
  plan: 'free',
};

export const settingsRepo = {
  get: async (): Promise<UserSettings> => {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  },
  set: async (settings: UserSettings) => {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  },
};
