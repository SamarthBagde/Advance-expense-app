import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

export const ExpenseDetailModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    selectedExpenseDetail,
    closeExpenseDetailModal,
    openEditModal,
    deleteTransaction,
  } = useExpense();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedExpenseDetail) return null;

  const isIncome = selectedExpenseDetail.type === 'CREDITED';
  const amountColor = isIncome ? colors.secondary : colors.danger;
  const badgeBg = isIncome ? colors.secondaryGlow : colors.dangerGlow;

  const handleEditPress = () => {
    const txToEdit = selectedExpenseDetail;
    closeExpenseDetailModal();
    openEditModal(txToEdit);
  };

  const handleDeletePress = () => {
    if (!selectedExpenseDetail) return;
    const { id, title } = selectedExpenseDetail;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteTransaction(id);
              if (success) {
                closeExpenseDetailModal();
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={!!selectedExpenseDetail}
      transparent
      animationType="slide"
      onRequestClose={closeExpenseDetailModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeExpenseDetailModal} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
              <View style={[styles.typeDot, { backgroundColor: amountColor }]} />
              <Text style={[styles.typeText, { color: amountColor }]}>
                {isIncome ? 'CREDITED / INCOME' : 'DEBITED / EXPENSE'}
              </Text>
            </View>
            <TouchableOpacity onPress={closeExpenseDetailModal} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Main Hero Section */}
            <View style={styles.heroSection}>
              <Text style={[styles.amountText, { color: amountColor }]}>
                {isIncome ? '+' : '-'}₹
                {selectedExpenseDetail.amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={[styles.titleText, { color: colors.textPrimary }]}>
                {selectedExpenseDetail.title}
              </Text>
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.surfaceLight }]}>
              {/* Category Row */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Category</Text>
                <View style={styles.infoValueRow}>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {selectedExpenseDetail.category}
                  </Text>
                </View>
              </View>

              <View style={[styles.rowDivider, { backgroundColor: colors.surfaceLight }]} />

              {/* Payment Method Row */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Payment Method</Text>
                <View style={[styles.methodPill, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.methodPillText, { color: colors.textSecondary }]}>
                    {selectedExpenseDetail.paymentMethod}
                  </Text>
                </View>
              </View>

              <View style={[styles.rowDivider, { backgroundColor: colors.surfaceLight }]} />

              {/* Date Row */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {selectedExpenseDetail.date}
                </Text>
              </View>
            </View>

            {/* Note Box if available */}
            {selectedExpenseDetail.note ? (
              <View style={[styles.noteCard, { backgroundColor: colors.background, borderColor: colors.surfaceLight }]}>
                <Text style={[styles.noteLabel, { color: colors.textMuted }]}>NOTE</Text>
                <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                  {selectedExpenseDetail.note}
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: colors.primary }]}
                onPress={handleEditPress}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  { backgroundColor: colors.danger + '1A', borderColor: colors.danger + '40' },
                ]}
                onPress={handleDeletePress}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.surfaceLight }]}
                onPress={closeExpenseDetailModal}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                <Text style={[styles.doneBtnText, { color: colors.textPrimary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
