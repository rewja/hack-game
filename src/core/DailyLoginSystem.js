/**
 * DailyLoginSystem - Sistem daily login dan streak
 * Phase 4: Engagement & Retention
 */

import { eventBus } from './EventBus.js';
import { CONSTANTS } from './Constants.js';

/**
 * DailyLoginSystem class
 */
export class DailyLoginSystem {
    /**
     * Check and reward daily login
     * @param {Object} stateManager - State manager
     * @returns {Object} Login result dengan reward info
     */
    static checkDailyLogin(stateManager) {
        const today = new Date().toDateString();
        const lastLogin = stateManager.get('lastLogin');
        const streak = stateManager.get('loginStreak') || 0;
        
        if (lastLogin === today) {
            return { 
                alreadyLoggedIn: true, 
                streak: streak,
                message: 'You have already logged in today!'
            };
        }
        
        // Check if streak continues
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        let newStreak = 1;
        if (lastLogin === yesterdayStr) {
            newStreak = streak + 1;
        } else if (lastLogin && lastLogin !== yesterdayStr) {
            // Streak broken
            newStreak = 1;
        }
        
        // Save login info
        stateManager.set('lastLogin', today);
        stateManager.set('loginStreak', newStreak);
        
        // Calculate reward
        const reward = this.calculateDailyReward(newStreak);
        
        // Award XP
        eventBus.emit('xp:add', reward.xp);
        
        // Emit event
        eventBus.emit('daily:login', {
            streak: newStreak,
            reward: reward
        });
        
        return {
            loggedIn: true,
            streak: newStreak,
            reward: reward,
            message: `Daily login reward: +${reward.xp} XP! (Streak: ${newStreak} days)`
        };
    }
    
    /**
     * Calculate daily reward based on streak
     * @param {number} streak - Current streak
     * @returns {Object} Reward info
     */
    static calculateDailyReward(streak) {
        const baseXP = 50;
        const streakBonus = Math.min(streak * 10, 100); // Max 100 bonus
        const totalXP = baseXP + streakBonus;
        
        // Weekly bonus (7 days)
        const weeklyBonus = streak >= 7 ? 50 : 0;
        const finalXP = totalXP + weeklyBonus;
        
        return {
            xp: finalXP,
            baseXP: baseXP,
            streakBonus: streakBonus,
            weeklyBonus: weeklyBonus,
            streak: streak,
            isWeeklyBonus: streak >= 7
        };
    }
    
    /**
     * Get current streak info
     * @param {Object} stateManager - State manager
     * @returns {Object} Streak info
     */
    static getStreakInfo(stateManager) {
        const streak = stateManager.get('loginStreak') || 0;
        const lastLogin = stateManager.get('lastLogin');
        const today = new Date().toDateString();
        
        // Check if streak is still active
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        const isActive = lastLogin === today || lastLogin === yesterdayStr;
        
        return {
            streak: streak,
            isActive: isActive,
            lastLogin: lastLogin,
            nextReward: this.calculateDailyReward(streak + 1)
        };
    }
}

