import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

type IllustrationType = 
  | 'empty-notes'
  | 'no-results'
  | 'welcome'
  | 'location'
  | 'voice'
  | 'favorites'
  | 'success';

interface IllustrationProps {
  type: IllustrationType;
  size?: number;
  style?: ViewStyle;
  color?: string;
}

const Illustration: React.FC<IllustrationProps> = ({
  type,
  size = 200,
  style,
  color
}) => {
  const { theme, isDark } = useTheme();
  
  const primaryColor = color || theme.colors.primary;
  const secondaryColor = theme.colors.secondary;
  const tertiaryColor = theme.colors.tertiary;
  const backgroundColor = isDark ? theme.colors.elevation.level2 : theme.colors.elevation.level1;
  
  const renderIllustration = () => {
    switch (type) {
      case 'empty-notes':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Rect x="40" y="30" width="120" height="140" rx="10" fill={backgroundColor} />
            <G opacity="0.9">
              <Rect x="55" y="50" width="90" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="55" y="70" width="70" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="55" y="90" width="90" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="55" y="110" width="50" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="55" y="130" width="75" height="10" rx="2" fill={primaryColor} opacity="0.3" />
            </G>
            <Circle cx="150" cy="50" r="20" fill="url(#gradient)" />
            <Path
              d="M145 50 L150 55 L160 45"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      
      case 'no-results':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={tertiaryColor} stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Circle cx="85" cy="85" r="40" fill={backgroundColor} strokeWidth="5" stroke="url(#searchGradient)" />
            <Path
              d="M115 115 L140 140"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="url(#searchGradient)"
            />
            <Path
              d="M85 65 L85 105 M65 85 L105 85"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />
          </Svg>
        );
      
      case 'welcome':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="welcomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Rect x="20" y="60" width="160" height="100" rx="10" fill={backgroundColor} />
            <Path
              d="M20 70 Q100 20 180 70"
              stroke="url(#welcomeGradient)"
              strokeWidth="10"
              fill="none"
            />
            <G opacity="0.8">
              <Rect x="40" y="80" width="120" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="40" y="100" width="100" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="40" y="120" width="80" height="10" rx="2" fill={primaryColor} opacity="0.3" />
              <Rect x="40" y="140" width="60" height="10" rx="2" fill={primaryColor} opacity="0.3" />
            </G>
            <Circle cx="160" cy="50" r="15" fill="url(#welcomeGradient)" />
          </Svg>
        );
      
      case 'location':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="locationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={tertiaryColor} stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="60" fill={backgroundColor} />
            <Path
              d="M100 60 C80 60 65 75 65 95 C65 115 85 135 100 150 C115 135 135 115 135 95 C135 75 120 60 100 60 Z"
              fill="url(#locationGradient)"
            />
            <Circle cx="100" cy="95" r="15" fill="white" fillOpacity="0.8" />
          </Svg>
        );
      
      case 'voice':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="voiceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={tertiaryColor} stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="60" fill={backgroundColor} />
            <Rect x="85" y="60" width="30" height="80" rx="15" fill="url(#voiceGradient)" />
            <Path
              d="M60 100 L60 110 C60 130 80 145 100 145 C120 145 140 130 140 110 L140 100"
              stroke="url(#voiceGradient)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M100 145 L100 160 M80 160 L120 160"
              stroke="url(#voiceGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'favorites':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="favGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="60" fill={backgroundColor} />
            <Path
              d="M100 140 L130 110 C140 100 140 85 130 75 C120 65 105 65 95 75 L100 80 L105 75 C115 65 130 65 140 75 C150 85 150 100 140 110 L100 150 L60 110 C50 100 50 85 60 75 C70 65 85 65 95 75 L100 80 L105 75 C95 65 80 65 70 75 C60 85 60 100 70 110 L100 140Z"
              fill="url(#favGradient)"
            />
          </Svg>
        );
      
      case 'success':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0.9" />
              </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="60" fill={backgroundColor} />
            <Circle cx="100" cy="100" r="50" fill="url(#successGradient)" />
            <Path
              d="M80 100 L95 115 L125 85"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      
      default:
        return <View style={{ width: size, height: size }} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderIllustration()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Illustration; 