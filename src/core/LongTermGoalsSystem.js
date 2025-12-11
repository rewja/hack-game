/**
 * LongTermGoalsSystem - Sistem long-term goals untuk endgame content
 * Phase 4: Engagement & Retention
 */

import { eventBus } from './EventBus.js';
import { BadgeSystem } from './BadgeSystem.js';

/**
 * LongTermGoalsSystem class
 */
export class LongTermGoalsSystem {
    static GOALS = {
        'collect_all_badges': {
            name: 'Badge Collector',
            description: 'Collect all badges',
            icon: '🏅',
            progress: (gameState) => {
                const badges = gameState.unlockedBadges || [];
                const total = Object.keys(BadgeSystem.getAllBadges()).length;
                return {
                    current: badges.length,
                    target: total,
                    percentage: (badges.length / total) * 100
                };
            },
            reward: { xp: 1000, title: 'Badge Master' }
        },
        'reach_level_50': {
            name: 'Level 50 Master',
            description: 'Reach level 50',
            icon: '⭐',
            progress: (gameState) => {
                const level = gameState.level || 1;
                return {
                    current: level,
                    target: 50,
                    percentage: (level / 50) * 100
                };
            },
            reward: { xp: 2000, title: 'Level 50 Master' }
        },
        'complete_100_missions': {
            name: 'Mission Master',
            description: 'Complete 100 missions',
            icon: '🎯',
            progress: (gameState) => {
                const completed = gameState.completedMissions || 0;
                return {
                    current: completed,
                    target: 100,
                    percentage: (completed / 100) * 100
                };
            },
            reward: { xp: 1500, title: 'Mission Master' }
        },
        'perfect_50_missions': {
            name: 'Perfectionist Master',
            description: 'Complete 50 missions perfectly',
            icon: '✨',
            progress: (gameState) => {
                const perfect = gameState.perfectMissions || 0;
                return {
                    current: perfect,
                    target: 50,
                    percentage: (perfect / 50) * 100
                };
            },
            reward: { xp: 2000, title: 'Perfectionist Master' }
        },
        '30_day_streak': {
            name: 'Dedicated Hacker',
            description: 'Maintain a 30-day login streak',
            icon: '🔥',
            progress: (gameState) => {
                const streak = gameState.loginStreak || 0;
                return {
                    current: streak,
                    target: 30,
                    percentage: (streak / 30) * 100
                };
            },
            reward: { xp: 2500, title: 'Dedicated Hacker' }
        },
        'top_10_leaderboard': {
            name: 'Top 10 Player',
            description: 'Reach top 10 in any leaderboard',
            icon: '👑',
            progress: (gameState) => {
                // Check if player is in top 10 of any leaderboard
                const topRanks = gameState.topLeaderboardRanks || [];
                const inTop10 = topRanks.some(rank => rank <= 10);
                return {
                    current: inTop10 ? 1 : 0,
                    target: 1,
                    percentage: inTop10 ? 100 : 0
                };
            },
            reward: { xp: 3000, title: 'Top 10 Player' }
        }
    };
    
    /**
     * Get all goals
     * @returns {Object} All goals
     */
    static getAllGoals() {
        return this.GOALS;
    }
    
    /**
     * Get goal progress
     * @param {string} goalId - Goal ID
     * @param {Object} gameState - Game state
     * @returns {Object|null} Progress info
     */
    static getGoalProgress(goalId, gameState) {
        const goal = this.GOALS[goalId];
        if (!goal) return null;
        
        return goal.progress(gameState);
    }
    
    /**
     * Check if goal is completed
     * @param {string} goalId - Goal ID
     * @param {Object} gameState - Game state
     * @returns {boolean} True if completed
     */
    static isGoalCompleted(goalId, gameState) {
        const progress = this.getGoalProgress(goalId, gameState);
        if (!progress) return false;
        
        return progress.current >= progress.target;
    }
    
    /**
     * Check and complete goals
     * @param {Object} stateManager - State manager
     * @returns {Array} Completed goals
     */
    static checkGoals(stateManager) {
        const gameState = stateManager.getState();
        const completedGoals = stateManager.get('completedGoals') || [];
        const newlyCompleted = [];
        
        Object.keys(this.GOALS).forEach(goalId => {
            // Skip if already completed
            if (completedGoals.includes(goalId)) return;
            
            // Check if completed
            if (this.isGoalCompleted(goalId, gameState)) {
                newlyCompleted.push(goalId);
                completedGoals.push(goalId);
                
                const goal = this.GOALS[goalId];
                
                // Award rewards
                if (goal.reward) {
                    if (goal.reward.xp) {
                        eventBus.emit('xp:add', goal.reward.xp);
                    }
                    if (goal.reward.title) {
                        stateManager.set('playerTitle', goal.reward.title);
                    }
                }
                
                // Emit event
                eventBus.emit('goal:completed', {
                    id: goalId,
                    ...goal
                });
            }
        });
        
        if (newlyCompleted.length > 0) {
            stateManager.set('completedGoals', completedGoals);
        }
        
        return newlyCompleted;
    }
    
    /**
     * Get all goals progress
     * @param {Object} stateManager - State manager
     * @returns {Object} All goals progress
     */
    static getAllGoalsProgress(stateManager) {
        const gameState = stateManager.getState();
        const progress = {};
        
        Object.keys(this.GOALS).forEach(goalId => {
            progress[goalId] = {
                ...this.GOALS[goalId],
                progress: this.getGoalProgress(goalId, gameState),
                completed: this.isGoalCompleted(goalId, gameState)
            };
        });
        
        return progress;
    }
}

