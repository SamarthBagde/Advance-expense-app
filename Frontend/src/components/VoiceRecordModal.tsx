import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
  PermissionsAndroid,
  Animated,
} from 'react-native';
import Sound, {
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
  RecordBackType,
} from 'react-native-nitro-sound';
import { MicIcon } from './Icons';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

export const VoiceRecordModal: React.FC = () => {
  const { colors } = useTheme();
  const {
    isVoiceModalOpen,
    closeVoiceModal,
    openAddModal,
    extractExpenseFromAudio,
  } = useExpense();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recordTimeStr, setRecordTimeStr] = useState<string>('00:00');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Pulse & Wave Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(10)).current;
  const waveAnim2 = useRef(new Animated.Value(18)).current;
  const waveAnim3 = useRef(new Animated.Value(14)).current;
  const waveAnim4 = useRef(new Animated.Value(22)).current;

  // Pulse effect while recording
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let waveLoop: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      waveLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 32, duration: 400, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 8, duration: 400, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 10, duration: 500, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 36, duration: 500, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 28, duration: 450, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 12, duration: 450, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 14, duration: 380, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 38, duration: 380, useNativeDriver: false }),
          ]),
        ])
      );
      waveLoop.start();
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(10);
      waveAnim2.setValue(18);
      waveAnim3.setValue(14);
      waveAnim4.setValue(22);
    }

    return () => {
      pulseLoop?.stop();
      waveLoop?.stop();
    };
  }, [isRecording, pulseAnim, waveAnim1, waveAnim2, waveAnim3, waveAnim4]);

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission Required',
          message: 'This app needs access to your microphone to capture voice expenses.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Audio permission request error:', err);
      return false;
    }
  };

  const handleStartRecord = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required to record audio.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordTimeStr('00:00');
      setStatusMsg('Listening... Speak your expense');

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: 'aac' as const,
      };

      const result = await Sound.startRecorder(undefined, audioSet);
      console.log('Started recording:', result);

      Sound.addRecordBackListener((e: RecordBackType) => {
        const mmss = Sound.mmssss(Math.floor(e.currentPosition));
        setRecordTimeStr(mmss.substring(0, 5));
      });
    } catch (err: any) {
      setIsRecording(false);
      Alert.alert('Recording Failed', err?.message || 'Could not start audio recorder');
    }
  };

  const handleStopAndProcessRecord = async () => {
    if (!isRecording) return;

    try {
      setStatusMsg('Transcribing speech & extracting expense...');
      setIsRecording(false);
      setIsProcessing(true);

      const filePath = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      console.log('Stopped recording. Audio saved at:', filePath);

      if (!filePath) {
        throw new Error('No audio file was recorded');
      }

      // Upload audio file to backend API /expense/extract-audio
      const ext = filePath.endsWith('.mp3') ? 'mp3' : filePath.endsWith('.m4a') ? 'm4a' : 'mp3';
      const extractedData = await extractExpenseFromAudio({
        uri: filePath,
        type: `audio/${ext}`,
        name: `voice_expense_${Date.now()}.${ext}`,
      });

      setIsProcessing(false);

      if (extractedData) {
        closeVoiceModal();
        openAddModal();
      } else {
        Alert.alert(
          'Extraction Error',
          'Could not extract expense details from audio. Please try again or enter details manually.'
        );
      }
    } catch (err: any) {
      setIsRecording(false);
      setIsProcessing(false);
      Alert.alert('Voice Entry Error', err?.message || 'Failed to process voice recording');
    }
  };

  const handleClose = async () => {
    if (isRecording) {
      try {
        await Sound.stopRecorder();
        Sound.removeRecordBackListener();
      } catch (e) {
        // ignore cleanup error
      }
    }
    setIsRecording(false);
    setIsProcessing(false);
    closeVoiceModal();
  };

  return (
    <Modal
      visible={isVoiceModalOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
          ]}
        >
          {/* Top Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.surfaceLight }]} />
          </View>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={[
                  styles.headerIconBadge,
                  { backgroundColor: 'rgba(99, 102, 241, 0.15)' },
                ]}
              >
                <MicIcon color="#6366F1" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Voice Expense Entry
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Describe your expense (e.g. "Spent 250 on lunch using UPI")
                </Text>
              </View>
            </View>
          </View>

          {/* Recording & Processing State Body */}
          <View style={styles.centerContainer}>
            {isProcessing ? (
              <View style={styles.stateBox}>
                <View style={[styles.loadingPulseRing, { borderColor: colors.primary }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  Extracting Expense...
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
                  {statusMsg}
                </Text>
              </View>
            ) : isRecording ? (
              <View style={styles.stateBox}>
                {/* Visualizer Waves */}
                <View style={styles.waveBarContainer}>
                  <Animated.View style={[styles.waveBar, { height: waveAnim1, backgroundColor: '#EF4444' }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim2, backgroundColor: '#EF4444' }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim3, backgroundColor: '#EF4444' }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim4, backgroundColor: '#EF4444' }]} />
                </View>

                {/* Pulsing Red Recording Button */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[styles.recordingMicBtn, { backgroundColor: '#EF4444' }]}
                    activeOpacity={0.8}
                    onPress={handleStopAndProcessRecord}
                  >
                    <MicIcon color="#FFFFFF" size={36} />
                  </TouchableOpacity>
                </Animated.View>

                <Text style={styles.timerText}>{recordTimeStr}</Text>
                <Text style={[styles.recordingHint, { color: colors.textSecondary }]}>
                  Tap mic to Stop & Auto-Extract
                </Text>
              </View>
            ) : (
              <View style={styles.stateBox}>
                <TouchableOpacity
                  style={[styles.idleMicBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                  onPress={handleStartRecord}
                >
                  <MicIcon color="#FFFFFF" size={38} />
                </TouchableOpacity>

                <Text style={[styles.idleTitle, { color: colors.textPrimary }]}>
                  Tap to Start Speaking
                </Text>
                <Text style={[styles.idleSubtitle, { color: colors.textMuted }]}>
                  Say merchant name, amount, category & payment method
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {isRecording ? (
            <TouchableOpacity
              style={[styles.stopActionBtn, { backgroundColor: '#EF4444' }]}
              onPress={handleStopAndProcessRecord}
              activeOpacity={0.85}
            >
              <Text style={styles.stopActionBtnText}>Done Speaking - Extract Expense</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={handleClose}
              disabled={isProcessing}
            >
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    marginBottom: 16,
  },
  headerIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleMicBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  idleTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  idleSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  recordingMicBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EF4444',
    marginVertical: 6,
    letterSpacing: 1.5,
  },
  recordingHint: {
    fontSize: 13,
    fontWeight: '600',
  },
  waveBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    marginBottom: 8,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
  },
  loadingPulseRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  stopActionBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  stopActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
