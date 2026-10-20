/**
 * IndexedDB Local Storage Layer (ChromaOS_LocalVault)
 * Offline-first persistent storage for caregiver shift logs,
 * FluidPass gesture credentials, and fatigue metrics.
 */

const DB_NAME = 'ChromaOS_CareKinetic_DB';
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('careLogs')) {
        db.createObjectStore('careLogs', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('gestureSignatures')) {
        db.createObjectStore('gestureSignatures', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('appSettings')) {
        db.createObjectStore('appSettings', { keyPath: 'key' });
      }
    };
  });
};

export const saveRecord = async (storeName, record) => {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.add({ ...record, timestamp: new Date().toISOString() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getAllRecords = async (storeName) => {
  const db = await openDB();
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const saveSetting = async (key, value) => {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('appSettings', 'readwrite');
    const store = tx.objectStore('appSettings');
    const req = store.put({ key, value });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getSetting = async (key) => {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction('appSettings', 'readonly');
    const store = tx.objectStore('appSettings');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => resolve(null);
  });
};
