/**
 * LocalStore IndexedDB Persistence Module
 * Manages offline persistence for custom apps, discussions, reviews, and star ratings.
 */

export class LocalStore {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HanaLaunchpadHubDB', 1);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('custom_apps')) {
          db.createObjectStore('custom_apps', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('discussions')) {
          db.createObjectStore('discussions', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('ratings')) {
          db.createObjectStore('ratings', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        reject(e);
      };
    });
  }

  async getCustomApps() {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('custom_apps', 'readonly');
      const store = tx.objectStore('custom_apps');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async saveCustomApp(app) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('custom_apps', 'readwrite');
      const store = tx.objectStore('custom_apps');
      const req = store.put(app);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  async getDiscussions(appId) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('discussions', 'readonly');
      const store = tx.objectStore('discussions');
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        resolve(all.filter(d => d.appId === appId));
      };
      req.onerror = () => resolve([]);
    });
  }

  async addDiscussion(appId, author, text) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('discussions', 'readwrite');
      const store = tx.objectStore('discussions');
      const record = { appId, author, text, timestamp: Date.now() };
      const req = store.add(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  }

  async addRating(appId, stars, reviewText) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('ratings', 'readwrite');
      const store = tx.objectStore('ratings');
      const record = { appId, stars, reviewText, timestamp: Date.now() };
      const req = store.add(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  }
}
