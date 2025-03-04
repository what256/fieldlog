import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated, StatusBar } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPACING, getShadow } from '../../styles/commonStyles';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  elevated?: boolean;
  scrollY?: Animated.Value;
  actions?: ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor,
  elevated = false,
  scrollY,
  actions,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate header height with safe area
  const headerHeight = 56 + insets.top;
  
  // Calculate opacity for elevation shadow based on scroll
  const shadowOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 20, 40],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
      })
    : elevated
    ? 1
    : 0;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || theme.colors.surface,
          paddingTop: insets.top,
          height: headerHeight,
          ...getShadow(3),
          shadowOpacity: shadowOpacity as any,
        },
      ]}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        translucent
      />
      
      <View style={styles.content}>
        {/* Left icon or button */}
        {leftIcon && (
          <IconButton
            icon={leftIcon}
            size={24}
            onPress={onLeftPress}
            style={styles.leftIcon}
          />
        )}
        
        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          
          {subtitle && (
            <Text
              variant="bodySmall"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        
        {/* Custom actions */}
        {actions ? (
          <View style={styles.actionsContainer}>{actions}</View>
        ) : (
          /* Right icon or button */
          rightIcon && (
            <IconButton
              icon={rightIcon}
              size={24}
              onPress={onRightPress}
              style={styles.rightIcon}
            />
          )
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ScreenHeader; 