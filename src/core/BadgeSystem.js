/**
 * BadgeSystem - Sistem badges dengan gameplay benefits
 * Phase 2: Progression & Rewards
 */

import { eventBus } from './EventBus.js';

/**
 * BadgeSystem class untuk badges
 */
export class BadgeSystem {
    static BADGES = {
        'hacker_badge': {
            name: 'Hacker Badge',
            description: 'Complete your first mission',
            effect: { xpBonus: 1.1 }, // 10% XP bonus
            icon: '🔓',
            rarity: 'common'
        },
        'interceptor_badge': {
            name: 'Interceptor Badge',
            description: 'Intercept 10 messages',
            effect: { scanSpeed: 1.5 }, // 50% faster scans
            icon: '📡',
            rarity: 'uncommon'
        },
        'decryptor_badge': {
            name: 'Decryptor Badge',
            description: 'Decrypt 5 files',
            effect: { decryptSuccess: 1.2 }, // 20% higher success rate
            icon: '🔐',
            rarity: 'uncommon'
        },
        'firewall_master': {
            name: 'Firewall Master',
            description: 'Bypass 3 firewalls',
            effect: { bypassChance: 1.3 }, // 30% higher bypass chance
            icon: '🛡️',
            rarity: 'rare'
        },
        'speed_demon': {
            name: 'Speed Demon',
            description: 'Complete a mission in under 2 minutes',
            effect: { commandSpeed: 1.25 }, // 25% faster commands
            icon: '⚡',
            rarity: 'rare'
        },
        'elite_hacker': {
            name: 'Elite Hacker',
            description: 'Reach level 20',
            effect: { xpBonus: 1.2, allSuccessRate: 1.15 }, // 20% XP bonus, 15% higher success rate
            icon: '👑',
            rarity: 'epic'
        }
    };
    
    /**
     * Unlock badge
     * @param {string} badgeId - Badge ID
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika berhasil unlock (belum pernah unlock sebelumnya)
     */
    static unlockBadge(badgeId, stateManager) {
        const badges = this.getUnlockedBadges(stateManager);
        if (badges.includes(badgeId)) {
            return false; // Already unlocked
        }
        
        badges.push(badgeId);
        stateManager.set('unlockedBadges', badges);
        
        const badge = this.BADGES[badgeId];
        if (badge) {
            eventBus.emit('badge:unlocked', {
                id: badgeId,
                ...badge
            });
        }
        
        return true;
    }
    
    /**
     * Get unlocked badges
     * @param {Object} stateManager - State manager
     * @returns {Array} Array of badge IDs
     */
    static getUnlockedBadges(stateManager) {
        return stateManager.get('unlockedBadges') || [];
    }
    
    /**
     * Check if badge is unlocked
     * @param {string} badgeId - Badge ID
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika unlocked
     */
    static isUnlocked(badgeId, stateManager) {
        const badges = this.getUnlockedBadges(stateManager);
        return badges.includes(badgeId);
    }
    
    /**
     * Apply badge effects to gameplay
     * @param {Object} stateManager - State manager
     * @returns {Object} Combined effects dari semua badges
     */
    static applyBadgeEffects(stateManager) {
        const badges = this.getUnlockedBadges(stateManager);
        const effects = {
            xpBonus: 1.0,
            scanSpeed: 1.0,
            decryptSuccess: 1.0,
            bypassChance: 1.0,
            commandSpeed: 1.0,
            allSuccessRate: 1.0
        };
        
        badges.forEach(badgeId => {
            const badge = this.BADGES[badgeId];
            if (badge && badge.effect) {
                // Combine effects (multiply multipliers)
                Object.keys(badge.effect).forEach(key => {
                    if (effects[key] !== undefined) {
                        effects[key] *= badge.effect[key];
                    }
                });
            }
        });
        
        return effects;
    }
    
    /**
     * Get badge info
     * @param {string} badgeId - Badge ID
     * @returns {Object|null} Badge info atau null
     */
    static getBadge(badgeId) {
        return this.BADGES[badgeId] || null;
    }
    
    /**
     * Get all badges
     * @returns {Object} All badges
     */
    static getAllBadges() {
        return this.BADGES;
    }
}

