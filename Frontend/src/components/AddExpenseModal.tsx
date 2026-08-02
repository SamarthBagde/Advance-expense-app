import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SparklesIcon } from './Icons';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Debit Card', value: 'DEBIT_CARD' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Wallet', value: 'WALLET' },
  { label: 'Other', value: 'OTHER' },
];

export const AddExpenseModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isAddModalOpen,
    closeAddModal,
    addTransaction,
    prefilledForm,
    setPrefilledForm,
    categories,
  } = useExpense();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'DEBITED' | 'CREDITED'>('DEBITED');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('DEBITED');
    setSelectedCategoryId(categories[0]?.id || 1);
    setPaymentMethod('CASH');
    setNote('');
    setErrorMsg('');
    setPrefilledForm(null);
  };

  useEffect(() => {
    if (categories && categories.length > 0 && !categories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (prefilledForm && isAddModalOpen) {
      if (prefilledForm.title) setTitle(prefilledForm.title);
      if (prefilledForm.amount) setAmount(String(prefilledForm.amount));
      if (prefilledForm.type) setType(prefilledForm.type);
      if (prefilledForm.categoryId) setSelectedCategoryId(prefilledForm.categoryId);
      if (prefilledForm.paymentMethod) setPaymentMethod(prefilledForm.paymentMethod);
      if (prefilledForm.note) setNote(prefilledForm.note);
    } else if (!isAddModalOpen) {
      resetForm();
    }
  }, [prefilledForm, isAddModalOpen]);

  const handleClose = () => {
    resetForm();
    closeAddModal();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a description title');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive amount');
      return;
    }

    const currentCat = categories.find((c) => c.id === selectedCategoryId) || categories[0] || { id: 1, title: 'General' };

    setIsSubmitting(true);
    try {
      const success = await addTransaction({
        categoryId: currentCat.id,
        title: title.trim(),
        amount: numAmount,
        type,
        expenseDate: new Date().toISOString(),
        paymentMethod,
        note: note.trim() || undefined,
      });

      if (success) {
        resetForm();
      } else {
        setErrorMsg('Failed to save transaction. Please try again.');
        resetForm();
      }
    } catch (err) {
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isAddModalOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Add Transaction
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {errorMsg ? <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text> : null}

            {prefilledForm ? (
              <View
                style={[
                  styles.verificationBanner,
                  { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '40' },
                ]}
              >
                <View style={{ marginRight: 10 }}>
                  <SparklesIcon color={colors.primary} size={20} />
                </View>
                <View style={styles.verificationTextContainer}>
                  <Text style={[styles.verificationTitle, { color: colors.primary }]}>
                    Extracted Bill - Review & Verify
                  </Text>
                  <Text style={[styles.verificationSubtitle, { color: colors.textMuted }]}>
                    Check extracted fields below. Edit anything if required, then tap Save.
                  </Text>
                </View>
              </View>
            ) : null}


            {/* Type Selector (Debited vs Credited) */}

            <View style={[styles.typeSelectorContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'DEBITED' && [styles.typeTabExpenseActive, { backgroundColor: colors.danger }],
                ]}
                onPress={() => setType('DEBITED')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'DEBITED' ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  Debited
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'CREDITED' && [styles.typeTabIncomeActive, { backgroundColor: colors.secondary }],
                ]}
                onPress={() => setType('CREDITED')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'CREDITED' ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  Credited
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Field */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Amount (₹)</Text>
            <View
              style={[
                styles.amountInputRow,
                { backgroundColor: colors.background, borderColor: colors.surfaceLight },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.primaryLight }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.textPrimary }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setErrorMsg('');
                }}
              />
            </View>

            {/* Title / Note */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Title / Description</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.surfaceLight,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Groceries & Supplies"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrorMsg('');
              }}
            />

            {/* Note Field (Optional) */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Note (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.surfaceLight,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Purchased at DMart"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />

            {/* Category Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Category</Text>
            <View style={styles.pillWrap}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.pill,
                    { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                    selectedCategoryId === cat.id && [styles.pillActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: selectedCategoryId === cat.id ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Method */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Payment Method</Text>
            <View style={styles.pillWrap}>
              {PAYMENT_METHODS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.pill,
                    { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                    paymentMethod === item.value && [styles.pillActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                  ]}
                  onPress={() => setPaymentMethod(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: paymentMethod === item.value ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: type === 'CREDITED' ? colors.secondary : colors.primary },
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Save {type === 'CREDITED' ? 'Credited Amount' : 'Debited Expense'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
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
  formScroll: {
    paddingBottom: 20,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeTabExpenseActive: {},
  typeTabIncomeActive: {},
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 22,
    fontWeight: '800',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActive: {},
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  verificationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  verificationSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});

