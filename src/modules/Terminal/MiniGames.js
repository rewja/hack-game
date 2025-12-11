/**
 * MiniGames - Sistem mini-game untuk skill-based command execution
 * Phase 1: Core Gameplay Improvements
 */

import { DOMUtils } from '../../utils/dom.js';
import { eventBus } from '../../core/EventBus.js';

/**
 * MiniGames class untuk menangani semua mini-games
 */
export class MiniGames {
    /**
     * Start typing challenge untuk scan command
     * @param {string[]} sequence - Sequence yang harus di-type
     * @returns {Promise<Object>} Result dengan success status dan stats
     */
    static async startTypingChallenge(sequence) {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'typing-challenge-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-family: 'Courier New', monospace;
            `;
            
            const container = document.createElement('div');
            container.style.cssText = `
                text-align: center;
                max-width: 600px;
                width: 90%;
            `;
            
            const title = document.createElement('h2');
            title.textContent = '⚡ Quick Scan Challenge ⚡';
            title.style.cssText = `
                color: #9A7BB3;
                margin-bottom: 30px;
                font-size: 24px;
            `;
            
            const instruction = document.createElement('p');
            instruction.textContent = 'Type the sequence quickly and accurately:';
            instruction.style.cssText = `
                margin-bottom: 20px;
                color: #E4C8F7;
            `;
            
            const targetDiv = document.createElement('div');
            targetDiv.className = 'target-sequence';
            targetDiv.style.cssText = `
                font-size: 32px;
                font-weight: bold;
                color: #6BCB77;
                margin: 30px 0;
                letter-spacing: 4px;
                text-shadow: 0 0 10px rgba(107, 203, 119, 0.8);
            `;
            targetDiv.textContent = sequence.join(' ');
            
            const inputDiv = document.createElement('div');
            inputDiv.style.cssText = `
                margin: 20px 0;
            `;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.style.cssText = `
                width: 100%;
                padding: 15px;
                font-size: 24px;
                font-family: 'Courier New', monospace;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #9A7BB3;
                border-radius: 10px;
                color: #fff;
                text-align: center;
                outline: none;
            `;
            input.autofocus = true;
            
            const progressDiv = document.createElement('div');
            progressDiv.style.cssText = `
                margin-top: 20px;
                font-size: 14px;
                color: #E4C8F7;
            `;
            
            const timerDiv = document.createElement('div');
            timerDiv.style.cssText = `
                margin-top: 10px;
                font-size: 18px;
                color: #FF6B9D;
                font-weight: bold;
            `;
            
            let startTime = Date.now();
            let timeLimit = 10000; // 10 seconds
            let timerInterval;
            
            const updateTimer = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, timeLimit - elapsed);
                timerDiv.textContent = `Time: ${(remaining / 1000).toFixed(1)}s`;
                
                if (remaining <= 0) {
                    clearInterval(timerInterval);
                    resolve({
                        success: false,
                        reason: 'timeout',
                        time: timeLimit
                    });
                    overlay.remove();
                }
            };
            
            timerInterval = setInterval(updateTimer, 100);
            updateTimer();
            
            input.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const target = sequence.join(' ');
                
                // Check if correct
                if (value === target) {
                    clearInterval(timerInterval);
                    const timeTaken = Date.now() - startTime;
                    const speed = target.length / (timeTaken / 1000); // chars per second
                    
                    resolve({
                        success: true,
                        time: timeTaken,
                        speed: speed,
                        accuracy: 1.0
                    });
                    overlay.remove();
                } else if (value.length > target.length) {
                    // Too long, mark as wrong
                    input.style.borderColor = '#FF6B9D';
                    setTimeout(() => {
                        input.style.borderColor = '#9A7BB3';
                        input.value = '';
                    }, 300);
                } else {
                    // Check partial match
                    const isCorrect = target.startsWith(value);
                    input.style.borderColor = isCorrect ? '#6BCB77' : '#FF6B9D';
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    clearInterval(timerInterval);
                    resolve({
                        success: false,
                        reason: 'cancelled'
                    });
                    overlay.remove();
                }
            });
            
            container.appendChild(title);
            container.appendChild(instruction);
            container.appendChild(targetDiv);
            inputDiv.appendChild(input);
            container.appendChild(inputDiv);
            container.appendChild(progressDiv);
            container.appendChild(timerDiv);
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            
            input.focus();
        });
    }
    
    /**
     * Optimize hack speed untuk bruteforce command
     * Player bisa click untuk "hack faster" dengan timing challenge
     * @returns {Promise<number>} Speed multiplier (0.5 - 2.0)
     */
    static async optimizeHackSpeed() {
        return new Promise((resolve) => {
            // Create overlay dengan progress bar
            const overlay = document.createElement('div');
            overlay.className = 'hack-speed-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;
            `;
            
            const container = document.createElement('div');
            container.style.cssText = `
                text-align: center;
                max-width: 500px;
                width: 90%;
            `;
            
            const title = document.createElement('h2');
            title.textContent = '⚡ Optimize Hack Speed ⚡';
            title.style.cssText = `
                color: #9A7BB3;
                margin-bottom: 20px;
            `;
            
            const instruction = document.createElement('p');
            instruction.textContent = 'Click when the bar reaches the green zone!';
            instruction.style.cssText = `
                margin-bottom: 30px;
                color: #E4C8F7;
            `;
            
            // Progress bar container
            const progressContainer = document.createElement('div');
            progressContainer.style.cssText = `
                width: 100%;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                overflow: hidden;
                margin: 20px 0;
                position: relative;
            `;
            
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                height: 100%;
                background: linear-gradient(90deg, #FF6B9D 0%, #9A7BB3 50%, #6BCB77 100%);
                width: 0%;
                transition: width 0.1s linear;
            `;
            
            // Green zone indicator
            const greenZone = document.createElement('div');
            greenZone.style.cssText = `
                position: absolute;
                left: 70%;
                width: 15%;
                height: 100%;
                background: rgba(107, 203, 119, 0.3);
                border: 2px solid #6BCB77;
                box-sizing: border-box;
            `;
            
            progressContainer.appendChild(greenZone);
            progressContainer.appendChild(progressBar);
            
            const resultDiv = document.createElement('div');
            resultDiv.style.cssText = `
                margin-top: 20px;
                font-size: 18px;
                min-height: 30px;
            `;
            
            let progress = 0;
            let speed = 1.0;
            let clicked = false;
            let animationId;
            
            const animate = () => {
                if (clicked) return;
                
                progress += 2;
                if (progress > 100) {
                    progress = 0; // Reset
                }
                
                progressBar.style.width = `${progress}%`;
                
                // Check if in green zone (70-85%)
                if (progress >= 70 && progress <= 85) {
                    progressBar.style.background = 'linear-gradient(90deg, #FF6B9D 0%, #9A7BB3 50%, #6BCB77 100%)';
                } else {
                    progressBar.style.background = 'linear-gradient(90deg, #FF6B9D 0%, #9A7BB3 100%)';
                }
                
                animationId = requestAnimationFrame(animate);
            };
            
            const handleClick = () => {
                if (clicked) return;
                clicked = true;
                cancelAnimationFrame(animationId);
                
                // Calculate speed multiplier based on accuracy
                if (progress >= 70 && progress <= 85) {
                    // Perfect hit
                    const center = 77.5;
                    const distance = Math.abs(progress - center);
                    const accuracy = 1 - (distance / 7.5);
                    speed = 1.0 + (accuracy * 1.0); // 1.0 - 2.0
                    resultDiv.textContent = `Perfect! Speed: ${speed.toFixed(2)}x`;
                    resultDiv.style.color = '#6BCB77';
                } else {
                    // Miss
                    speed = 0.5 + (progress / 100) * 0.5; // 0.5 - 1.0
                    resultDiv.textContent = `Miss! Speed: ${speed.toFixed(2)}x`;
                    resultDiv.style.color = '#FF6B9D';
                }
                
                setTimeout(() => {
                    resolve(speed);
                    overlay.remove();
                }, 1000);
            };
            
            overlay.addEventListener('click', handleClick);
            
            container.appendChild(title);
            container.appendChild(instruction);
            container.appendChild(progressContainer);
            container.appendChild(resultDiv);
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            
            animate();
        });
    }
}

