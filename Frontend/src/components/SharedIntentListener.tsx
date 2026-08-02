import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Modal, Text, AppState } from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { useTheme } from '../context/ThemeContext';
import { useExpense } from '../context/ExpenseContext';

export const SharedIntentListener: React.FC = () => {
  const { colors } = useTheme();
  const { extractExpenseFromBillImage, openAddModal } = useExpense();
  const [isProcessing, setIsProcessing] = useState(false);

  // Checks for incoming shared intent files (e.g. UPI screenshots shared via GPay, PhonePe, Paytm, Gallery)
  const checkReceivedFiles = () => {
    // Reset JS clear flag so ReceiveSharingIntent reads incoming files on each app foreground / intent update
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

            // Extract UPI transaction data (amount, merchant, date, etc.) from the shared image via OCR/parser
            const extracted = await extractExpenseFromBillImage({
              uri: fileUri,
              type: sharedFile.mimeType || 'image/jpeg',
              name: sharedFile.fileName || `upi_share_${Date.now()}.jpg`,
            });

            if (extracted) {
              openAddModal();
            }
          } catch (err) {
            console.error('Shared UPI transaction processing error:', err);
          } finally {
            setIsProcessing(false);
            // Clear processed intent data so subsequent share actions can be received cleanly
            ReceiveSharingIntent.clearReceivedFiles();
          }
        } else {
          ReceiveSharingIntent.clearReceivedFiles();
        }
      },
      (error: any) => {
        console.warn('ReceiveSharingIntent error:', error);
        ReceiveSharingIntent.clearReceivedFiles();
      },
      'ShareMedia'
    );
  };

  useEffect(() => {
    // Initial check on mount (e.g. cold start via share intent)
    checkReceivedFiles();

    // Listen for app state transitions to re-check intents when bringing the app to foreground
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

