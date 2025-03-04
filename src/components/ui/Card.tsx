import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { commonStyles, getShadow, SPACING } from '../../styles/commonStyles';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  disabled = false,
  testID,
}) => {
  const theme = useTheme();
  
  // Dynamic styles based on variant
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      margin: SPACING.sm,
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...getShadow(4),
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
          margin: 0,
          borderRadius: 0,
        };
      default:
        return {
          ...baseStyle,
          ...getShadow(2),
        };
    }
  };
  
  const cardStyle = [
    getCardStyle(),
    disabled && styles.disabled,
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

interface CardSectionProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardSectionProps> = ({ children, style }) => (
  <View style={[styles.cardHeader, style]}>
    {children}
  </View>
);

export const CardContent: React.FC<CardSectionProps> = ({ children, style }) => (
  <View style={[styles.cardContent, style]}>
    {children}
  </View>
);

export const CardFooter: React.FC<CardSectionProps> = ({ children, style }) => (
  <View style={[styles.cardFooter, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  cardHeader: {
    marginBottom: SPACING.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Card;