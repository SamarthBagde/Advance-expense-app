import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpRightIcon, ArrowDownLeftIcon } from '../components/Icons';

export default function Home() {
  const { colors } = useTheme();
  const { userProfile, totalBalance, totalIncome, totalExpense, transactions, openAddOptionsModal } = useExpense();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>WELCOME BACK</Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{userProfile.name}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          <View style={styles.balanceTop}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Total Balance</Text>
            <View style={[styles.tagPill, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>INR</Text>
            </View>
          </View>

          <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
            ₹
            {totalBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <View style={[styles.statsDivider, { backgroundColor: colors.surfaceLight }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainerIncome, { backgroundColor: colors.secondaryGlow }]}>
                <ArrowDownLeftIcon color={colors.secondary} size={14} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Income</Text>
                <Text style={[styles.statAmountIncome, { color: colors.secondary }]}>
                  +₹{totalIncome.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={[styles.statVerticalDivider, { backgroundColor: colors.surfaceLight }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconContainerExpense, { backgroundColor: colors.dangerGlow }]}>
                <ArrowUpRightIcon color={colors.danger} size={14} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expenses</Text>
                <Text style={[styles.statAmountExpense, { color: colors.danger }]}>
                  -₹{totalExpense.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
        </View>

        {recentTransactions.map((tx) => (
          <View
            key={tx.id}
            style={[
              styles.txCard,
              { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
            ]}
          >
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.categoryDot,
                  {
                    backgroundColor:
                      tx.type === 'CREDITED' ? colors.secondary : colors.danger,
                  },
                ]}
              />
              <View style={styles.txTextContainer}>
                <Text style={[styles.txTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                  {tx.title}
                </Text>
                <Text style={[styles.txMeta, { color: colors.textMuted }]} numberOfLines={1} ellipsizeMode="tail">
                  {tx.category} • {tx.date}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.txAmount,
                { color: tx.type === 'CREDITED' ? colors.secondary : colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {tx.type === 'CREDITED' ? '+' : '-'}₹{tx.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAddOptionsModal}
        activeOpacity={0.85}
      >
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  balanceCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 12,
    letterSpacing: -0.5,
  },
  statsDivider: {
    height: 1,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainerIncome: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statIconContainerExpense: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statAmountIncome: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  statAmountExpense: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  statVerticalDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  actionButtonPrimary: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  txTextContainer: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  txMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
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