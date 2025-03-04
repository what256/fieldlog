import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SPACING, BORDER_RADIUS } from '../../styles/commonStyles';

export type TagVariant = 'filled' | 'outlined' | 'ghost';

interface TagProps {
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: TagVariant;
  selected?: boolean;
  color?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({
  label,
  onPress,
  onLongPress,
  variant = 'filled',
  selected = false,
  color,
  style,
  size = 'medium',
  disabled = false,
  icon,
}) => {
  const theme = useTheme();
  
  // Calculate tag styles based on props
  const getTagStyles = (): ViewStyle => {
    // Default colors
    let backgroundColor = theme.colors.primaryContainer;
    let borderColor = 'transparent';
    let textColor = theme.colors.onPrimaryContainer;
    
    // Get custom color or use theme color
    const tagColor = color || theme.colors.primary;
    
    // Apply variant styles
    switch (variant) {
      case 'outlined':
        backgroundColor = 'transparent';
        borderColor = selected ? tagColor : theme.colors.outline;
        textColor = selected ? tagColor : theme.colors.onSurface;
        break;
      case 'ghost':
        backgroundColor = selected ? `${tagColor}30` : 'transparent';
        borderColor = 'transparent';
        textColor = selected ? tagColor : theme.colors.onSurface;
        break;
      case 'filled':
      default:
        backgroundColor = selected ? tagColor : `${tagColor}30`;
        borderColor = 'transparent';
        textColor = selected ? theme.colors.onPrimary : tagColor;
        break;
    }
    
    // Apply disabled state
    if (disabled) {
      backgroundColor = theme.colors.surfaceDisabled;
      borderColor = variant === 'outlined' ? theme.colors.surfaceDisabled : 'transparent';
      textColor = theme.colors.onSurfaceDisabled;
    }
    
    // Get size padding
    const sizePadding = {
      small: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
      },
      medium: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
      },
      large: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
      },
    };
    
    return {
      backgroundColor,
      borderColor,
      ...sizePadding[size],
    };
  };
  
  // Get text size based on tag size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      case 'medium':
      default:
        return 14;
    }
  };
  
  // Get tag style
  const tagStyle = [
    styles.tag,
    getTagStyles(),
    style,
  ];
  
  // Get text style
  const textStyle = [
    styles.text,
    { 
      fontSize: getTextSize(),
      color: disabled 
        ? theme.colors.onSurfaceDisabled 
        : getTagStyles().textColor as string,
    },
  ];
  
  // Render tag content
  const renderContent = () => (
    <>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </>
  );
  
  // If onPress is provided, make it touchable
  if (onPress) {
    return (
      <TouchableOpacity
        style={tagStyle}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  // Otherwise, render as a view
  return (
    <View style={tagStyle}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    marginRight: SPACING.xs,
    marginVertical: SPACING.xs / 2,
  },
  text: {
    fontWeight: '500',
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
});

export default Tag; 