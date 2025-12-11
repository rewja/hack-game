import { eventBus } from './EventBus.js';
import { ErrorHandler } from './ErrorHandler.js';

/**
 * PluginSystem - Plugin system untuk extensibility
 * Memungkinkan third-party plugins untuk extend functionality
 */
export class PluginSystem {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }

    /**
     * Register plugin
     * @param {string} name - Plugin name
     * @param {Object} plugin - Plugin object dengan install/uninstall methods
     * @throws {Error} Jika plugin sudah terdaftar
     */
    register(name, plugin) {
        if (this.plugins.has(name)) {
            throw new Error(`Plugin ${name} already registered`);
        }

        if (!plugin || typeof plugin !== 'object') {
            throw new Error(`Invalid plugin object for ${name}`);
        }

        try {
            this.plugins.set(name, plugin);

            // Call install hook jika ada
            if (typeof plugin.install === 'function') {
                plugin.install(this, {
                    eventBus,
                    ErrorHandler,
                });
            }

            // Emit plugin registered event
            eventBus.emit('plugin:registered', { name, plugin });

            console.log(`✅ Plugin "${name}" registered successfully`);
        } catch (error) {
            ErrorHandler.handle(error, `PluginSystem.register(${name})`);
            throw error;
        }
    }

    /**
     * Unregister plugin
     * @param {string} name - Plugin name
     */
    unregister(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            console.warn(`Plugin "${name}" not found`);
            return;
        }

        try {
            // Call uninstall hook jika ada
            if (typeof plugin.uninstall === 'function') {
                plugin.uninstall(this, {
                    eventBus,
                    ErrorHandler,
                });
            }

            this.plugins.delete(name);

            // Emit plugin unregistered event
            eventBus.emit('plugin:unregistered', { name });

            console.log(`✅ Plugin "${name}" unregistered successfully`);
        } catch (error) {
            ErrorHandler.handle(error, `PluginSystem.unregister(${name})`);
        }
    }

    /**
     * Get plugin
     * @param {string} name - Plugin name
     * @returns {Object|null} Plugin object atau null
     */
    get(name) {
        return this.plugins.get(name) || null;
    }

    /**
     * Check if plugin is registered
     * @param {string} name - Plugin name
     * @returns {boolean} True jika terdaftar
     */
    has(name) {
        return this.plugins.has(name);
    }

    /**
     * Get all registered plugins
     * @returns {Array} Array of plugin names
     */
    getAll() {
        return Array.from(this.plugins.keys());
    }

    /**
     * Register hook
     * @param {string} hookName - Hook name
     * @param {Function} callback - Hook callback
     */
    registerHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(callback);
    }

    /**
     * Execute hook
     * @param {string} hookName - Hook name
     * @param {*} data - Data untuk hook
     * @returns {*} Result dari hook execution
     */
    executeHook(hookName, data = null) {
        const callbacks = this.hooks.get(hookName) || [];
        let result = data;

        callbacks.forEach((callback) => {
            try {
                result = callback(result);
            } catch (error) {
                ErrorHandler.handle(error, `PluginSystem.executeHook(${hookName})`);
            }
        });

        return result;
    }
}

// Export singleton instance
export const pluginSystem = new PluginSystem();

