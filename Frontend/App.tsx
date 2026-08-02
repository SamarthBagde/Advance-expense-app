import React from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { ErrorProvider } from './src/context/ErrorContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigation';
import { AddExpenseModal } from './src/components/AddExpenseModal';
import { AddExpenseOptionsModal } from './src/components/AddExpenseOptionsModal';
import { ScanReceiptModal } from './src/components/ScanReceiptModal';
import { VoiceEntryModal } from './src/components/VoiceEntryModal';
import { ExpenseDetailModal } from './src/components/ExpenseDetailModal';
import { SharedIntentListener } from './src/components/SharedIntentListener';

function AppContent() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        {isAuthenticated ? (
          <ExpenseProvider>
            <BottomTabNavigator />
            <AddExpenseModal />
            <AddExpenseOptionsModal />
            <ScanReceiptModal />
            <VoiceEntryModal />
            <ExpenseDetailModal />
            <SharedIntentListener />
          </ExpenseProvider>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;


