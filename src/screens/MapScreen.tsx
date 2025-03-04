import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { FAB, ActivityIndicator, Text, Card, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { format } from 'date-fns';

import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../database/noteRepository';
import { getLocationHistory } from '../database/locationRepository';
import { getCurrentLocation } from '../utils/locationService';
import { RootStackParamList } from '../../App';

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { notes } = useAppContext();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  
  // Initial region (default to San Francisco)
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // Load location history and set initial region
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get location history
        const history = await getLocationHistory();
        setLocationHistory(history);
        
        // Set initial region based on current location or most recent history
        const currentLocation = await getCurrentLocation();
        
        if (currentLocation) {
          setRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else if (history.length > 0) {
          setRegion({
            latitude: history[0].latitude,
            longitude: history[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter notes with location data
  const notesWithLocation = notes.filter(
    note => note.latitude !== null && note.longitude !== null
  );
  
  // Handle note press
  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', { noteId: note.id as number });
  };
  
  // Handle go to current location
  const handleGoToCurrentLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation && mapRef.current) {
        const { latitude, longitude } = currentLocation.coords;
        
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        Alert.alert('Error', 'Unable to get current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };
  
  // Toggle location history display
  const handleToggleLocationHistory = () => {
    setShowLocationHistory(!showLocationHistory);
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {/* Notes markers */}
        {notesWithLocation.map((note) => (
          <Marker
            key={`note-${note.id}`}
            coordinate={{
              latitude: note.latitude as number,
              longitude: note.longitude as number,
            }}
            pinColor={note.is_favorite ? 'gold' : 'red'}
            title={note.title || 'Untitled Note'}
            description={format(new Date(note.timestamp), 'MMM d, yyyy')}
          >
            <Callout onPress={() => handleNotePress(note)}>
              <Card style={styles.calloutCard}>
                <Card.Content>
                  <Text variant="titleMedium" numberOfLines={1}>
                    {note.title || 'Untitled Note'}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={1}>
                    {format(new Date(note.timestamp), 'MMM d, yyyy h:mm a')}
                  </Text>
                  <Text variant="bodyMedium" numberOfLines={2}>
                    {note.content || 'No content'}
                  </Text>
                  <Text variant="bodySmall" style={styles.tapText}>
                    Tap to view details
                  </Text>
                </Card.Content>
              </Card>
            </Callout>
          </Marker>
        ))}
        
        {/* Location history markers */}
        {showLocationHistory && locationHistory.map((location, index) => (
          <Marker
            key={`history-${location.id || index}`}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="blue"
            opacity={0.7}
            title={location.location_name || 'Location History'}
            description={format(new Date(location.timestamp), 'MMM d, yyyy h:mm a')}
          />
        ))}
      </MapView>
      
      {/* FAB menu */}
      <View style={styles.fabContainer}>
        <FAB
          icon="crosshairs-gps"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleGoToCurrentLocation}
          color={theme.colors.surface}
          small
        />
        
        <FAB
          icon={showLocationHistory ? 'map-marker-off' : 'map-marker-path'}
          style={[
            styles.fab,
            {
              backgroundColor: showLocationHistory
                ? theme.colors.error
                : theme.colors.primary,
            },
          ]}
          onPress={handleToggleLocationHistory}
          color={theme.colors.surface}
          small
        />
      </View>
      
      {/* Empty state */}
      {notesWithLocation.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No notes with location data.
            Create notes with location to see them on the map.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutCard: {
    width: 200,
    borderRadius: 8,
  },
  tapText: {
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'column',
  },
  fab: {
    margin: 8,
  },
  emptyContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
  },
});

// Dark mode map style
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#bdbdbd',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#181818',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#1b1b1b',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#2c2c2c',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#8a8a8a',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      {
        color: '#373737',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#3c3c3c',
      },
    ],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [
      {
        color: '#4e4e4e',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#3d3d3d',
      },
    ],
  },
];

export default MapScreen; 