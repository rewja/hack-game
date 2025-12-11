import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
    memoize, 
    memoizeWithLimit, 
    shallowEqual,
    debounce,
    throttle
} from '../../src/utils/performance.js';

describe('Performance Utils', () => {
    describe('memoize', () => {
        it('should cache function results', () => {
            let callCount = 0;
            const fn = (x) => {
                callCount++;
                return x * 2;
            };
            
            const memoized = memoize(fn);
            
            expect(memoized(5)).toBe(10);
            expect(callCount).toBe(1);
            
            expect(memoized(5)).toBe(10);
            expect(callCount).toBe(1); // Should not call again
            
            expect(memoized(10)).toBe(20);
            expect(callCount).toBe(2); // New argument, should call
        });
        
        it('should work with multiple arguments', () => {
            let callCount = 0;
            const fn = (a, b) => {
                callCount++;
                return a + b;
            };
            
            const memoized = memoize(fn);
            
            expect(memoized(1, 2)).toBe(3);
            expect(callCount).toBe(1);
            
            expect(memoized(1, 2)).toBe(3);
            expect(callCount).toBe(1);
            
            expect(memoized(2, 3)).toBe(5);
            expect(callCount).toBe(2);
        });
        
        it('should use custom key generator', () => {
            let callCount = 0;
            const fn = (obj) => {
                callCount++;
                return obj.value * 2;
            };
            
            const keyGenerator = (obj) => obj.id;
            const memoized = memoize(fn, keyGenerator);
            
            expect(memoized({ id: 'a', value: 5 })).toBe(10);
            expect(callCount).toBe(1);
            
            expect(memoized({ id: 'a', value: 10 })).toBe(10); // Same id, cached
            expect(callCount).toBe(1);
            
            expect(memoized({ id: 'b', value: 5 })).toBe(10); // Different id
            expect(callCount).toBe(2);
        });
    });
    
    describe('memoizeWithLimit', () => {
        it('should limit cache size', () => {
            let callCount = 0;
            const fn = (x) => {
                callCount++;
                return x;
            };
            
            const memoized = memoizeWithLimit(fn, 2);
            
            memoized(1);
            memoized(2);
            expect(callCount).toBe(2);
            
            memoized(1); // Should be cached
            expect(callCount).toBe(2);
            
            memoized(3); // Should remove oldest (1) and add 3
            expect(callCount).toBe(3);
            
            memoized(1); // Should call again because 1 was removed
            expect(callCount).toBe(4);
        });
        
        it('should implement LRU cache', () => {
            let callCount = 0;
            const fn = (x) => {
                callCount++;
                return x;
            };
            
            const memoized = memoizeWithLimit(fn, 3);
            
            memoized(1);
            memoized(2);
            memoized(3);
            expect(callCount).toBe(3);
            
            memoized(1); // Access 1, moves to end
            expect(callCount).toBe(3);
            
            memoized(4); // Should remove 2 (oldest), keep 1, 3, 4
            expect(callCount).toBe(4);
            
            memoized(2); // Should call again because 2 was removed
            expect(callCount).toBe(5);
            
            memoized(1); // Should be cached (was moved to end)
            expect(callCount).toBe(5);
        });
    });
    
    describe('shallowEqual', () => {
        it('should return true for equal primitives', () => {
            expect(shallowEqual(5, 5)).toBe(true);
            expect(shallowEqual('test', 'test')).toBe(true);
            expect(shallowEqual(null, null)).toBe(true);
            expect(shallowEqual(undefined, undefined)).toBe(true);
        });
        
        it('should return false for different primitives', () => {
            expect(shallowEqual(5, 10)).toBe(false);
            expect(shallowEqual('test', 'other')).toBe(false);
        });
        
        it('should return true for equal objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 2 };
            expect(shallowEqual(obj1, obj2)).toBe(true);
        });
        
        it('should return false for different objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };
            expect(shallowEqual(obj1, obj2)).toBe(false);
        });
        
        it('should return false for objects with different keys', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, c: 2 };
            expect(shallowEqual(obj1, obj2)).toBe(false);
        });
        
        it('should not deep compare nested objects', () => {
            const obj1 = { a: { nested: 1 } };
            const obj2 = { a: { nested: 1 } };
            // Should return false because it's shallow comparison
            expect(shallowEqual(obj1, obj2)).toBe(false);
        });
    });
    
    describe('debounce', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        
        afterEach(() => {
            vi.useRealTimers();
        });
        
        it('should delay function execution', () => {
            const fn = vi.fn();
            const debounced = debounce(fn, 100);
            
            debounced();
            expect(fn).not.toHaveBeenCalled();
            
            vi.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });
        
        it('should cancel previous calls', () => {
            const fn = vi.fn();
            const debounced = debounce(fn, 100);
            
            debounced();
            debounced();
            debounced();
            
            vi.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('throttle', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        
        afterEach(() => {
            vi.useRealTimers();
        });
        
        it('should limit function execution frequency', () => {
            const fn = vi.fn();
            const throttled = throttle(fn, 100);
            
            throttled();
            expect(fn).toHaveBeenCalledTimes(1);
            
            throttled();
            expect(fn).toHaveBeenCalledTimes(1); // Should not call again
            
            vi.advanceTimersByTime(100);
            throttled();
            expect(fn).toHaveBeenCalledTimes(2);
        });
    });
});

