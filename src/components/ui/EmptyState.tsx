import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme, Button, Icon } from 'react-native-paper';
import { commonStyles, SPACING } from '../../styles/commonStyles';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  iconSize?: number;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  imageSource?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'information-outline',
  iconSize = 64,
  actionLabel,
  onAction,
  style,
  imageSource,
}) => {
  const theme = useTheme();
  
  return (
    <View style={[commonStyles.centered, styles.container, style]}>
      {imageSource ? (
        <View style={styles.imageContainer}>
          <imageSource width={200} height={200} />
        </View>
      ) : (
        <Icon
          source={icon}
          size={iconSize}
          color={theme.colors.primary}
          style={styles.icon}
        />
      )}
      
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {title}
      </Text>
      
      <Text
        variant="bodyMedium"
        style={[
          styles.message,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
  },
  icon: {
    marginBottom: SPACING.md,
  },
  imageContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: SPACING.lg,
    maxWidth: '80%',
  },
  actionButton: {
    marginTop: SPACING.md,
  },
});

export default EmptyState; 