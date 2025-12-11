import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../../src/core/StateManager.js';

describe('StateManager', () => {
    let stateManager;

    beforeEach(() => {
        stateManager = new StateManager({
            xp: 0,
            level: 1,
            missions: [],
        });
    });

    describe('Initialization', () => {
        it('should initialize with initial state', () => {
            const state = stateManager.getState();
            expect(state.xp).toBe(0);
            expect(state.level).toBe(1);
            expect(state.missions).toEqual([]);
        });

        it('should initialize with empty state if no initial state provided', () => {
            const emptyStateManager = new StateManager();
            const state = emptyStateManager.getState();
            expect(state).toEqual({});
        });
    });

    describe('State Management', () => {
        it('should get state value', () => {
            expect(stateManager.get('xp')).toBe(0);
            expect(stateManager.get('level')).toBe(1);
        });

        it('should set state value', () => {
            stateManager.set('xp', 100);
            expect(stateManager.get('xp')).toBe(100);
        });

        it('should update multiple keys', () => {
            stateManager.update({
                xp: 150,
                level: 2,
            });
            expect(stateManager.get('xp')).toBe(150);
            expect(stateManager.get('level')).toBe(2);
        });

        it('should return immutable copy of state', () => {
            const state1 = stateManager.getState();
            const state2 = stateManager.getState();
            state1.xp = 999;
            expect(state2.xp).toBe(0);
        });
    });

    describe('Subscriptions', () => {
        it('should subscribe to state changes', () => {
            const callback = vi.fn();
            stateManager.subscribe('xp', callback);

            stateManager.set('xp', 100);
            expect(callback).toHaveBeenCalledWith(100, 0, 'xp');
        });

        it('should notify multiple subscribers', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            stateManager.subscribe('xp', callback1);
            stateManager.subscribe('xp', callback2);

            stateManager.set('xp', 50);
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should unsubscribe from state changes', () => {
            const callback = vi.fn();
            const unsubscribe = stateManager.subscribe('xp', callback);

            stateManager.set('xp', 100);
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
            stateManager.set('xp', 200);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should handle errors in subscribers gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = vi.fn();

            stateManager.subscribe('xp', errorCallback);
            stateManager.subscribe('xp', normalCallback);

            // Should not throw, but log error
            expect(() => {
                stateManager.set('xp', 100);
            }).not.toThrow();

            expect(normalCallback).toHaveBeenCalled();
        });
    });
});

