import { describe, it, expect } from 'vitest';
import { ValidationUtils } from '../../src/utils/validation.js';

describe('ValidationUtils', () => {
    describe('validateMission', () => {
        it('should validate correct mission structure', () => {
            const mission = {
                id: 'mission-01',
                title: 'Test Mission',
                description: 'Test description',
                status: 'active',
                steps: [
                    { id: 'step-1', text: 'Step 1', completed: false },
                ],
                reward: '50 XP',
            };

            expect(ValidationUtils.validateMission(mission)).toBe(true);
        });

        it('should reject mission with missing required fields', () => {
            const mission = {
                id: 'mission-01',
                // Missing title
                description: 'Test',
                status: 'active',
                steps: [],
                reward: '50 XP',
            };

            expect(ValidationUtils.validateMission(mission)).toBe(false);
        });

        it('should reject mission with invalid status', () => {
            const mission = {
                id: 'mission-01',
                title: 'Test',
                description: 'Test',
                status: 'invalid',
                steps: [],
                reward: '50 XP',
            };

            expect(ValidationUtils.validateMission(mission)).toBe(false);
        });

        it('should reject mission with invalid steps', () => {
            const mission = {
                id: 'mission-01',
                title: 'Test',
                description: 'Test',
                status: 'active',
                steps: [{ id: 'step-1' }], // Missing text and completed
                reward: '50 XP',
            };

            expect(ValidationUtils.validateMission(mission)).toBe(false);
        });
    });

    describe('validateSettings', () => {
        it('should validate correct settings', () => {
            const settings = {
                sound: true,
                animations: false,
                autosave: true,
                fontSize: 14,
            };

            expect(ValidationUtils.validateSettings(settings)).toBe(true);
        });

        it('should reject settings with invalid types', () => {
            const settings = {
                sound: 'true', // Should be boolean
                animations: false,
            };

            expect(ValidationUtils.validateSettings(settings)).toBe(false);
        });

        it('should reject settings with invalid keys', () => {
            const settings = {
                sound: true,
                invalidKey: 'value',
            };

            expect(ValidationUtils.validateSettings(settings)).toBe(false);
        });
    });

    describe('validateString', () => {
        it('should validate string with constraints', () => {
            expect(ValidationUtils.validateString('hello', { minLength: 3, maxLength: 10 })).toBe('hello');
            expect(ValidationUtils.validateString('hi', { minLength: 3 })).toBe(null);
            expect(ValidationUtils.validateString('verylongstring', { maxLength: 5 })).toBe('veryl');
        });

        it('should validate string with pattern', () => {
            const pattern = /^[a-z]+$/;
            expect(ValidationUtils.validateString('hello', { pattern })).toBe('hello');
            expect(ValidationUtils.validateString('hello123', { pattern })).toBe(null);
        });
    });

    describe('validateNumber', () => {
        it('should validate number with constraints', () => {
            expect(ValidationUtils.validateNumber(50, { min: 0, max: 100 })).toBe(50);
            expect(ValidationUtils.validateNumber(-10, { min: 0 })).toBe(null);
            expect(ValidationUtils.validateNumber(150, { max: 100 })).toBe(null);
        });

        it('should reject non-numeric values', () => {
            expect(ValidationUtils.validateNumber('not a number')).toBe(null);
            expect(ValidationUtils.validateNumber(NaN)).toBe(null);
        });
    });
});

