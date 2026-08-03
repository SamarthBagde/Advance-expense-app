import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { EditIcon, FilterIcon } from '../components/Icons';
import { SortByField, SortOrder } from '../types';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const {
    transactions,
    categories,
    categoryBreakdown,
    totalExpense,
    isLoadingExpenses,
    fetchExpenses,
    openAddOptionsModal,
    openEditModal,
    openExpenseDetailModal,
    deleteTransaction,
  } = useExpense();

  // Applied filter state (defaults: null/undefined for all expenses & categories)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortByField>('expenseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [tempCategoryId, setTempCategoryId] = useState<number | undefined>(undefined);
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  const [tempSortBy, setTempSortBy] = useState<SortByField>('expenseDate');
  const [tempSortOrder, setTempSortOrder] = useState<SortOrder>('DESC');

  // Trigger backend fetch with filters whenever selection changes
  useEffect(() => {
    fetchExpenses({
      categoryId: selectedCategoryId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    });
  }, [selectedCategoryId, startDate, endDate, sortBy, sortOrder]);

  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const formatDateString = (d: Date) => d.toISOString().split('T')[0];

  const handleOpenStartDatePicker = () => {
    if (Platform.OS === 'android') {
      const initialDate = tempStartDate ? new Date(tempStartDate) : new Date();
      const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;
      DateTimePickerAndroid.open({
        value: validInitialDate,
        onChange: (_: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            setTempStartDate(formatDateString(selectedDate));
          }
        },
        mode: 'date',
      });
    } else {
      setShowPicker('start');
    }
  };

  const handleOpenEndDatePicker = () => {
    if (Platform.OS === 'android') {
      const initialDate = tempEndDate ? new Date(tempEndDate) : new Date();
      const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;
      DateTimePickerAndroid.open({
        value: validInitialDate,
        onChange: (_: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            setTempEndDate(formatDateString(selectedDate));
          }
        },
        mode: 'date',
      });
    } else {
      setShowPicker('end');
    }
  };

  const handleOpenFilterModal = () => {
    setTempCategoryId(selectedCategoryId);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedCategoryId(tempCategoryId);
    setStartDate(tempStartDate.trim());
    setEndDate(tempEndDate.trim());
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedCategoryId(undefined);
    setStartDate('');
    setEndDate('');
    setSortBy('expenseDate');
    setSortOrder('DESC');
    setTempCategoryId(undefined);
    setTempStartDate('');
    setTempEndDate('');
    setTempSortBy('expenseDate');
    setTempSortOrder('DESC');
    setIsFilterModalOpen(false);
  };

  const handleDeleteConfirm = (id: string, title: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteTransaction(id);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  let activeFilterCount = 0;
  if (selectedCategoryId !== undefined) activeFilterCount++;
  if (startDate) activeFilterCount++;
  if (endDate) activeFilterCount++;
  if (sortBy !== 'expenseDate' || sortOrder !== 'DESC') activeFilterCount++;

  const isFiltered = activeFilterCount > 0;
  const activeCategoryTitle = categories.find((c) => c.id === selectedCategoryId)?.title;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Expenses</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                MONTHLY BREAKDOWN
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addSmallBtn, { backgroundColor: colors.primary }]}
              onPress={openAddOptionsModal}
              activeOpacity={0.8}
            >
              <Text style={styles.plusSymbol}>+</Text>
              <Text style={styles.addSmallBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Breakdown Card */}
          <View
            style={[
              styles.breakdownCard,
              { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
            ]}
          >


            {/* Category Metrics Grid */}
            <View style={styles.categoryGrid}>
              {categoryBreakdown.map((cat) => (
                <View key={cat.category} style={styles.categoryItem}>
                  <View style={styles.categoryDotTitleRow}>
                    <View style={[styles.categoryLegendDot, { backgroundColor: cat.color }]} />
                    <Text
                      style={[styles.categoryName, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {cat.category}
                    </Text>
                  </View>
                  <Text style={[styles.categoryValue, { color: colors.textMuted }]}>
                    ₹{cat.amount.toFixed(0)} ({cat.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Unified Filter & Sort Control Toolbar */}
          <View style={styles.filterControlBar}>
            {isFiltered ? (
              <TouchableOpacity onPress={handleResetFilters} style={styles.resetBtn}>
                <Text style={[styles.resetBtnText, { color: colors.danger }]}>✕ Reset All</Text>
              </TouchableOpacity>
            ) : <View />}

            <TouchableOpacity
              style={[
                styles.filterModalTriggerIconBtn,
                {
                  backgroundColor: isFiltered ? colors.primary : colors.surface,
                  borderColor: isFiltered ? colors.primary : colors.surfaceLight,
                },
              ]}
              onPress={handleOpenFilterModal}
              activeOpacity={0.8}
            >
              <FilterIcon color={isFiltered ? '#FFFFFF' : colors.textPrimary} size={18} />
              {activeFilterCount > 0 ? (
                <View style={[styles.badgeDot, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.badgeDotText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Active Filter Chips / Summary indicator */}
          {isFiltered ? (
            <View style={styles.activeFilterChipsRow}>
              {activeCategoryTitle ? (
                <View style={[styles.chip, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>Category: {activeCategoryTitle}</Text>
                </View>
              ) : null}
              {startDate || endDate ? (
                <View style={[styles.chip, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>Date: {startDate || 'Start'} to {endDate || 'End'}</Text>
                </View>
              ) : null}
              {sortBy !== 'expenseDate' || sortOrder !== 'DESC' ? (
                <View style={[styles.chip, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>Sort: {sortBy === 'amount' ? 'Amount' : 'Date'} ({sortOrder})</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Expenses List Header */}
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
              Transactions ({transactions.length})
            </Text>
            {isLoadingExpenses ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
            ) : null}
          </View>

          {/* Expense Cards */}
          {isLoadingExpenses && transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 12 }]}>
                Loading expenses...
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No expenses found matching the selected filter.
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.expenseCard,
                  { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
                ]}
                onPress={() => openExpenseDetailModal(tx)}
                activeOpacity={0.7}
              >
                <View style={styles.expenseLeft}>
                  <View style={[styles.methodBadge, { backgroundColor: colors.surfaceLight }]}>
                    <Text style={[styles.methodBadgeText, { color: colors.textSecondary }]}>
                      {(tx.paymentMethod || 'CASH').substring(0, 3).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.expenseTextContainer}>
                    <Text style={[styles.expenseTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                      {tx.title}
                    </Text>
                    <Text style={[styles.expenseMeta, { color: colors.textMuted }]} numberOfLines={1} ellipsizeMode="tail">
                      {tx.category} • {tx.paymentMethod} • {tx.date}
                    </Text>
                  </View>
                </View>

                <View style={styles.expenseRight}>
                  <Text
                    style={[
                      styles.expenseAmount,
                      { color: tx.type === 'CREDITED' ? colors.secondary : colors.danger },
                    ]}
                    numberOfLines={1}
                  >
                    {tx.type === 'CREDITED' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => openEditModal(tx)}
                    style={styles.actionBtn}
                    disabled={deletingId === tx.id}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <EditIcon color={deletingId === tx.id ? colors.textMuted : colors.primaryLight} size={15} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteConfirm(tx.id, tx.title)}
                    style={styles.actionBtn}
                    disabled={deletingId === tx.id}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {deletingId === tx.id ? (
                      <ActivityIndicator size="small" color={colors.danger} />
                    ) : (
                      <Text style={[styles.deleteBtnText, { color: colors.textMuted }]}>✕</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Unified Filter & Sort Modal */}
        <Modal
          visible={isFilterModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsFilterModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setIsFilterModalOpen(false)} />
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalCardTitle, { color: colors.textPrimary }]}>Filter & Sort Expenses</Text>
                <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.closeBtn}>
                  <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* 1. Category Filter Section */}
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Category</Text>
                <View style={styles.pillWrap}>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                      tempCategoryId === undefined && [styles.pillActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    ]}
                    onPress={() => setTempCategoryId(undefined)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, { color: tempCategoryId === undefined ? '#FFFFFF' : colors.textSecondary }]}>
                      All Categories
                    </Text>
                  </TouchableOpacity>

                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pill,
                        { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                        tempCategoryId === cat.id && [styles.pillActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                      onPress={() => setTempCategoryId(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, { color: tempCategoryId === cat.id ? '#FFFFFF' : colors.textSecondary }]}>
                        {cat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Date Range Section */}
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Date Range</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputSubLabel, { color: colors.textMuted }]}>Start Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.datePickerBtn,
                        { backgroundColor: colors.background, borderColor: tempStartDate ? colors.primary : colors.surfaceLight },
                      ]}
                      onPress={handleOpenStartDatePicker}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.datePickerBtnText, { color: tempStartDate ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                        {tempStartDate ? tempStartDate : 'Select Date'}
                      </Text>
                      {tempStartDate ? (
                        <TouchableOpacity onPress={() => setTempStartDate('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={[styles.clearSingleDateText, { color: colors.danger }]}>✕</Text>
                        </TouchableOpacity>
                      ) : null}
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputSubLabel, { color: colors.textMuted }]}>End Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.datePickerBtn,
                        { backgroundColor: colors.background, borderColor: tempEndDate ? colors.primary : colors.surfaceLight },
                      ]}
                      onPress={handleOpenEndDatePicker}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.datePickerBtnText, { color: tempEndDate ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                        {tempEndDate ? tempEndDate : 'Select Date'}
                      </Text>
                      {tempEndDate ? (
                        <TouchableOpacity onPress={() => setTempEndDate('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={[styles.clearSingleDateText, { color: colors.danger }]}>✕</Text>
                        </TouchableOpacity>
                      ) : null}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Sort Field Section */}
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Sort By</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                      tempSortBy === 'expenseDate' && [styles.toggleOptionActive, { backgroundColor: colors.primary + '20', borderColor: colors.primary }],
                    ]}
                    onPress={() => setTempSortBy('expenseDate')}
                  >
                    <Text style={[styles.toggleOptionText, { color: tempSortBy === 'expenseDate' ? colors.primary : colors.textSecondary }]}>
                      Transaction Date
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                      tempSortBy === 'amount' && [styles.toggleOptionActive, { backgroundColor: colors.primary + '20', borderColor: colors.primary }],
                    ]}
                    onPress={() => setTempSortBy('amount')}
                  >
                    <Text style={[styles.toggleOptionText, { color: tempSortBy === 'amount' ? colors.primary : colors.textSecondary }]}>
                      Amount
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 4. Sort Order Section */}
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Sort Order</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                      tempSortOrder === 'DESC' && [styles.toggleOptionActive, { backgroundColor: colors.primary + '20', borderColor: colors.primary }],
                    ]}
                    onPress={() => setTempSortOrder('DESC')}
                  >
                    <Text style={[styles.toggleOptionText, { color: tempSortOrder === 'DESC' ? colors.primary : colors.textSecondary }]}>
                      {tempSortBy === 'amount' ? 'Highest First' : 'Newest First'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                      tempSortOrder === 'ASC' && [styles.toggleOptionActive, { backgroundColor: colors.primary + '20', borderColor: colors.primary }],
                    ]}
                    onPress={() => setTempSortOrder('ASC')}
                  >
                    <Text style={[styles.toggleOptionText, { color: tempSortOrder === 'ASC' ? colors.primary : colors.textSecondary }]}>
                      {tempSortBy === 'amount' ? 'Lowest First' : 'Oldest First'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalResetBtn, { backgroundColor: colors.surfaceLight }]}
                  onPress={handleResetFilters}
                >
                  <Text style={[styles.modalResetText, { color: colors.danger }]}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalApplyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.modalApplyText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  filterControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterModalTriggerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  activeFilterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '94%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillActive: {},
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datePickerBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  clearSingleDateText: {
    fontSize: 12,
    fontWeight: '800',
    paddingLeft: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {},
  toggleOptionText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalResetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 5,
  },
  plusSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  addSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  breakdownTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  breakdownTotalValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  periodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressStackTrack: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressStackSegment: {
    height: '100%',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '46%',
  },
  categoryDotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryLegendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  categoryValue: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    marginLeft: 13,
  },
  filterScroll: {
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortOptionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortBtnActive: {},
  sortBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  methodBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  expenseTextContainer: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  expenseMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 28,
  },
});
