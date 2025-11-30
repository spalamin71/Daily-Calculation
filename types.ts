export interface NoteCount {
  value: number;
  count: number;
}

export interface BankEntry {
  id: string;
  name: string;
  amount: number;
}

export interface TransactionEntry {
  id: string;
  name: string;
  amount: number;
  note?: string;
}

export interface DailyData {
  date: string;
  openingBalance: number;
  
  // Hand Cash
  handCashMode: 'direct' | 'notes';
  handCashDirect: number;
  handCashNotes: NoteCount[];

  // Mobile Banking Agent
  bkashAgent: number;
  nagadAgent: number;
  rocketAgent: number;
  otherAgent: number;

  // Mobile Banking Personal
  bkashPersonal: number;
  nagadPersonal: number;
  rocketPersonal: number;

  // Banks
  banks: BankEntry[];

  // Receivables (People give me money)
  receivables: TransactionEntry[];

  // Payables (I give people money)
  payables: TransactionEntry[];

  // Commissions (Expenses)
  bkashComm: number;
  nagadComm: number;
  rocketComm: number;
  otherComm: number;

  // Investment (Expense/Asset Transfer)
  investment: number;

  // Flexiload
  gpFlexi: number;
  blFlexi: number;
  robiFlexi: number;
  airtelFlexi: number;
}

export const initialNotes: NoteCount[] = [
  { value: 1000, count: 0 },
  { value: 500, count: 0 },
  { value: 200, count: 0 },
  { value: 100, count: 0 },
  { value: 50, count: 0 },
  { value: 20, count: 0 },
  { value: 10, count: 0 },
];

export const initialDailyData: DailyData = {
  date: new Date().toISOString().split('T')[0],
  openingBalance: 0,
  handCashMode: 'direct',
  handCashDirect: 0,
  handCashNotes: initialNotes,
  bkashAgent: 0,
  nagadAgent: 0,
  rocketAgent: 0,
  otherAgent: 0,
  bkashPersonal: 0,
  nagadPersonal: 0,
  rocketPersonal: 0,
  banks: [
    { id: '1', name: 'IFIC Bank', amount: 0 },
    { id: '2', name: 'Islami Bank', amount: 0 },
    { id: '3', name: 'Dhaka Bank', amount: 0 },
  ],
  receivables: [],
  payables: [],
  bkashComm: 0,
  nagadComm: 0,
  rocketComm: 0,
  otherComm: 0,
  investment: 0,
  gpFlexi: 0,
  blFlexi: 0,
  robiFlexi: 0,
  airtelFlexi: 0,
};