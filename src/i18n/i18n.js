/**
 * I18n - Internationalization system
 * Support untuk multiple languages
 */
export class I18n {
    constructor(locale = 'id') {
        this.locale = locale;
        this.translations = {};
        this.fallbackLocale = 'id';
    }

    /**
     * Load translations untuk locale tertentu
     * @param {string} locale - Locale code (e.g., 'id', 'en')
     * @returns {Promise<void>}
     */
    async loadTranslations(locale) {
        try {
            const response = await fetch(`/i18n/${locale}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${locale}`);
            }
            this.translations[locale] = await response.json();
        } catch (error) {
            console.warn(`Failed to load translations for ${locale}, using fallback`);
            // Try to load fallback locale
            if (locale !== this.fallbackLocale) {
                await this.loadTranslations(this.fallbackLocale);
            }
        }
    }

    /**
     * Set locale
     * @param {string} locale - Locale code
     */
    async setLocale(locale) {
        if (!this.translations[locale]) {
            await this.loadTranslations(locale);
        }
        this.locale = locale;
        // Emit locale change event
        if (window.eventBus) {
            window.eventBus.emit('i18n:locale:changed', locale);
        }
    }

    /**
     * Get current locale
     * @returns {string} Current locale
     */
    getLocale() {
        return this.locale;
    }

    /**
     * Translate key dengan parameters
     * @param {string} key - Translation key (supports dot notation, e.g., 'mission.title')
     * @param {Object} params - Parameters untuk interpolation
     * @returns {string} Translated string
     */
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }

    /**
     * Get translation untuk key
     * @param {string} key - Translation key
     * @returns {string} Translation atau key jika tidak ditemukan
     */
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.locale];

        // Navigate nested object
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                // Try fallback locale
                translation = this.translations[this.fallbackLocale];
                for (const k2 of keys) {
                    if (translation && typeof translation === 'object' && k2 in translation) {
                        translation = translation[k2];
                    } else {
                        return key; // Return key jika tidak ditemukan
                    }
                }
                break;
            }
        }

        return typeof translation === 'string' ? translation : key;
    }

    /**
     * Interpolate parameters ke string
     * @param {string} str - String dengan placeholders
     * @param {Object} params - Parameters object
     * @returns {string} Interpolated string
     */
    interpolate(str, params) {
        if (!str || typeof str !== 'string') {
            return str;
        }

        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Check if translation exists
     * @param {string} key - Translation key
     * @returns {boolean} True jika translation ada
     */
    has(key) {
        return this.getTranslation(key) !== key;
    }
}

// Export singleton instance
export const i18n = new I18n();

