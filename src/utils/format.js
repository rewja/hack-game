/**
 * Formatting utilities
 */
export class FormatUtils {
    /**
     * Format waktu relatif (time ago)
     * @param {Date} date - Date object
     * @returns {string} Formatted time string
     */
    static getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    /**
     * Format date ke locale string
     * @param {Date|string} date - Date object atau ISO string
     * @param {string} locale - Locale (default: 'id-ID')
     * @returns {string} Formatted date string
     */
    static formatDate(date, locale = 'id-ID') {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString(locale);
    }

    /**
     * Format number dengan thousand separator
     * @param {number} num - Number
     * @returns {string} Formatted number string
     */
    static formatNumber(num) {
        return num.toLocaleString('id-ID');
    }

    /**
     * Format percentage
     * @param {number} value - Value (0-100)
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    static formatPercentage(value, decimals = 0) {
        return `${value.toFixed(decimals)}%`;
    }
}

