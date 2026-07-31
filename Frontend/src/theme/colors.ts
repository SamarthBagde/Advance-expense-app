export interface ThemeColors {
    background: string;
    surface: string;
    surfaceLight: string;
    surfaceHover: string;

    primary: string;
    primaryLight: string;
    primaryGlow: string;

    secondary: string;
    secondaryGlow: string;

    danger: string;
    dangerGlow: string;

    warning: string;
    accentBlue: string;
    accentPurple: string;

    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    tabBackground: string;
    tabBorder: string;
    tabActive: string;
    tabInactive: string;
}

export const darkColors: ThemeColors = {
    background: '#0B0F19',
    surface: '#151C2C',
    surfaceLight: '#1E293B',
    surfaceHover: '#2A364F',

    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryGlow: 'rgba(99, 102, 241, 0.15)',

    secondary: '#10B981',
    secondaryGlow: 'rgba(16, 185, 129, 0.15)',

    danger: '#F43F5E',
    dangerGlow: 'rgba(244, 63, 94, 0.15)',

    warning: '#F59E0B',
    accentBlue: '#38BDF8',
    accentPurple: '#A855F7',

    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    tabBackground: '#0F172A',
    tabBorder: '#1E293B',
    tabActive: '#6366F1',
    tabInactive: '#64748B',
};

export const lightColors: ThemeColors = {
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceLight: '#E2E8F0',
    surfaceHover: '#CBD5E1',

    primary: '#4F46E5',
    primaryLight: '#6366F1',
    primaryGlow: 'rgba(79, 70, 229, 0.12)',

    secondary: '#059669',
    secondaryGlow: 'rgba(5, 150, 105, 0.12)',

    danger: '#E11D48',
    dangerGlow: 'rgba(225, 29, 72, 0.12)',

    warning: '#D97706',
    accentBlue: '#0284C7',
    accentPurple: '#9333EA',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',

    tabBackground: '#FFFFFF',
    tabBorder: '#E2E8F0',
    tabActive: '#4F46E5',
    tabInactive: '#94A3B8',
};

// Fallback for direct imports
export const Colors = lightColors;
