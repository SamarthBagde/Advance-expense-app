import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

export const ScanReceiptModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isScanModalOpen,
    closeScanModal,
    openAddModal,
    setPrefilledForm,
    categories,
  } = useExpense();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const simulateOCRScan = async (sourceType: 'camera' | 'gallery') => {
    try {
      setIsScanning(true);
      setStatusMsg('Analyzing receipt image with Gemini AI...');

      // Simulating receipt scanner / Gemini API extraction
      await new Promise((resolve) => setTimeout(() => resolve(null), 2000));

      const firstCatId = categories && categories.length > 0 ? categories[0].id : 1;

      const extractedData = {
        title: sourceType === 'camera' ? 'Supermarket Receipt' : 'Restaurant Bill',
        amount: sourceType === 'camera' ? 450.00 : 285.00,
        type: 'DEBITED' as const,
        categoryId: firstCatId,
        paymentMethod: 'CREDIT_CARD',
        note: `Auto-extracted via ${sourceType === 'camera' ? 'Camera OCR' : 'Gallery Scan'}`,
      };

      setPrefilledForm(extractedData);
      setIsScanning(false);
      closeScanModal();

      // Open manual form with pre-filled fields for user verification
      openAddModal();
    } catch (err: any) {
      setIsScanning(false);
      Alert.alert('Scan Failed', err?.message || 'Could not extract text from image');
    }
  };

  return (
    <Modal
      visible={isScanModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeScanModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeScanModal} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          {/* Header Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.surfaceLight }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              📸 Receipt Scanner
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              AI-powered OCR bill extraction
            </Text>
          </View>

          {isScanning ? (
            <View style={styles.scanningContainer}>
              <View style={[styles.scannerRing, { borderColor: colors.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
              <Text style={[styles.scanningText, { color: colors.textPrimary }]}>
                Scanning Receipt...
              </Text>
              <Text style={[styles.statusText, { color: colors.textMuted }]}>
                {statusMsg}
              </Text>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.scanBtnPrimary,
                  { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.85}
                onPress={() => simulateOCRScan('camera')}
              >
                <Text style={styles.scanBtnIcon}>📷</Text>
                <View style={styles.scanBtnTextContainer}>
                  <Text style={styles.scanBtnTitle}>Capture with Camera</Text>
                  <Text style={styles.scanBtnSubtitle}>Take a live photo of paper receipt</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scanBtnSecondary,
                  { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                ]}
                activeOpacity={0.85}
                onPress={() => simulateOCRScan('gallery')}
              >
                <Text style={styles.scanBtnIcon}>🖼️</Text>
                <View style={styles.scanBtnTextContainer}>
                  <Text style={[styles.scanBtnTitleSecondary, { color: colors.textPrimary }]}>
                    Upload from Gallery
                  </Text>
                  <Text style={[styles.scanBtnSubtitleSecondary, { color: colors.textMuted }]}>
                    Choose saved bill or receipt image
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={closeScanModal}
            disabled={isScanning}
          >
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
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
  optionsContainer: {
    marginBottom: 16,
  },
  scanBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  scanBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  scanBtnIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  scanBtnTextContainer: {
    flex: 1,
  },
  scanBtnTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  scanBtnSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  scanBtnTitleSecondary: {
    fontSize: 15,
    fontWeight: '800',
  },
  scanBtnSubtitleSecondary: {
    fontSize: 12,
    marginTop: 2,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scannerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanningText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
