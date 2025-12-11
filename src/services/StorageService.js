import { CONSTANTS } from '../core/Constants.js';
import { ValidationUtils } from '../utils/validation.js';

/**
 * StorageService - Abstraction layer untuk localStorage
 * Menyediakan type-safe storage dengan validation
 */
export class StorageService {
    /**
     * Get item dari localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value jika tidak ditemukan
     * @returns {*} Stored value atau default
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading from localStorage [${key}]:`, error);
            return defaultValue;
        }
    }

    /**
     * Set item ke localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value yang ingin disimpan
     * @returns {boolean} True jika berhasil
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage [${key}]:`, error);
            return false;
        }
    }

    /**
     * Remove item dari localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage [${key}]:`, error);
        }
    }

    /**
     * Clear semua localStorage
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Get settings dari storage
     * @returns {Object} Settings object
     */
    static getSettings() {
        const defaultSettings = {
            sound: true,
            animations: true,
            autosave: true,
            fontSize: 14,
        };

        const saved = this.get(CONSTANTS.STORAGE.SETTINGS_KEY, null);
        if (saved && ValidationUtils.validateSettings(saved)) {
            return { ...defaultSettings, ...saved };
        }
        return defaultSettings;
    }

    /**
     * Save settings ke storage
     * @param {Object} settings - Settings object
     * @returns {boolean} True jika berhasil disimpan
     */
    static saveSettings(settings) {
        if (!ValidationUtils.validateSettings(settings)) {
            console.warn('Invalid settings object, not saving');
            return false;
        }
        return this.set(CONSTANTS.STORAGE.SETTINGS_KEY, settings);
    }

    /**
     * Get state dari storage
     * @returns {Object|null} State object atau null
     */
    static getState() {
        const state = this.get(CONSTANTS.STORAGE.STATE_KEY, null);
        if (state && ValidationUtils.validateState(state)) {
            return state;
        }
        return null;
    }

    /**
     * Save state ke storage
     * @param {Object} state - State object
     * @returns {boolean} True jika berhasil disimpan
     */
    static saveState(state) {
        if (!ValidationUtils.validateState(state)) {
            console.warn('Invalid state object, not saving');
            return false;
        }
        return this.set(CONSTANTS.STORAGE.STATE_KEY, state);
    }

    /**
     * Check if welcome screen sudah pernah dilihat
     * @returns {boolean} True jika sudah dilihat
     */
    static hasSeenWelcome() {
        return this.get(CONSTANTS.STORAGE.WELCOME_KEY, false) === true;
    }

    /**
     * Mark welcome screen sebagai sudah dilihat
     */
    static markWelcomeSeen() {
        this.set(CONSTANTS.STORAGE.WELCOME_KEY, true);
    }
}

