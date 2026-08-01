import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

export const AddExpenseOptionsModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isAddOptionsOpen,
    closeAddOptionsModal,
    openAddModal,
    openScanModal,
    openVoiceModal,
  } = useExpense();

  const handleSelectOption = (optionType: 'manual' | 'camera' | 'voice') => {
    closeAddOptionsModal();

    switch (optionType) {
      case 'manual':
        openAddModal();
        break;
      case 'camera':
        openScanModal();
        break;
      case 'voice':
        openVoiceModal();
        break;
    }
  };

  return (
    <Modal
      visible={isAddOptionsOpen}
      transparent
      animationType="slide"
      onRequestClose={closeAddOptionsModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeAddOptionsModal} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          {/* Header Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.surfaceLight }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Add Expense
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Choose your preferred input method
            </Text>
          </View>

          {/* List of Input Method Cards */}
          <View style={styles.gridContainer}>
            {/* 1. Manual Form Entry */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.background, borderColor: colors.surfaceLight },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectOption('manual')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Text style={styles.cardEmoji}>📝</Text>
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Manual Entry</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Fill transaction form manually</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Scan Bill Photo */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.background, borderColor: colors.surfaceLight },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectOption('camera')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={styles.cardEmoji}>📸</Text>
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Scan Bill Photo</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Camera OCR receipt scanner</Text>
              </View>
            </TouchableOpacity>

            {/* 3. Voice Command */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.background, borderColor: colors.surfaceLight },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectOption('voice')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Text style={styles.cardEmoji}>🎙️</Text>
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Voice Entry</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Speak & auto-fill details</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={closeAddOptionsModal}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  gridContainer: {
    marginBottom: 10,
  },
  optionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextContent: {
    flex: 1,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
