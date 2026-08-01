import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Home from '../screen/Home';
import ExpensesScreen from '../screen/ExpensesScreen';
import ProfileScreen from '../screen/ProfileScreen';
import { HomeIcon, ExpensesIcon, ProfileIcon } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import { RootTabParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.tabActive || colors.primary,
        tabBarInactiveTintColor: colors.tabInactive || colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.tabBackground || colors.surface,
            borderTopColor: colors.tabBorder || colors.surfaceLight,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: colors.primaryGlow },
              ]}
            >
              <HomeIcon color={color} size={18} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: colors.primaryGlow },
              ]}
            >
              <ExpensesIcon color={color} size={18} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                focused && { backgroundColor: colors.primaryGlow },
              ]}
            >
              <ProfileIcon color={color} size={18} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 30,
    borderRadius: 15,
  },
});
