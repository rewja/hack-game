/**
 * LeaderboardSystem - Sistem leaderboard untuk missions
 * Phase 3: Content & Replayability
 */

import { CONSTANTS } from './Constants.js';

/**
 * LeaderboardSystem class
 */
export class LeaderboardSystem {
    /**
     * Submit score to leaderboard
     * @param {string} playerId - Player ID
     * @param {number} score - Score
     * @param {string} missionId - Mission ID
     * @param {Object} stateManager - State manager
     * @returns {Object} Player rank info
     */
    static submitScore(playerId, score, missionId, stateManager) {
        const entry = {
            playerId,
            score,
            missionId,
            timestamp: Date.now(),
            level: stateManager.get('level') || 1,
            playerName: stateManager.get('playerName') || 'Player'
        };
        
        // Get or create leaderboard
        const leaderboard = this.getLeaderboard(missionId);
        leaderboard.push(entry);
        
        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep top 100
        leaderboard.splice(100);
        
        // Save to localStorage
        localStorage.setItem(`leaderboard_${missionId}`, JSON.stringify(leaderboard));
        
        // Get player rank
        const rank = this.getPlayerRank(playerId, missionId);
        
        return {
            rank,
            totalEntries: leaderboard.length
        };
    }
    
    /**
     * Get leaderboard for mission
     * @param {string} missionId - Mission ID
     * @param {number} limit - Limit results
     * @returns {Array} Leaderboard entries
     */
    static getLeaderboard(missionId, limit = 10) {
        const data = localStorage.getItem(`leaderboard_${missionId}`);
        if (!data) return [];
        
        try {
            const leaderboard = JSON.parse(data);
            return leaderboard.slice(0, limit);
        } catch (e) {
            console.error('Error parsing leaderboard:', e);
            return [];
        }
    }
    
    /**
     * Get player rank
     * @param {string} playerId - Player ID
     * @param {string} missionId - Mission ID
     * @returns {number} Player rank (1-based, 0 if not found)
     */
    static getPlayerRank(playerId, missionId) {
        const leaderboard = this.getLeaderboard(missionId, 1000);
        const index = leaderboard.findIndex(entry => entry.playerId === playerId);
        return index >= 0 ? index + 1 : 0;
    }
    
    /**
     * Get global leaderboard (all missions combined)
     * @param {number} limit - Limit results
     * @returns {Array} Global leaderboard entries
     */
    static getGlobalLeaderboard(limit = 10) {
        // Get all leaderboards
        const allEntries = [];
        
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('leaderboard_')) {
                const missionId = key.replace('leaderboard_', '');
                const entries = this.getLeaderboard(missionId, 1000);
                entries.forEach(entry => {
                    allEntries.push({
                        ...entry,
                        missionId
                    });
                });
            }
        }
        
        // Sort by score
        allEntries.sort((a, b) => b.score - a.score);
        
        return allEntries.slice(0, limit);
    }
    
    /**
     * Calculate score untuk mission completion
     * @param {Object} mission - Mission object
     * @param {Object} completionData - Completion data
     * @returns {number} Calculated score
     */
    static calculateScore(mission, completionData) {
        const baseScore = 1000;
        
        // Time bonus (faster = more points)
        const timeBonus = this.calculateTimeBonus(
            completionData.timeTaken,
            mission.timeLimit || 600000 // Default 10 minutes
        );
        
        // Efficiency bonus (less retries = more points)
        const efficiencyBonus = this.calculateEfficiencyBonus(
            completionData.retries || 0,
            completionData.stepsCompleted || mission.steps.length
        );
        
        // Difficulty multiplier
        const difficultyMultiplier = this.getDifficultyMultiplier(mission.difficulty);
        
        const finalScore = Math.floor(
            (baseScore + timeBonus + efficiencyBonus) * difficultyMultiplier
        );
        
        return finalScore;
    }
    
    /**
     * Calculate time bonus
     * @param {number} timeTaken - Time taken in milliseconds
     * @param {number} estimatedTime - Estimated time in milliseconds
     * @returns {number} Time bonus
     */
    static calculateTimeBonus(timeTaken, estimatedTime) {
        if (timeTaken <= estimatedTime * 0.5) return 500; // Very fast
        if (timeTaken <= estimatedTime * 0.75) return 300; // Fast
        if (timeTaken <= estimatedTime) return 100; // On time
        return 0; // Slow
    }
    
    /**
     * Calculate efficiency bonus
     * @param {number} retries - Number of retries
     * @param {number} stepsCompleted - Steps completed
     * @returns {number} Efficiency bonus
     */
    static calculateEfficiencyBonus(retries, stepsCompleted) {
        if (retries === 0) return 300; // Perfect run
        if (retries === 1) return 150; // One retry
        if (retries === 2) return 50; // Two retries
        return 0; // Many retries
    }
    
    /**
     * Get difficulty multiplier
     * @param {string} difficulty - Difficulty level
     * @returns {number} Difficulty multiplier
     */
    static getDifficultyMultiplier(difficulty) {
        const multipliers = {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0,
            very_hard: 3.0
        };
        return multipliers[difficulty] || 1.0;
    }
}

