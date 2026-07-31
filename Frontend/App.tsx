import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Home from './src/screen/Home';
import AuthNavigator from './src/navigation/AuthNavigation';

function AppContent() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;




  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]} >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        {
          isAuthenticated ? (
            <>
              <Home />
            </>
          ) : (
            <AuthNavigator />
          )
        }
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

// function MainApp() {
//     return (
//         <ExpenseProvider>
//         <AppContent />
//         </ExpenseProvider>
//     );
// }



function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
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
