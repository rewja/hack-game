/**
 * FeedbackSystem - Sistem untuk anticipation & satisfaction building
 * Phase 5: Polish & UX
 */

import { VisualEffects } from './VisualEffects.js';
import { getAudioSystem } from '../core/AudioSystem.js';

/**
 * FeedbackSystem class
 */
export class FeedbackSystem {
    /**
     * Build anticipation sebelum reveal reward
     * @param {Function} callback - Callback function setelah anticipation
     * @param {number} duration - Duration in ms
     * @returns {HTMLElement} Loader element
     */
    static buildAnticipation(callback, duration = 2000) {
        // Show loading/processing animation
        const loader = this.showLoader('Processing reward...');
        
        // Build up dengan sound
        const audioSystem = getAudioSystem();
        audioSystem.playSound('typing');
        
        // Animate progress
        let progress = 0;
        const progressBar = loader.querySelector('.loader-progress');
        const interval = setInterval(() => {
            progress += 100 / (duration / 100);
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, progress)}%`;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.remove();
                    if (callback) callback();
                }, 200);
            }
        }, 100);
        
        return loader;
    }
    
    /**
     * Show loader
     * @param {string} message - Loader message
     * @returns {HTMLElement} Loader element
     */
    static showLoader(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'feedback-loader';
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #9A7BB3 0%, #E4C8F7 100%);
            padding: 30px 40px;
            border-radius: 15px;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            min-width: 300px;
        `;
        
        loader.innerHTML = `
            <div style="color: #fff; margin-bottom: 15px; font-size: 18px; font-weight: bold;">${message}</div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; overflow: hidden;">
                <div class="loader-progress" style="height: 100%; background: #FF6B9D; width: 0%; transition: width 0.1s linear;"></div>
            </div>
        `;
        
        document.body.appendChild(loader);
        return loader;
    }
    
    /**
     * Show satisfying completion
     * @param {Object} reward - Reward data
     */
    static showSatisfyingCompletion(reward) {
        // Pause untuk build tension
        setTimeout(() => {
            // Reveal dengan flourish
            this.revealReward(reward);
            
            // Play celebration sound
            const audioSystem = getAudioSystem();
            audioSystem.playSound('mission_complete');
            
            // Confetti
            VisualEffects.createConfetti();
        }, 500);
    }
    
    /**
     * Reveal reward dengan flourish
     * @param {Object} reward - Reward data
     */
    static revealReward(reward) {
        const modal = document.createElement('div');
        modal.className = 'reward-reveal-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #9A7BB3 0%, #E4C8F7 100%);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: reward-reveal 0.5s ease-out;
        `;
        
        content.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 28px;">Reward Earned!</h2>
            ${reward.xp ? `<div style="color: #6BCB77; font-size: 36px; font-weight: bold; margin: 20px 0;">+${reward.xp} XP</div>` : ''}
            ${reward.item ? `<div style="color: #fff; font-size: 18px; margin-top: 10px;">${reward.item}</div>` : ''}
            <button class="reward-close-btn" style="margin-top: 30px; padding: 12px 30px; background: #FF6B9D; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer;">Awesome!</button>
        `;
        
        // Add CSS animation jika belum ada
        if (!document.getElementById('reward-reveal-styles')) {
            const style = document.createElement('style');
            style.id = 'reward-reveal-styles';
            style.textContent = `
                @keyframes reward-reveal {
                    from { transform: scale(0) rotate(180deg); opacity: 0; }
                    to { transform: scale(1) rotate(0deg); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close button
        const closeBtn = content.querySelector('.reward-close-btn');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 3000);
    }
    
    /**
     * Show delayed satisfaction untuk mission completion
     * @param {Object} mission - Mission data
     * @param {Function} callback - Callback setelah satisfaction
     */
    static showDelayedSatisfaction(mission, callback) {
        // Build anticipation
        this.buildAnticipation(() => {
            // Show satisfying completion
            this.showSatisfyingCompletion({
                xp: mission.reward ? parseInt(mission.reward.match(/\d+/)?.[0] || 0) : 0,
                item: mission.title
            });
            
            if (callback) callback();
        }, 1500);
    }
}

