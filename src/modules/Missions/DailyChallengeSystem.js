/**
 * DailyChallengeSystem - Sistem daily challenges
 * Phase 3: Content & Replayability
 */

import { eventBus } from '../../core/EventBus.js';
import { CONSTANTS } from '../../core/Constants.js';

/**
 * DailyChallengeSystem class untuk daily challenges
 */
export class DailyChallengeSystem {
    /**
     * Seeded random number generator untuk consistent daily challenge
     * @param {string} seed - Seed string
     * @returns {Function} Random function
     */
    static seededRandom(seed) {
        let value = 0;
        for (let i = 0; i < seed.length; i++) {
            value = ((value << 5) - value) + seed.charCodeAt(i);
            value = value & value; // Convert to 32bit integer
        }
        
        let state = Math.abs(value);
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }
    
    /**
     * Generate daily challenge
     * @returns {Object} Daily challenge object
     */
    static generateDailyChallenge() {
        const date = new Date();
        const seed = date.toDateString();
        
        // Use seed untuk consistent daily challenge
        const random = this.seededRandom(seed);
        
        const challengeTypes = [
            'speed_run',
            'perfect_run',
            'command_master',
            'combo_challenge',
            'puzzle_solve'
        ];
        
        const type = challengeTypes[Math.floor(random() * challengeTypes.length)];
        
        return {
            id: `daily_${date.toISOString().split('T')[0]}`,
            type: type,
            title: this.getChallengeTitle(type),
            description: this.getChallengeDescription(type),
            objectives: this.generateObjectives(type, random),
            rewards: {
                xp: 200,
                bonus: true,
                streak: this.getStreakBonus()
            },
            expiresAt: this.getEndOfDay(date),
            status: 'active'
        };
    }
    
    /**
     * Get challenge title
     * @param {string} type - Challenge type
     * @returns {string} Challenge title
     */
    static getChallengeTitle(type) {
        const titles = {
            'speed_run': 'Speed Run Challenge',
            'perfect_run': 'Perfect Run Challenge',
            'command_master': 'Command Master Challenge',
            'combo_challenge': 'Combo Challenge',
            'puzzle_solve': 'Puzzle Solve Challenge'
        };
        return titles[type] || 'Daily Challenge';
    }
    
    /**
     * Get challenge description
     * @param {string} type - Challenge type
     * @returns {string} Challenge description
     */
    static getChallengeDescription(type) {
        const descriptions = {
            'speed_run': 'Complete a mission in under 2 minutes',
            'perfect_run': 'Complete a mission without failing any step',
            'command_master': 'Use 5 different commands in one session',
            'combo_challenge': 'Complete 3 missions in a row',
            'puzzle_solve': 'Solve a complex encryption puzzle'
        };
        return descriptions[type] || 'Complete the daily challenge';
    }
    
    /**
     * Generate objectives untuk challenge
     * @param {string} type - Challenge type
     * @param {Function} random - Random function
     * @returns {Array} Objectives array
     */
    static generateObjectives(type, random) {
        const objectives = {
            'speed_run': [
                { type: 'time', target: 120000, description: 'Complete a mission in under 2 minutes' }
            ],
            'perfect_run': [
                { type: 'perfect', target: 1, description: 'Complete a mission without any failures' }
            ],
            'command_master': [
                { type: 'commands', target: 5, description: 'Use 5 different commands' }
            ],
            'combo_challenge': [
                { type: 'missions', target: 3, description: 'Complete 3 missions in a row' }
            ],
            'puzzle_solve': [
                { type: 'decrypt', target: 1, description: 'Successfully decrypt a file' }
            ]
        };
        
        return objectives[type] || [];
    }
    
    /**
     * Get streak bonus
     * @returns {number} Streak bonus multiplier
     */
    static getStreakBonus() {
        // TODO: Get from state
        return 1.0;
    }
    
    /**
     * Get end of day timestamp
     * @param {Date} date - Date object
     * @returns {number} End of day timestamp
     */
    static getEndOfDay(date) {
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay.getTime();
    }
    
    /**
     * Check daily challenge completion
     * @param {Object} challenge - Challenge object
     * @param {Object} gameState - Game state
     * @returns {boolean} True if completed
     */
    static checkCompletion(challenge, gameState) {
        if (!challenge.objectives) return false;
        
        // Check objectives
        return challenge.objectives.every(obj => {
            return this.checkObjective(obj, gameState);
        });
    }
    
    /**
     * Check objective completion
     * @param {Object} objective - Objective object
     * @param {Object} gameState - Game state
     * @returns {boolean} True if objective met
     */
    static checkObjective(objective, gameState) {
        switch (objective.type) {
            case 'time':
                const fastestMission = gameState.fastestMissionCompletion || null;
                return fastestMission && fastestMission.time < objective.target;
            
            case 'perfect':
                const perfectMissions = gameState.perfectMissions || 0;
                return perfectMissions >= objective.target;
            
            case 'commands':
                const usedCommands = gameState.usedCommands || [];
                return usedCommands.length >= objective.target;
            
            case 'missions':
                const completedToday = this.getCompletedToday(gameState);
                return completedToday >= objective.target;
            
            case 'decrypt':
                // Check if decrypt command was used successfully
                return gameState.successfulDecrypts >= objective.target;
            
            default:
                return false;
        }
    }
    
    /**
     * Get missions completed today
     * @param {Object} gameState - Game state
     * @returns {number} Number of missions completed today
     */
    static getCompletedToday(gameState) {
        const today = new Date().toDateString();
        const todayCompletions = (gameState.dailyCompletions || {})[today] || 0;
        return todayCompletions;
    }
    
    /**
     * Get current daily challenge
     * @param {Object} stateManager - State manager
     * @returns {Object|null} Current daily challenge
     */
    static getCurrentDailyChallenge(stateManager) {
        const stored = stateManager.get('dailyChallenge');
        if (!stored) return null;
        
        // Check if expired
        if (Date.now() > stored.expiresAt) {
            return null;
        }
        
        return stored;
    }
    
    /**
     * Initialize daily challenge
     * @param {Object} stateManager - State manager
     * @returns {Object} Daily challenge
     */
    static initializeDailyChallenge(stateManager) {
        const current = this.getCurrentDailyChallenge(stateManager);
        if (current) {
            return current;
        }
        
        // Generate new daily challenge
        const challenge = this.generateDailyChallenge();
        stateManager.set('dailyChallenge', challenge);
        
        // Emit event
        eventBus.emit('daily:challenge:new', challenge);
        
        return challenge;
    }
    
    /**
     * Complete daily challenge
     * @param {Object} stateManager - State manager
     * @returns {Object|null} Reward info
     */
    static completeDailyChallenge(stateManager) {
        const challenge = this.getCurrentDailyChallenge(stateManager);
        if (!challenge) return null;
        
        const gameState = stateManager.getState();
        if (!this.checkCompletion(challenge, gameState)) {
            return null;
        }
        
        // Mark as completed
        challenge.status = 'completed';
        stateManager.set('dailyChallenge', challenge);
        
        // Track completion
        const today = new Date().toDateString();
        const dailyCompletions = stateManager.get('dailyCompletions') || {};
        dailyCompletions[today] = (dailyCompletions[today] || 0) + 1;
        stateManager.set('dailyCompletions', dailyCompletions);
        
        // Calculate reward
        const baseReward = challenge.rewards.xp;
        const streakBonus = challenge.rewards.streak || 1.0;
        const totalReward = Math.floor(baseReward * streakBonus);
        
        // Award XP
        eventBus.emit('xp:add', totalReward);
        
        // Emit event
        eventBus.emit('daily:challenge:complete', {
            challenge,
            reward: totalReward
        });
        
        return {
            xp: totalReward,
            streak: challenge.rewards.streak
        };
    }
}

