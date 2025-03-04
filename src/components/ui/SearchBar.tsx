import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  ViewStyle,
} from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { SPACING, getShadow, BORDER_RADIUS } from '../../styles/commonStyles';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  icon?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onClear,
  onFocus,
  onBlur,
  onSubmitEditing,
  autoFocus = false,
  style,
  inputStyle,
  icon = 'magnify',
  returnKeyType = 'search',
  disabled = false,
}) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(autoFocus);
  
  // Animation values
  const [focusAnim] = useState(new Animated.Value(0));
  const [clearOpacity] = useState(new Animated.Value(0));
  
  // Update clear button visibility when value changes
  useEffect(() => {
    Animated.timing(clearOpacity, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, clearOpacity]);
  
  // Handle focus animations
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);
  
  // Calculate derived styles
  const containerBackgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.dark 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
      theme.colors.surface,
    ],
  });
  
  const containerBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', theme.colors.primary],
  });
  
  const iconColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.onSurfaceVariant, theme.colors.primary],
  });
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };
  
  // Handle clear
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: containerBackgroundColor,
          borderColor: containerBorderColor,
          ...getShadow(isFocused ? 3 : 1),
        },
        style,
      ]}
    >
      {/* Search Icon */}
      <Animated.View style={styles.iconContainer}>
        <IconButton
          icon={icon}
          size={20}
          iconColor={iconColor as any}
          style={styles.icon}
        />
      </Animated.View>
      
      {/* Text Input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { 
            color: theme.colors.onSurface,
            placeholderTextColor: theme.colors.onSurfaceVariant,
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        editable={!disabled}
        selectionColor={theme.colors.primary}
      />
      
      {/* Clear Button */}
      <Animated.View
        style={[styles.clearContainer, { opacity: clearOpacity }]}
        pointerEvents={value.length > 0 ? 'auto' : 'none'}
      >
        <IconButton
          icon="close"
          size={18}
          iconColor={theme.colors.onSurfaceVariant}
          style={styles.clearIcon}
          onPress={handleClear}
          disabled={disabled}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    height: 48,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  iconContainer: {
    paddingLeft: SPACING.xs,
  },
  icon: {
    margin: 0,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingHorizontal: SPACING.xs,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  clearContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    margin: 0,
  },
});

export default SearchBar; 