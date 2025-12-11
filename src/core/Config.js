/**
 * Config - Configuration management system
 * Mengelola konfigurasi aplikasi dengan nested path support
 */
export class Config {
    constructor() {
        this.config = {
            game: {
                xpPerLevel: 100,
                maxLevel: 100,
            },
            terminal: {
                maxHistory: 100,
                autocompleteEnabled: true,
            },
            ui: {
                theme: 'light',
                animations: true,
            },
        };
    }

    /**
     * Get config value dengan nested path
     * @param {string} path - Path ke config (e.g., 'game.xpPerLevel')
     * @param {*} defaultValue - Default value jika tidak ditemukan
     * @returns {*} Config value
     */
    get(path, defaultValue = undefined) {
        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Set config value dengan nested path
     * @param {string} path - Path ke config (e.g., 'game.xpPerLevel')
     * @param {*} value - Value yang ingin di-set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.config;

        for (const key of keys) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = value;
    }

    /**
     * Get semua config
     * @returns {Object} Copy dari semua config
     */
    getAll() {
        return JSON.parse(JSON.stringify(this.config));
    }

    /**
     * Merge config dengan object baru
     * @param {Object} newConfig - Config object yang ingin di-merge
     */
    merge(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }

    /**
     * Deep merge helper
     * @private
     */
    deepMerge(target, source) {
        const output = { ...target };
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * Check if value is object
     * @private
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
}

// Export singleton instance
export const config = new Config();

