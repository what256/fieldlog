import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { 
  List, 
  Switch, 
  Divider, 
  Button, 
  Text, 
  Dialog, 
  Portal, 
  TextInput,
  RadioButton,
  Snackbar
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { exportData, importData } from '../utils/backupService';
import { clearLocationHistory } from '../database/locationRepository';
import { deleteAllNotes } from '../database/noteRepository';

const SettingsScreen = () => {
  const { 
    settings, 
    updateSettings, 
    refreshNotes, 
    refreshLocationHistory 
  } = useAppContext();
  
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Dialog states
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [exportFileName, setExportFileName] = useState('fieldlog_backup');
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Handle toggle settings
  const handleToggleSetting = (setting: string) => {
    if (settings) {
      updateSettings({
        ...settings,
        [setting]: !settings[setting]
      });
    }
  };
  
  // Handle export data
  const handleExport = async () => {
    try {
      setExportDialogVisible(false);
      
      // Show loading snackbar
      setSnackbarMessage('Exporting data...');
      setSnackbarVisible(true);
      
      const fileName = exportFileName.trim() || 'fieldlog_backup';
      const result = await exportData(fileName);
      
      if (result.success) {
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.filePath as string);
          setSnackbarMessage('Data exported successfully!');
        } else {
          setSnackbarMessage(`Data exported to: ${result.filePath}`);
        }
      } else {
        setSnackbarMessage('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbarMessage('Error exporting data');
    } finally {
      setSnackbarVisible(true);
    }
  };
  
  // Handle import data
  const handleImport = async () => {
    try {
      setImportDialogVisible(false);
      
      // Show loading snackbar
      setSnackbarMessage('Selecting backup file...');
      setSnackbarVisible(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setSnackbarMessage('Import canceled');
        setSnackbarVisible(true);
        return;
      }
      
      // Show importing snackbar
      setSnackbarMessage('Importing data...');
      setSnackbarVisible(true);
      
      const importResult = await importData(result.assets[0].uri);
      
      if (importResult.success) {
        // Refresh data
        await refreshNotes();
        await refreshLocationHistory();
        
        setSnackbarMessage('Data imported successfully!');
      } else {
        setSnackbarMessage('Failed to import data: ' + importResult.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      setSnackbarMessage('Error importing data');
    } finally {
      setSnackbarVisible(true);
    }
  };
  
  // Handle clear location history
  const handleClearLocationHistory = async () => {
    try {
      await clearLocationHistory();
      await refreshLocationHistory();
      
      setSnackbarMessage('Location history cleared');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Clear location history error:', error);
      setSnackbarMessage('Error clearing location history');
      setSnackbarVisible(true);
    }
  };
  
  // Handle delete all data
  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }
    
    try {
      setDeleteDialogVisible(false);
      
      // Show loading snackbar
      setSnackbarMessage('Deleting all data...');
      setSnackbarVisible(true);
      
      // Delete all notes and clear location history
      await deleteAllNotes();
      await clearLocationHistory();
      
      // Refresh data
      await refreshNotes();
      await refreshLocationHistory();
      
      setSnackbarMessage('All data deleted successfully');
    } catch (error) {
      console.error('Delete all data error:', error);
      setSnackbarMessage('Error deleting data');
    } finally {
      setSnackbarVisible(true);
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Theme Settings */}
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Theme"
          description="Use dark theme for the app"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>
      
      <Divider />
      
      {/* Location Settings */}
      <List.Section>
        <List.Subheader>Location</List.Subheader>
        <List.Item
          title="Track Location"
          description="Automatically track location in background"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={props => (
            <Switch
              value={settings?.trackLocation || false}
              onValueChange={() => handleToggleSetting('trackLocation')}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Location Accuracy"
          description="High accuracy uses more battery"
          left={props => <List.Icon {...props} icon="crosshairs-gps" />}
          right={props => (
            <Switch
              value={settings?.highAccuracy || false}
              onValueChange={() => handleToggleSetting('highAccuracy')}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Clear Location History"
          description="Delete all saved location data"
          left={props => <List.Icon {...props} icon="map-marker-off" />}
          right={props => (
            <Button 
              mode="outlined" 
              onPress={handleClearLocationHistory}
              style={styles.actionButton}
            >
              Clear
            </Button>
          )}
        />
      </List.Section>
      
      <Divider />
      
      {/* Voice Settings */}
      <List.Section>
        <List.Subheader>Voice</List.Subheader>
        <List.Item
          title="Voice Commands"
          description="Enable voice command recognition"
          left={props => <List.Icon {...props} icon="microphone" />}
          right={props => (
            <Switch
              value={settings?.voiceCommands || false}
              onValueChange={() => handleToggleSetting('voiceCommands')}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Text-to-Speech"
          description="Read notes aloud"
          left={props => <List.Icon {...props} icon="text-to-speech" />}
          right={props => (
            <Switch
              value={settings?.textToSpeech || false}
              onValueChange={() => handleToggleSetting('textToSpeech')}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>
      
      <Divider />
      
      {/* Backup & Restore */}
      <List.Section>
        <List.Subheader>Backup & Restore</List.Subheader>
        <List.Item
          title="Export Data"
          description="Export all notes and settings"
          left={props => <List.Icon {...props} icon="export" />}
          onPress={() => setExportDialogVisible(true)}
        />
        <List.Item
          title="Import Data"
          description="Import notes from backup file"
          left={props => <List.Icon {...props} icon="import" />}
          onPress={() => setImportDialogVisible(true)}
        />
      </List.Section>
      
      <Divider />
      
      {/* Danger Zone */}
      <List.Section>
        <List.Subheader style={{ color: theme.colors.error }}>Danger Zone</List.Subheader>
        <List.Item
          title="Delete All Data"
          description="Permanently delete all notes and settings"
          titleStyle={{ color: theme.colors.error }}
          left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
          onPress={() => setDeleteDialogVisible(true)}
        />
      </List.Section>
      
      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text variant="titleMedium" style={styles.aboutTitle}>
          FieldLog
        </Text>
        <Text variant="bodyMedium" style={styles.aboutVersion}>
          Version 1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.aboutCopyright}>
          © 2023 FieldLog. All rights reserved.
        </Text>
      </View>
      
      {/* Export Dialog */}
      <Portal>
        <Dialog
          visible={exportDialogVisible}
          onDismiss={() => setExportDialogVisible(false)}
        >
          <Dialog.Title>Export Data</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Enter a name for your backup file:
            </Text>
            <TextInput
              label="Filename"
              value={exportFileName}
              onChangeText={setExportFileName}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExportDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleExport}>Export</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Import Dialog */}
      <Portal>
        <Dialog
          visible={importDialogVisible}
          onDismiss={() => setImportDialogVisible(false)}
        >
          <Dialog.Title>Import Data</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              This will import notes from a backup file. Existing data will be preserved unless there are conflicts.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleImport}>Select File</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete All Data Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete All Data</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={[styles.dialogText, { color: theme.colors.error }]}>
              Warning: This action cannot be undone. All notes and settings will be permanently deleted.
            </Text>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Type DELETE to confirm:
            </Text>
            <TextInput
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              mode="outlined"
              style={styles.dialogInput}
              error={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleDeleteAllData} 
              textColor={theme.colors.error}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Delete All
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButton: {
    marginVertical: 4,
  },
  dialogText: {
    marginBottom: 16,
  },
  dialogInput: {
    marginBottom: 8,
  },
  aboutSection: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  aboutTitle: {
    marginBottom: 8,
  },
  aboutVersion: {
    marginBottom: 4,
    opacity: 0.7,
  },
  aboutCopyright: {
    opacity: 0.5,
  },
});

export default SettingsScreen; 