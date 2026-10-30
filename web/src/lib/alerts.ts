import { formatGBP, getData, ymd } from './store';

export interface PriorityAlert {
  id: string;
  kind: 'bill_due_today' | 'medication_due_soon';
  title: string;
  detail: string;
}

/** Minutes between now and a medication's "HH:mm" time, today. Negative if already passed. */
function minutesUntil(time: string, now: Date): number {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return (target.getTime() - now.getTime()) / 60_000;
}

/**
 * High-priority alerts: a bill due today that isn't paid yet, or a
 * medication dose due within the next 5 minutes (and not already past due
 * by more than a minute, so it doesn't linger once the moment has passed).
 */
export function getPriorityAlerts(now: Date = new Date()): PriorityAlert[] {
  const alerts: PriorityAlert[] = [];

  const { bills, medicines } = getData();
  const today = ymd(now);

  for (const bill of bills) {
    if (bill.paid) continue;
    if (bill.dueDate === today) {
      alerts.push({
        id: `bill-${bill.id}`,
        kind: 'bill_due_today',
        title: `${bill.name} is due today`,
        detail: `${formatGBP(bill.amount)} · ${bill.category}`,
      });
    }
  }

  for (const med of medicines) {
    const mins = minutesUntil(med.time, now);
    if (mins <= 5 && mins >= -1 && med.takenOn !== today) {
      alerts.push({
        id: `med-${med.id}-${med.time}`,
        kind: 'medication_due_soon',
        title: mins <= 0 ? `Take ${med.name} now` : `Take ${med.name} in ${Math.ceil(mins)} min`,
        detail: `Scheduled for ${med.time}`,
      });
    }
  }

  return alerts;
}
