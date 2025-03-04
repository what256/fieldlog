import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { Text, FAB, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../App';
import { useAppContext } from '../context/AppContext';
import { Note } from '../database/noteRepository';
import NoteItem from '../components/NoteItem';
import SearchBar from '../components/ui/SearchBar';
import ScreenHeader from '../components/ui/ScreenHeader';
import { SPACING, getShadow, commonStyles } from '../styles/commonStyles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { notes, isLoading, refreshNotes } = useAppContext();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  };
  
  // Handle note press
  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', { noteId: note.id as number });
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = async (note: Note) => {
    // Update the note's favorite status
    const updatedNote = {
      ...note,
      is_favorite: !note.is_favorite,
    };
    
    // Save to database and refresh
    // TODO: Implement this with the repository
    await refreshNotes();
  };
  
  // Handle create note
  const handleCreateNote = () => {
    navigation.navigate('CreateNote');
  };
  
  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };
  
  // Filter notes based on search query
  const filteredNotes = searchQuery
    ? notes.filter(
        note => 
          (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (note.tags && note.tags.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      )
    : notes;
  
  // Empty component
  const EmptyComponent = () => (
    <View style={commonStyles.emptyState}>
      <Text variant="titleMedium" style={{ marginBottom: SPACING.md }}>
        No notes yet
      </Text>
      <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
        Create your first note by tapping the + button below
      </Text>
    </View>
  );
  
  // Empty search component
  const EmptySearchComponent = () => (
    <View style={commonStyles.emptyState}>
      <Text variant="titleMedium" style={{ marginBottom: SPACING.md }}>
        No results found
      </Text>
      <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
        Try a different search term
      </Text>
    </View>
  );
  
  // Loading component
  const LoadingComponent = () => (
    <View style={commonStyles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
  
  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SearchBar
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={handleSearchChange}
        onFocus={() => setSearchMode(true)}
        onBlur={() => setSearchMode(false)}
      />
    </View>
  );
  
  // Separator
  const ItemSeparator = () => <View style={styles.separator} />;
  
  // Calculate content padding based on insets
  const contentPadding = {
    paddingTop: searchMode ? SPACING.sm : SPACING.xl * 2,
    paddingBottom: insets.bottom + SPACING.lg,
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        translucent
      />
      
      {/* Animated Header */}
      {!searchMode && (
        <Animated.View
          style={[
            styles.headerBackground,
            {
              backgroundColor: theme.colors.background,
              height: insets.top + 56,
              opacity: headerOpacity,
              ...getShadow(3),
            },
          ]}
        />
      )}
      
      {/* Screen Title */}
      {!searchMode && (
        <ScreenHeader
          title="My Notes"
          subtitle={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          scrollY={scrollY}
        />
      )}
      
      {/* Notes List */}
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <Animated.FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id?.toString() || ''}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={handleNotePress}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            searchQuery ? <EmptySearchComponent /> : <EmptyComponent />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            contentPadding,
            filteredNotes.length === 0 && { flex: 1 },
          ]}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
      
      {/* FAB */}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            ...getShadow(5),
          },
        ]}
        color={theme.colors.onPrimary}
        onPress={handleCreateNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    zIndex: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.sm,
  },
  separator: {
    height: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xl,
    borderRadius: 28,
  },
});

export default HomeScreen; 