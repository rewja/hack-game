/**
 * CollectionSystem - Sistem collection untuk collectibles
 * Phase 4: Engagement & Retention
 */

import { eventBus } from './EventBus.js';
import { BadgeSystem } from './BadgeSystem.js';

/**
 * CollectionSystem class
 */
export class CollectionSystem {
    static COLLECTIBLES = {
        badges: {
            type: 'badge',
            name: 'Badges',
            categories: ['mission', 'achievement', 'special'],
            display: 'grid',
            icon: '🏅'
        },
        themes: {
            type: 'theme',
            name: 'Themes',
            categories: ['terminal', 'ui', 'background'],
            display: 'preview',
            icon: '🎨'
        },
        titles: {
            type: 'title',
            name: 'Titles',
            categories: ['rank', 'achievement', 'special'],
            display: 'list',
            icon: '👑'
        },
        commands: {
            type: 'command',
            name: 'Commands',
            categories: ['basic', 'advanced', 'secret'],
            display: 'terminal',
            icon: '⌨️'
        }
    };
    
    static THEMES = {
        'default': {
            name: 'Default Theme',
            description: 'The classic Soft Hacker OS theme',
            unlocked: true
        },
        'neon_terminal': {
            name: 'Neon Terminal',
            description: 'A beautiful neon theme for your terminal',
            unlocked: false,
            unlockCondition: 'Reach level 25'
        },
        'dark_mode': {
            name: 'Dark Mode',
            description: 'A sleek dark theme',
            unlocked: false,
            unlockCondition: 'Complete 10 missions'
        },
        'pastel_dream': {
            name: 'Pastel Dream',
            description: 'A soft pastel theme',
            unlocked: false,
            unlockCondition: 'Complete all story missions'
        }
    };
    
    static TITLES = {
        'rookie': {
            name: 'Rookie Hacker',
            description: 'Just starting out',
            unlocked: true
        },
        'the_ultimate_hacker': {
            name: 'The Ultimate Hacker',
            description: 'Complete all missions',
            unlocked: false,
            unlockCondition: 'Complete all missions'
        },
        'speed_demon': {
            name: 'Speed Demon',
            description: 'Complete a mission in under 2 minutes',
            unlocked: false,
            unlockCondition: 'Complete a mission in under 2 minutes'
        },
        'elite_hacker': {
            name: 'Elite Hacker',
            description: 'Reach level 20',
            unlocked: false,
            unlockCondition: 'Reach level 20'
        }
    };
    
    /**
     * Unlock collectible
     * @param {string} type - Collectible type (badges, themes, titles, commands)
     * @param {string} id - Collectible ID
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika berhasil unlock (belum pernah unlock sebelumnya)
     */
    static unlockCollectible(type, id, stateManager) {
        const collection = this.getCollection(type, stateManager);
        if (collection.includes(id)) {
            return false; // Already unlocked
        }
        
        collection.push(id);
        this.saveCollection(type, collection, stateManager);
        
        // Get collectible data
        const data = this.getCollectibleData(type, id);
        
        // Show unlock notification
        eventBus.emit('collectible:unlocked', {
            type: type,
            id: id,
            data: data
        });
        
        return true;
    }
    
    /**
     * Get collection untuk type tertentu
     * @param {string} type - Collectible type
     * @param {Object} stateManager - State manager
     * @returns {Array} Collection array
     */
    static getCollection(type, stateManager) {
        const key = `collection_${type}`;
        return stateManager.get(key) || [];
    }
    
    /**
     * Save collection
     * @param {string} type - Collectible type
     * @param {Array} collection - Collection array
     * @param {Object} stateManager - State manager
     */
    static saveCollection(type, collection, stateManager) {
        const key = `collection_${type}`;
        stateManager.set(key, collection);
    }
    
    /**
     * Get collectible data
     * @param {string} type - Collectible type
     * @param {string} id - Collectible ID
     * @returns {Object|null} Collectible data
     */
    static getCollectibleData(type, id) {
        switch (type) {
            case 'badges':
                return BadgeSystem.getBadge(id);
            case 'themes':
                return this.THEMES[id] || null;
            case 'titles':
                return this.TITLES[id] || null;
            default:
                return null;
        }
    }
    
    /**
     * Get collection progress
     * @param {string} type - Collectible type
     * @param {Object} stateManager - State manager
     * @returns {Object} Progress info
     */
    static getCollectionProgress(type, stateManager) {
        const collection = this.getCollection(type, stateManager);
        const total = this.getTotalCollectibles(type);
        
        return {
            collected: collection.length,
            total: total,
            percentage: total > 0 ? (collection.length / total) * 100 : 0
        };
    }
    
    /**
     * Get total collectibles untuk type
     * @param {string} type - Collectible type
     * @returns {number} Total count
     */
    static getTotalCollectibles(type) {
        switch (type) {
            case 'badges':
                return Object.keys(BadgeSystem.getAllBadges()).length;
            case 'themes':
                return Object.keys(this.THEMES).length;
            case 'titles':
                return Object.keys(this.TITLES).length;
            default:
                return 0;
        }
    }
    
    /**
     * Get all collections progress
     * @param {Object} stateManager - State manager
     * @returns {Object} All collections progress
     */
    static getAllCollectionsProgress(stateManager) {
        const progress = {};
        
        Object.keys(this.COLLECTIBLES).forEach(type => {
            progress[type] = this.getCollectionProgress(type, stateManager);
        });
        
        return progress;
    }
}

