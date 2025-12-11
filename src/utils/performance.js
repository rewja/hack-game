/**
 * Performance utilities - Debouncing, Throttling, dan optimizations
 */

/**
 * Debounce function - Delay execution sampai setelah delay time
 * @param {Function} func - Function yang ingin di-debounce
 * @param {number} wait - Delay dalam milliseconds
 * @param {boolean} immediate - Execute immediately pada first call
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function - Limit execution frequency
 * @param {Function} func - Function yang ingin di-throttle
 * @param {number} limit - Time limit dalam milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * RequestAnimationFrame wrapper untuk smooth animations
 * @param {Function} callback - Callback function
 * @returns {number} Animation frame ID
 */
export function requestAnimation(callback) {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(callback);
    }
    // Fallback untuk browsers yang tidak support
    return setTimeout(callback, 16); // ~60fps
}

/**
 * Cancel animation frame
 * @param {number} id - Animation frame ID
 */
export function cancelAnimation(id) {
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(id);
    } else {
        clearTimeout(id);
    }
}

/**
 * Batch DOM updates untuk performance
 * @param {Function} updateFn - Function yang melakukan DOM updates
 * @param {number} delay - Delay dalam milliseconds (default: 0 untuk next frame)
 */
export function batchDOMUpdates(updateFn, delay = 0) {
    if (delay === 0) {
        requestAnimation(() => {
            updateFn();
        });
    } else {
        setTimeout(() => {
            updateFn();
        }, delay);
    }
}

/**
 * Measure performance
 * @param {string} label - Performance label
 * @param {Function} fn - Function yang ingin di-measure
 * @returns {*} Function result
 */
export function measurePerformance(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
}

/**
 * Async measure performance
 * @param {string} label - Performance label
 * @param {Function} fn - Async function yang ingin di-measure
 * @returns {Promise<*>} Function result
 */
export async function measurePerformanceAsync(label, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
}

/**
 * Memoization utility untuk cache function results
 * @param {Function} fn - Function yang ingin di-memoize
 * @param {Function} keyGenerator - Function untuk generate cache key dari arguments
 * @returns {Function} Memoized function
 */
export function memoize(fn, keyGenerator = null) {
    const cache = new Map();
    
    return function memoized(...args) {
        const key = keyGenerator 
            ? keyGenerator(...args) 
            : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

/**
 * Memoize dengan max cache size untuk prevent memory leak
 * @param {Function} fn - Function yang ingin di-memoize
 * @param {number} maxSize - Maximum cache size (default: 100)
 * @param {Function} keyGenerator - Function untuk generate cache key
 * @returns {Function} Memoized function
 */
export function memoizeWithLimit(fn, maxSize = 100, keyGenerator = null) {
    const cache = new Map();
    
    return function memoized(...args) {
        const key = keyGenerator 
            ? keyGenerator(...args) 
            : JSON.stringify(args);
        
        if (cache.has(key)) {
            // Move to end (LRU)
            const value = cache.get(key);
            cache.delete(key);
            cache.set(key, value);
            return value;
        }
        
        const result = fn.apply(this, args);
        
        // Remove oldest if cache is full
        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        cache.set(key, result);
        return result;
    };
}

/**
 * Check if values are equal (shallow comparison)
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean} True if equal
 */
export function shallowEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    
    return true;
}

