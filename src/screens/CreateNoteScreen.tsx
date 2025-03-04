import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Chip, IconButton, Text, ActivityIndicator, FAB, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Note, saveNote } from '../database/noteRepository';
import { RootStackParamList } from '../../App';
import { getCurrentLocation, getAddressFromCoordinates } from '../utils/locationService';
import { startVoiceRecognition, stopVoiceRecognition } from '../utils/speechService';

type CreateNoteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Available colors for notes
const NOTE_COLORS = [
  '#FFFFFF', // Default (white)
  '#F8BBD0', // Pink
  '#E1BEE7', // Purple
  '#D1C4E9', // Deep Purple
  '#C5CAE9', // Indigo
  '#BBDEFB', // Blue
  '#B3E5FC', // Light Blue
  '#B2EBF2', // Cyan
  '#B2DFDB', // Teal
  '#C8E6C9', // Green
  '#DCEDC8', // Light Green
  '#F0F4C3', // Lime
  '#FFF9C4', // Yellow
  '#FFECB3', // Amber
  '#FFE0B2', // Orange
  '#FFCCBC', // Deep Orange
];

const CreateNoteScreen = () => {
  const navigation = useNavigation<CreateNoteScreenNavigationProp>();
  const { refreshNotes } = useAppContext();
  const { theme } = useTheme();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Set up navigation options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          mode="text"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving || !content.trim()}
        >
          Save
        </Button>
      ),
    });
  }, [navigation, title, content, tags, selectedColor, isFavorite, location, isSaving]);
  
  // Get current location
  const handleGetLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setLocation({
          latitude,
          longitude,
          name: address || undefined,
        });
      } else {
        Alert.alert('Error', 'Unable to get current location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Toggle voice recording
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      stopVoiceRecognition();
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      
      startVoiceRecognition(
        (text) => {
          // Append recognized text to content
          setContent(prevContent => {
            return prevContent ? `${prevContent}\n${text}` : text;
          });
          setIsRecording(false);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          Alert.alert('Error', 'Voice recognition failed');
          setIsRecording(false);
        }
      );
    }
  };
  
  // Save the note
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Note content cannot be empty');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const now = Date.now();
      
      const newNote: Note = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        timestamp: now,
        latitude: location?.latitude,
        longitude: location?.longitude,
        location_name: location?.name,
        color: selectedColor !== NOTE_COLORS[0] ? selectedColor : undefined,
        is_favorite: isFavorite,
        created_at: now,
        updated_at: now,
        tags: tags.length > 0 ? tags : undefined,
      };
      
      await saveNote(newNote);
      await refreshNotes();
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title input */}
          <TextInput
            label="Title (optional)"
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { backgroundColor: selectedColor }]}
            mode="outlined"
          />
          
          {/* Content input */}
          <TextInput
            label="Note content"
            value={content}
            onChangeText={setContent}
            multiline
            style={[styles.contentInput, { backgroundColor: selectedColor }]}
            mode="outlined"
            numberOfLines={10}
          />
          
          {/* Tags section */}
          <View style={styles.tagsSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Tags</Text>
            
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Add tag"
                value={currentTag}
                onChangeText={setCurrentTag}
                style={styles.tagInput}
                mode="outlined"
                dense
                right={
                  <TextInput.Icon
                    icon="plus"
                    onPress={handleAddTag}
                    disabled={!currentTag.trim()}
                  />
                }
                onSubmitEditing={handleAddTag}
              />
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    style={styles.tag}
                    onClose={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>
          
          {/* Color picker */}
          <View style={styles.colorSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Note Color</Text>
            
            <View style={styles.colorPicker}>
              {NOTE_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
          
          {/* Additional options */}
          <View style={styles.optionsSection}>
            <View style={styles.optionRow}>
              <Text>Favorite</Text>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                color={theme.colors.primary}
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text>Location</Text>
              <Button
                mode="outlined"
                onPress={handleGetLocation}
                loading={isLoadingLocation}
                disabled={isLoadingLocation}
                icon="map-marker"
                compact
              >
                {location ? 'Update Location' : 'Add Location'}
              </Button>
            </View>
            
            {location && (
              <Text variant="bodySmall" style={styles.locationText}>
                📍 {location.name || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </Text>
            )}
          </View>
        </ScrollView>
        
        {/* Voice recording button */}
        <FAB
          icon={isRecording ? 'microphone-off' : 'microphone'}
          style={[
            styles.fab,
            {
              backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
            },
          ]}
          onPress={handleToggleRecording}
          color={theme.colors.surface}
          label={isRecording ? 'Stop Recording' : 'Voice Note'}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
  },
  contentInput: {
    marginBottom: 24,
    minHeight: 150,
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  tagInputContainer: {
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginTop: -8,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CreateNoteScreen; 