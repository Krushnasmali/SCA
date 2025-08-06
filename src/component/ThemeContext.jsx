import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // npm install @react-native-async-storage/async-storage

export const ThemeContext = createContext();

export const themes = {
  light: {
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F4',

    // Text colors
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Primary brand colors
    primary: '#800080',
    primaryLight: '#9D4EDD',
    primaryDark: '#6A0572',

    // Accent colors
    accent: '#BB86FC',
    accentLight: '#D1C4E9',

    // Card and surface colors
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: 'rgba(0, 0, 0, 0.1)',

    // Interactive elements
    switchThumb: '#800080',
    switchTrack: '#D1C4E9',
    switchTrackActive: '#9D4EDD',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Border and divider colors
    border: '#E5E7EB',
    divider: '#F3F4F6',

    // Navigation colors
    headerBackground: '#800080',
    headerText: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#800080',
    tabBarInactive: '#9CA3AF',
  },
  dark: {
    // Background colors
    background: '#0F0F0F',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#262626',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    // Primary brand colors
    primary: '#BB86FC',
    primaryLight: '#D1C4E9',
    primaryDark: '#9D4EDD',

    // Accent colors
    accent: '#BB86FC',
    accentLight: '#D1C4E9',

    // Card and surface colors
    cardBackground: '#1A1A1A',
    cardBorder: '#374151',
    cardShadow: 'rgba(0, 0, 0, 0.3)',

    // Interactive elements
    switchThumb: '#BB86FC',
    switchTrack: '#374151',
    switchTrackActive: '#6200EE',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Border and divider colors
    border: '#374151',
    divider: '#262626',

    // Navigation colors
    headerBackground: '#1A1A1A',
    headerText: '#FFFFFF',
    tabBarBackground: '#1A1A1A',
    tabBarBorder: '#374151',
    tabBarActive: '#BB86FC',
    tabBarInactive: '#6B7280',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(themes.light);

  // Load theme preference from storage or use system preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme) {
          const isDarkTheme = savedTheme === 'dark';
          setIsDark(isDarkTheme);
          setTheme(isDarkTheme ? themes.dark : themes.light);
        } else {
          // No saved theme; use system preference
          const colorScheme = Appearance.getColorScheme();
          setIsDark(colorScheme === 'dark');
          setTheme(colorScheme === 'dark' ? themes.dark : themes.light);
        }
      } catch (e) {
        // error reading value; fallback to system preference
        const colorScheme = Appearance.getColorScheme();
        setIsDark(colorScheme === 'dark');
        setTheme(colorScheme === 'dark' ? themes.dark : themes.light);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      if (isDark) {
        setTheme(themes.light);
        setIsDark(false);
        await AsyncStorage.setItem('@app_theme', 'light');
      } else {
        setTheme(themes.dark);
        setIsDark(true);
        await AsyncStorage.setItem('@app_theme', 'dark');
      }
    } catch (e) {
      // saving error
      console.error('Error saving theme:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
