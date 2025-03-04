import { DefaultTheme, MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

// Define custom color palette
const palette = {
  // Primary colors
  primary: {
    light: '#4dabf5',
    main: '#2196F3',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },
  // Secondary colors
  secondary: {
    light: '#4aedc4',
    main: '#03DAC6',
    dark: '#018786',
    contrast: '#000000',
  },
  // Accent colors
  accent: {
    light: '#FF94C2',
    main: '#F06292',
    dark: '#BA2D65',
    contrast: '#FFFFFF',
  },
  // Other colors
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrast: '#FFFFFF',
  },
  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
    contrast: '#000000',
  },
  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
    contrast: '#FFFFFF',
  },
  info: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
    contrast: '#FFFFFF',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Light theme
export const lightTheme: MD3Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary.main,
    primaryContainer: palette.primary.light,
    secondary: palette.secondary.main,
    secondaryContainer: palette.secondary.light,
    tertiary: palette.accent.main,
    tertiaryContainer: palette.accent.light,
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    surfaceDisabled: palette.neutral[200],
    background: '#F9F9F9',
    error: palette.error.main,
    errorContainer: palette.error.light,
    onPrimary: palette.primary.contrast,
    onPrimaryContainer: '#000000',
    onSecondary: palette.secondary.contrast,
    onSecondaryContainer: '#000000',
    onTertiary: palette.accent.contrast,
    onTertiaryContainer: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#555555',
    onSurfaceDisabled: palette.neutral[500],
    onError: palette.error.contrast,
    onErrorContainer: '#000000',
    onBackground: '#000000',
    outline: palette.neutral[400],
    outlineVariant: palette.neutral[300],
    inverseSurface: palette.neutral[900],
    inverseOnSurface: '#FFFFFF',
    inversePrimary: palette.primary.light,
    shadow: 'rgba(0, 0, 0, 0.1)',
    scrim: 'rgba(0, 0, 0, 0.3)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    elevation: {
      level0: 'transparent',
      // Shadows for elevation levels
      level1: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      level2: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(0, 0, 0, 0.08)',
      level3: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
      level4: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.12)' 
        : 'rgba(0, 0, 0, 0.12)',
      level5: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.14)' 
        : 'rgba(0, 0, 0, 0.14)',
    },
  },
};

// Dark theme
export const darkTheme: MD3Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary.light,
    primaryContainer: palette.primary.dark,
    secondary: palette.secondary.light,
    secondaryContainer: palette.secondary.dark,
    tertiary: palette.accent.light,
    tertiaryContainer: palette.accent.dark,
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    surfaceDisabled: palette.neutral[800],
    background: '#0A0A0A',
    error: palette.error.light,
    errorContainer: palette.error.dark,
    onPrimary: '#000000',
    onPrimaryContainer: '#FFFFFF',
    onSecondary: '#000000',
    onSecondaryContainer: '#FFFFFF',
    onTertiary: '#000000',
    onTertiaryContainer: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    onSurfaceDisabled: palette.neutral[600],
    onError: '#000000',
    onErrorContainer: '#FFFFFF',
    onBackground: '#FFFFFF',
    outline: palette.neutral[500],
    outlineVariant: palette.neutral[700],
    inverseSurface: palette.neutral[100],
    inverseOnSurface: '#000000',
    inversePrimary: palette.primary.dark,
    shadow: 'rgba(0, 0, 0, 0.3)',
    scrim: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    elevation: {
      level0: 'transparent',
      // Shadows for elevation levels
      level1: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.3)' 
        : 'rgba(0, 0, 0, 0.3)',
      level2: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.4)' 
        : 'rgba(0, 0, 0, 0.4)',
      level3: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.5)' 
        : 'rgba(0, 0, 0, 0.5)',
      level4: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.6)' 
        : 'rgba(0, 0, 0, 0.6)',
      level5: Platform.OS === 'ios' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(0, 0, 0, 0.7)',
    },
  },
};

// Theme with transparency
export const getThemeWithTransparency = (isDark: boolean, opacity: number = 0.95) => {
  const baseTheme = isDark ? darkTheme : lightTheme;
  const transparentBackground = isDark 
    ? `rgba(10, 10, 10, ${opacity})` 
    : `rgba(249, 249, 249, ${opacity})`;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: transparentBackground,
      surface: isDark 
        ? `rgba(18, 18, 18, ${opacity})` 
        : `rgba(255, 255, 255, ${opacity})`,
      surfaceVariant: isDark 
        ? `rgba(30, 30, 30, ${opacity})` 
        : `rgba(245, 245, 245, ${opacity})`,
    }
  };
};

// Export the palette for use in styles
export { palette }; 