import { getDatabase } from './database';

export interface Note {
  id?: number;
  title: string;
  content: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  color?: string;
  is_favorite: boolean;
  created_at: number;
  updated_at: number;
  tags?: string[];
}

export const saveNote = (note: Note): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = Date.now();
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO notes (
          title, content, timestamp, latitude, longitude, location_name, 
          color, is_favorite, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.title,
          note.content,
          note.timestamp,
          note.latitude,
          note.longitude,
          note.location_name,
          note.color,
          note.is_favorite ? 1 : 0,
          note.created_at || now,
          note.updated_at || now
        ],
        (_, result) => {
          const noteId = result.insertId;
          
          // If there are tags, save them
          if (note.tags && note.tags.length > 0) {
            saveNoteTags(noteId, note.tags)
              .then(() => resolve(noteId))
              .catch(error => reject(error));
          } else {
            resolve(noteId);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateNote = (note: Note): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!note.id) {
      reject(new Error('Note ID is required for update'));
      return;
    }
    
    const db = getDatabase();
    const now = Date.now();
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE notes SET 
          title = ?, content = ?, timestamp = ?, latitude = ?, longitude = ?, 
          location_name = ?, color = ?, is_favorite = ?, updated_at = ?
        WHERE id = ?`,
        [
          note.title,
          note.content,
          note.timestamp,
          note.latitude,
          note.longitude,
          note.location_name,
          note.color,
          note.is_favorite ? 1 : 0,
          now,
          note.id
        ],
        async (_, result) => {
          if (result.rowsAffected > 0) {
            // Update tags if provided
            if (note.tags) {
              try {
                // Remove existing tags
                await removeNoteTagsByNoteId(note.id);
                // Add new tags
                await saveNoteTags(note.id, note.tags);
                resolve();
              } catch (error) {
                reject(error);
              }
            } else {
              resolve();
            }
          } else {
            reject(new Error('Note not found'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteNote = (noteId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM notes WHERE id = ?',
        [noteId],
        (_, result) => {
          if (result.rowsAffected > 0) {
            resolve();
          } else {
            reject(new Error('Note not found'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getNoteById = (noteId: number): Promise<Note> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes WHERE id = ?',
        [noteId],
        async (_, result) => {
          if (result.rows.length > 0) {
            const note = result.rows.item(0);
            // Convert SQLite integer to boolean
            note.is_favorite = !!note.is_favorite;
            
            // Get tags for this note
            try {
              const tags = await getNoteTagsByNoteId(noteId);
              resolve({...note, tags});
            } catch (error) {
              resolve(note);
            }
          } else {
            reject(new Error('Note not found'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getAllNotes = (): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes ORDER BY timestamp DESC',
        [],
        async (_, result) => {
          const notes: Note[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            const note = result.rows.item(i);
            // Convert SQLite integer to boolean
            note.is_favorite = !!note.is_favorite;
            
            // Get tags for this note
            try {
              const tags = await getNoteTagsByNoteId(note.id);
              notes.push({...note, tags});
            } catch (error) {
              notes.push(note);
            }
          }
          
          resolve(notes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const searchNotes = (query: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const searchTerm = `%${query}%`;
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT DISTINCT n.* FROM notes n
         LEFT JOIN note_tags nt ON n.id = nt.note_id
         LEFT JOIN tags t ON nt.tag_id = t.id
         WHERE n.title LIKE ? OR n.content LIKE ? OR n.location_name LIKE ? OR t.name LIKE ?
         ORDER BY n.timestamp DESC`,
        [searchTerm, searchTerm, searchTerm, searchTerm],
        async (_, result) => {
          const notes: Note[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            const note = result.rows.item(i);
            // Convert SQLite integer to boolean
            note.is_favorite = !!note.is_favorite;
            
            // Get tags for this note
            try {
              const tags = await getNoteTagsByNoteId(note.id);
              notes.push({...note, tags});
            } catch (error) {
              notes.push(note);
            }
          }
          
          resolve(notes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getFavoriteNotes = (): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes WHERE is_favorite = 1 ORDER BY timestamp DESC',
        [],
        async (_, result) => {
          const notes: Note[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            const note = result.rows.item(i);
            // Convert SQLite integer to boolean
            note.is_favorite = !!note.is_favorite;
            
            // Get tags for this note
            try {
              const tags = await getNoteTagsByNoteId(note.id);
              notes.push({...note, tags});
            } catch (error) {
              notes.push(note);
            }
          }
          
          resolve(notes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Tag related functions
export const saveTag = (tagName: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR IGNORE INTO tags (name) VALUES (?)',
        [tagName],
        (_, result) => {
          if (result.insertId) {
            resolve(result.insertId);
          } else {
            // Tag might already exist, get its ID
            tx.executeSql(
              'SELECT id FROM tags WHERE name = ?',
              [tagName],
              (_, result) => {
                if (result.rows.length > 0) {
                  resolve(result.rows.item(0).id);
                } else {
                  reject(new Error('Failed to save tag'));
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const saveNoteTags = async (noteId: number, tagNames: string[]): Promise<void> => {
  const db = getDatabase();
  
  for (const tagName of tagNames) {
    try {
      const tagId = await saveTag(tagName);
      
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
            [noteId, tagId],
            () => resolve(),
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (error) {
      console.error('Error saving note tag:', error);
    }
  }
};

export const getNoteTagsByNoteId = (noteId: number): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT t.name FROM tags t
         JOIN note_tags nt ON t.id = nt.tag_id
         WHERE nt.note_id = ?`,
        [noteId],
        (_, result) => {
          const tags: string[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            tags.push(result.rows.item(i).name);
          }
          
          resolve(tags);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const removeNoteTagsByNoteId = (noteId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM note_tags WHERE note_id = ?',
        [noteId],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getAllTags = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT name FROM tags ORDER BY name',
        [],
        (_, result) => {
          const tags: string[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            tags.push(result.rows.item(i).name);
          }
          
          resolve(tags);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteAllNotes = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM notes`,
        [],
        (_, result) => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}; 