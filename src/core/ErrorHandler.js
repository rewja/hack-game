import { eventBus } from './EventBus.js';

/**
 * ErrorHandler - Centralized error handling system
 * Menyediakan error handling, logging, dan user-friendly error messages
 */
export class ErrorHandler {
    /**
     * Handle error dengan logging dan user notification
     * @param {Error} error - Error object
     * @param {string} context - Context dimana error terjadi
     * @param {Object} options - Additional options
     */
    static handle(error, context = '', options = {}) {
        // Log error ke console
        console.error(`[${context}]`, error);

        // Log ke error tracking service (e.g., Sentry) jika tersedia
        if (window.errorTracker) {
            window.errorTracker.captureException(error, { context, ...options });
        }

        // Show user-friendly message
        if (options.showToUser !== false) {
            this.showUserError(error, context, options);
        }

        // Emit error event untuk modules yang perlu tahu
        eventBus.emit('error:occurred', {
            error,
            context,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Show user-friendly error message
     * @param {Error} error - Error object
     * @param {string} context - Context
     * @param {Object} options - Options
     */
    static showUserError(error, context, options = {}) {
        let message = options.userMessage || 'Something went wrong. Please try again.';

        // Custom messages untuk error types tertentu
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            message = 'Network error. Please check your connection.';
        } else if (error.name === 'TypeError') {
            message = 'Invalid data format. Please refresh the page.';
        } else if (error.name === 'SyntaxError') {
            message = 'Data parsing error. Please try again.';
        }

        // Show toast notification
        eventBus.emit('toast:show', {
            message: message,
            type: 'error',
        });
    }

    /**
     * Wrap async function dengan error handling
     * @param {Function} fn - Async function
     * @param {string} context - Context
     * @returns {Function} Wrapped function
     */
    static wrapAsync(fn, context = '') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error; // Re-throw untuk caller yang perlu handle
            }
        };
    }

    /**
     * Wrap sync function dengan error handling
     * @param {Function} fn - Sync function
     * @param {string} context - Context
     * @returns {Function} Wrapped function
     */
    static wrapSync(fn, context = '') {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error;
            }
        };
    }

    /**
     * Create error dengan context
     * @param {string} message - Error message
     * @param {string} context - Context
     * @param {Error} originalError - Original error (optional)
     * @returns {Error} Error object
     */
    static createError(message, context = '', originalError = null) {
        const error = new Error(message);
        error.name = context || 'AppError';
        if (originalError) {
            error.originalError = originalError;
            error.stack = originalError.stack;
        }
        return error;
    }
}

