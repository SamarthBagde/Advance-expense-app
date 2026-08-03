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
  IExpenseFilterDTO,
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
  allTransactions: Transaction[];
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
  editingTransaction: Transaction | null;
  openEditModal: (transaction: Transaction) => void;
  selectedExpenseDetail: Transaction | null;
  openExpenseDetailModal: (transaction: Transaction) => void;
  closeExpenseDetailModal: () => void;
  fetchCategories: () => Promise<void>;
  fetchExpenses: (filters?: IExpenseFilterDTO) => Promise<void>;
  addTransaction: (payload: CreateExpensePayload) => Promise<boolean>;
  updateTransaction: (id: string, payload: Partial<CreateExpensePayload>) => Promise<boolean>;
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
  const { user, isAuthenticated, logout } = useAuth();
  const { showError } = useGlobalError();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddOptionsOpen, setIsAddOptionsOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [prefilledForm, setPrefilledForm] = useState<Partial<Transaction> | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedExpenseDetail, setSelectedExpenseDetail] = useState<Transaction | null>(null);

  // Fetch Categories from Backend API
  const fetchCategories = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/category`, {
        headers: getAuthHeaders(),
      });
      const resData = response.data;
      if (response.status === 200 && resData.data && Array.isArray(resData.data)) {
        setCategories(resData.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await logout();
        return;
      }
      console.error('Failed to fetch categories from backend:', error);
    }
  };

  // Fetch Expenses from Backend API with optional filters & sorting
  const fetchExpenses = async (filters?: IExpenseFilterDTO) => {
    const token = getAuthToken();
    if (!isAuthenticated || !token) return;

    setIsLoadingExpenses(true);
    try {
      // Clean query parameters (pass only defined filters)
      const cleanParams: Record<string, any> = {};
      if (filters) {
        if (filters.categoryId !== undefined) cleanParams.categoryId = filters.categoryId;
        if (filters.startDate) cleanParams.startDate = filters.startDate;
        if (filters.endDate) cleanParams.endDate = filters.endDate;
        if (filters.expenseDate) cleanParams.expenseDate = filters.expenseDate;
        if (filters.sortBy) cleanParams.sortBy = filters.sortBy;
        if (filters.sortOrder) cleanParams.sortOrder = filters.sortOrder;
      }

      const response = await axios.get(`${API_URL}/expense`, {
        params: cleanParams,
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
        // If no filter query parameters were sent, update overall allTransactions as well
        if (Object.keys(cleanParams).length === 0) {
          setAllTransactions(mappedTx);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Auth token expired or invalid (401). Logging out...');
        await logout();
        return;
      }
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
      setAllTransactions([]);
      setCategories([]);
    }
  }, [isAuthenticated]);

  // Modal Handlers
  const openAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const openExpenseDetailModal = (tx: Transaction) => {
    setSelectedExpenseDetail(tx);
  };

  const closeExpenseDetailModal = () => {
    setSelectedExpenseDetail(null);
  };

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
      let matchedCatId: number | undefined = undefined;
      if (extracted.category && categories.length > 0) {
        const foundCat = categories.find(
          (c) => c.title.toLowerCase() === String(extracted.category).toLowerCase()
        );
        if (foundCat) {
          matchedCatId = foundCat.id;
        }
      }

      // Normalize payment method from OCR text to standard enum values
      const rawPm = extracted.paymentMethod ? String(extracted.paymentMethod).toUpperCase() : '';
      let normalizedPm = '';
      if (['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER'].includes(rawPm)) {
        normalizedPm = rawPm;
      } else if (rawPm.includes('UPI') || rawPm.includes('GPAY') || rawPm.includes('GOOGLE PAY') || rawPm.includes('PHONEPE') || rawPm.includes('PAYTM') || rawPm.includes('BHIM')) {
        normalizedPm = 'UPI';
      } else if (rawPm.includes('CARD') || rawPm.includes('DEBIT')) {
        normalizedPm = 'DEBIT_CARD';
      } else if (rawPm.includes('CREDIT')) {
        normalizedPm = 'CREDIT_CARD';
      } else if (rawPm.includes('BANK') || rawPm.includes('TRANSFER') || rawPm.includes('NEFT') || rawPm.includes('IMPS') || rawPm.includes('RTGS')) {
        normalizedPm = 'BANK_TRANSFER';
      } else if (rawPm.includes('WALLET')) {
        normalizedPm = 'WALLET';
      } else if (rawPm.includes('CASH')) {
        normalizedPm = 'CASH';
      }

      const prefilledData: Partial<Transaction> = {
        title: extracted.merchant || extracted.title || 'Scanned Bill',
        amount: typeof extracted.amount === 'number' ? extracted.amount : (parseFloat(extracted.amount) || 0),
        type: extracted.type === 'CREDITED' ? 'CREDITED' : 'DEBITED',
        categoryId: matchedCatId,
        paymentMethod: normalizedPm,
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

  // Update Expense on Backend API
  const updateTransaction = async (
    id: string,
    payload: Partial<CreateExpensePayload>
  ): Promise<boolean> => {
    try {
      const response = await axios.patch(`${API_URL}/expense/update/${id}`, payload, {
        headers: getAuthHeaders(),
      });

      const resData = response.data;
      const updatedItem = resData?.data;

      const categoryTitle = categories.find((c) => c.id === payload.categoryId)?.title || '-';

      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === id) {
            return {
              ...tx,
              categoryId: payload.categoryId !== undefined ? payload.categoryId : tx.categoryId,
              title: payload.title !== undefined ? payload.title : tx.title,
              category: categoryTitle !== '-' ? categoryTitle : tx.category,
              amount: payload.amount !== undefined ? payload.amount : tx.amount,
              type: payload.type || tx.type,
              paymentMethod: payload.paymentMethod || tx.paymentMethod,
              note: payload.note !== undefined ? payload.note : tx.note,
              date: updatedItem?.expenseDate
                ? new Date(updatedItem.expenseDate).toLocaleDateString()
                : tx.date,
            };
          }
          return tx;
        })
      );
      closeAddModal();
      return true;
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || error.message || 'Failed to update expense';
      console.error('Failed to update expense on backend:', serverMsg);
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
        allTransactions,
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
        editingTransaction,
        openEditModal,
        selectedExpenseDetail,
        openExpenseDetailModal,
        closeExpenseDetailModal,
        fetchCategories,
        fetchExpenses,
        addTransaction,
        updateTransaction,
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