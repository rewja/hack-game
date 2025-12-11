import { DOMUtils } from '../../utils/dom.js';
import { FormatUtils } from '../../utils/format.js';
import { SecurityUtils } from '../../utils/security.js';
import { VirtualScroll } from '../../utils/virtualScroll.js';
import { eventBus } from '../../core/EventBus.js';

/**
 * LogSystem - Mengelola system logs display dengan virtual scrolling
 */
export class LogSystem {
    constructor(stateManager) {
        this.state = stateManager;
        this.virtualScroll = null;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen untuk logs updates
        eventBus.on('logs:updated', () => {
            this.updateLogsDisplay();
        });

        // Listen untuk state changes
        this.state.subscribe('logs', () => {
            this.updateLogsDisplay();
        });
    }

    /**
     * Update logs display dengan virtual scrolling
     */
    updateLogsDisplay() {
        const logsContent = document.getElementById('logsContent');
        if (!logsContent) return;

        const logs = this.state.get('logs') || [];

        // Initialize virtual scroll jika belum ada
        if (!this.virtualScroll) {
            this.virtualScroll = new VirtualScroll(logsContent, logs, {
                itemHeight: 40, // Approximate height per log entry
                overscan: 3,
            });

            // Override renderItem untuk custom log rendering
            this.virtualScroll.renderItem = (log, index) => {
                const entry = DOMUtils.createElement('div', { className: 'log-entry' });
                const time = FormatUtils.formatDate(log.time);
                const timeSpan = DOMUtils.createElement('span', {
                    className: 'log-time',
                    textContent: `[${time}]`,
                });
                const levelSpan = DOMUtils.createElement('span', {
                    className: `log-level ${log.level.toLowerCase()}`,
                    textContent: `[${log.level}]`,
                });
                const messageSpan = DOMUtils.createElement('span', {
                    className: 'log-message',
                    textContent: SecurityUtils.escapeHtml(log.message),
                });

                DOMUtils.appendChildren(entry, [timeSpan, levelSpan, messageSpan]);
                return entry;
            };

            // Initial render
            this.virtualScroll.render();
        } else {
            // Update items
            this.virtualScroll.updateItems(logs);

            // Auto-scroll to bottom jika user belum scroll up
            const isNearBottom =
                logsContent.scrollHeight - logsContent.scrollTop <=
                logsContent.clientHeight + 100;
            if (isNearBottom) {
                this.virtualScroll.scrollToBottom();
            }
        }
    }
}

