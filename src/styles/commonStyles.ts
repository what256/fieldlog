import { StyleSheet, Dimensions, Platform } from 'react-native';
import { palette } from './theme';

// Get screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive size utilities
export const wp = (percentage: number) => {
  return (percentage * SCREEN_WIDTH) / 100;
};

export const hp = (percentage: number) => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadow styles for different platforms
export const getShadow = (elevation: number = 2) => {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1 + elevation * 0.05,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {
      elevation,
    },
  });
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Cards
  card: {
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
    ...getShadow(3),
  },
  cardCompact: {
    borderRadius: 12,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    ...getShadow(2),
  },
  cardHeader: {
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  
  // Forms
  formContainer: {
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  
  // Buttons
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  iconButton: {
    margin: SPACING.xs,
  },
  
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    color: palette.error.main,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  
  // Misc
  divider: {
    height: 1,
    width: '100%',
    marginVertical: SPACING.md,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
});

// Helper for responsive padding based on screen size
export const getResponsivePadding = () => {
  if (SCREEN_WIDTH > 600) {
    return SPACING.lg;
  }
  return SPACING.md;
};

// Helper for consistent border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
}; 