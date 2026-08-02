import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

import { PhoneIcon } from '../components/Icons';

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { userProfile, totalIncome, totalExpense, transactions } = useExpense();
  const { user, logout } = useAuth();

  const displayName = user?.username || userProfile.name;
  const displayEmail = user?.email || userProfile.email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>ACCOUNT</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{displayEmail}</Text>
          {user?.phone ? (
            <View style={[styles.phoneBadge, { backgroundColor: colors.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <PhoneIcon color={colors.textSecondary} size={14} />
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{user.phone}</Text>
            </View>
          ) : null}
        </View>


        {/* Overview Quick Stats */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overview</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Income</Text>
              <Text style={[styles.statValue, { color: colors.secondary }]}>+₹{totalIncome.toFixed(0)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.surfaceLight }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expenses</Text>
              <Text style={[styles.statValue, { color: colors.danger }]}>-₹{totalExpense.toFixed(0)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.surfaceLight }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Records</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>{transactions.length}</Text>
            </View>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeBtn,
                  { backgroundColor: colors.background, borderColor: colors.surfaceLight },
                  themeMode === mode && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Text
                  style={[
                    styles.themeBtnText,
                    { color: themeMode === mode ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
          <TouchableOpacity style={[styles.logoutBtn]} onPress={logout}>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
    marginTop: 4,
  },
  phoneBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 28,
  },
  themeRow: {
    flexDirection: 'row',
    width: '100%',
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FF3B3015',
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
