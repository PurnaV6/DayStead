import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type {
  Appointment,
  Bill,
  Expense,
  Medication,
  MedicationLogEntry,
  UserBalance,
  UserSettings,
} from '../types';
import {
  appointmentsRepo,
  balanceRepo,
  billsRepo,
  expensesRepo,
  medicationLogRepo,
  medicationsRepo,
  settingsRepo,
} from '../storage/repository';
import {
  cancelScheduled,
  requestNotificationPermission,
  scheduleDailyRepeating,
  scheduleOneOff,
} from '../lib/notifications';

interface AppDataState {
  loading: boolean;
  bills: Bill[];
  medications: Medication[];
  medicationLog: MedicationLogEntry[];
  appointments: Appointment[];
  expenses: Expense[];
  balance: UserBalance | null;
  settings: UserSettings;
  addOrUpdateBill: (bill: Bill, opts?: { applyToFutureOnly?: boolean }) => Promise<void>;
  markBillPaid: (billId: string) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
  addOrUpdateMedication: (med: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  logDoseTaken: (medicationId: string, scheduledFor: string) => Promise<void>;
  addOrUpdateAppointment: (appt: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBalance: (amount: number) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

const AppDataContext = createContext<AppDataState | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLog, setMedicationLog] = useState<MedicationLogEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalanceState] = useState<UserBalance | null>(null);
  const [settings, setSettingsState] = useState<UserSettings>({
    paydayDayOfMonth: 28,
    cashBuffer: 100,
    plan: 'free',
  });

  const refresh = useCallback(async () => {
    const [b, m, ml, a, e, bal, s] = await Promise.all([
      billsRepo.list(),
      medicationsRepo.list(),
      medicationLogRepo.list(),
      appointmentsRepo.list(),
      expensesRepo.list(),
      balanceRepo.get(),
      settingsRepo.get(),
    ]);
    setBills(b);
    setMedications(m);
    setMedicationLog(ml);
    setAppointments(a);
    setExpenses(e);
    setBalanceState(bal);
    setSettingsState(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    requestNotificationPermission();
  }, [refresh]);

  const addOrUpdateBill = useCallback(
    async (bill: Bill, opts?: { applyToFutureOnly?: boolean }) => {
      await billsRepo.save(bill);
      if (bill.remindersEnabled) {
        const reminderDate = new Date(bill.nextDueDate);
        reminderDate.setDate(reminderDate.getDate() - bill.reminderDaysBefore);
        if (reminderDate.getTime() > Date.now()) {
          await scheduleOneOff(
            `${bill.name} due soon`,
            `${bill.amountIsEstimate ? '~' : ''}£${bill.amount.toFixed(2)} due ${new Date(
              bill.nextDueDate,
            ).toLocaleDateString('en-GB')}`,
            reminderDate,
          );
        }
      }
      await refresh();
    },
    [refresh],
  );

  const markBillPaid = useCallback(
    async (billId: string) => {
      const bill = bills.find((b) => b.id === billId);
      if (!bill) return;
      await billsRepo.save({ ...bill, status: 'paid', updatedAt: new Date().toISOString() });
      await refresh();
    },
    [bills, refresh],
  );

  const deleteBill = useCallback(
    async (billId: string) => {
      await billsRepo.remove(billId);
      await refresh();
    },
    [refresh],
  );

  const addOrUpdateMedication = useCallback(
    async (med: Medication) => {
      await medicationsRepo.save(med);
      if (med.remindersEnabled) {
        for (const dose of med.doses) {
          const [hour, minute] = dose.time.split(':').map(Number);
          await scheduleDailyRepeating(
            `Time to take ${med.name}`,
            `${med.dosage} — scheduled for ${dose.time}`,
            hour,
            minute,
          );
        }
      }
      await refresh();
    },
    [refresh],
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      await medicationsRepo.remove(id);
      await refresh();
    },
    [refresh],
  );

  const logDoseTaken = useCallback(
    async (medicationId: string, scheduledFor: string) => {
      await medicationLogRepo.save({
        id: uuid(),
        medicationId,
        scheduledFor,
        takenAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  const addOrUpdateAppointment = useCallback(
    async (appt: Appointment) => {
      await appointmentsRepo.save(appt);
      if (appt.remindersEnabled) {
        const reminderDate = new Date(appt.dateTime);
        reminderDate.setHours(reminderDate.getHours() - 1);
        if (reminderDate.getTime() > Date.now()) {
          await scheduleOneOff(
            appt.title,
            `${appt.location || 'Appointment'} at ${new Date(appt.dateTime).toLocaleTimeString(
              'en-GB',
              { hour: '2-digit', minute: '2-digit' },
            )}`,
            reminderDate,
          );
        }
      }
      await refresh();
    },
    [refresh],
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      await appointmentsRepo.remove(id);
      await refresh();
    },
    [refresh],
  );

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      await expensesRepo.save({
        ...expense,
        id: uuid(),
        createdAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await expensesRepo.remove(id);
      await refresh();
    },
    [refresh],
  );

  const setBalance = useCallback(async (amount: number) => {
    const next: UserBalance = { amount, updatedAt: new Date().toISOString() };
    await balanceRepo.set(next);
    setBalanceState(next);
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      await settingsRepo.set(next);
      setSettingsState(next);
    },
    [settings],
  );

  const value = useMemo<AppDataState>(
    () => ({
      loading,
      bills,
      medications,
      medicationLog,
      appointments,
      expenses,
      balance,
      settings,
      addOrUpdateBill,
      markBillPaid,
      deleteBill,
      addOrUpdateMedication,
      deleteMedication,
      logDoseTaken,
      addOrUpdateAppointment,
      deleteAppointment,
      addExpense,
      deleteExpense,
      setBalance,
      updateSettings,
      refresh,
    }),
    [
      loading,
      bills,
      medications,
      medicationLog,
      appointments,
      expenses,
      balance,
      settings,
      addOrUpdateBill,
      markBillPaid,
      deleteBill,
      addOrUpdateMedication,
      deleteMedication,
      logDoseTaken,
      addOrUpdateAppointment,
      deleteAppointment,
      addExpense,
      deleteExpense,
      setBalance,
      updateSettings,
      refresh,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataState {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
