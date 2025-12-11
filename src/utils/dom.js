/**
 * DOM utilities untuk manipulasi DOM yang lebih aman dan efisien
 */
export class DOMUtils {
    /**
     * Create element dengan attributes
     * @param {string} tag - Tag name
     * @param {Object} attributes - Attributes object
     * @param {string|Node} content - Content (text atau node)
     * @returns {HTMLElement} Created element
     */
    static createElement(tag, attributes = {}, content = null) {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach((key) => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (content !== null) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof Node) {
                element.appendChild(content);
            }
        }

        return element;
    }

    /**
     * Safe innerHTML dengan sanitization
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML string
     */
    static safeInnerHTML(element, html) {
        // Untuk sekarang, gunakan textContent untuk keamanan
        // Di production, bisa gunakan DOMPurify
        element.textContent = html;
    }

    /**
     * Append multiple children sekaligus
     * @param {HTMLElement} parent - Parent element
     * @param {HTMLElement[]} children - Array of child elements
     */
    static appendChildren(parent, children) {
        children.forEach((child) => {
            if (child instanceof Node) {
                parent.appendChild(child);
            }
        });
    }

    /**
     * Remove all children dari element
     * @param {HTMLElement} element - Target element
     */
    static clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Scroll to bottom dengan smooth behavior
     * @param {HTMLElement} element - Target element
     */
    static scrollToBottom(element) {
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }
}

/**
 * DOM Cache untuk mengurangi querySelector calls
 */
export class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get element dengan caching
     * @param {string} selector - CSS selector
     * @param {boolean} forceRefresh - Force refresh cache
     * @returns {HTMLElement|null} Element atau null
     */
    get(selector, forceRefresh = false) {
        if (forceRefresh || !this.cache.has(selector)) {
            const element = document.querySelector(selector);
            this.cache.set(selector, element);
            return element;
        }
        return this.cache.get(selector);
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Remove specific selector dari cache
     * @param {string} selector - CSS selector
     */
    remove(selector) {
        this.cache.delete(selector);
    }
}

