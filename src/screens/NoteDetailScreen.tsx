import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, IconButton, Chip, ActivityIndicator, FAB, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';

import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Note, getNoteById, updateNote, deleteNote } from '../database/noteRepository';
import { RootStackParamList } from '../../App';
import { speakText } from '../utils/speechService';

type NoteDetailScreenRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;
type NoteDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NoteDetailScreen = () => {
  const route = useRoute<NoteDetailScreenRouteProp>();
  const navigation = useNavigation<NoteDetailScreenNavigationProp>();
  const { refreshNotes } = useAppContext();
  const { theme } = useTheme();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      try {
        const noteData = await getNoteById(route.params.noteId);
        setNote(noteData);
      } catch (error) {
        console.error('Error loading note:', error);
        Alert.alert('Error', 'Failed to load note');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    loadNote();
  }, [route.params.noteId]);
  
  // Set up navigation options
  useEffect(() => {
    if (note) {
      navigation.setOptions({
        title: note.title || 'Note Details',
        headerRight: () => (
          <IconButton
            icon="dots-vertical"
            onPress={() => setMenuVisible(true)}
          />
        ),
      });
    }
  }, [note, navigation]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!note) return;
    
    try {
      const updatedNote: Note = {
        ...note,
        is_favorite: !note.is_favorite,
      };
      
      await updateNote(updatedNote);
      setNote(updatedNote);
      await refreshNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update note');
    }
  };
  
  // Handle edit note
  const handleEditNote = () => {
    setMenuVisible(false);
    // Navigate to edit screen (not implemented in this basic version)
    Alert.alert('Edit Note', 'Edit functionality would be implemented here');
  };
  
  // Handle delete note
  const handleDeleteNote = () => {
    setMenuVisible(false);
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!note?.id) return;
              
              await deleteNote(note.id);
              await refreshNotes();
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };
  
  // Handle speak note
  const handleSpeakNote = async () => {
    setMenuVisible(false);
    
    if (!note) return;
    
    try {
      const textToSpeak = `${note.title}. ${note.content}`;
      await speakText(textToSpeak);
    } catch (error) {
      console.error('Error speaking note:', error);
      Alert.alert('Error', 'Failed to speak note');
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (!note) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Note not found</Text>
      </View>
    );
  }
  
  // Format dates
  const formattedDate = format(new Date(note.timestamp), 'MMMM d, yyyy h:mm a');
  const formattedCreatedDate = format(new Date(note.created_at), 'MMMM d, yyyy h:mm a');
  const formattedUpdatedDate = format(new Date(note.updated_at), 'MMMM d, yyyy h:mm a');
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {note.title || 'Untitled Note'}
          </Text>
          <IconButton
            icon={note.is_favorite ? 'star' : 'star-outline'}
            iconColor={note.is_favorite ? '#FFD700' : theme.colors.onSurface}
            size={24}
            onPress={handleFavoriteToggle}
          />
        </View>
        
        {/* Date and location */}
        <View style={styles.metaContainer}>
          <Text variant="bodySmall" style={styles.date}>
            {formattedDate}
          </Text>
          
          {note.location_name && (
            <Text variant="bodySmall" style={styles.location}>
              📍 {note.location_name}
            </Text>
          )}
        </View>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
              <Chip key={index} style={styles.tag}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
        
        {/* Content */}
        <Text variant="bodyLarge" style={styles.content}>
          {note.content || 'No content'}
        </Text>
        
        {/* Additional metadata */}
        <View style={styles.additionalMeta}>
          <Text variant="bodySmall" style={styles.metaText}>
            Created: {formattedCreatedDate}
          </Text>
          <Text variant="bodySmall" style={styles.metaText}>
            Last modified: {formattedUpdatedDate}
          </Text>
        </View>
      </ScrollView>
      
      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.menu}
      >
        <Menu.Item
          leadingIcon="pencil"
          onPress={handleEditNote}
          title="Edit Note"
        />
        <Menu.Item
          leadingIcon="text-to-speech"
          onPress={handleSpeakNote}
          title="Speak Note"
        />
        <Divider />
        <Menu.Item
          leadingIcon="delete"
          onPress={handleDeleteNote}
          title="Delete Note"
          titleStyle={{ color: theme.colors.error }}
        />
      </Menu>
      
      {/* Edit FAB */}
      <FAB
        icon="pencil"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleEditNote}
        color={theme.colors.surface}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  date: {
    opacity: 0.7,
  },
  location: {
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  content: {
    marginBottom: 24,
    lineHeight: 24,
  },
  additionalMeta: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 16,
    marginTop: 16,
  },
  metaText: {
    opacity: 0.6,
    marginBottom: 4,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default NoteDetailScreen; 