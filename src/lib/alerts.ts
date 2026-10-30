import type { Bill, Medication, MedicationLogEntry } from '../types';

export interface PriorityAlert {
  id: string;
  kind: 'bill_due_today' | 'medication_due_soon';
  title: string;
  detail: string;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Minutes between now and an "HH:mm" time today. Negative once it's passed. */
function minutesUntil(time: string, now: Date): number {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return (target.getTime() - now.getTime()) / 60_000;
}

/**
 * High-priority alerts: a bill due today that isn't paid, or a medication
 * dose due within the next 5 minutes that hasn't already been logged today.
 */
export function getPriorityAlerts(
  bills: Bill[],
  medications: Medication[],
  medicationLog: MedicationLogEntry[],
  now: Date = new Date(),
): PriorityAlert[] {
  const alerts: PriorityAlert[] = [];

  for (const bill of bills) {
    if (bill.status === 'paid') continue;
    if (isSameDay(new Date(bill.nextDueDate), now)) {
      alerts.push({
        id: `bill-${bill.id}`,
        kind: 'bill_due_today',
        title: `${bill.name} is due today`,
        detail: `${bill.amountIsEstimate ? '~' : ''}£${bill.amount.toFixed(2)}`,
      });
    }
  }

  const todayKey = now.toISOString().slice(0, 10);
  for (const med of medications) {
    for (const dose of med.doses) {
      const mins = minutesUntil(dose.time, now);
      if (mins > 5 || mins < -1) continue;
      const scheduledFor = `${todayKey}T${dose.time}`;
      const alreadyLogged = medicationLog.some(
        (l) => l.medicationId === med.id && l.scheduledFor === scheduledFor && l.takenAt,
      );
      if (alreadyLogged) continue;
      alerts.push({
        id: `med-${med.id}-${dose.time}`,
        kind: 'medication_due_soon',
        title: mins <= 0 ? `Take ${med.name} now` : `Take ${med.name} in ${Math.ceil(mins)} min`,
        detail: `${med.dosage}, scheduled for ${dose.time}`,
      });
    }
  }

  return alerts;
}
