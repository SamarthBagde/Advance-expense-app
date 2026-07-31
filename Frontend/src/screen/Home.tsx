import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';

export default function Home() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#0F172A' }]}>
      <Text style={[styles.title, { color: colors.textPrimary || '#FFFFFF' }]}>
        Advance Expense Tracker
      </Text>
      
      <Text style={[styles.welcomeText, { color: colors.textMuted || '#94A3B8' }]}>
        Welcome, <Text style={{ color: colors.primary || '#6366F1', fontWeight: '700' }}>{user?.username || 'User'}</Text>
      </Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: '#FF3B301A',
    borderWidth: 1,
    borderColor: Colors.danger || '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  logoutText: {
    color: Colors.danger || '#F43F5E',
    fontSize: 15,
    fontWeight: '700',
  },
});
