/**
 * DataService - Data fetching dengan caching
 */
export class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Fetch data dengan caching
     * @param {string} url - URL untuk fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<*>} Fetched data
     */
    async fetch(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = this.cache.get(cacheKey);

        // Check if cache masih valid
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Cache hasil
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now(),
            });

            return data;
        } catch (error) {
            // Error akan di-handle oleh caller
            throw error;
        }
    }

    /**
     * Clear cache
     * @param {string} url - URL spesifik (optional, jika tidak ada akan clear semua)
     */
    clearCache(url = null) {
        if (url) {
            // Clear cache untuk URL tertentu
            const keysToDelete = [];
            this.cache.forEach((value, key) => {
                if (key.startsWith(url)) {
                    keysToDelete.push(key);
                }
            });
            keysToDelete.forEach((key) => this.cache.delete(key));
        } else {
            this.cache.clear();
        }
    }

    /**
     * Set cache TTL
     * @param {number} ttl - TTL dalam milliseconds
     */
    setCacheTTL(ttl) {
        this.cacheTTL = ttl;
    }
}

// Export singleton instance
export const dataService = new DataService();

