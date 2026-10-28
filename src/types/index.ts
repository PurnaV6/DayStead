export type PaymentStatus = 'scheduled' | 'paid' | 'overdue';

export type RecurrenceFrequency = 'once' | 'weekly' | 'monthly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  category: 'rent' | 'credit_card' | 'utility' | 'subscription' | 'other';
  amount: number;
  amountIsEstimate: boolean;
  frequency: RecurrenceFrequency;
  nextDueDate: string; // ISO date
  status: PaymentStatus;
  remindersEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDose {
  time: string; // "HH:mm"
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // free text, e.g. "500mg"
  doses: MedicationDose[];
  courseStartDate: string;
  courseEndDate: string | null; // null = ongoing
  remindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLogEntry {
  id: string;
  medicationId: string;
  scheduledFor: string; // ISO datetime of the dose this entry completes
  takenAt: string | null; // null = not yet marked taken
}

export interface Appointment {
  id: string;
  title: string;
  location: string;
  dateTime: string; // ISO datetime
  notes: string;
  remindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO date
  createdAt: string;
}

export interface UserBalance {
  amount: number;
  updatedAt: string;
}

export interface UserSettings {
  paydayDayOfMonth: number; // 1-31
  cashBuffer: number;
  /** 'trial' = within or past the 30-day trial window; 'paid' = subscribed. See PRODUCT_SPEC.md §8. */
  plan: 'trial' | 'paid';
  trialStartedAt: string;
}
