import { describe, it, expect } from 'vitest';
import { FormatUtils } from '../../src/utils/format.js';

describe('FormatUtils', () => {
    describe('getTimeAgo', () => {
        it('should return "Just now" for recent dates', () => {
            const date = new Date();
            expect(FormatUtils.getTimeAgo(date)).toBe('Just now');
        });

        it('should return minutes ago', () => {
            const date = new Date(Date.now() - 5 * 60 * 1000);
            expect(FormatUtils.getTimeAgo(date)).toBe('5m ago');
        });

        it('should return hours ago', () => {
            const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
            expect(FormatUtils.getTimeAgo(date)).toBe('2h ago');
        });

        it('should return days ago', () => {
            const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            expect(FormatUtils.getTimeAgo(date)).toBe('3d ago');
        });
    });

    describe('formatDate', () => {
        it('should format date to locale string', () => {
            const date = new Date('2024-01-15T10:30:00');
            const formatted = FormatUtils.formatDate(date, 'id-ID');
            expect(formatted).toContain('2024');
        });

        it('should handle ISO string input', () => {
            const dateStr = '2024-01-15T10:30:00Z';
            const formatted = FormatUtils.formatDate(dateStr);
            expect(formatted).toBeTruthy();
        });
    });

    describe('formatNumber', () => {
        it('should format number with thousand separator', () => {
            expect(FormatUtils.formatNumber(1000)).toBe('1.000');
            expect(FormatUtils.formatNumber(1234567)).toBe('1.234.567');
        });

        it('should format small numbers', () => {
            expect(FormatUtils.formatNumber(5)).toBe('5');
            expect(FormatUtils.formatNumber(123)).toBe('123');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentage with default decimals', () => {
            expect(FormatUtils.formatPercentage(50)).toBe('50%');
            expect(FormatUtils.formatPercentage(75.5)).toBe('76%');
        });

        it('should format percentage with custom decimals', () => {
            expect(FormatUtils.formatPercentage(50.123, 2)).toBe('50.12%');
            expect(FormatUtils.formatPercentage(75.567, 1)).toBe('75.6%');
        });
    });
});

