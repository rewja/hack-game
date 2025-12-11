import { DOMUtils } from './dom.js';

/**
 * LoadingManager - Manage loading states dan skeleton screens
 */
export class LoadingManager {
    /**
     * Show loading spinner
     * @param {HTMLElement|string} element - Target element atau selector
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading element
     */
    static show(element, message = 'Loading...') {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) {
            console.warn('LoadingManager.show: Target element not found');
            return null;
        }

        // Remove existing loader jika ada
        this.hide(target);

        const loader = DOMUtils.createElement('div', {
            className: 'loading-spinner',
        });

        const spinner = DOMUtils.createElement('div', { className: 'spinner' });
        const messageEl = DOMUtils.createElement('p', {
            className: 'loading-message',
            textContent: message,
        });

        loader.appendChild(spinner);
        loader.appendChild(messageEl);
        target.appendChild(loader);

        return loader;
    }

    /**
     * Hide loading spinner
     * @param {HTMLElement|string} element - Target element atau selector
     */
    static hide(element) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        const loader = target.querySelector('.loading-spinner');
        if (loader) {
            loader.remove();
        }
    }

    /**
     * Show skeleton screen
     * @param {HTMLElement|string} element - Target element atau selector
     * @param {number} count - Number of skeleton items
     * @returns {HTMLElement} Skeleton container
     */
    static showSkeleton(element, count = 3) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) {
            console.warn('LoadingManager.showSkeleton: Target element not found');
            return null;
        }

        // Clear existing content
        DOMUtils.clearChildren(target);

        const container = DOMUtils.createElement('div', {
            className: 'skeleton-container',
        });

        for (let i = 0; i < count; i++) {
            const skeleton = DOMUtils.createElement('div', {
                className: 'skeleton-item',
            });
            container.appendChild(skeleton);
        }

        target.appendChild(container);
        return container;
    }

    /**
     * Hide skeleton screen
     * @param {HTMLElement|string} element - Target element atau selector
     */
    static hideSkeleton(element) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        const skeleton = target.querySelector('.skeleton-container');
        if (skeleton) {
            skeleton.remove();
        }
    }
}

