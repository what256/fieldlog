import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

import { getDatabase } from '../database/database';
import { getAllNotes } from '../database/noteRepository';
import { getLocationHistory } from '../database/locationRepository';
import { db } from '../database/database';

// Backup file name
const BACKUP_FILE_NAME = 'fieldlog_backup.json';

// Backup directory
const BACKUP_DIRECTORY = FileSystem.documentDirectory + 'backups/';

interface BackupData {
  notes: any[];
  locationHistory: any[];
  settings: any;
  version: string;
}

interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

interface ImportResult {
  success: boolean;
  error?: string;
}

/**
 * Create a backup of all app data
 * @returns Promise resolving to the path of the backup file
 */
export const createBackup = async (): Promise<string> => {
  try {
    // Create backup directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIRECTORY, { intermediates: true });
    }
    
    // Get all data to backup
    const notes = await getAllNotes();
    const locationHistory = await getLocationHistory();
    
    // Get all AsyncStorage data
    const allKeys = await AsyncStorage.getAllKeys();
    const allAsyncStorageData: Record<string, any> = {};
    
    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        allAsyncStorageData[key] = value;
      }
    }
    
    // Create backup object
    const backupData = {
      notes,
      locationHistory,
      asyncStorage: allAsyncStorageData,
      timestamp: Date.now(),
      version: '1.0.0', // App version
    };
    
    // Convert to JSON
    const backupJson = JSON.stringify(backupData, null, 2);
    
    // Save to file
    const backupPath = BACKUP_DIRECTORY + BACKUP_FILE_NAME;
    await FileSystem.writeAsStringAsync(backupPath, backupJson);
    
    return backupPath;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
};

/**
 * Share the backup file
 * @returns Promise resolving when sharing is complete
 */
export const shareBackup = async (): Promise<void> => {
  try {
    // Create backup
    const backupPath = await createBackup();
    
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      // Share the file
      await Sharing.shareAsync(backupPath, {
        mimeType: 'application/json',
        dialogTitle: 'Share FieldLog Backup',
        UTI: 'public.json',
      });
    } else {
      Alert.alert(
        'Sharing not available',
        'Sharing is not available on this device'
      );
    }
  } catch (error) {
    console.error('Error sharing backup:', error);
    Alert.alert(
      'Error',
      'Failed to share backup'
    );
  }
};

/**
 * Restore data from a backup file
 * @param backupPath Path to the backup file
 * @returns Promise resolving when restore is complete
 */
export const restoreFromBackup = async (backupPath: string): Promise<void> => {
  try {
    // Read backup file
    const backupJson = await FileSystem.readAsStringAsync(backupPath);
    const backupData = JSON.parse(backupJson);
    
    // Validate backup data
    if (!backupData.notes || !backupData.locationHistory || !backupData.asyncStorage) {
      throw new Error('Invalid backup file');
    }
    
    // Get database
    const db = getDatabase();
    
    // Clear existing data
    db.transaction(tx => {
      tx.executeSql('DELETE FROM note_tags;');
      tx.executeSql('DELETE FROM tags;');
      tx.executeSql('DELETE FROM notes;');
      tx.executeSql('DELETE FROM location_history;');
    });
    
    // Restore notes and tags
    for (const note of backupData.notes) {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO notes (
            id, title, content, timestamp, latitude, longitude, location_name, 
            color, is_favorite, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            note.id,
            note.title,
            note.content,
            note.timestamp,
            note.latitude,
            note.longitude,
            note.location_name,
            note.color,
            note.is_favorite ? 1 : 0,
            note.created_at,
            note.updated_at
          ]
        );
      });
      
      // Restore tags for this note
      if (note.tags && note.tags.length > 0) {
        for (const tagName of note.tags) {
          // Insert tag if it doesn't exist
          db.transaction(tx => {
            tx.executeSql(
              'INSERT OR IGNORE INTO tags (name) VALUES (?)',
              [tagName]
            );
          });
          
          // Get tag ID
          db.transaction(tx => {
            tx.executeSql(
              'SELECT id FROM tags WHERE name = ?',
              [tagName],
              (_, result) => {
                if (result.rows.length > 0) {
                  const tagId = result.rows.item(0).id;
                  
                  // Insert note-tag relation
                  db.transaction(tx => {
                    tx.executeSql(
                      'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
                      [note.id, tagId]
                    );
                  });
                }
              }
            );
          });
        }
      }
    }
    
    // Restore location history
    for (const location of backupData.locationHistory) {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO location_history (
            id, latitude, longitude, timestamp, location_name
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            location.id,
            location.latitude,
            location.longitude,
            location.timestamp,
            location.location_name
          ]
        );
      });
    }
    
    // Restore AsyncStorage data
    for (const [key, value] of Object.entries(backupData.asyncStorage)) {
      await AsyncStorage.setItem(key, value as string);
    }
    
    Alert.alert(
      'Restore Complete',
      'Your data has been restored successfully'
    );
  } catch (error) {
    console.error('Error restoring from backup:', error);
    Alert.alert(
      'Error',
      'Failed to restore from backup'
    );
    throw new Error('Failed to restore from backup');
  }
};

/**
 * Export all app data to a JSON file
 * @param fileName Name of the backup file (without extension)
 * @returns Result object with success status and file path
 */
export const exportData = async (fileName: string): Promise<ExportResult> => {
  try {
    // Get all data
    const notes = await getAllNotes();
    const locationHistory = await getLocationHistory();
    
    // Create backup object
    const backupData: BackupData = {
      notes,
      locationHistory,
      settings: {}, // TODO: Add settings from context
      version: '1.0.0',
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(backupData, null, 2);
    
    // Ensure directory exists
    const backupDir = `${FileSystem.documentDirectory}backups/`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
    }
    
    // Create file path with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `${backupDir}${fileName}_${timestamp}.json`;
    
    // Write file
    await FileSystem.writeAsStringAsync(filePath, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return {
      success: true,
      filePath,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Import data from a backup file
 * @param fileUri URI of the backup file
 * @returns Result object with success status
 */
export const importData = async (fileUri: string): Promise<ImportResult> => {
  try {
    // Read file
    const jsonData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Parse JSON
    const backupData = JSON.parse(jsonData) as BackupData;
    
    // Validate backup data
    if (!backupData.notes || !Array.isArray(backupData.notes)) {
      return {
        success: false,
        error: 'Invalid backup file: missing notes data',
      };
    }
    
    // Import notes
    if (backupData.notes.length > 0) {
      for (const note of backupData.notes) {
        // Skip if note has no content
        if (!note.content && !note.title) continue;
        
        // Check if note already exists
        const existingNote = await db.executeSql(
          'SELECT id FROM notes WHERE id = ?',
          [note.id]
        );
        
        if (existingNote[0].rows.length > 0) {
          // Update existing note
          await db.executeSql(
            `UPDATE notes SET 
              title = ?, 
              content = ?, 
              timestamp = ?, 
              modified_timestamp = ?, 
              is_favorite = ?, 
              color = ?, 
              tags = ?, 
              latitude = ?, 
              longitude = ?, 
              location_name = ? 
            WHERE id = ?`,
            [
              note.title,
              note.content,
              note.timestamp,
              note.modified_timestamp,
              note.is_favorite ? 1 : 0,
              note.color,
              note.tags,
              note.latitude,
              note.longitude,
              note.location_name,
              note.id,
            ]
          );
        } else {
          // Insert new note
          await db.executeSql(
            `INSERT INTO notes (
              id, title, content, timestamp, modified_timestamp, 
              is_favorite, color, tags, latitude, longitude, location_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              note.id,
              note.title,
              note.content,
              note.timestamp,
              note.modified_timestamp,
              note.is_favorite ? 1 : 0,
              note.color,
              note.tags,
              note.latitude,
              note.longitude,
              note.location_name,
            ]
          );
        }
      }
    }
    
    // Import location history
    if (backupData.locationHistory && Array.isArray(backupData.locationHistory) && backupData.locationHistory.length > 0) {
      for (const location of backupData.locationHistory) {
        // Check if location already exists
        const existingLocation = await db.executeSql(
          'SELECT id FROM location_history WHERE id = ?',
          [location.id]
        );
        
        if (existingLocation[0].rows.length === 0) {
          // Insert new location
          await db.executeSql(
            `INSERT INTO location_history (
              id, latitude, longitude, timestamp, location_name
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              location.id,
              location.latitude,
              location.longitude,
              location.timestamp,
              location.location_name,
            ]
          );
        }
      }
    }
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; 