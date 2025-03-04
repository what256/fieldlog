import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Open the database
export const getDatabase = () => {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase('fieldlog.db');
  return db;
};

// Initialize the database
export const initDatabase = () => {
  const db = getDatabase();
  
  // Create tables if they don't exist
  db.transaction(tx => {
    // Notes table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        timestamp INTEGER NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        color TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );`
    );

    // Tags table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );`
    );

    // Note-Tag relation table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS note_tags (
        note_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      );`
    );

    // Location history table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS location_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        location_name TEXT
      );`
    );
  });
};

// Drop all tables (for development/testing)
export const dropAllTables = () => {
  const db = getDatabase();
  
  db.transaction(tx => {
    tx.executeSql('DROP TABLE IF EXISTS note_tags;');
    tx.executeSql('DROP TABLE IF EXISTS tags;');
    tx.executeSql('DROP TABLE IF EXISTS notes;');
    tx.executeSql('DROP TABLE IF EXISTS location_history;');
  });
}; 