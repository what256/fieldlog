import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { Note, searchNotes, getAllTags, updateNote } from '../database/noteRepository';
import NoteItem from '../components/NoteItem';
import { RootStackParamList } from '../../App';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load all tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    
    loadTags();
  }, []);
  
  // Perform search when query or selected tags change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() && selectedTags.length === 0) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Search by query
        let results: Note[] = [];
        
        if (searchQuery.trim()) {
          results = await searchNotes(searchQuery);
        }
        
        // Filter by selected tags
        if (selectedTags.length > 0) {
          if (results.length > 0) {
            // Filter existing results by tags
            results = results.filter(note => 
              note.tags && selectedTags.every(tag => note.tags!.includes(tag))
            );
          } else {
            // Get all notes and filter by tags
            const allNotes = await searchNotes('');
            results = allNotes.filter(note => 
              note.tags && selectedTags.every(tag => note.tags!.includes(tag))
            );
          }
        }
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [searchQuery, selectedTags]);
  
  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Handle note press
  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', { noteId: note.id as number });
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = async (note: Note) => {
    try {
      const updatedNote: Note = {
        ...note,
        is_favorite: !note.is_favorite,
      };
      
      await updateNote(updatedNote);
      
      // Update the note in the search results
      setSearchResults(prevResults => 
        prevResults.map(n => n.id === note.id ? { ...n, is_favorite: !n.is_favorite } : n)
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <Searchbar
        placeholder="Search notes..."
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Tags filter */}
      {allTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <FlatList
            data={allTags}
            renderItem={({ item }) => (
              <Chip
                style={[
                  styles.tagChip,
                  selectedTags.includes(item) && { backgroundColor: theme.colors.primary },
                ]}
                textStyle={[
                  selectedTags.includes(item) && { color: theme.colors.surface },
                ]}
                onPress={() => handleTagToggle(item)}
                mode={selectedTags.includes(item) ? 'flat' : 'outlined'}
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
          />
        </View>
      )}
      
      {/* Search results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() || selectedTags.length > 0
              ? 'No notes match your search'
              : 'Enter a search term or select tags to find notes'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={handleNotePress}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  tagsContainer: {
    marginBottom: 8,
  },
  tagsList: {
    paddingHorizontal: 16,
  },
  tagChip: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  resultsList: {
    paddingVertical: 8,
  },
});

export default SearchScreen; 