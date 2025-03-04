import React, { useState } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleOnPress?: boolean;
  style?: ViewStyle;
  feedbackColor?: string;
  feedbackDuration?: number;
  activeScale?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  scaleOnPress = true,
  style,
  feedbackColor,
  feedbackDuration = 150,
  activeScale = 0.96,
  onPress,
  ...props
}) => {
  const theme = useTheme();
  
  // Animation values
  const [scaleValue] = useState(new Animated.Value(1));
  const [feedbackOpacity] = useState(new Animated.Value(0));
  
  // Handle press in
  const handlePressIn = () => {
    if (scaleOnPress) {
      Animated.timing(scaleValue, {
        toValue: activeScale,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
    
    if (feedbackColor) {
      Animated.timing(feedbackOpacity, {
        toValue: 0.1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Handle press out
  const handlePressOut = () => {
    if (scaleOnPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
    
    if (feedbackColor) {
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: feedbackDuration,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={style}
      {...props}
    >
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        {children}
        
        {feedbackColor && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: feedbackColor || theme.colors.primary,
                opacity: feedbackOpacity,
                borderRadius: 8,
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});

export default AnimatedButton; 