import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';

interface ErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    // Auto clear after 4.5 seconds
    setTimeout(() => {
      setError((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error ? (
        <SafeAreaView style={styles.toastContainer} pointerEvents="box-none">
          <View style={styles.toastCard}>
            <Text style={styles.toastIcon}>⚠️</Text>
            <Text style={styles.toastText} numberOfLines={2}>
              {error}
            </Text>
            <TouchableOpacity onPress={clearError} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : null}
    </ErrorContext.Provider>
  );
};

export const useGlobalError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within an ErrorProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 4,
  },
  closeBtnText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '800',
  },
});
