import type { Bill } from '../types';

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/** Bills due between now and the next payday (or within `days` if no payday set). */
export function upcomingBills(bills: Bill[], days: number): Bill[] {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + days);
  return bills
    .filter((b) => b.status !== 'paid')
    .filter((b) => {
      const due = new Date(b.nextDueDate);
      return due >= stripTime(now) && due <= horizon;
    })
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
}

export function overdueBills(bills: Bill[]): Bill[] {
  const now = stripTime(new Date());
  return bills.filter((b) => b.status !== 'paid' && new Date(b.nextDueDate) < now);
}

export function totalDue(bills: Bill[]): number {
  return bills.reduce((sum, b) => sum + b.amount, 0);
}

/** Days until the next occurrence of `paydayDayOfMonth`. */
export function daysUntilPayday(paydayDayOfMonth: number): number {
  const now = new Date();
  const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), paydayDayOfMonth);
  const target = thisMonthPayday >= stripTime(now)
    ? thisMonthPayday
    : new Date(now.getFullYear(), now.getMonth() + 1, paydayDayOfMonth);
  return Math.ceil((stripTime(target).getTime() - stripTime(now).getTime()) / 86_400_000);
}

/** "Money needed before payday": sum of unpaid bills due before the next payday, plus the user's cash buffer. */
export function moneyNeededBeforePayday(
  bills: Bill[],
  paydayDayOfMonth: number,
  cashBuffer: number,
): { amount: number; daysLeft: number; billCount: number } {
  const daysLeft = daysUntilPayday(paydayDayOfMonth);
  const due = upcomingBills(bills, daysLeft);
  return {
    amount: totalDue(due) + cashBuffer,
    daysLeft,
    billCount: due.length,
  };
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
