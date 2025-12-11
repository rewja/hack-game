/**
 * TutorialSystem - Sistem interactive tutorial
 * Phase 5: Polish & UX
 */

import { DOMUtils } from '../../utils/dom.js';
import { SecurityUtils } from '../../utils/security.js';
import { AnimationSystem } from '../../utils/AnimationSystem.js';
import { eventBus } from '../../core/EventBus.js';

/**
 * TutorialSystem class
 */
export class TutorialSystem {
    static TUTORIAL_STEPS = [
        {
            target: '#dashboard-panel',
            title: 'Welcome to Soft Hacker OS!',
            content: 'This is your dashboard. Here you can see your progress, XP, level, and recent activities.',
            action: 'highlight',
            position: 'bottom'
        },
        {
            target: '[data-tab="missions"]',
            title: 'Missions',
            content: 'Click here to see available missions. Complete missions to earn XP and unlock new challenges!',
            action: 'highlight',
            position: 'right'
        },
        {
            target: '[data-tab="terminal"]',
            title: 'Terminal',
            content: 'Use the terminal to execute commands and complete missions. Try typing "help" to see available commands.',
            action: 'highlight',
            position: 'right'
        },
        {
            target: '#terminalInput',
            title: 'Command Input',
            content: 'Type commands here and press Enter to execute. Some commands have mini-games for skill-based gameplay!',
            action: 'highlight',
            position: 'top'
        }
    ];
    
    /**
     * Start interactive tutorial
     * @param {Object} stateManager - State manager
     */
    static startTutorial(stateManager) {
        // Check if tutorial already completed
        if (stateManager.get('tutorialCompleted')) {
            return;
        }
        
        const steps = this.TUTORIAL_STEPS;
        this.showTutorialStep(steps[0], 0, steps, stateManager);
    }
    
    /**
     * Show tutorial step
     * @param {Object} step - Tutorial step data
     * @param {number} index - Current step index
     * @param {Array} allSteps - All tutorial steps
     * @param {Object} stateManager - State manager
     */
    static showTutorialStep(step, index, allSteps, stateManager) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            pointer-events: all;
        `;
        
        // Find target element
        const target = document.querySelector(step.target);
        if (!target) {
            // Skip jika target tidak ditemukan
            if (index < allSteps.length - 1) {
                this.showTutorialStep(allSteps[index + 1], index + 1, allSteps, stateManager);
            } else {
                this.completeTutorial(stateManager);
            }
            return;
        }
        
        // Highlight target
        const rect = target.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            border: 3px solid #FF6B9D;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 107, 157, 0.8);
            z-index: 10001;
            pointer-events: none;
            animation: tutorial-pulse 2s ease-in-out infinite;
        `;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        
        // Position tooltip
        const position = step.position || 'bottom';
        let top = rect.bottom + 20;
        let left = rect.left;
        
        if (position === 'top') {
            top = rect.top - 150;
        } else if (position === 'right') {
            top = rect.top;
            left = rect.right + 20;
        } else if (position === 'left') {
            top = rect.top;
            left = rect.left - 300;
        }
        
        tooltip.style.cssText = `
            position: fixed;
            top: ${top}px;
            left: ${left}px;
            background: linear-gradient(135deg, #9A7BB3 0%, #E4C8F7 100%);
            padding: 20px;
            border-radius: 12px;
            max-width: 300px;
            z-index: 10002;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: tutorial-fade-in 0.3s ease;
        `;
        
        tooltip.innerHTML = `
            <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 18px;">${SecurityUtils.escapeHtml(step.title)}</h3>
            <p style="color: #fff; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">${SecurityUtils.escapeHtml(step.content)}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #E4C8F7; font-size: 12px;">Step ${index + 1} of ${allSteps.length}</span>
                <div>
                    ${index > 0 ? '<button class="tutorial-prev" style="margin-right: 10px; padding: 8px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Previous</button>' : ''}
                    <button class="tutorial-next" style="padding: 8px 15px; background: #FF6B9D; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">${index < allSteps.length - 1 ? 'Next' : 'Finish'}</button>
                </div>
            </div>
        `;
        
        // Add CSS animation jika belum ada
        if (!document.getElementById('tutorial-styles')) {
            const style = document.createElement('style');
            style.id = 'tutorial-styles';
            style.textContent = `
                @keyframes tutorial-pulse {
                    0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 107, 157, 0.8); }
                    50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 107, 157, 1); }
                }
                @keyframes tutorial-fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show
        document.body.appendChild(overlay);
        document.body.appendChild(highlight);
        document.body.appendChild(tooltip);
        
        // Next button
        const nextBtn = tooltip.querySelector('.tutorial-next');
        nextBtn.addEventListener('click', () => {
            overlay.remove();
            highlight.remove();
            tooltip.remove();
            
            if (index < allSteps.length - 1) {
                this.showTutorialStep(allSteps[index + 1], index + 1, allSteps, stateManager);
            } else {
                this.completeTutorial(stateManager);
            }
        });
        
        // Previous button
        const prevBtn = tooltip.querySelector('.tutorial-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                overlay.remove();
                highlight.remove();
                tooltip.remove();
                
                if (index > 0) {
                    this.showTutorialStep(allSteps[index - 1], index - 1, allSteps, stateManager);
                }
            });
        }
        
        // Skip tutorial
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                highlight.remove();
                tooltip.remove();
                this.completeTutorial(stateManager);
            }
        });
    }
    
    /**
     * Complete tutorial
     * @param {Object} stateManager - State manager
     */
    static completeTutorial(stateManager) {
        stateManager.set('tutorialCompleted', true);
        eventBus.emit('tutorial:completed', {});
    }
    
    /**
     * Check if tutorial should be shown
     * @param {Object} stateManager - State manager
     * @returns {boolean} True jika tutorial belum completed
     */
    static shouldShowTutorial(stateManager) {
        return !stateManager.get('tutorialCompleted');
    }
}

