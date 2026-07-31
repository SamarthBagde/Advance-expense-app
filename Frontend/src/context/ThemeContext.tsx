import React, { createContext, ReactNode, useContext, useState } from "react";
import { darkColors, lightColors, ThemeColors } from "../theme/colors";
import { useColorScheme } from "react-native";
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colors: ThemeColors;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const systemScheme = useColorScheme()

    const effectiveMode =
        themeMode === 'system'
            ? systemScheme == 'light'
                ? 'light'
                : 'dark'
            : themeMode;

    const isDark = effectiveMode == 'dark'
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                setThemeMode,
                colors,
                isDark
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}


export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}