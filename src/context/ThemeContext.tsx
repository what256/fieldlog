import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../styles/theme';

// Storage key for theme preference
const THEME_STORAGE_KEY = 'fieldlog_theme_preference';

// Define context type
export interface ThemeContextType {
  theme: typeof lightTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    
    // Save preference
    AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light')
      .catch(error => console.error('Error saving theme preference:', error));
  };

  // Current theme based on isDark state
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for using the context
export const useTheme = () => useContext(ThemeContext); 