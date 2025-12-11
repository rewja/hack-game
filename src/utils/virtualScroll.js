import { DOMUtils } from './dom.js';
import { requestAnimation } from './performance.js';

/**
 * VirtualScroll - Virtual scrolling untuk large lists
 * Hanya render items yang visible di viewport
 */
export class VirtualScroll {
    constructor(container, items, options = {}) {
        this.container = container;
        this.items = items;
        this.itemHeight = options.itemHeight || 50;
        this.overscan = options.overscan || 5; // Render extra items untuk smooth scrolling
        this.startIndex = 0;
        this.endIndex = 0;
        this.scrollTop = 0;
        this.isScrolling = false;
        this.animationFrameId = null;

        this.init();
    }

    /**
     * Initialize virtual scroll
     */
    init() {
        if (!this.container) {
            console.error('VirtualScroll: Container element not found');
            return;
        }

        // Create wrapper untuk items
        this.wrapper = DOMUtils.createElement('div', {
            className: 'virtual-scroll-wrapper',
            style: `position: relative; height: ${this.items.length * this.itemHeight}px;`,
        });

        // Create viewport
        this.viewport = DOMUtils.createElement('div', {
            className: 'virtual-scroll-viewport',
            style: 'position: absolute; top: 0; left: 0; right: 0;',
        });

        this.wrapper.appendChild(this.viewport);
        DOMUtils.clearChildren(this.container);
        this.container.appendChild(this.wrapper);

        // Setup scroll listener
        this.container.addEventListener('scroll', this.handleScroll.bind(this), {
            passive: true,
        });

        // Initial render
        this.calculateVisibleRange();
        this.render();
    }

    /**
     * Calculate visible range
     */
    calculateVisibleRange() {
        if (!this.container) return;

        const containerHeight = this.container.clientHeight;
        this.scrollTop = this.container.scrollTop;

        this.startIndex = Math.max(
            0,
            Math.floor(this.scrollTop / this.itemHeight) - this.overscan
        );
        this.endIndex = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + containerHeight) / this.itemHeight) + this.overscan
        );
    }

    /**
     * Render visible items
     */
    render() {
        if (!this.viewport) return;

        // Clear viewport
        DOMUtils.clearChildren(this.viewport);

        // Render visible items
        const visibleItems = this.items.slice(this.startIndex, this.endIndex);

        visibleItems.forEach((item, index) => {
            const actualIndex = this.startIndex + index;
            const itemElement = this.renderItem(item, actualIndex);
            if (itemElement) {
                itemElement.style.position = 'absolute';
                itemElement.style.top = `${actualIndex * this.itemHeight}px`;
                itemElement.style.left = '0';
                itemElement.style.right = '0';
                itemElement.style.height = `${this.itemHeight}px`;
                this.viewport.appendChild(itemElement);
            }
        });
    }

    /**
     * Render single item (override di subclass)
     * @param {*} item - Item data
     * @param {number} index - Item index
     * @returns {HTMLElement} Rendered element
     */
    renderItem(item, index) {
        // Override di subclass
        const div = DOMUtils.createElement('div', {
            className: 'virtual-scroll-item',
            textContent: `Item ${index}`,
        });
        return div;
    }

    /**
     * Handle scroll event
     */
    handleScroll() {
        if (this.isScrolling) return;

        this.isScrolling = true;
        this.animationFrameId = requestAnimation(() => {
            this.calculateVisibleRange();
            this.render();
            this.isScrolling = false;
        });
    }

    /**
     * Update items
     * @param {Array} newItems - New items array
     */
    updateItems(newItems) {
        this.items = newItems;
        this.wrapper.style.height = `${this.items.length * this.itemHeight}px`;
        this.calculateVisibleRange();
        this.render();
    }

    /**
     * Scroll to index
     * @param {number} index - Target index
     */
    scrollToIndex(index) {
        if (index < 0 || index >= this.items.length) return;

        const scrollTop = index * this.itemHeight;
        this.container.scrollTop = scrollTop;
        this.calculateVisibleRange();
        this.render();
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        this.scrollToIndex(this.items.length - 1);
    }

    /**
     * Destroy virtual scroll
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.container) {
            this.container.removeEventListener('scroll', this.handleScroll);
        }
    }
}

