import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { EditIcon } from '../components/Icons';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const {
    transactions,
    categories,
    categoryBreakdown,
    totalExpense,
    openAddOptionsModal,
    openEditModal,
    openExpenseDetailModal,
    deleteTransaction,
  } = useExpense();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filterCategories = ['All', ...categories.map((c) => c.title)];

  const filteredTransactions = transactions.filter(
    (tx) => selectedCategory === 'All' || tx.category === selectedCategory
  );

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
            {/* Note: Displays total debited expenditure from ExpenseContext (can be filtered by current calendar month if needed) */}
            <View style={styles.breakdownHeader}>
              <View>
                <Text style={[styles.breakdownTotalLabel, { color: colors.textMuted }]}>
                  Total Monthly Spent
                </Text>
                <Text style={[styles.breakdownTotalValue, { color: colors.textPrimary }]}>
                  ₹{totalExpense.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.periodBadge, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.periodBadgeText, { color: colors.primaryLight }]}>
                  THIS MONTH
                </Text>
              </View>
            </View>

            {/* Stacked Bar Chart Progress Bar */}
            <View style={[styles.progressStackTrack, { backgroundColor: colors.surfaceLight }]}>
              {categoryBreakdown.map((cat, idx) => (
                <View
                  key={cat.category}
                  style={[
                    styles.progressStackSegment,
                    {
                      flex: cat.percentage || 1,
                      backgroundColor: cat.color,
                      borderTopLeftRadius: idx === 0 ? 4 : 0,
                      borderBottomLeftRadius: idx === 0 ? 4 : 0,
                      borderTopRightRadius: idx === categoryBreakdown.length - 1 ? 4 : 0,
                      borderBottomRightRadius: idx === categoryBreakdown.length - 1 ? 4 : 0,
                    },
                  ]}
                />
              ))}
            </View>

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

          {/* Filter Pills Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterPill,
                    { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
                    isSelected && [
                      styles.filterPillActive,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ],
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Expenses List Header */}
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
              Transactions ({filteredTransactions.length})
            </Text>
          </View>

          {/* Expense Cards */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No expenses found for this category.
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  listHeader: {
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
