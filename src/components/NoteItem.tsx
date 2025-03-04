import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { Note } from '../database/noteRepository';

import Card, { CardContent, CardHeader } from './ui/Card';
import AnimatedButton from './ui/AnimatedButton';
import { SPACING, getShadow } from '../styles/commonStyles';

interface NoteItemProps {
  note: Note;
  onPress: (note: Note) => void;
  onFavoriteToggle: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress, onFavoriteToggle }) => {
  const theme = useTheme();
  
  // Format date as relative time or absolute date
  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    onFavoriteToggle(note);
  };
  
  // Create tag pills if tags exist
  const renderTags = () => {
    if (!note.tags || note.tags.length === 0) return null;
    
    return (
      <View style={styles.tagContainer}>
        {note.tags.map((tag, index) => (
          <View 
            key={index} 
            style={[
              styles.tagPill, 
              { backgroundColor: theme.colors.primaryContainer }
            ]}
          >
            <Text 
              style={[styles.tagText, { color: theme.colors.onPrimaryContainer }]}
              numberOfLines={1}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  // Determine card color
  const getCardStyle = () => {
    if (note.color) {
      return {
        backgroundColor: note.color,
        borderLeftWidth: 0,
      };
    }
    
    return {
      borderLeftWidth: 4,
      borderLeftColor: note.is_favorite 
        ? theme.colors.tertiary 
        : theme.colors.primary,
    };
  };
  
  return (
    <AnimatedButton
      onPress={() => onPress(note)}
      feedbackColor={theme.colors.primary}
      style={styles.container}
    >
      <Card style={[styles.card, getCardStyle()]}>
        <CardHeader>
          <View style={styles.headerContainer}>
            <Text 
              variant="titleMedium" 
              style={styles.title}
              numberOfLines={1}
            >
              {note.title || 'Untitled Note'}
            </Text>
            
            <IconButton
              icon={note.is_favorite ? 'star' : 'star-outline'}
              iconColor={note.is_favorite ? theme.colors.tertiary : theme.colors.outline}
              size={20}
              onPress={handleFavoriteToggle}
              style={styles.favoriteButton}
            />
          </View>
          
          <Text 
            variant="bodySmall" 
            style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
          >
            {formatDate(note.created_at)}
          </Text>
        </CardHeader>
        
        <CardContent>
          <Text 
            variant="bodyMedium"
            numberOfLines={2}
            style={styles.content}
          >
            {note.content}
          </Text>
          
          {renderTags()}
        </CardContent>
        
        {note.location_name && (
          <View style={styles.locationContainer}>
            <IconButton
              icon="map-marker"
              size={16}
              style={styles.locationIcon}
            />
            <Text 
              variant="bodySmall" 
              numberOfLines={1}
              style={styles.locationText}
            >
              {note.location_name}
            </Text>
          </View>
        )}
      </Card>
    </AnimatedButton>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    ...getShadow(2),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  favoriteButton: {
    margin: 0,
    marginLeft: SPACING.xs,
  },
  date: {
    marginTop: -SPACING.xs,
  },
  content: {
    marginVertical: SPACING.xs,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  tagPill: {
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  locationIcon: {
    margin: 0,
    marginLeft: -SPACING.xs,
  },
  locationText: {
    opacity: 0.7,
    marginLeft: -SPACING.xs,
  },
});

export default NoteItem; 