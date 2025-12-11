/**
 * CommandRegistry - Registry untuk semua terminal commands
 */
export class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }

    /**
     * Register command
     * @param {string} name - Command name
     * @param {Function} handler - Command handler function
     * @param {Object} options - Command options (help, description, etc)
     */
    register(name, handler, options = {}) {
        this.commands.set(name.toLowerCase(), {
            name: name.toLowerCase(),
            handler,
            help: options.help || `Usage: ${name}`,
            description: options.description || '',
            validate: options.validate || (() => true),
        });
    }

    /**
     * Get command handler
     * @param {string} name - Command name
     * @returns {Object|null} Command object atau null
     */
    get(name) {
        return this.commands.get(name.toLowerCase()) || null;
    }

    /**
     * Check if command exists
     * @param {string} name - Command name
     * @returns {boolean} True jika command ada
     */
    has(name) {
        return this.commands.has(name.toLowerCase());
    }

    /**
     * Get all command names
     * @returns {string[]} Array of command names
     */
    getAllNames() {
        return Array.from(this.commands.keys());
    }

    /**
     * Get all commands
     * @returns {Map} Map of all commands
     */
    getAll() {
        return this.commands;
    }
}

