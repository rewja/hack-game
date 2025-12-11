/**
 * Security utilities untuk sanitization dan validation
 */
export class SecurityUtils {
    /**
     * Sanitize HTML string untuk mencegah XSS
     * @param {string} str - String yang ingin di-sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text yang ingin di-escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Validate command input
     * @param {string} input - Command input
     * @param {string[]} allowedCommands - List command yang diizinkan
     * @returns {boolean} True jika valid
     */
    static validateCommand(input, allowedCommands = []) {
        if (!input || typeof input !== 'string') {
            return false;
        }
        const [cmd] = input.trim().split(' ');
        return allowedCommands.length === 0 || allowedCommands.includes(cmd.toLowerCase());
    }

    /**
     * Sanitize user input untuk terminal
     * @param {string} input - User input
     * @returns {string} Sanitized input
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        // Remove control characters kecuali newline dan tab
        return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    }
}

