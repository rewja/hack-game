/**
 * VisualEffects - Sistem untuk visual feedback dan animasi
 * Phase 1: Core Gameplay Improvements
 */

import { DOMUtils } from './dom.js';

/**
 * VisualEffects class untuk menangani semua visual feedback
 */
export class VisualEffects {
    /**
     * Show XP gain animation
     * @param {number} amount - Jumlah XP yang didapat
     * @param {Object} position - Position {x, y} untuk animasi
     */
    static showXPGain(amount, position = null) {
        const xpElement = document.createElement('div');
        xpElement.className = 'xp-gain-animation';
        xpElement.textContent = `+${amount} XP`;
        
        // Set position jika provided, atau gunakan center
        if (position) {
            xpElement.style.left = `${position.x}px`;
            xpElement.style.top = `${position.y}px`;
        } else {
            // Default: center of screen
            xpElement.style.left = '50%';
            xpElement.style.top = '50%';
            xpElement.style.transform = 'translate(-50%, -50%)';
        }
        
        xpElement.style.position = 'fixed';
        xpElement.style.zIndex = '10000';
        xpElement.style.pointerEvents = 'none';
        xpElement.style.fontSize = '24px';
        xpElement.style.fontWeight = 'bold';
        xpElement.style.color = '#6BCB77';
        xpElement.style.textShadow = '0 0 10px rgba(107, 203, 119, 0.8)';
        
        document.body.appendChild(xpElement);
        
        // Animate
        const animation = xpElement.animate([
            { transform: 'translateY(0) scale(0.5)', opacity: 0 },
            { transform: 'translateY(-30px) scale(1.2)', opacity: 1, offset: 0.3 },
            { transform: 'translateY(-80px) scale(0.8)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => xpElement.remove();
    }
    
    /**
     * Show level up celebration
     * @param {number} level - Level baru
     * @param {Object} rewards - Rewards yang didapat
     */
    static showLevelUp(level, rewards = {}) {
        // Create confetti effect
        this.createConfetti();
        
        // Show level up modal
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
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
            pointer-events: all;
        `;
        
        const content = document.createElement('div');
        content.className = 'level-up-content';
        content.style.cssText = `
            background: linear-gradient(135deg, #9A7BB3 0%, #E4C8F7 100%);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            max-width: 500px;
            width: 90%;
        `;
        
        const title = document.createElement('h1');
        title.textContent = '🎉 LEVEL UP! 🎉';
        title.style.cssText = `
            font-size: 36px;
            margin: 0 0 20px 0;
            color: #fff;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        
        const levelDisplay = document.createElement('div');
        levelDisplay.className = 'level-display';
        levelDisplay.textContent = `Level ${level}`;
        levelDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: #FF6B9D;
            margin: 20px 0;
            text-shadow: 0 0 20px rgba(255, 107, 157, 0.8);
        `;
        
        content.appendChild(title);
        content.appendChild(levelDisplay);
        
        // Show rewards jika ada
        if (Object.keys(rewards).length > 0) {
            const rewardsDiv = document.createElement('div');
            rewardsDiv.className = 'level-up-rewards';
            rewardsDiv.style.cssText = `
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            if (rewards.unlocks) {
                rewards.unlocks.forEach(unlock => {
                    const unlockDiv = document.createElement('div');
                    unlockDiv.textContent = `✨ ${unlock}`;
                    unlockDiv.style.cssText = `
                        color: #fff;
                        margin: 10px 0;
                        font-size: 18px;
                    `;
                    rewardsDiv.appendChild(unlockDiv);
                });
            }
            
            content.appendChild(rewardsDiv);
        }
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Continue';
        closeBtn.style.cssText = `
            margin-top: 30px;
            padding: 12px 30px;
            background: #FF6B9D;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.05)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
        });
        
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Animate in
        content.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.1)', opacity: 1, offset: 0.5 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 800,
            easing: 'ease-out'
        });
    }
    
    /**
     * Create confetti effect
     */
    static createConfetti() {
        const colors = ['#FF6B9D', '#9A7BB3', '#E4C8F7', '#F6DAE8', '#6BCB77'];
        const count = 50;
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }
        
        // Add CSS animation jika belum ada
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Show success celebration untuk mission/command
     * @param {HTMLElement} element - Element yang akan di-animate
     */
    static celebrateSuccess(element) {
        if (!element) return;
        
        // Pulse animation
        element.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.1)', opacity: 0.9, offset: 0.5 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        // Add glow effect
        element.classList.add('success-glow');
        setTimeout(() => {
            element.classList.remove('success-glow');
        }, 2000);
    }
    
    /**
     * Show error feedback
     * @param {HTMLElement} element - Element yang akan di-animate
     */
    static showError(element) {
        if (!element) return;
        
        // Shake animation
        element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
    }
}

