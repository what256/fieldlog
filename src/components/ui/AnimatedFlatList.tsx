import React, { useRef, useState, useEffect } from 'react';
import { 
  Animated, 
  FlatList, 
  FlatListProps, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { AnimationPresets } from '../../utils/AnimationUtils';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: { item: T; index: number; animatedValue: Animated.Value }) => React.ReactElement;
  animationType?: 'fade' | 'slide' | 'scale' | 'none';
  animationDuration?: number;
  useStaggeredAnimation?: boolean;
  staggerDelay?: number;
  extraData?: any;
}

function AnimatedFlatList<T>({
  data,
  renderItem,
  animationType = 'fade',
  animationDuration = 300,
  useStaggeredAnimation = true,
  staggerDelay = 50,
  extraData,
  ...rest
}: AnimatedFlatListProps<T>) {
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const animationsStarted = useRef(false);
  const previousDataLength = useRef(0);

  // Initialize or update animated values when data changes
  useEffect(() => {
    if (!data) return;
    
    const dataLength = data.length;
    
    // If we're adding items, configure animations for the new items
    if (dataLength > previousDataLength.current) {
      const newValues = [...animatedValues];
      
      // Add new animated values for new items
      for (let i = previousDataLength.current; i < dataLength; i++) {
        newValues[i] = new Animated.Value(0);
      }
      
      setAnimatedValues(newValues);
      
      // Start animations if not already started
      if (!animationsStarted.current && dataLength > 0) {
        animationsStarted.current = true;
        
        // Use layout animation for smoother transitions when adding/removing items
        LayoutAnimation.configureNext({
          duration: animationDuration,
          update: { type: 'easeInEaseOut' },
          create: { type: 'easeInEaseOut', property: 'opacity' },
          delete: { type: 'easeInEaseOut', property: 'opacity' }
        });
        
        // Create animations for each item
        const animations = newValues.map((value, index) => {
          const delay = useStaggeredAnimation ? index * staggerDelay : 0;
          
          return Animated.timing(value, {
            toValue: 1,
            duration: animationDuration,
            delay,
            useNativeDriver: true,
            easing: AnimationPresets.gentle.easing
          });
        });
        
        // Start all animations
        Animated.parallel(animations).start();
      }
    } else if (dataLength < previousDataLength.current) {
      // Handle case when items are removed
      if (dataLength === 0) {
        setAnimatedValues([]);
        animationsStarted.current = false;
      } else {
        setAnimatedValues(animatedValues.slice(0, dataLength));
        
        LayoutAnimation.configureNext({
          duration: 200,
          delete: { type: 'easeInEaseOut', property: 'opacity' }
        });
      }
    }
    
    previousDataLength.current = dataLength;
  }, [data, animationDuration, useStaggeredAnimation, staggerDelay]);

  // Reset animations when extraData changes
  useEffect(() => {
    if (animationsStarted.current) {
      animationsStarted.current = false;
      
      // Reset all animated values
      const newValues = animatedValues.map(() => new Animated.Value(0));
      setAnimatedValues(newValues);
      
      // Restart animations
      setTimeout(() => {
        animationsStarted.current = true;
        
        const animations = newValues.map((value, index) => {
          const delay = useStaggeredAnimation ? index * staggerDelay : 0;
          
          return Animated.timing(value, {
            toValue: 1,
            duration: animationDuration,
            delay,
            useNativeDriver: true,
            easing: AnimationPresets.gentle.easing
          });
        });
        
        Animated.parallel(animations).start();
      }, 50);
    }
  }, [extraData]);

  // Enhanced renderItem that passes the animated value
  const renderItemWithAnimation = ({ item, index, ...rest }: any) => {
    if (!animatedValues[index]) return null;
    
    return renderItem({ 
      item, 
      index, 
      animatedValue: animatedValues[index],
      ...rest 
    });
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItemWithAnimation}
      extraData={animatedValues}
      {...rest}
    />
  );
}

export default AnimatedFlatList; 