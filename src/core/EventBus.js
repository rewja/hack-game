/**
 * EventBus - Event-driven communication system
 * Menggunakan publish-subscribe pattern untuk loose coupling
 */
export class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe ke event tertentu
     * @param {string} event - Nama event
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.off(event, callback);
        };
    }

    /**
     * Emit event dengan data
     * @param {string} event - Nama event
     * @param {*} data - Data yang akan dikirim ke subscribers
     */
    emit(event, data = null) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Unsubscribe dari event
     * @param {string} event - Nama event
     * @param {Function} callback - Callback function yang ingin di-unsubscribe
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
    }

    /**
     * Subscribe ke event sekali saja
     * @param {string} event - Nama event
     * @param {Function} callback - Callback function
     */
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * Clear semua listeners untuk event tertentu
     * @param {string} event - Nama event (optional, jika tidak ada akan clear semua)
     */
    clear(event = null) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}

// Export singleton instance
export const eventBus = new EventBus();

