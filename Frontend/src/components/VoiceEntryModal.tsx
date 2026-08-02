import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MicIcon } from './Icons';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

export const VoiceEntryModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isVoiceModalOpen,
    closeVoiceModal,
    openAddModal,
    setPrefilledForm,
    categories,
  } = useExpense();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const handleStartListening = async () => {
    setIsListening(true);
    setTranscript('Listening... Speak now (e.g. "Spent 250 on dinner paid via Cash")');

    // Simulate voice recording & speech recognition
    await new Promise((resolve) => setTimeout(() => resolve(null), 2500));

    const recognizedText = 'Spent 250 on dinner paid via Cash';
    setTranscript(`"${recognizedText}"`);

    await new Promise((resolve) => setTimeout(() => resolve(null), 1000));

    const firstCatId = categories && categories.length > 0 ? categories[0].id : 1;

    // Auto-fill extracted voice command into prefilledForm
    setPrefilledForm({
      title: 'Dinner & Restaurant',
      amount: 250,
      type: 'DEBITED',
      categoryId: firstCatId,
      paymentMethod: 'CASH',
      note: 'Voice entry: ' + recognizedText,
    });

    setIsListening(false);
    setTranscript('');
    closeVoiceModal();
    openAddModal();
  };

  return (
    <Modal
      visible={isVoiceModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeVoiceModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeVoiceModal} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          {/* Header handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.surfaceLight }]} />
          </View>

          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MicIcon color={colors.primary} size={22} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Voice Assistant
              </Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Speak to log your expense automatically
            </Text>
          </View>

          <View style={styles.micSection}>
            <TouchableOpacity
              style={[
                styles.micBtn,
                {
                  backgroundColor: isListening ? colors.danger : colors.primary,
                  borderColor: isListening ? colors.dangerGlow : colors.primaryGlow,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleStartListening}
              disabled={isListening}
            >
              {isListening ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <MicIcon color="#FFFFFF" size={36} />
              )}
            </TouchableOpacity>


            <Text style={[styles.promptText, { color: colors.textPrimary }]}>
              {isListening ? 'Listening...' : 'Tap the microphone to speak'}
            </Text>
            <Text style={[styles.transcriptText, { color: colors.textMuted }]}>
              {transcript || 'Example: "Paid 1200 for electricity bill"'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={closeVoiceModal}
            disabled={isListening}
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
  micSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  micBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  micEmoji: {
    fontSize: 38,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
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
