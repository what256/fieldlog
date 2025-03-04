import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { Toast } from './ui/Toast';
import Card, { CardContent, CardHeader, CardFooter } from './ui/Card';
import Illustration from './ui/Illustrations';
import AnimatedButton from './ui/AnimatedButton';
import PageTransition from './ui/PageTransition';
import { hp, wp } from '../styles/commonStyles';

// Define a type that allows any object to be used as a style
type AnimatedButtonStyle = any;

const Example = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [animationType, setAnimationType] = useState<'fade' | 'slideFromRight' | 'slideFromBottom' | 'scale'>('fade');

  const showToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    Toast.show(`This is a ${type} message`, type, 3000);
  };

  return (
    <PageTransition type={animationType}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text variant="headlineMedium" style={styles.title}>UI Components</Text>
        
        {/* Theme Toggle */}
        <Card variant="outlined" style={styles.card}>
          <CardHeader>
            <Text variant="titleMedium">Theme</Text>
          </CardHeader>
          <CardContent>
            <Text variant="bodyMedium">Current theme: {isDark ? 'Dark' : 'Light'}</Text>
          </CardContent>
          <CardFooter>
            <Button mode="outlined" onPress={toggleTheme}>
              Toggle Theme
            </Button>
          </CardFooter>
        </Card>

        {/* Toast Examples */}
        <Card variant="elevated" style={styles.card}>
          <CardHeader>
            <Text variant="titleMedium">Toast Notifications</Text>
          </CardHeader>
          <CardContent>
            <Text variant="bodyMedium">Display different types of toast messages</Text>
          </CardContent>
          <CardFooter style={styles.toastButtons}>
            <Button mode="outlined" onPress={() => showToast('success')}>
              Success
            </Button>
            <Button mode="outlined" onPress={() => showToast('info')}>
              Info
            </Button>
            <Button mode="outlined" onPress={() => showToast('warning')}>
              Warning
            </Button>
            <Button mode="outlined" onPress={() => showToast('error')}>
              Error
            </Button>
          </CardFooter>
        </Card>

        {/* Illustrations */}
        <Card variant="flat" style={styles.card}>
          <CardHeader>
            <Text variant="titleMedium">Illustrations</Text>
          </CardHeader>
          <CardContent style={styles.illustrationsContainer}>
            <View style={styles.illustrationRow}>
              <View style={styles.illustrationItem}>
                <Illustration type="empty-notes" size={100} />
                <Text variant="labelSmall">Empty Notes</Text>
              </View>
              <View style={styles.illustrationItem}>
                <Illustration type="no-results" size={100} />
                <Text variant="labelSmall">No Results</Text>
              </View>
            </View>
            <View style={styles.illustrationRow}>
              <View style={styles.illustrationItem}>
                <Illustration type="location" size={100} />
                <Text variant="labelSmall">Location</Text>
              </View>
              <View style={styles.illustrationItem}>
                <Illustration type="voice" size={100} />
                <Text variant="labelSmall">Voice</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Animated Buttons */}
        <Card variant="default" style={styles.card}>
          <CardHeader>
            <Text variant="titleMedium">Animated Buttons</Text>
          </CardHeader>
          <CardContent>
            <Text variant="bodyMedium">Buttons with feedback animations</Text>
          </CardContent>
          <CardFooter style={styles.animatedButtonsContainer}>
            <AnimatedButton 
              style={{ 
                ...styles.animatedButton, 
                backgroundColor: theme.colors.primary
              } as AnimatedButtonStyle}
              onPress={() => Toast.show('Primary button pressed!')}
            >
              <Text style={{ color: theme.colors.onPrimary }}>Primary</Text>
            </AnimatedButton>
            
            <AnimatedButton 
              style={{ 
                ...styles.animatedButton, 
                backgroundColor: theme.colors.secondary
              } as AnimatedButtonStyle}
              onPress={() => Toast.show('Secondary button pressed!')}
              feedbackColor={theme.colors.secondaryContainer}
            >
              <Text style={{ color: theme.colors.onSecondary }}>Secondary</Text>
            </AnimatedButton>
            
            <AnimatedButton 
              style={{ 
                ...styles.animatedButton, 
                backgroundColor: theme.colors.tertiary
              } as AnimatedButtonStyle}
              onPress={() => Toast.show('Tertiary button pressed!')}
              activeScale={0.9}
            >
              <Text style={{ color: theme.colors.onTertiary }}>Tertiary</Text>
            </AnimatedButton>
          </CardFooter>
        </Card>

        {/* Page Transitions */}
        <Card variant="outlined" style={styles.card}>
          <CardHeader>
            <Text variant="titleMedium">Page Transitions</Text>
          </CardHeader>
          <CardContent>
            <Text variant="bodyMedium">Try different transition animations</Text>
          </CardContent>
          <CardFooter style={styles.transitionButtons}>
            <Button mode="outlined" onPress={() => setAnimationType('fade')}>
              Fade
            </Button>
            <Button mode="outlined" onPress={() => setAnimationType('slideFromRight')}>
              Slide
            </Button>
            <Button mode="outlined" onPress={() => setAnimationType('slideFromBottom')}>
              Rise
            </Button>
            <Button mode="outlined" onPress={() => setAnimationType('scale')}>
              Scale
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  title: {
    marginBottom: hp(2),
    textAlign: 'center',
  },
  card: {
    marginBottom: hp(2),
  },
  toastButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  illustrationsContainer: {
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  illustrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: hp(2),
  },
  illustrationItem: {
    alignItems: 'center',
  },
  animatedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  animatedButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(25),
  },
  transitionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: wp(2),
  },
});

export default Example; 