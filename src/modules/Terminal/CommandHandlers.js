import { eventBus } from '../../core/EventBus.js';
import { CONSTANTS } from '../../core/Constants.js';
import { ValidationUtils } from '../../utils/validation.js';
import { SecurityUtils } from '../../utils/security.js';
import { MiniGames } from './MiniGames.js';
import { VisualEffects } from '../../utils/VisualEffects.js';
import { BadgeSystem } from '../../core/BadgeSystem.js';

/**
 * CommandHandlers - Handler functions untuk semua terminal commands
 */
export class CommandHandlers {
    constructor(terminal, stateManager) {
        this.terminal = terminal;
        this.state = stateManager;
        // Track retry counts untuk commands
        this.commandRetries = new Map();
    }
    
    /**
     * Calculate success rate untuk command dengan badge effects
     * @param {string} command - Command name
     * @returns {number} Success rate (0.0 - 1.0)
     */
    calculateSuccessRate(command) {
        const baseRate = CONSTANTS.COMMAND.BASE_SUCCESS_RATE[command] || 0.8;
        const retries = this.commandRetries.get(command) || 0;
        const penalty = retries * CONSTANTS.COMMAND.RETRY_PENALTY;
        let successRate = Math.max(0.1, baseRate - penalty);
        
        // Apply badge effects
        const badgeEffects = BadgeSystem.applyBadgeEffects(this.state);
        
        // Apply general success rate bonus
        if (badgeEffects.allSuccessRate) {
            successRate = Math.min(1.0, successRate * badgeEffects.allSuccessRate);
        }
        
        // Apply command-specific bonuses
        if (command === 'decrypt' && badgeEffects.decryptSuccess) {
            successRate = Math.min(1.0, successRate * badgeEffects.decryptSuccess);
        }
        
        return successRate;
    }
    
    /**
     * Track command usage untuk achievements
     * @param {string} command - Command name
     */
    trackCommandUsage(command) {
        const usedCommands = this.state.get('usedCommands') || [];
        if (!usedCommands.includes(command)) {
            usedCommands.push(command);
            this.state.set('usedCommands', usedCommands);
        }
    }
    
    /**
     * Check if command should succeed
     * @param {string} command - Command name
     * @returns {boolean} True jika berhasil
     */
    checkCommandSuccess(command) {
        const successRate = this.calculateSuccessRate(command);
        return Math.random() < successRate;
    }
    
    /**
     * Record command attempt
     * @param {string} command - Command name
     * @param {boolean} success - Apakah berhasil
     */
    recordCommandAttempt(command, success) {
        if (success) {
            // Reset retries jika berhasil
            this.commandRetries.set(command, 0);
        } else {
            // Increment retries jika gagal
            const retries = (this.commandRetries.get(command) || 0) + 1;
            this.commandRetries.set(command, retries);
        }
    }

    /**
     * Find and complete matching mission steps for a command
     * Uses dynamic matching based on step text patterns
     * @param {string} command - Command name (scan, decrypt, bruteforce, etc.)
     */
    completeMatchingMissionSteps(command) {
        const missions = this.state.get('missions') || [];
        
        // Define keyword patterns for each command
        const commandPatterns = {
            'scan': ['scan', 'locate', 'network', 'traffic', 'ports', 'firewall', 'monitor'],
            'decrypt': ['decrypt', 'hash', 'encryption', 'crack', 'decode', 'analyze'],
            'bruteforce': ['brute', 'force', 'attack', 'recover', 'password', 'crack']
        };

        const keywords = commandPatterns[command] || [];
        if (keywords.length === 0) return;

        // Find matching steps in active missions
        missions.forEach(mission => {
            if (mission.status !== 'active') return;

            mission.steps.forEach(step => {
                // Skip if already completed
                if (step.completed) return;

                // Check if step text matches any keyword (case-insensitive)
                const stepTextLower = step.text.toLowerCase();
                const matches = keywords.some(keyword => 
                    stepTextLower.includes(keyword.toLowerCase())
                );

                if (matches) {
                    // Emit event untuk mission step completion
                    eventBus.emit('mission:step:complete', {
                        missionId: mission.id,
                        stepId: step.id,
                    });
                }
            });
        });
    }

    /**
     * Show help message
     */
    showHelp() {
        const helpText = `
Available commands:
  help          - Show this help message
  clear         - Clear terminal screen
  scan          - Scan network for targets
  bruteforce    - Brute force password attack
  decrypt       - Decrypt encrypted files
  ping [host]   - Ping a network host
  missions      - Show available missions
  logs          - Display system logs
  whoami        - Show current user
  date          - Show current date and time
  echo [text]   - Echo text to terminal
        `.trim();

        helpText.split('\n').forEach((line) => {
            this.terminal.addLine(line);
        });
    }

    /**
     * Clear terminal
     */
    clearTerminal() {
        this.terminal.clear();
        this.terminal.addLine('Terminal cleared ♡', 'success');
    }

    /**
     * Scan network dengan typing challenge
     */
    async scanNetwork() {
        try {
            this.trackCommandUsage('scan');
            
            this.terminal.addLine('Scanning network...', 'info');
            this.terminal.addLine('Quick scan challenge required!', 'info');
            
            // Apply badge effects untuk scan speed
            const badgeEffects = BadgeSystem.applyBadgeEffects(this.state);
            const scanSpeedMultiplier = badgeEffects.scanSpeed || 1.0;
            
            // Start typing challenge
            const sequence = ['192.168.1.', '100', '101', '102'];
            const result = await MiniGames.startTypingChallenge(sequence);
        
        if (result.success) {
            this.terminal.addLine('Scan successful!', 'success');
            this.terminal.addLine(`Scan speed: ${result.speed.toFixed(1)} chars/sec`, 'info');
            this.terminal.addLine('Found 3 targets:', 'info');
            this.terminal.addLine('  → 192.168.1.100 (Active)', 'text');
            this.terminal.addLine('  → 192.168.1.101 (Active)', 'text');
            this.terminal.addLine('  → 192.168.1.102 (Firewall Protected)', 'text');
            this.terminal.addLine('Scan complete ✨', 'success');
            this.terminal.addLog('Network scan completed', 'info');
            
            this.recordCommandAttempt('scan', true);
            
            // Complete matching mission steps dynamically
            this.completeMatchingMissionSteps('scan');
        } else {
            this.terminal.addLine('Scan failed!', 'error');
            if (result.reason === 'timeout') {
                this.terminal.addLine('Scan timeout. Try again!', 'error');
            } else {
                this.terminal.addLine('Scan cancelled.', 'warning');
            }
            this.terminal.addLine('Type "scan" again to retry', 'info');
            this.recordCommandAttempt('scan', false);
        }
        } catch (error) {
            this.terminal.addLine('Scan error: Network scan failed unexpectedly', 'error');
            this.terminal.addLine('Please try again or check your connection', 'info');
            this.recordCommandAttempt('scan', false);
            console.error('Scan network error:', error);
        }
    }

    /**
     * Brute force attack dengan hack speed optimization
     */
    async bruteforce() {
        try {
            this.trackCommandUsage('bruteforce');
            
            this.terminal.addLine('Initializing brute force attack...', 'info');
            this.terminal.addLine('Target: password.hash', 'text');
            
            // Check success rate
            const success = this.checkCommandSuccess('bruteforce');
            const retries = this.commandRetries.get('bruteforce') || 0;
            
            if (retries >= CONSTANTS.COMMAND.MAX_RETRIES) {
                this.terminal.addLine('Brute force attack locked!', 'error');
                this.terminal.addLine('Target has increased security. Try a different approach.', 'warning');
                this.terminal.addLine('Hint: Try upgrading your tools or using a different method.', 'info');
                return;
            }
            
            // Show hack speed optimization mini-game
            this.terminal.addLine('Optimize hack speed? (Click to optimize)', 'info');
            const hackSpeed = await MiniGames.optimizeHackSpeed();
        
        const baseInterval = 800;
        const speedMultiplier = hackSpeed;
        const interval = baseInterval / speedMultiplier;
        
        this.terminal.addLine(`Hack speed: ${speedMultiplier.toFixed(2)}x`, 'info');
        
        const progress = [20, 45, 70, 90, 100];
        let current = 0;

        const progressInterval = setInterval(() => {
            if (current < progress.length) {
                this.terminal.addLine(`Progress: ${progress[current]}%`, 'info');
                current++;
            } else {
                clearInterval(progressInterval);
                
                // Check if attack succeeds
                if (success) {
                    this.terminal.addLine('ACCESS GRANTED ♡', 'success');
                    this.terminal.addLine('Password recovered: ********', 'success');
                    this.terminal.addLog('Brute force attack successful', 'success');
                    eventBus.emit('toast:show', {
                        message: 'Password recovered successfully!',
                        type: 'success',
                    });
                    
                    this.recordCommandAttempt('bruteforce', true);
                    
                    // Complete matching mission steps dynamically
                    this.completeMatchingMissionSteps('bruteforce');
                    
                    // Auto-complete "Recover and verify password" step after successful bruteforce
                    // This handles mission-01 step-4
                    setTimeout(() => {
                        const missions = this.state.get('missions') || [];
                        const mission01 = missions.find(m => m.id === 'mission-01');
                        if (mission01 && mission01.status === 'active') {
                            const step4 = mission01.steps.find(s => s.id === 'step-4');
                            if (step4 && !step4.completed) {
                                // Check if step-3 is completed (bruteforce step)
                                const step3 = mission01.steps.find(s => s.id === 'step-3');
                                if (step3 && step3.completed) {
                                    eventBus.emit('mission:step:complete', {
                                        missionId: 'mission-01',
                                        stepId: 'step-4',
                                    });
                                }
                            }
                        }
                    }, 500);
                } else {
                    this.terminal.addLine('Brute force attack failed!', 'error');
                    this.terminal.addLine('Target has increased security.', 'warning');
                    this.terminal.addLine(`Retries: ${retries + 1}/${CONSTANTS.COMMAND.MAX_RETRIES}`, 'info');
                    this.terminal.addLine('Type "bruteforce" again to retry', 'info');
                    
                    this.recordCommandAttempt('bruteforce', false);
                }
            }
        }, interval);
        } catch (error) {
            this.terminal.addLine('Brute force error: Attack failed unexpectedly', 'error');
            this.terminal.addLine('Please try again', 'info');
            this.recordCommandAttempt('bruteforce', false);
            console.error('Bruteforce error:', error);
        }
    }

    /**
     * Decrypt file dengan failure states
     * @param {string[]} args - Command arguments
     */
    decrypt(args = []) {
        this.trackCommandUsage('decrypt');
        
        // Validate arguments
        const validatedArgs = ValidationUtils.validateCommandArgs(args, {
            maxLength: 1,
            types: ['string'],
        });

        if (!validatedArgs && args.length > 0) {
            this.terminal.addLine('Invalid file name', 'error');
            return;
        }

        const file = args[0] || 'archive.enc';
        // Sanitize filename
        const sanitizedFile = SecurityUtils.sanitizeInput(file);
        this.terminal.addLine(`Decrypting ${sanitizedFile}...`, 'info');
        
        // Check success rate
        const success = this.checkCommandSuccess('decrypt');
        const retries = this.commandRetries.get('decrypt') || 0;

        setTimeout(() => {
            this.terminal.addLine('Analyzing encryption method...', 'text');
            setTimeout(() => {
                this.terminal.addLine('Cracking encryption layer 1...', 'text');
                setTimeout(() => {
                    if (success) {
                        this.terminal.addLine('SYSTEM BYPASSED ✨', 'success');
                        this.terminal.addLine('File decrypted successfully!', 'success');
                        this.terminal.addLog(`Decryption successful: ${file}`, 'success');
                        eventBus.emit('toast:show', {
                            message: 'File decrypted!',
                            type: 'success',
                        });
                        
                        this.recordCommandAttempt('decrypt', true);
                        
                        // Complete matching mission steps dynamically
                        this.completeMatchingMissionSteps('decrypt');
                    } else {
                        this.terminal.addLine('Decryption failed!', 'error');
                        this.terminal.addLine('Encryption too strong. Try again or use a different method.', 'warning');
                        this.terminal.addLine(`Retries: ${retries + 1}/${CONSTANTS.COMMAND.MAX_RETRIES}`, 'info');
                        this.terminal.addLine('Type "decrypt" again to retry', 'info');
                        
                        this.recordCommandAttempt('decrypt', false);
                    }
                }, 1000);
            }, 1000);
        }, 500);
    }

    /**
     * Ping host
     * @param {string[]} args - Command arguments
     */
    ping(args = []) {
        // Validate hostname
        let host = args[0] || 'localhost';
        if (args.length > 0) {
            const validated = ValidationUtils.validateString(args[0], {
                maxLength: 255,
                pattern: /^[a-zA-Z0-9.-]+$/,
            });
            if (!validated) {
                this.terminal.addLine('Invalid hostname format', 'error');
                return;
            }
            host = validated;
        }
        this.terminal.addLine(`Pinging ${host}...`, 'info');

        setTimeout(() => {
            const time = Math.floor(Math.random() * 50) + 10;
            this.terminal.addLine(`Reply from ${host}: time=${time}ms`, 'success');
        }, 500);
    }

    /**
     * Show missions
     */
    showMissions() {
        const missions = this.state.get('missions') || [];
        this.terminal.addLine('Available Missions:', 'info');
        missions.forEach((mission) => {
            const status = mission.status === 'active' ? 'ACTIVE' : 'LOCKED';
            const progress = mission.progress || 0;
            this.terminal.addLine(`  [${status}] ${mission.title} - ${progress}%`, 'text');
        });
        this.terminal.addLine('Type "missions" in sidebar to view details', 'info');
    }

    /**
     * Show logs
     */
    showLogs() {
        const logs = this.state.get('logs') || [];
        this.terminal.addLine('Recent System Logs:', 'info');
        const recentLogs = logs.slice(-5);
        recentLogs.forEach((log) => {
            this.terminal.addLine(`  [${log.level}] ${log.message}`, 'text');
        });
    }

    /**
     * Show user info
     */
    whoami() {
        const level = this.state.get('level') || 1;
        const xp = this.state.get('xp') || 0;
        const completedMissions = this.state.get('completedMissions') || 0;

        this.terminal.addLine('soft-hacker', 'text');
        this.terminal.addLine('Role: Elite Hacker', 'text');
        this.terminal.addLine(`Level: ${level}`, 'text');
        this.terminal.addLine(`XP: ${xp}`, 'text');
        this.terminal.addLine(`Missions Completed: ${completedMissions}`, 'text');
    }

    /**
     * Show date
     */
    showDate() {
        const now = new Date();
        this.terminal.addLine(now.toLocaleString('id-ID'), 'text');
    }

    /**
     * Echo text
     * @param {string[]} args - Command arguments
     */
    echo(args = []) {
        const text = args.join(' ');
        this.terminal.addLine(text, 'text');
    }
}

