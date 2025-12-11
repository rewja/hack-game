/**
 * ProgressionSystem - Sistem progression dengan exponential curve
 * Phase 2: Progression & Rewards
 */

/**
 * ProgressionSystem class untuk menghitung progression
 */
export class ProgressionSystem {
    /**
     * Calculate XP required for level
     * Exponential curve untuk membuat progression lebih meaningful
     * @param {number} level - Target level
     * @returns {number} XP required untuk level tersebut
     */
    static getXPForLevel(level) {
        // Base: 100 XP untuk level 1
        // Exponential: 100 * (1.15 ^ (level - 1))
        if (level <= 1) return 0;
        return Math.floor(100 * Math.pow(1.15, level - 1));
    }
    
    /**
     * Calculate total XP needed untuk reach level
     * @param {number} level - Target level
     * @returns {number} Total XP needed dari level 1 ke level tersebut
     */
    static getTotalXPForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.getXPForLevel(i);
        }
        return total;
    }
    
    /**
     * Get level from total XP
     * @param {number} totalXP - Total XP yang dimiliki
     * @returns {number} Level berdasarkan total XP
     */
    static getLevelFromXP(totalXP) {
        let level = 1;
        let xpNeeded = 0;
        
        while (xpNeeded <= totalXP) {
            const xpForNextLevel = this.getXPForLevel(level);
            xpNeeded += xpForNextLevel;
            if (xpNeeded <= totalXP) {
                level++;
            } else {
                break;
            }
        }
        
        return level;
    }
    
    /**
     * Get XP progress untuk current level
     * @param {number} totalXP - Total XP yang dimiliki
     * @returns {Object} Progress info {level, currentXP, xpForNextLevel, progress}
     */
    static getXPProgress(totalXP) {
        const level = this.getLevelFromXP(totalXP);
        const xpForCurrentLevel = this.getTotalXPForLevel(level);
        const xpForNextLevel = this.getTotalXPForLevel(level + 1);
        const currentXP = totalXP - xpForCurrentLevel;
        const xpNeeded = this.getXPForLevel(level);
        const progress = xpNeeded > 0 ? (currentXP / xpNeeded) : 0;
        
        return {
            level,
            currentXP,
            xpForNextLevel: xpNeeded,
            totalXP,
            progress: Math.min(1, Math.max(0, progress)),
            xpNeeded: Math.max(0, xpNeeded - currentXP)
        };
    }
}

