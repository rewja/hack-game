/**
 * SocialSystem - Sistem sharing dan social features
 * Phase 4: Engagement & Retention
 */

import { eventBus } from './EventBus.js';

/**
 * SocialSystem class
 */
export class SocialSystem {
    /**
     * Share achievement
     * @param {Object} achievement - Achievement object
     * @returns {Promise<boolean>} True jika berhasil share
     */
    static async shareAchievement(achievement) {
        const text = `I just unlocked "${achievement.name}" in Soft Hacker OS! 🎮♡`;
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Soft Hacker OS Achievement',
                    text: text,
                    url: url
                });
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
                return false;
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                eventBus.emit('toast:show', {
                    message: 'Achievement link copied to clipboard!',
                    type: 'success'
                });
                return true;
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                return false;
            }
        }
    }
    
    /**
     * Share score/leaderboard position
     * @param {Object} scoreData - Score data
     * @returns {Promise<boolean>} True jika berhasil share
     */
    static async shareScore(scoreData) {
        const text = `I scored ${scoreData.score} points and ranked #${scoreData.rank} in "${scoreData.missionTitle}"! 🎮♡`;
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Soft Hacker OS Score',
                    text: text,
                    url: url
                });
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
                return false;
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                eventBus.emit('toast:show', {
                    message: 'Score link copied to clipboard!',
                    type: 'success'
                });
                return true;
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                return false;
            }
        }
    }
    
    /**
     * Share level up
     * @param {number} level - New level
     * @returns {Promise<boolean>} True jika berhasil share
     */
    static async shareLevelUp(level) {
        const text = `I just reached Level ${level} in Soft Hacker OS! 🎮♡`;
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Soft Hacker OS Level Up',
                    text: text,
                    url: url
                });
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
                return false;
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                eventBus.emit('toast:show', {
                    message: 'Level up link copied to clipboard!',
                    type: 'success'
                });
                return true;
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                return false;
            }
        }
    }
    
    /**
     * Generate shareable image untuk achievement
     * @param {Object} achievement - Achievement object
     * @returns {Promise<string>} Data URL of image
     */
    static async generateShareImage(achievement) {
        // Create canvas dengan achievement info
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        
        const ctx = canvas.getContext('2d');
        
        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#9A7BB3');
        gradient.addColorStop(1, '#E4C8F7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Achievement Unlocked!', canvas.width / 2, 200);
        
        ctx.font = '48px Arial';
        ctx.fillText(achievement.name, canvas.width / 2, 300);
        
        ctx.font = '36px Arial';
        ctx.fillText(achievement.description, canvas.width / 2, 400);
        
        ctx.font = '24px Arial';
        ctx.fillText('Soft Hacker OS', canvas.width / 2, 550);
        
        return canvas.toDataURL('image/png');
    }
    
    /**
     * Download shareable image
     * @param {string} dataUrl - Image data URL
     * @param {string} filename - Filename
     */
    static downloadShareImage(dataUrl, filename = 'achievement.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    }
}

