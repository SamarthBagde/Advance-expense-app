export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Profile: undefined;
};

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  message?: string;
  data?: {
    user?: User;
    [key: string]: any;
  };
}

export interface CategoryItem {
  id: number;
  title: string;
}

export interface Transaction {
  id: string;
  categoryId?: number;
  title: string;
  category: string;
  amount: number;
  type: 'DEBITED' | 'CREDITED';
  date: string;
  paymentMethod: string;
  note?: string;
}

export type Expense = Transaction;

export interface CreateExpensePayload {
  categoryId: number;
  title: string;
  amount: number;
  type?: 'DEBITED' | 'CREDITED';
  expenseDate?: string;
  paymentMethod: string;
  note?: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export type SortByField = 'expenseDate' | 'amount';
export type SortOrder = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface IExpenseFilterDTO {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  expenseDate?: string;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
}