/**
 * Validation utilities untuk data validation
 */
export class ValidationUtils {
    /**
     * Validate mission data structure
     * @param {Object} mission - Mission object
     * @returns {boolean} True jika valid
     */
    static validateMission(mission) {
        if (!mission || typeof mission !== 'object') {
            return false;
        }

        const requiredFields = ['id', 'title', 'description', 'status', 'steps', 'reward'];
        for (const field of requiredFields) {
            if (!(field in mission)) {
                return false;
            }
        }

        // Validate status
        const validStatuses = ['active', 'locked', 'completed'];
        if (!validStatuses.includes(mission.status)) {
            return false;
        }

        // Validate steps
        if (!Array.isArray(mission.steps) || mission.steps.length === 0) {
            return false;
        }

        // Validate each step
        for (const step of mission.steps) {
            if (!step.id || !step.text || typeof step.completed !== 'boolean') {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate missions array
     * @param {Array} missions - Missions array
     * @returns {Array} Valid missions only
     */
    static validateMissions(missions) {
        if (!Array.isArray(missions)) {
            return [];
        }

        return missions.filter((mission) => this.validateMission(mission));
    }

    /**
     * Validate settings object
     * @param {Object} settings - Settings object
     * @returns {boolean} True jika valid
     */
    static validateSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            return false;
        }

        const validKeys = ['sound', 'animations', 'autosave', 'fontSize'];
        const settingsKeys = Object.keys(settings);

        // Check if all keys are valid
        for (const key of settingsKeys) {
            if (!validKeys.includes(key)) {
                return false;
            }
        }

        // Validate types
        if ('sound' in settings && typeof settings.sound !== 'boolean') {
            return false;
        }
        if ('animations' in settings && typeof settings.animations !== 'boolean') {
            return false;
        }
        if ('autosave' in settings && typeof settings.autosave !== 'boolean') {
            return false;
        }
        if ('fontSize' in settings && typeof settings.fontSize !== 'number') {
            return false;
        }

        return true;
    }

    /**
     * Validate state object
     * @param {Object} state - State object
     * @returns {boolean} True jika valid
     */
    static validateState(state) {
        if (!state || typeof state !== 'object') {
            return false;
        }

        // Check required fields
        const requiredFields = ['xp', 'level', 'completedMissions'];
        for (const field of requiredFields) {
            if (!(field in state) || typeof state[field] !== 'number') {
                return false;
            }
        }

        // Validate missions jika ada
        if (state.missions && !Array.isArray(state.missions)) {
            return false;
        }

        // Validate settings jika ada
        if (state.settings && !this.validateSettings(state.settings)) {
            return false;
        }

        return true;
    }

    /**
     * Validate command arguments
     * @param {Array} args - Command arguments
     * @param {Object} schema - Validation schema
     * @returns {boolean} True jika valid
     */
    static validateCommandArgs(args, schema) {
        if (!Array.isArray(args)) {
            return false;
        }

        // Check min/max length
        if (schema.minLength && args.length < schema.minLength) {
            return false;
        }
        if (schema.maxLength && args.length > schema.maxLength) {
            return false;
        }

        // Validate each argument
        if (schema.types) {
            for (let i = 0; i < args.length && i < schema.types.length; i++) {
                const expectedType = schema.types[i];
                const arg = args[i];

                if (expectedType === 'string' && typeof arg !== 'string') {
                    return false;
                }
                if (expectedType === 'number' && typeof arg !== 'number' && isNaN(Number(arg))) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Sanitize dan validate string
     * @param {*} value - Value yang ingin di-validate
     * @param {Object} options - Validation options
     * @returns {string|null} Sanitized string atau null jika invalid
     */
    static validateString(value, options = {}) {
        if (typeof value !== 'string') {
            return null;
        }

        let sanitized = value.trim();

        // Check min/max length
        if (options.minLength && sanitized.length < options.minLength) {
            return null;
        }
        if (options.maxLength && sanitized.length > options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }

        // Check pattern
        if (options.pattern && !options.pattern.test(sanitized)) {
            return null;
        }

        return sanitized;
    }

    /**
     * Validate number
     * @param {*} value - Value yang ingin di-validate
     * @param {Object} options - Validation options
     * @returns {number|null} Valid number atau null
     */
    static validateNumber(value, options = {}) {
        const num = Number(value);
        if (isNaN(num)) {
            return null;
        }

        if (options.min !== undefined && num < options.min) {
            return null;
        }
        if (options.max !== undefined && num > options.max) {
            return null;
        }

        return num;
    }
}

