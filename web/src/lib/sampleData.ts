export interface SampleBill {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  method: string;
  status: 'scheduled' | 'paid' | 'overdue_unconfirmed';
}

export const user = { name: 'Purna', workspace: 'Personal workspace' };

const todayISO = new Date().toISOString().slice(0, 10);

export const bills: SampleBill[] = [
  { id: '0', name: 'Internet', category: 'Utilities', amount: 42, dueDate: todayISO, method: 'Direct Debit', status: 'scheduled' },
  { id: '1', name: 'Rent', category: 'Rent', amount: 850, dueDate: '2026-11-01', method: 'Bank transfer', status: 'scheduled' },
  { id: '2', name: 'Electricity', category: 'Utilities', amount: 78, dueDate: '2026-11-03', method: 'Direct Debit', status: 'scheduled' },
  { id: '3', name: 'Phone', category: 'Subscriptions', amount: 25, dueDate: '2026-11-05', method: 'Card', status: 'scheduled' },
  { id: '4', name: 'Credit card', category: 'Credit card', amount: 220, dueDate: '2026-10-20', method: 'Direct Debit', status: 'paid' },
  { id: '5', name: 'Water', category: 'Utilities', amount: 34, dueDate: '2026-10-18', method: 'Direct Debit', status: 'paid' },
  { id: '6', name: 'Streaming', category: 'Subscriptions', amount: 12.99, dueDate: '2026-10-15', method: 'Card', status: 'paid' },
];

export const remainingTotal = bills
  .filter((b) => b.status !== 'paid')
  .reduce((sum, b) => sum + b.amount, 0);

export const paidTotal = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
export const scheduledTotal = bills.reduce((sum, b) => sum + b.amount, 0);

export const medications = [
  { id: '1', name: 'Metformin', time: '08:00', taken: false },
  { id: '2', name: 'Metformin', time: '20:00', taken: false },
  { id: '3', name: 'Vitamin D', time: '08:00', taken: false },
];

export const appointments = [
  { id: '1', title: 'GP check-up', date: '2026-11-04T09:30:00', location: 'Riverside Surgery' },
  { id: '2', title: 'Dentist', date: '2026-11-12T14:00:00', location: 'Smile Clinic' },
];

export const trend = {
  current: { label: 'October 2026', total: scheduledTotal, points: [20, 20, 22, 24, 30, 34, 34, 34, 36, 55, 90, 100] },
  previous: { label: 'September 2026', total: null as number | null, points: [] as number[] },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#2f4a3c',
  Utilities: '#5b8a6b',
  Subscriptions: '#9ab89e',
  'Credit card': '#c9a24b',
  Other: '#b7bcae',
};

export const categoryBreakdown = Object.entries(
  bills.reduce<Record<string, number>>((acc, b) => {
    acc[b.category] = (acc[b.category] ?? 0) + b.amount;
    return acc;
  }, {}),
).map(([category, amount]) => ({
  category,
  amount,
  color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
}));
