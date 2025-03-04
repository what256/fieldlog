import { Animated, Easing, ViewStyle, TransformsStyle } from 'react-native';

// Define a custom type for Animated styles to fix TypeScript errors
type AnimatedStyle = {
  [key: string]: any;
};

/**
 * Animation presets that can be used throughout the app
 */
export const AnimationPresets = {
  spring: {
    friction: 7,
    tension: 40,
    useNativeDriver: true
  },
  gentle: {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: true
  },
  bounce: {
    duration: 400,
    easing: Easing.elastic(1.2),
    useNativeDriver: true
  },
  popIn: {
    duration: 250,
    easing: Easing.back(1.5),
    useNativeDriver: true
  },
  fadeIn: {
    duration: 250,
    easing: Easing.ease,
    useNativeDriver: true
  },
  stagger: (delay: number = 50) => ({
    useNativeDriver: true,
    delay
  })
};

/**
 * Creates an animated stagger sequence for multiple items
 */
export const createStaggeredAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 50
): Animated.CompositeAnimation => {
  return Animated.stagger(
    staggerDelay,
    animations
  );
};

/**
 * Creates a fade-in animation
 */
export const createFadeInAnimation = (
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true
  });
};

/**
 * Creates a scale animation
 */
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  config = AnimationPresets.spring
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    ...config
  });
};

/**
 * Creates a slide animation
 */
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  config = AnimationPresets.gentle
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    ...config
  });
};

/**
 * Get interpolated opacity style from scroll position
 */
export const getScrollBasedOpacity = (
  scrollY: Animated.Value,
  inputRange: number[] = [0, 50],
  outputRange: number[] = [0, 1]
): AnimatedStyle => {
  const opacity = scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp'
  });
  
  return { opacity };
};

/**
 * Get interpolated translation style from scroll position
 */
export const getScrollBasedTranslation = (
  scrollY: Animated.Value,
  axis: 'x' | 'y' = 'y',
  inputRange: number[] = [0, 100],
  outputRange: number[] = [0, -20]
): AnimatedStyle => {
  const translation = scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp'
  });
  
  return axis === 'y' 
    ? { transform: [{ translateY: translation }] } 
    : { transform: [{ translateX: translation }] };
};

/**
 * Creates a shared element transition config
 */
export const createSharedElementTransition = (id: string) => ({
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 300,
        damping: 30,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 300,
        damping: 30,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  sharedElementsConfig: () => [{ id }],
}); 