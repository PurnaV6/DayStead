import { useSyncExternalStore } from 'react';

// The web dashboard is a preview: what people add is saved in this browser only,
// not in their Daystead account. Every list starts empty.

export const BILL_CATEGORIES = ['Rent', 'Utilities', 'Subscriptions', 'Credit card', 'Insurance', 'Other'] as const;
export type BillCategory = (typeof BILL_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<BillCategory, string> = {
  Rent: '#2f4a3c',
  Utilities: '#5b8a6b',
  Subscriptions: '#9ab89e',
  'Credit card': '#c9a24b',
  Insurance: '#7a6a9a',
  Other: '#b7bcae',
};

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD, local
  paid: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  time: string; // HH:mm
  takenOn: string | null; // YYYY-MM-DD the dose was last marked taken
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD, local
  time: string; // HH:mm
  location: string;
}

export interface StoreData {
  bills: Bill[];
  medicines: Medicine[];
  appointments: Appointment[];
}

const KEY = 'daystead-web-v1';
const EMPTY: StoreData = { bills: [], medicines: [], appointments: [] };

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      bills: Array.isArray(parsed.bills) ? parsed.bills : [],
      medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
    };
  } catch {
    return EMPTY;
  }
}

let data = load();
const listeners = new Set<() => void>();

function commit(next: StoreData) {
  data = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows can block storage; the change still shows until the page is closed.
  }
  listeners.forEach((l) => l());
}

export function getData() {
  return data;
}

export function useStore(): StoreData {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => data,
  );
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function addBill(bill: Omit<Bill, 'id' | 'paid'>) {
  commit({ ...data, bills: [...data.bills, { ...bill, id: newId(), paid: false }] });
}
export function toggleBillPaid(id: string) {
  commit({ ...data, bills: data.bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)) });
}
export function removeBill(id: string) {
  commit({ ...data, bills: data.bills.filter((b) => b.id !== id) });
}

export function addMedicine(medicine: Omit<Medicine, 'id' | 'takenOn'>) {
  commit({ ...data, medicines: [...data.medicines, { ...medicine, id: newId(), takenOn: null }] });
}
export function toggleMedicineTaken(id: string) {
  const today = ymd(new Date());
  commit({
    ...data,
    medicines: data.medicines.map((m) => (m.id === id ? { ...m, takenOn: m.takenOn === today ? null : today } : m)),
  });
}
export function removeMedicine(id: string) {
  commit({ ...data, medicines: data.medicines.filter((m) => m.id !== id) });
}

export function addAppointment(appointment: Omit<Appointment, 'id'>) {
  commit({ ...data, appointments: [...data.appointments, { ...appointment, id: newId() }] });
}
export function removeAppointment(id: string) {
  commit({ ...data, appointments: data.appointments.filter((a) => a.id !== id) });
}

/** YYYY-MM-DD from local date parts (toISOString would shift dates during BST). */
export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Today as YYYY-MM-DD. */
export function todayYmd() {
  return ymd(new Date());
}

/** Local Date for a YYYY-MM-DD string (new Date('2026-11-01') would parse as UTC). */
export function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatGBP(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

export function formatDay(s: string) {
  return parseYmd(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
