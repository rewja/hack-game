import { describe, it, expect } from 'vitest';
import { SecurityUtils } from '../../src/utils/security.js';

describe('SecurityUtils', () => {
    describe('escapeHtml', () => {
        it('should escape HTML special characters', () => {
            expect(SecurityUtils.escapeHtml('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
            );
        });

        it('should escape ampersand', () => {
            expect(SecurityUtils.escapeHtml('A & B')).toBe('A &amp; B');
        });

        it('should escape single quotes', () => {
            expect(SecurityUtils.escapeHtml("It's working")).toBe('It&#039;s working');
        });

        it('should return empty string for non-string input', () => {
            expect(SecurityUtils.escapeHtml(null)).toBe('');
            expect(SecurityUtils.escapeHtml(undefined)).toBe('');
        });
    });

    describe('sanitizeInput', () => {
        it('should remove control characters', () => {
            const input = 'test\x00\x01\x02string';
            const sanitized = SecurityUtils.sanitizeInput(input);
            expect(sanitized).toBe('teststring');
        });

        it('should preserve newline and tab', () => {
            const input = 'line1\nline2\tindented';
            const sanitized = SecurityUtils.sanitizeInput(input);
            expect(sanitized).toBe('line1\nline2\tindented');
        });

        it('should return empty string for non-string input', () => {
            expect(SecurityUtils.sanitizeInput(null)).toBe('');
            expect(SecurityUtils.sanitizeInput(123)).toBe('');
        });
    });

    describe('validateCommand', () => {
        it('should validate command against allowed list', () => {
            const allowedCommands = ['help', 'clear', 'scan'];
            expect(SecurityUtils.validateCommand('help', allowedCommands)).toBe(true);
            expect(SecurityUtils.validateCommand('invalid', allowedCommands)).toBe(false);
        });

        it('should validate command case-insensitively', () => {
            const allowedCommands = ['help', 'clear'];
            expect(SecurityUtils.validateCommand('HELP', allowedCommands)).toBe(true);
            expect(SecurityUtils.validateCommand('Clear', allowedCommands)).toBe(true);
        });

        it('should return true if no allowed commands specified', () => {
            expect(SecurityUtils.validateCommand('anycommand', [])).toBe(true);
        });

        it('should return false for invalid input', () => {
            expect(SecurityUtils.validateCommand(null, ['help'])).toBe(false);
            expect(SecurityUtils.validateCommand('', ['help'])).toBe(false);
        });
    });

    describe('sanitizeHTML', () => {
        it('should sanitize HTML string', () => {
            const html = '<script>alert("xss")</script>';
            const sanitized = SecurityUtils.sanitizeHTML(html);
            expect(sanitized).not.toContain('<script>');
        });
    });
});

