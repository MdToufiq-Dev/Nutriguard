/**
 * Local storage wrapper with repository-style API
 * Phase 1: localStorage with DB-friendly shapes (string id, ISO dates, flat objects)
 * Phase 2: Replace with REST API calls
 */

const STORAGE_PREFIX = 'nutriguard_';

/**
 * Get item by key
 */
export async function get(key) {
    try {
        const data = localStorage.getItem(STORAGE_PREFIX + key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Storage get error:', error);
        return null;
    }
}

/**
 * Set item
 */
export async function set(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Storage set error:', error);
        return false;
    }
}

/**
 * List items by prefix
 */
export async function list(prefix = '') {
    try {
        const results = [];
        const fullPrefix = STORAGE_PREFIX + prefix;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(fullPrefix)) {
                const data = localStorage.getItem(key);
                if (data) {
                    results.push(JSON.parse(data));
                }
            }
        }

        return results;
    } catch (error) {
        console.error('Storage list error:', error);
        return [];
    }
}

/**
 * Remove item
 */
export async function remove(key) {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return true;
    } catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
}

/**
 * Clear all app data
 */
export async function clear() {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        return true;
    } catch (error) {
        console.error('Storage clear error:', error);
        return false;
    }
}
