import * as Location from 'expo-location';
import { saveLocation } from '../database/locationRepository';

// Time interval for location tracking (30 minutes in milliseconds)
const LOCATION_INTERVAL = 30 * 60 * 1000;

// Accuracy of location tracking
const LOCATION_ACCURACY = Location.Accuracy.Balanced;

// Flag to track if location tracking is active
let isLocationTrackingActive = false;

// Timer ID for periodic location updates
let locationTimerId: NodeJS.Timeout | null = null;

/**
 * Request location permissions from the user
 * @returns Promise resolving to boolean indicating if permissions were granted
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }
    
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('Background location permission denied');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Get the current location
 * @returns Promise resolving to the current location
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermissions = await requestLocationPermissions();
    
    if (!hasPermissions) {
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: LOCATION_ACCURACY
    });
    
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Start tracking location in the background
 * @returns Promise resolving to boolean indicating if tracking was started
 */
export const startLocationTracking = async (): Promise<boolean> => {
  try {
    // Check if tracking is already active
    if (isLocationTrackingActive) {
      return true;
    }
    
    const hasPermissions = await requestLocationPermissions();
    
    if (!hasPermissions) {
      return false;
    }
    
    // Get and save the initial location
    const initialLocation = await getCurrentLocation();
    
    if (initialLocation) {
      await saveLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        timestamp: initialLocation.timestamp,
      });
    }
    
    // Set up periodic location tracking
    locationTimerId = setInterval(async () => {
      try {
        const location = await getCurrentLocation();
        
        if (location) {
          await saveLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          });
        }
      } catch (error) {
        console.error('Error in periodic location tracking:', error);
      }
    }, LOCATION_INTERVAL);
    
    isLocationTrackingActive = true;
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

/**
 * Stop tracking location
 */
export const stopLocationTracking = (): void => {
  if (locationTimerId) {
    clearInterval(locationTimerId);
    locationTimerId = null;
  }
  
  isLocationTrackingActive = false;
};

/**
 * Check if location tracking is active
 * @returns Boolean indicating if location tracking is active
 */
export const isTrackingActive = (): boolean => {
  return isLocationTrackingActive;
};

/**
 * Get a human-readable address from coordinates
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise resolving to address string or null
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      const parts = [
        address.name,
        address.street,
        address.city,
        address.region,
        address.country
      ].filter(Boolean);
      
      return parts.join(', ');
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return null;
  }
}; 