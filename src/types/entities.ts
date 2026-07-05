// ==========================================
// CATEGORY
// ==========================================
export interface Category {
  id: string;
  name: string;
  hexColor?: string;
  moduleType?: string;
  userId: string;
}

export interface CreateCategoryDTO {
  name: string;
  hexColor?: string;
  moduleType?: string;
}

// ==========================================
// AGENDA / TASK / EVENT
// ==========================================
export type AgendaType = 'TASK' | 'EVENT';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  userId: string;
  type: AgendaType;
}

export interface Task {
  agendaItemId: string;
  agendaItem: AgendaItem;
  dueDate?: string;
  priority?: Priority;
  isCompleted: boolean;
  categoryId?: string;
  category?: Category;
}

export interface Event {
  agendaItemId: string;
  agendaItem: AgendaItem;
  startDate: string;
  endDate: string;
  googleEventId?: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  isCompleted?: boolean;
  categoryId?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  isCompleted?: boolean;
  categoryId?: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  googleEventId?: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  googleEventId?: string;
}

// ==========================================
// FINANCE — TRANSACTION / GOAL / INVESTMENT
// ==========================================
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface FinancialItem {
  id: string;
  amount: number;
  userId: string;
  type: 'TRANSACTION' | 'GOAL' | 'INVESTMENT';
}

export interface Transaction {
  financialItemId: string;
  financialItem: FinancialItem;
  transactionType: TransactionType;
  date: string;
  description?: string;
  categoryId?: string;
  category?: Category;
}

export interface Goal {
  financialItemId: string;
  financialItem: FinancialItem;
  title: string;
  targetAmount: number;
  targetDate?: string;
}

export interface Investment {
  financialItemId: string;
  financialItem: FinancialItem;
  assetName: string;
  estimatedReturn?: number;
}

export interface CreateTransactionDTO {
  amount: number;
  transactionType: TransactionType;
  date: string;
  description?: string;
  categoryId?: string;
}

export interface UpdateTransactionDTO {
  amount?: number;
  transactionType?: TransactionType;
  date?: string;
  description?: string;
  categoryId?: string;
}

export interface CreateGoalDTO {
  amount: number;
  title: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateGoalDTO {
  amount?: number;
  title?: string;
  targetAmount?: number;
  targetDate?: string;
}

export interface CreateInvestmentDTO {
  amount: number;
  assetName: string;
  estimatedReturn?: number;
}

export interface UpdateInvestmentDTO {
  amount?: number;
  assetName?: string;
  estimatedReturn?: number;
}

// ==========================================
// HABITS — HABIT MODULE / DAILY RECORD
// ==========================================
export interface Activity {
  id: string;
  name: string;
  description?: string;
  userId: string;
  type: 'HABIT';
}

export interface HabitModule {
  activityId: string;
  activity: Activity;
  notes?: string;
  currentStreak: number;
  dailyRecords?: DailyRecord[];
}

export interface DailyRecord {
  id: string;
  date: string;
  isCompleted?: boolean;
  habitId: string;
}

export interface CreateHabitDTO {
  name: string;
  description?: string;
  notes?: string;
}

export interface UpdateHabitDTO {
  name?: string;
  description?: string;
  notes?: string;
  currentStreak?: number;
}

export interface CreateDailyRecordDTO {
  date: string;
  isCompleted?: boolean;
  habitId: string;
}

export interface UpdateDailyRecordDTO {
  isCompleted?: boolean;
}

// ==========================================
// USER
// ==========================================
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}
