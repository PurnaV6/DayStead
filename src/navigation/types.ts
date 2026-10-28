export type RootStackParamList = {
  Tabs: undefined;
  AddBill: undefined;
  AddMedication: undefined;
  AddAppointment: undefined;
  AddExpense: undefined;
  Paywall: { reason?: string } | undefined;
  // tab screens, also reachable via the stack's typed navigation
  Home: undefined;
  Bills: undefined;
  Medications: undefined;
  Appointments: undefined;
  Expenses: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Bills: undefined;
  Medications: undefined;
  Expenses: undefined;
  Settings: undefined;
};
