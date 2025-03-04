import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { commonStyles, SPACING } from '../../styles/commonStyles';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
  fullscreen?: boolean;
  translucent?: boolean;
  variant?: 'default' | 'overlay' | 'inline';
  style?: ViewStyle;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  message,
  fullscreen = false,
  translucent = false,
  variant = 'default',
  style,
}) => {
  const theme = useTheme();
  
  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'overlay':
        return [
          styles.overlayContainer,
          {
            backgroundColor: translucent
              ? `${theme.dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'}`
              : theme.colors.background,
          },
        ];
      case 'inline':
        return styles.inlineContainer;
      default:
        return fullscreen
          ? [styles.fullscreenContainer, { backgroundColor: theme.colors.background }]
          : styles.defaultContainer;
    }
  };
  
  return (
    <View style={[getContainerStyle(), style]}>
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
        style={styles.indicator}
      />
      
      {message && (
        <Text
          variant="bodyMedium"
          style={[
            styles.message,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    ...commonStyles.centered,
    padding: SPACING.lg,
  },
  fullscreenContainer: {
    ...commonStyles.centered,
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayContainer: {
    ...commonStyles.centered,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  indicator: {
    marginBottom: SPACING.sm,
  },
  message: {
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default LoadingIndicator; 