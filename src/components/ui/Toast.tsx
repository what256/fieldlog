import React, { useEffect, useRef, useState } from 'react';
import { 
  Animated, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { getShadow } from '../../styles/commonStyles';

type ToastType = 'success' | 'error' | 'info' | 'warning';

// Singleton pattern to manage toast instances
class ToastManager {
  static instance: ToastManager;
  private showToastFunction: (message: string, type?: ToastType, duration?: number) => void = () => {};
  private hideToastFunction: () => void = () => {};

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setShowToast(showFn: (message: string, type?: ToastType, duration?: number) => void) {
    this.showToastFunction = showFn;
  }

  setHideToast(hideFn: () => void) {
    this.hideToastFunction = hideFn;
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    this.showToastFunction(message, type, duration);
  }

  hide() {
    this.hideToastFunction();
  }
}

export const Toast = {
  show: (message: string, type: ToastType = 'info', duration: number = 3000) => {
    ToastManager.getInstance().show(message, type, duration);
  },
  hide: () => {
    ToastManager.getInstance().hide();
  }
};

interface ToastContainerProps {
  position?: 'top' | 'bottom';
  offsetY?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'bottom',
  offsetY = 70,
  containerStyle,
  textStyle,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState<ToastType>('info');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.tertiary;
      case 'info':
      default:
        return theme.colors.secondary;
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'alert-outline';
      case 'info':
      default:
        return 'information-outline';
    }
  };

  const showToast = (text: string, toastType: ToastType = 'info', duration: number = 3000) => {
    // Clear existing timeout if there is one
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    setMessage(text);
    setType(toastType);
    setIsVisible(true);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    timeout.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  useEffect(() => {
    // Register the show/hide functions with the ToastManager
    ToastManager.getInstance().setShowToast(showToast);
    ToastManager.getInstance().setHideToast(hideToast);

    return () => {
      // Cleanup timeout on unmount
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [position]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          [position]: offsetY,
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: theme.colors.elevation.level1,
          borderLeftColor: getToastColor(),
        },
        containerStyle,
        getShadow(5),
      ]}
    >
      <View style={styles.iconContainer}>
        <IconButton
          icon={getToastIcon()}
          size={24}
          iconColor={getToastColor()}
        />
      </View>
      <Text style={[styles.text, { color: theme.colors.onSurface }, textStyle]}>
        {message}
      </Text>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <IconButton
          icon="close"
          size={18}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minHeight: 50,
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderLeftWidth: 4,
    elevation: 5,
    zIndex: 9999,
  },
  iconContainer: {
    marginLeft: 4,
  },
  text: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 