/**
 * RewardSystem - Sistem milestone rewards
 * Phase 2: Progression & Rewards
 */

import { eventBus } from './EventBus.js';

/**
 * RewardSystem class untuk milestone rewards
 */
export class RewardSystem {
    static MILESTONE_REWARDS = {
        5: { 
            type: 'unlock', 
            item: 'advanced_scanner', 
            name: 'Advanced Scanner',
            message: 'Advanced Scanner Unlocked!',
            description: 'Scan commands are now 20% faster'
        },
        10: { 
            type: 'unlock', 
            item: 'stealth_mode', 
            name: 'Stealth Mode',
            message: 'Stealth Mode Unlocked!',
            description: 'Commands have 15% higher success rate'
        },
        15: { 
            type: 'unlock', 
            item: 'auto_decrypt', 
            name: 'Auto-Decrypt Tool',
            message: 'Auto-Decrypt Tool Unlocked!',
            description: 'Decrypt commands are now 30% faster'
        },
        20: { 
            type: 'badge', 
            item: 'elite_hacker', 
            name: 'Elite Hacker Badge',
            message: 'Elite Hacker Badge Earned!',
            description: 'You are now an Elite Hacker!'
        },
        25: { 
            type: 'cosmetic', 
            item: 'neon_terminal', 
            name: 'Neon Terminal Theme',
            message: 'Neon Terminal Theme Unlocked!',
            description: 'A beautiful neon theme for your terminal'
        },
        30: { 
            type: 'unlock', 
            item: 'mission_editor', 
            name: 'Mission Editor',
            message: 'Mission Editor Unlocked!',
            description: 'Create and edit your own missions'
        }
    };
    
    /**
     * Check and award milestone rewards
     * @param {number} level - Level yang baru dicapai
     * @param {Object} stateManager - State manager untuk save unlocked items
     * @returns {Object|null} Milestone reward atau null
     */
    static checkMilestones(level, stateManager) {
        const milestone = this.MILESTONE_REWARDS[level];
        if (!milestone) return null;
        
        // Check if already unlocked
        const unlocked = stateManager.get('unlockedItems') || [];
        if (unlocked.includes(milestone.item)) {
            return null; // Already unlocked
        }
        
        // Add to unlocked items
        unlocked.push(milestone.item);
        stateManager.set('unlockedItems', unlocked);
        
        // Emit event
        eventBus.emit('milestone:unlocked', {
            ...milestone,
            level: level
        });
        
        return {
            ...milestone,
            level: level
        };
    }
    
    /**
     * Get all unlocked items
     * @param {Object} stateManager - State manager
     * @returns {Array} Array of unlocked item IDs
     */
    static getUnlockedItems(stateManager) {
        return stateManager.get('unlockedItems') || [];
    }
    
    /**
     * Check if item is unlocked
     * @param {string} itemId - Item ID
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika unlocked
     */
    static isUnlocked(itemId, stateManager) {
        const unlocked = this.getUnlockedItems(stateManager);
        return unlocked.includes(itemId);
    }
}

