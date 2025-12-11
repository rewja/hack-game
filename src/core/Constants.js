/**
 * Constants untuk Soft Hacker OS
 * Menyimpan semua magic numbers dan konfigurasi default
 */
export const CONSTANTS = {
    XP_PER_LEVEL: 100,
    TERMINAL: {
        MAX_HISTORY: 100,
        MAX_LINES: 500, // Maximum lines in terminal display (prevent memory leak)
        CURSOR_BLINK_INTERVAL: 1000,
        AUTOCOMPLETE_DELAY: 300,
        BATCH_RENDER_INTERVAL: 16, // ~60fps
    },
    MISSION: {
        STATUS: {
            ACTIVE: 'active',
            LOCKED: 'locked',
            COMPLETED: 'completed',
        },
    },
    STORAGE: {
        SETTINGS_KEY: 'softHackerSettings',
        STATE_KEY: 'softHackerState',
        WELCOME_KEY: 'softHackerWelcomeSeen',
    },
    ANIMATIONS: {
        FADE_IN: '0.15s ease',
        SLIDE_UP: '0.3s ease',
        TRANSITION_NORMAL: '0.2s ease',
    },
    LOG_LEVELS: {
        INFO: 'INFO',
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR',
        WARNING: 'WARNING',
    },
    COMMAND: {
        // Base success rates untuk commands (0.0 - 1.0)
        BASE_SUCCESS_RATE: {
            scan: 0.95,
            bruteforce: 0.70,
            decrypt: 0.80,
            ping: 0.99,
        },
        // Retry penalties (mengurangi success rate setiap retry)
        RETRY_PENALTY: 0.1,
        // Max retries sebelum command locked
        MAX_RETRIES: 3,
    },
    MINI_GAMES: {
        TYPING_CHALLENGE_TIME_LIMIT: 10000, // 10 seconds
        HACK_SPEED_GREEN_ZONE_START: 70,
        HACK_SPEED_GREEN_ZONE_END: 85,
    },
};

