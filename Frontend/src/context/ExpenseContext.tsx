import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import {
  Transaction,
  CategorySummary,
  UserProfile,
  CreateExpensePayload,
  CategoryItem,
} from '../types';
import { getAuthToken, useAuth } from './AuthContext';
import { useGlobalError } from './ErrorContext';
import { Colors } from '../theme/colors';

const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

interface ExpenseContextType {
  transactions: Transaction[];
  userProfile: UserProfile;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categories: CategoryItem[];
  categoryBreakdown: CategorySummary[];
  isLoadingExpenses: boolean;
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  isAddOptionsOpen: boolean;
  openAddOptionsModal: () => void;
  closeAddOptionsModal: () => void;
  isScanModalOpen: boolean;
  openScanModal: () => void;
  closeScanModal: () => void;
  isVoiceModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  prefilledForm: Partial<Transaction> | null;
  setPrefilledForm: (data: Partial<Transaction> | null) => void;
  fetchCategories: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  addTransaction: (payload: CreateExpensePayload) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  extractExpenseFromBillImage: (file: { uri: string; type?: string; name?: string }) => Promise<Partial<Transaction> | null>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const CATEGORY_COLORS: Record<string, string> = {
  Dining: Colors.primary,
  Shopping: Colors.danger,
  Utilities: Colors.accentBlue,
  Travel: Colors.accentPurple,
  Misc: Colors.warning,
};

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useGlobalError();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddOptionsOpen, setIsAddOptionsOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [prefilledForm, setPrefilledForm] = useState<Partial<Transaction> | null>(null);

  // Fetch Categories from Backend API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/category`, {
        headers: getAuthHeaders(),
      });
      const resData = response.data;
      if (response.status === 200 && resData.data && Array.isArray(resData.data)) {
        setCategories(resData.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch categories from backend:', error);
    }
  };

  // Fetch Expenses from Backend API
  const fetchExpenses = async () => {
    if (!isAuthenticated) return;
    setIsLoadingExpenses(true);
    try {
      const response = await axios.get(`${API_URL}/expense`, {
        headers: getAuthHeaders(),
      });
      const resData = response.data;
      if (response.status === 200 && resData.data && Array.isArray(resData.data)) {
        const mappedTx: Transaction[] = resData.data.map((item: any) => {
          const catTitle = item?.category?.title || item?.Category?.title || '-';
          const rawAmount = Number(item?.amount);
          const validAmount = isNaN(rawAmount) ? 0 : rawAmount;
          const rawDate = item?.expenseDate ? new Date(item.expenseDate) : null;
          const validDate = rawDate && !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString() : 'Today';

          return {
            id: String(item?.id || `tx-${Math.random()}`),
            categoryId: item?.categoryId || item?.category?.id || 1,
            title: item?.title || 'Untitled Expense',
            category: catTitle,
            amount: validAmount,
            type: item?.type === 'CREDITED' ? 'CREDITED' : 'DEBITED',
            date: validDate,
            paymentMethod: typeof item?.paymentMethod === 'string' ? item.paymentMethod : 'CASH',
            note: item?.note || '',
          };
        });
        setTransactions(mappedTx);
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || error.message || 'Failed to load expenses from server';
      console.error('Failed to fetch expenses from backend:', serverMsg);
      showError(serverMsg);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  // Trigger data fetching on auth / mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchExpenses();
    } else {
      setTransactions([]);
      setCategories([]);
    }
  }, [isAuthenticated]);

  // Modal Handlers
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openAddOptionsModal = () => setIsAddOptionsOpen(true);
  const closeAddOptionsModal = () => setIsAddOptionsOpen(false);

  const openScanModal = () => setIsScanModalOpen(true);
  const closeScanModal = () => setIsScanModalOpen(false);

  const openVoiceModal = () => setIsVoiceModalOpen(true);
  const closeVoiceModal = () => setIsVoiceModalOpen(false);

  // Extract Expense details from bill photo via backend extract API
  const extractExpenseFromBillImage = async (file: { uri: string; type?: string; name?: string }): Promise<Partial<Transaction> | null> => {
    try {
      const formData = new FormData();
      const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

      formData.append('image', {
        uri: cleanUri,
        type: file.type || 'image/jpeg',
        name: file.name || `receipt_${Date.now()}.jpg`,
      } as any);

      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post(`${API_URL}/expense/extract`, formData, { headers });

      const resData = response.data;
      const extracted = resData?.data;

      if (!extracted) {
        throw new Error('No structured bill data returned from server');
      }

      // Match extracted category name to user categories
      let matchedCatId = categories[0]?.id || 17;
      if (extracted.category && categories.length > 0) {
        const foundCat = categories.find(
          (c) => c.title.toLowerCase() === String(extracted.category).toLowerCase()
        );
        if (foundCat) {
          matchedCatId = foundCat.id;
        }
      }

      const prefilledData: Partial<Transaction> = {
        title: extracted.merchant || extracted.title || 'Scanned Bill',
        amount: typeof extracted.amount === 'number' ? extracted.amount : (parseFloat(extracted.amount) || 0),
        type: extracted.type === 'CREDITED' ? 'CREDITED' : 'DEBITED',
        categoryId: matchedCatId,
        paymentMethod: extracted.paymentMethod || 'CASH',
        note: extracted.note || (extracted.merchant ? `Bill photo from ${extracted.merchant}` : 'Auto-extracted from bill photo'),
      };

      setPrefilledForm(prefilledData);
      return prefilledData;
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || error.message || 'Failed to process bill photo';
      console.error('Bill photo extraction error:', serverMsg);
      showError(serverMsg);
      return null;
    }
  };

  // Add Transaction to Backend API
  const addTransaction = async (payload: CreateExpensePayload): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/expense/add`, payload, {
        headers: getAuthHeaders(),
      });

      const resData = response.data;
      const createdItem = resData?.data;

      const categoryTitle = categories.find((c) => c.id === payload.categoryId)?.title || '-';

      const newTx: Transaction = {
        id: createdItem?.id ? String(createdItem.id) : `tx-${Date.now()}`,
        categoryId: payload.categoryId,
        title: payload.title,
        category: categoryTitle,
        amount: payload.amount,
        type: payload.type || 'DEBITED',
        date: payload.expenseDate ? new Date(payload.expenseDate).toLocaleDateString() : 'Just now',
        paymentMethod: payload.paymentMethod,
        note: payload.note,
      };

      setTransactions((prev) => [newTx, ...prev]);
      closeAddModal();
      return true;
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || error.message || 'Failed to save expense';
      console.error('Failed to create expense on backend:', serverMsg);
      showError(serverMsg);
      return false;
    }
  };

  // Delete Transaction from Backend API
  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/expense/delete/${id}`, {
        headers: getAuthHeaders(),
      });
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      return true;
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || error.message || 'Failed to delete expense';
      console.error('Failed to delete expense on backend:', serverMsg);
      showError(serverMsg);
      return false;
    }
  };

  // Dynamic calculations from real transactions
  const totalIncome = transactions
    .filter((tx) => tx.type === 'CREDITED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Total debited expenses across all transactions
  const totalExpense = transactions
    .filter((tx) => tx.type === 'DEBITED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Dynamic Category Breakdown from real transactions
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'DEBITED')
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const categoryBreakdown: CategorySummary[] = Object.entries(categoryTotals).map(
    ([category, amount]) => {
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        category,
        amount,
        percentage,
        color: CATEGORY_COLORS[category] || Colors.primary,
      };
    }
  );

  const userProfile: UserProfile = {
    name: user?.username || 'User',
    email: user?.email || '',
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        userProfile,
        totalBalance,
        totalIncome,
        totalExpense,
        categories,
        categoryBreakdown,
        isLoadingExpenses,
        isAddModalOpen,
        openAddModal,
        closeAddModal,
        isAddOptionsOpen,
        openAddOptionsModal,
        closeAddOptionsModal,
        isScanModalOpen,
        openScanModal,
        closeScanModal,
        isVoiceModalOpen,
        openVoiceModal,
        closeVoiceModal,
        prefilledForm,
        setPrefilledForm,
        fetchCategories,
        fetchExpenses,
        addTransaction,
        deleteTransaction,
        extractExpenseFromBillImage,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};