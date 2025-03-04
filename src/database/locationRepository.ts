import { getDatabase } from './database';
import { SQLResultSet } from 'expo-sqlite';

export interface LocationRecord {
  id?: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  location_name?: string;
}

export const saveLocation = (location: LocationRecord): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO location_history (
          latitude, longitude, timestamp, location_name
        ) VALUES (?, ?, ?, ?)`,
        [
          location.latitude,
          location.longitude,
          location.timestamp,
          location.location_name
        ],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getLocationHistory = (
  startDate?: number,
  endDate?: number
): Promise<LocationRecord[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    let query = 'SELECT * FROM location_history';
    const params: any[] = [];
    
    if (startDate || endDate) {
      query += ' WHERE';
      
      if (startDate) {
        query += ' timestamp >= ?';
        params.push(startDate);
      }
      
      if (startDate && endDate) {
        query += ' AND';
      }
      
      if (endDate) {
        query += ' timestamp <= ?';
        params.push(endDate);
      }
    }
    
    query += ' ORDER BY timestamp DESC';
    
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, result) => {
          const locations: LocationRecord[] = [];
          const length = result.rows.length;
          
          for (let i = 0; i < length; i++) {
            locations.push(result.rows.item(i));
          }
          
          resolve(locations);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getLatestLocation = (): Promise<LocationRecord | null> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM location_history ORDER BY timestamp DESC LIMIT 1',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
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

export const deleteLocationHistory = (
  startDate?: number,
  endDate?: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    let query = 'DELETE FROM location_history';
    const params: any[] = [];
    
    if (startDate || endDate) {
      query += ' WHERE';
      
      if (startDate) {
        query += ' timestamp >= ?';
        params.push(startDate);
      }
      
      if (startDate && endDate) {
        query += ' AND';
      }
      
      if (endDate) {
        query += ' timestamp <= ?';
        params.push(endDate);
      }
    }
    
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        () => {
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

export const clearLocationHistory = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM location_history`,
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