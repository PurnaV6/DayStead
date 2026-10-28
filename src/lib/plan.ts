import type { UserSettings } from '../types';

/**
 * Free tier limits. Medications are capped (not unlimited) deliberately:
 * this is what keeps the "Medisafe went paid-only" acquisition angle intact
 * — Medisafe caps free users at 2 medications, so DayStead beats that at 3
 * while still giving Plus a real reason to exist for anyone managing more.
 */
export const FREE_LIMITS = {
  maxBills: 5,
  maxMedications: 3,
  maxAppointments: 5,
} as const;

export const PLUS_PRICE_MONTHLY_GBP = 2.99;
export const PLUS_PRICE_YEARLY_GBP = 29.99;

export function isPlus(settings: UserSettings): boolean {
  return settings.plan === 'plus';
}

export function canAddBill(settings: UserSettings, currentCount: number): boolean {
  return isPlus(settings) || currentCount < FREE_LIMITS.maxBills;
}

export function canAddMedication(settings: UserSettings, currentCount: number): boolean {
  return isPlus(settings) || currentCount < FREE_LIMITS.maxMedications;
}

export function canAddAppointment(settings: UserSettings, currentCount: number): boolean {
  return isPlus(settings) || currentCount < FREE_LIMITS.maxAppointments;
}
