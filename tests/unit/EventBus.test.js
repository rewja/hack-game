import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
    let eventBus;

    beforeEach(() => {
        eventBus = new EventBus();
    });

    describe('Event Registration', () => {
        it('should register event listener', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);

            eventBus.emit('test:event', { data: 'test' });
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should register multiple listeners for same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            eventBus.on('test:event', callback1);
            eventBus.on('test:event', callback2);

            eventBus.emit('test:event', { data: 'test' });
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });

    describe('Event Emission', () => {
        it('should emit event with data', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);

            eventBus.emit('test:event', { message: 'hello' });
            expect(callback).toHaveBeenCalledWith({ message: 'hello' });
        });

        it('should emit event without data', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);

            eventBus.emit('test:event');
            expect(callback).toHaveBeenCalledWith(null);
        });

        it('should not call listeners for unregistered events', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);

            eventBus.emit('other:event', { data: 'test' });
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Event Unsubscription', () => {
        it('should unsubscribe from event', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);

            eventBus.emit('test:event');
            expect(callback).toHaveBeenCalledTimes(1);

            eventBus.off('test:event', callback);
            eventBus.emit('test:event');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should return unsubscribe function from on()', () => {
            const callback = vi.fn();
            const unsubscribe = eventBus.on('test:event', callback);

            eventBus.emit('test:event');
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
            eventBus.emit('test:event');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Once Subscription', () => {
        it('should call listener only once', () => {
            const callback = vi.fn();
            eventBus.once('test:event', callback);

            eventBus.emit('test:event');
            eventBus.emit('test:event');
            eventBus.emit('test:event');

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('Clear Events', () => {
        it('should clear specific event', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);
            eventBus.on('other:event', callback);

            eventBus.clear('test:event');
            eventBus.emit('test:event');
            eventBus.emit('other:event');

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should clear all events', () => {
            const callback = vi.fn();
            eventBus.on('test:event', callback);
            eventBus.on('other:event', callback);

            eventBus.clear();
            eventBus.emit('test:event');
            eventBus.emit('other:event');

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in event listeners gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = vi.fn();

            eventBus.on('test:event', errorCallback);
            eventBus.on('test:event', normalCallback);

            expect(() => {
                eventBus.emit('test:event');
            }).not.toThrow();

            expect(normalCallback).toHaveBeenCalled();
        });
    });
});

