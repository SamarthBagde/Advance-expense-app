import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Modal, Text, AppState } from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { useTheme } from '../context/ThemeContext';
import { useExpense } from '../context/ExpenseContext';

export const SharedIntentListener: React.FC = () => {
  const { colors } = useTheme();
  const { extractExpenseFromBillImage, openAddModal } = useExpense();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkReceivedFiles = () => {
    if ((ReceiveSharingIntent as any).isClear !== undefined) {
      (ReceiveSharingIntent as any).isClear = false;
    }

    ReceiveSharingIntent.getReceivedFiles(
      async (files: any[]) => {
        if (!files || files.length === 0) return;

        const sharedFile = files[0];
        const fileUri = sharedFile.contentUri || sharedFile.filePath || sharedFile.weblink;

        if (fileUri) {
          try {
            setIsProcessing(true);

            const extracted = await extractExpenseFromBillImage({
              uri: fileUri,
              type: sharedFile.mimeType || 'image/jpeg',
              name: sharedFile.fileName || `upi_share_${Date.now()}.jpg`,

            });

            setIsProcessing(false);

            if (extracted) {
              openAddModal();
            }
          } catch (err) {
            setIsProcessing(false);
            console.error('Shared UPI transaction processing error:', err);
          }
        }
      },
      (error: any) => {
        console.warn('ReceiveSharingIntent error:', error);
      },
      'ShareMedia'
    );
  };

  useEffect(() => {
    checkReceivedFiles();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkReceivedFiles();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isProcessing) return null;

  return (
    <Modal transparent visible animationType='fade'>
      <View style={styles.modalOverlay}>
        <View style={[styles.processingCard, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={[styles.processingTitle, { color: colors.textPrimary }]}>
            Processing Shared Transaction
          </Text>
          <Text style={[styles.processingSubtitle, { color: colors.textMuted }]}>
            Extracting details from shared UPI screenshot
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    width: '85%',
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

