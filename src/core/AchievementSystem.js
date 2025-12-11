/**
 * AchievementSystem - Sistem achievements
 * Phase 2: Progression & Rewards
 */

import { BadgeSystem } from './BadgeSystem.js';
import { eventBus } from './EventBus.js';

/**
 * AchievementSystem class untuk achievements
 */
export class AchievementSystem {
    static ACHIEVEMENTS = {
        'first_mission': {
            name: 'First Steps',
            description: 'Complete your first mission',
            icon: '🎯',
            reward: { xp: 25, badge: 'hacker_badge' },
            check: (gameState) => {
                return (gameState.completedMissions || 0) >= 1;
            }
        },
        'speed_demon': {
            name: 'Speed Demon',
            description: 'Complete a mission in under 2 minutes',
            icon: '⚡',
            reward: { xp: 50, badge: 'speed_demon' },
            check: (gameState) => {
                const fastestMission = gameState.fastestMissionCompletion || null;
                return fastestMission && fastestMission.time < 120000; // 2 minutes in ms
            }
        },
        'perfectionist': {
            name: 'Perfectionist',
            description: 'Complete 5 missions without failing any step',
            icon: '✨',
            reward: { xp: 100, badge: null },
            check: (gameState) => {
                return (gameState.perfectMissions || 0) >= 5;
            }
        },
        'night_owl': {
            name: 'Night Owl',
            description: 'Complete 10 missions after midnight',
            icon: '🦉',
            reward: { xp: 75, badge: null },
            check: (gameState) => {
                return (gameState.nightMissions || 0) >= 10;
            }
        },
        'command_master': {
            name: 'Command Master',
            description: 'Use every command at least once',
            icon: '⌨️',
            reward: { xp: 150, badge: null },
            check: (gameState) => {
                const usedCommands = gameState.usedCommands || [];
                const allCommands = ['help', 'clear', 'scan', 'bruteforce', 'decrypt', 'ping', 'missions', 'logs', 'whoami', 'date', 'echo'];
                return allCommands.every(cmd => usedCommands.includes(cmd));
            }
        },
        'completionist': {
            name: 'Completionist',
            description: 'Complete all missions',
            icon: '🏆',
            reward: { xp: 500, badge: null, title: 'The Ultimate Hacker' },
            check: (gameState) => {
                const missions = gameState.missions || [];
                return missions.length > 0 && missions.every(m => m.status === 'completed');
            }
        },
        'level_10': {
            name: 'Rising Star',
            description: 'Reach level 10',
            icon: '⭐',
            reward: { xp: 100, badge: null },
            check: (gameState) => {
                return (gameState.level || 1) >= 10;
            }
        },
        'level_20': {
            name: 'Elite Hacker',
            description: 'Reach level 20',
            icon: '👑',
            reward: { xp: 200, badge: 'elite_hacker' },
            check: (gameState) => {
                return (gameState.level || 1) >= 20;
            }
        }
    };
    
    /**
     * Check achievements based on game state
     * @param {Object} stateManager - State manager
     * @returns {Array} Array of newly unlocked achievements
     */
    static checkAchievements(stateManager) {
        const gameState = stateManager.getState();
        const unlocked = stateManager.get('unlockedAchievements') || [];
        const newlyUnlocked = [];
        
        // Check each achievement
        Object.entries(this.ACHIEVEMENTS).forEach(([id, achievement]) => {
            // Skip if already unlocked
            if (unlocked.includes(id)) return;
            
            // Check condition
            if (achievement.check && achievement.check(gameState)) {
                newlyUnlocked.push({ id, ...achievement });
                unlocked.push(id);
                
                // Award rewards
                if (achievement.reward) {
                    if (achievement.reward.xp) {
                        eventBus.emit('xp:add', achievement.reward.xp);
                    }
                    if (achievement.reward.badge) {
                        BadgeSystem.unlockBadge(achievement.reward.badge, stateManager);
                    }
                    if (achievement.reward.title) {
                        stateManager.set('playerTitle', achievement.reward.title);
                        // Also unlock in collection system
                        import('./CollectionSystem.js').then(({ CollectionSystem }) => {
                            CollectionSystem.unlockCollectible('titles', achievement.reward.title.toLowerCase().replace(/\s+/g, '_'), stateManager);
                        });
                    }
                }
            }
        });
        
        if (newlyUnlocked.length > 0) {
            stateManager.set('unlockedAchievements', unlocked);
            
            // Emit events untuk setiap achievement
            newlyUnlocked.forEach(achievement => {
                eventBus.emit('achievement:unlocked', achievement);
            });
        }
        
        return newlyUnlocked;
    }
    
    /**
     * Get unlocked achievements
     * @param {Object} stateManager - State manager
     * @returns {Array} Array of achievement IDs
     */
    static getUnlockedAchievements(stateManager) {
        return stateManager.get('unlockedAchievements') || [];
    }
    
    /**
     * Check if achievement is unlocked
     * @param {string} achievementId - Achievement ID
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika unlocked
     */
    static isUnlocked(achievementId, stateManager) {
        const unlocked = this.getUnlockedAchievements(stateManager);
        return unlocked.includes(achievementId);
    }
    
    /**
     * Get achievement info
     * @param {string} achievementId - Achievement ID
     * @returns {Object|null} Achievement info atau null
     */
    static getAchievement(achievementId) {
        return this.ACHIEVEMENTS[achievementId] || null;
    }
    
    /**
     * Get all achievements
     * @returns {Object} All achievements
     */
    static getAllAchievements() {
        return this.ACHIEVEMENTS;
    }
}

