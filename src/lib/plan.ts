import type { UserSettings } from '../types';

/**
 * Pricing model per PRODUCT_SPEC.md §8 (supersedes the earlier free-tier +
 * £2.99/£29.99 model that used to live here). There is no permanent free
 * tier: every user gets a 30-day full-feature trial, then the whole app is
 * paid. Feature caps (FREE_LIMITS) no longer apply, kept only as the
 * trial-expired gate, not a free/paid feature split.
 */
export const TRIAL_DAYS = 30;
export const PRICE_MONTHLY_GBP = 4.99;
export const PRICE_YEARLY_GBP = 49.99;

export function trialDaysRemaining(trialStartedAt: string): number {
  const started = new Date(trialStartedAt).getTime();
  const elapsedDays = Math.floor((Date.now() - started) / 86_400_000);
  return Math.max(0, TRIAL_DAYS - elapsedDays);
}

export function isTrialActive(settings: UserSettings): boolean {
  if (!settings.trialStartedAt) return false;
  return trialDaysRemaining(settings.trialStartedAt) > 0;
}

export function hasFullAccess(settings: UserSettings): boolean {
  return settings.plan === 'paid' || isTrialActive(settings);
}
