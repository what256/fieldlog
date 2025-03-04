import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import CreateNoteScreen from './src/screens/CreateNoteScreen';

// Context
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';

// UI Components
import { ToastContainer } from './src/components/ui/Toast';

export type RootStackParamList = {
  Main: undefined;
  NoteDetail: { noteId: number };
  CreateNote: undefined;
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Search: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Tab Navigator Component
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'magnify' : 'magnify';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

/**
 * Main App Component
 */
const App = () => {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
};

/**
 * App Content Component with Navigation
 */
const AppContent = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: 'Note' }} />
          <Stack.Screen name="CreateNote" component={CreateNoteScreen} options={{ title: 'Create Note' }} />
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Global Toast container for notifications */}
      <ToastContainer position="bottom" offsetY={80} />
    </>
  );
};

export default App;