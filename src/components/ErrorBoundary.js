import { DOMUtils } from '../utils/dom.js';
import { SecurityUtils } from '../utils/security.js';
import { ErrorHandler } from '../core/ErrorHandler.js';

/**
 * ErrorBoundary - Error boundary untuk UI components
 * Menangkap error dan menampilkan fallback UI
 */
export class ErrorBoundary {
    constructor(element, fallbackRenderer) {
        this.element = element;
        this.fallbackRenderer = fallbackRenderer || this.defaultFallback;
        this.hasError = false;
    }

    /**
     * Wrap function dengan error boundary
     * @param {Function} fn - Function yang ingin di-wrap
     * @param {string} context - Context untuk error handling
     */
    wrap(fn, context = '') {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.catch(error, context);
                return null;
            }
        };
    }

    /**
     * Wrap async function dengan error boundary
     * @param {Function} fn - Async function yang ingin di-wrap
     * @param {string} context - Context untuk error handling
     */
    wrapAsync(fn, context = '') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.catch(error, context);
                return null;
            }
        };
    }

    /**
     * Catch error dan render fallback
     * @param {Error} error - Error object
     * @param {string} context - Context
     */
    catch(error, context = '') {
        this.hasError = true;
        ErrorHandler.handle(error, context, { showToUser: false });

        if (this.element) {
            const fallback = this.fallbackRenderer(error, context);
            if (fallback instanceof Node) {
                DOMUtils.clearChildren(this.element);
                this.element.appendChild(fallback);
            } else if (typeof fallback === 'string') {
                DOMUtils.clearChildren(this.element);
                const errorDiv = DOMUtils.createElement('div', {
                    className: 'error-boundary',
                    textContent: SecurityUtils.escapeHtml(fallback),
                });
                this.element.appendChild(errorDiv);
            }
        }
    }

    /**
     * Default fallback renderer
     * @param {Error} error - Error object
     * @param {string} context - Context
     * @returns {HTMLElement} Fallback element
     */
    defaultFallback(error, context) {
        const container = DOMUtils.createElement('div', {
            className: 'error-boundary',
        });

        const icon = DOMUtils.createElement('div', {
            className: 'error-icon',
            textContent: '⚠️',
        });

        const title = DOMUtils.createElement('h3', {
            className: 'error-title',
            textContent: 'Something went wrong',
        });

        const message = DOMUtils.createElement('p', {
            className: 'error-message',
            textContent: SecurityUtils.escapeHtml(
                error.message || 'An unexpected error occurred'
            ),
        });

        const retryBtn = DOMUtils.createElement('button', {
            className: 'error-retry',
            textContent: 'Retry',
        });
        retryBtn.addEventListener('click', () => {
            this.reset();
            window.location.reload();
        });

        DOMUtils.appendChildren(container, [icon, title, message, retryBtn]);
        return container;
    }

    /**
     * Reset error boundary
     */
    reset() {
        this.hasError = false;
        if (this.element) {
            DOMUtils.clearChildren(this.element);
        }
    }
}

