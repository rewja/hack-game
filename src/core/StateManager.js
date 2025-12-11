/**
 * StateManager - Centralized state management dengan Proxy pattern
 * Menggunakan Proxy untuk reactive state updates
 * 
 * BEST PRACTICES:
 * 1. Gunakan state.set(key, value) untuk semua state updates
 * 2. StateManager otomatis notify semua subscribers saat state berubah
 * 3. Event bus hanya untuk cross-module actions/events, bukan untuk state updates
 * 4. Subscribe ke state changes menggunakan state.subscribe(key, callback)
 * 
 * Contoh:
 *   // ✅ CORRECT: Update state langsung
 *   state.set('xp', 100);
 *   
 *   // ✅ CORRECT: Emit event untuk action, kemudian update state
 *   eventBus.emit('xp:add', 50);
 *   // Handler akan memanggil: state.set('xp', currentXP + 50);
 *   
 *   // ❌ WRONG: Jangan update state melalui event bus
 *   eventBus.emit('state:update', { xp: 100 });
 */
export class StateManager {
    constructor(initialState = {}) {
        this.subscribers = new Map();
        this.state = new Proxy(initialState, {
            set: (target, prop, value) => {
                const oldValue = target[prop];
                target[prop] = value;
                this.notify(prop, value, oldValue);
                return true;
            },
            get: (target, prop) => {
                return target[prop];
            },
        });
    }

    /**
     * Subscribe ke perubahan state untuk key tertentu
     * @param {string} key - Key state yang ingin di-subscribe
     * @param {Function} callback - Callback function yang akan dipanggil saat state berubah
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Notify semua subscribers tentang perubahan state
     * @param {string} key - Key yang berubah
     * @param {*} newValue - Nilai baru
     * @param {*} oldValue - Nilai lama
     */
    notify(key, newValue, oldValue) {
        const callbacks = this.subscribers.get(key) || [];
        callbacks.forEach((cb) => {
            try {
                cb(newValue, oldValue, key);
            } catch (error) {
                console.error(`Error in subscriber for ${key}:`, error);
            }
        });
    }

    /**
     * Get current state (immutable copy)
     * @returns {Object} Copy dari current state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Get value dari state key tertentu
     * @param {string} key - Key yang ingin diambil
     * @returns {*} Value dari key tersebut
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set value untuk state key tertentu
     * @param {string} key - Key yang ingin di-set
     * @param {*} value - Value yang ingin di-set
     */
    set(key, value) {
        this.state[key] = value;
    }

    /**
     * Update multiple keys sekaligus
     * @param {Object} updates - Object berisi key-value pairs yang ingin di-update
     */
    update(updates) {
        Object.keys(updates).forEach((key) => {
            this.state[key] = updates[key];
        });
    }
}

