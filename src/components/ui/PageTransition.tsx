import React, { useEffect } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { AnimationPresets } from '../../utils/AnimationUtils';

type TransitionType = 'fade' | 'slideFromRight' | 'slideFromBottom' | 'scale' | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  enabled?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  style,
  enabled = true,
}) => {
  const animation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled) {
      // Reset animation when type changes
      animation.setValue(0);
      
      Animated.timing(animation, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: AnimationPresets.gentle.easing,
      }).start();
    }
  }, [animation, type, duration, delay, enabled]);

  const getAnimatedStyle = (): ViewStyle => {
    if (!enabled) return {};
    
    switch (type) {
      case 'fade':
        return {
          opacity: animation,
        };
      
      case 'slideFromRight':
        return {
          opacity: animation,
          transform: [
            {
              translateX: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        };
      
      case 'slideFromBottom':
        return {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        };
      
      case 'scale':
        return {
          opacity: animation,
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      
      default:
        return {};
    }
  };

  return (
    <Animated.View style={[styles.container, style, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PageTransition; 