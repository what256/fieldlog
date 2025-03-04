import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Note, getAllNotes, getFavoriteNotes } from '../database/noteRepository';
import { initDatabase } from '../database/database';
import { startLocationTracking, stopLocationTracking, isTrackingActive } from '../utils/locationService';
import { getLocationHistory, LocationData } from '../database/locationRepository';

// Define settings interface
export interface AppSettings {
  trackLocation: boolean;
  highAccuracy: boolean;
  voiceCommands: boolean;
  textToSpeech: boolean;
  [key: string]: boolean | string | number;
}

// Define context type
export interface AppContextType {
  notes: Note[];
  favoriteNotes: Note[];
  locationHistory: LocationData[];
  settings: AppSettings;
  isLoading: boolean;
  isLocationTrackingEnabled: boolean;
  isDarkMode: boolean;
  refreshNotes: () => Promise<void>;
  refreshLocationHistory: () => Promise<void>;
  updateSettings: (newSettings: AppSettings) => void;
  toggleLocationTracking: () => Promise<void>;
  toggleDarkMode: () => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  notes: [],
  favoriteNotes: [],
  locationHistory: [],
  settings: {
    trackLocation: false,
    highAccuracy: false,
    voiceCommands: false,
    textToSpeech: false,
  },
  isLoading: true,
  isLocationTrackingEnabled: false,
  isDarkMode: false,
  refreshNotes: async () => {},
  refreshLocationHistory: async () => {},
  updateSettings: () => {},
  toggleLocationTracking: async () => {},
  toggleDarkMode: () => {},
});

// Storage keys
const DARK_MODE_KEY = 'fieldlog_dark_mode';
const LOCATION_TRACKING_KEY = 'fieldlog_location_tracking';

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>({
    trackLocation: false,
    highAccuracy: false,
    voiceCommands: false,
    textToSpeech: false,
  });

  // Initialize the app
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database
        initDatabase();
        
        // Load settings from AsyncStorage
        const darkModeSetting = await AsyncStorage.getItem(DARK_MODE_KEY);
        setIsDarkMode(darkModeSetting === 'true');
        
        const locationTrackingSetting = await AsyncStorage.getItem(LOCATION_TRACKING_KEY);
        const shouldTrack = locationTrackingSetting === 'true';
        setIsLocationTrackingEnabled(shouldTrack);
        
        // Start location tracking if enabled
        if (shouldTrack) {
          await startLocationTracking();
        }
        
        // Load notes
        await refreshNotes();
        await refreshLocationHistory();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initApp();
    
    // Cleanup on unmount
    return () => {
      if (isLocationTrackingEnabled) {
        stopLocationTracking();
      }
    };
  }, []);

  // Refresh notes
  const refreshNotes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const allNotes = await getAllNotes();
      setNotes(allNotes);
      
      const favorites = await getFavoriteNotes();
      setFavoriteNotes(favorites);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh location history
  const refreshLocationHistory = async (): Promise<void> => {
    try {
      const fetchedLocations = await getLocationHistory();
      setLocationHistory(fetchedLocations);
    } catch (error) {
      console.error('Error refreshing location history:', error);
    }
  };

  // Toggle location tracking
  const toggleLocationTracking = async (): Promise<void> => {
    try {
      const newValue = !isLocationTrackingEnabled;
      
      if (newValue) {
        await startLocationTracking();
      } else {
        stopLocationTracking();
      }
      
      setIsLocationTrackingEnabled(newValue);
      await AsyncStorage.setItem(LOCATION_TRACKING_KEY, String(newValue));
    } catch (error) {
      console.error('Error toggling location tracking:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = (): void => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    AsyncStorage.setItem(DARK_MODE_KEY, String(newValue));
  };

  // Update settings
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Save settings to storage if needed
  };

  // Context value
  const value: AppContextType = {
    notes,
    favoriteNotes,
    locationHistory,
    settings,
    isLoading,
    isLocationTrackingEnabled,
    isDarkMode,
    refreshNotes,
    refreshLocationHistory,
    updateSettings,
    toggleLocationTracking,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}; 