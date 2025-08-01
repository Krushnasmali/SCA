import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // npm install @react-native-async-storage/async-storage

export const ThemeContext = createContext();

export const themes = {
  light: {
    background: '#F5F6FA',
    text: '#800080',
    switchThumb: '#800080',
    switchTrack: '#D1C4E9',
  },
  dark: {
    background: '#121212',
    text: '#BB86FC',
    switchThumb: '#BB86FC',
    switchTrack: '#6200EE',
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
