/**
 * Soft Hacker OS - Application Entry Point
 * Modular architecture dengan StateManager dan EventBus
 */

import { StateManager } from './core/StateManager.js';
import { eventBus } from './core/EventBus.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { StorageService } from './services/StorageService.js';
import { Terminal } from './modules/Terminal/Terminal.js';
import { MissionSystem } from './modules/Missions/MissionSystem.js';
import { DashboardController } from './modules/Dashboard/DashboardController.js';
import { LogSystem } from './modules/Logs/LogSystem.js';
import { CONSTANTS } from './core/Constants.js';
import { DOMUtils, DOMCache } from './utils/dom.js';
import { SecurityUtils } from './utils/security.js';
import { debounce, throttle } from './utils/performance.js';
import { VisualEffects } from './utils/VisualEffects.js';
import { ProgressionSystem } from './core/ProgressionSystem.js';
import { RewardSystem } from './core/RewardSystem.js';
import { BadgeSystem } from './core/BadgeSystem.js';
import { AchievementSystem } from './core/AchievementSystem.js';
import { DailyChallengeSystem } from './modules/Missions/DailyChallengeSystem.js';
import { ProceduralMissionGenerator } from './modules/Missions/ProceduralMissionGenerator.js';
import { LeaderboardSystem } from './core/LeaderboardSystem.js';
import { DailyLoginSystem } from './core/DailyLoginSystem.js';
import { CollectionSystem } from './core/CollectionSystem.js';
import { SocialSystem } from './core/SocialSystem.js';
import { LongTermGoalsSystem } from './core/LongTermGoalsSystem.js';
import { TutorialSystem } from './modules/Tutorial/TutorialSystem.js';
import { getAudioSystem } from './core/AudioSystem.js';
import { FeedbackSystem } from './utils/FeedbackSystem.js';
import { AnimationSystem } from './utils/AnimationSystem.js';

/**
 * Initialize application
 */
class App {
    constructor() {
        this.stateManager = null;
        this.terminal = null;
        this.missionSystem = null;
        this.dashboardController = null;
        this.logSystem = null;
        this.domCache = new DOMCache();
    }

    /**
     * Initialize app
     */
    async init() {
        // Initialize state manager dengan initial state
        const initialState = this.getInitialState();
        this.stateManager = new StateManager(initialState);

        // Load saved state
        this.loadSavedState();

        // Initialize audio system
        this.audioSystem = getAudioSystem();
        
        // Initialize modules
        this.initializeModules();

        // Setup global event handlers
        this.setupGlobalHandlers();

        // Initialize UI components
        this.initializeUI();
        
        // Initialize daily challenge
        DailyChallengeSystem.initializeDailyChallenge(this.stateManager);
        
        // Check daily login
        const loginResult = DailyLoginSystem.checkDailyLogin(this.stateManager);
        if (loginResult.loggedIn) {
            this.showToast(loginResult.message, 'success');
        }
        
        // Show tutorial jika belum completed
        if (TutorialSystem.shouldShowTutorial(this.stateManager)) {
            setTimeout(() => {
                TutorialSystem.startTutorial(this.stateManager);
            }, 1000);
        }

        // Add initial logs
        this.addInitialLogs();

        // Check welcome screen
        this.checkWelcomeScreen();

        console.log('♡ Soft Hacker OS initialized ♡');
    }

    /**
     * Get initial state
     * @returns {Object} Initial state object
     */
    getInitialState() {
        return {
            currentTab: 'dashboard',
            commandHistory: [],
            historyIndex: -1,
            missions: [],
            logs: [],
            xp: 0,
            level: 1,
            completedMissions: 0,
            badges: [],
            settings: StorageService.getSettings(),
            theme: 'light',
            messages: [
                {
                    id: 1,
                    sender: 'System Admin',
                    subject: 'Welcome to Soft Hacker OS ♡',
                    preview: 'Your first mission is ready...',
                    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                },
            ],
            activities: [
                {
                    time: new Date().toISOString(),
                    text: 'System initialized ♡',
                },
            ],
        };
    }

    /**
     * Load saved state dari storage
     */
    loadSavedState() {
        try {
            const savedState = StorageService.getState();
            if (savedState) {
                // Merge dengan initial state (prioritaskan saved state)
                const currentState = this.stateManager.getState();
                this.stateManager.update({ ...currentState, ...savedState });
            }
        } catch (error) {
            ErrorHandler.handle(error, 'App.loadSavedState', {
                showToUser: false,
            });
            // Continue with default state
        }
    }

    /**
     * Initialize modules
     */
    initializeModules() {
        // Initialize Terminal
        this.terminal = new Terminal(this.stateManager);

        // Initialize Mission System
        this.missionSystem = new MissionSystem(this.stateManager);

        // Initialize Dashboard Controller
        this.dashboardController = new DashboardController(this.stateManager);

        // Initialize Log System
        this.logSystem = new LogSystem(this.stateManager);
    }

    /**
     * Setup global event handlers
     */
    setupGlobalHandlers() {
        // XP addition handler
        eventBus.on('xp:add', (amount) => {
            this.addXP(amount);
        });

        // Toast notification handler
        eventBus.on('toast:show', (data) => {
            this.showToast(data.message, data.type);
        });

        // Tab switching handler
        eventBus.on('tab:switch', (tabName) => {
            this.switchTab(tabName);
        });
        
        // Milestone unlocked handler
        eventBus.on('milestone:unlocked', (milestone) => {
            this.showMilestoneUnlock(milestone);
        });
        
        // Badge unlocked handler
        eventBus.on('badge:unlocked', (badge) => {
            this.showBadgeUnlock(badge);
        });
        
        // Achievement unlocked handler
        eventBus.on('achievement:unlocked', (achievement) => {
            this.showAchievementUnlock(achievement);
        });
        
        // Check achievements periodically
        setInterval(() => {
            AchievementSystem.checkAchievements(this.stateManager);
            LongTermGoalsSystem.checkGoals(this.stateManager);
        }, 5000); // Check every 5 seconds
        
        // Daily challenge completion handler
        eventBus.on('daily:challenge:complete', (data) => {
            this.showToast(`Daily Challenge Complete! +${data.reward} XP`, 'success');
            eventBus.emit('activity:add', `Completed daily challenge: +${data.reward} XP`);
        });
        
        // Daily challenge new handler
        eventBus.on('daily:challenge:new', (challenge) => {
            this.showToast(`New Daily Challenge: ${challenge.title}`, 'info');
        });
        
        // Daily login handler
        eventBus.on('daily:login', (data) => {
            if (data.reward.isWeeklyBonus) {
                this.showToast(`Weekly Bonus! +${data.reward.xp} XP (${data.streak} day streak!)`, 'success');
            }
        });
        
        // Collectible unlocked handler
        eventBus.on('collectible:unlocked', (data) => {
            this.showToast(`New ${data.type} unlocked: ${data.data?.name || data.id}!`, 'success');
        });
        
        // Goal completed handler
        eventBus.on('goal:completed', (goal) => {
            this.showToast(`Long-term Goal Completed: ${goal.name}!`, 'success');
            eventBus.emit('activity:add', `Completed goal: ${goal.name}`);
        });
        
        // Tutorial completed handler
        eventBus.on('tutorial:completed', () => {
            this.showToast('Tutorial completed! Happy hacking! ♡', 'success');
        });
        
        // Mission complete dengan delayed satisfaction
        eventBus.on('mission:complete', (data) => {
            FeedbackSystem.showDelayedSatisfaction(data.mission, () => {
                // Callback setelah satisfaction
            });
        });
    }
    
    /**
     * Show milestone unlock notification
     * @param {Object} milestone - Milestone data
     */
    showMilestoneUnlock(milestone) {
        this.showToast(`🎉 ${milestone.message}`, 'success');
        eventBus.emit('activity:add', milestone.message);
    }
    
    /**
     * Show badge unlock notification
     * @param {Object} badge - Badge data
     */
    showBadgeUnlock(badge) {
        this.showToast(`${badge.icon} Badge Unlocked: ${badge.name}!`, 'success');
        eventBus.emit('activity:add', `Badge unlocked: ${badge.name}`);
    }
    
    /**
     * Show achievement unlock notification
     * @param {Object} achievement - Achievement data
     */
    showAchievementUnlock(achievement) {
        const rewardText = achievement.reward?.xp 
            ? ` (+${achievement.reward.xp} XP)` 
            : '';
        this.showToast(`${achievement.icon} Achievement: ${achievement.name}${rewardText}!`, 'success');
        eventBus.emit('activity:add', `Achievement unlocked: ${achievement.name}`);
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // Initialize tab navigation
        this.initTabNavigation();

        // Initialize theme toggle
        this.initThemeToggle();

        // Initialize modals
        this.initSettingsModal();
        this.initProfileModal();

        // Initialize inbox
        this.initInbox();

        // Initialize system tools
        this.initSystemTools();

        // Update dashboard
        this.dashboardController.updateDashboard();
    }

    /**
     * Initialize tab navigation
     */
    initTabNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);

                // Update active states
                navItems.forEach((ni) => ni.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    /**
     * Switch tab
     * @param {string} tabName - Tab name
     */
    switchTab(tabName) {
        // Hide all panels
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach((panel) => {
            panel.classList.remove('active');
        });

        // Show selected panel
        const panel = this.domCache.get(`#${tabName}-panel`) || document.getElementById(`${tabName}-panel`);
        if (panel) {
            panel.classList.add('active');
            this.stateManager.set('currentTab', tabName);
        }

        // Update dashboard when switching to it
        if (tabName === 'dashboard') {
            this.dashboardController.updateDashboard();
        }

        // Re-render missions when switching to missions tab
        if (tabName === 'missions') {
            if (this.missionSystem) {
                if (this.stateManager.get('missions').length === 0) {
                    this.missionSystem.loadMissions();
                } else {
                    setTimeout(() => {
                        this.missionSystem.renderMissions();
                    }, 50);
                }
            }
        }

        // Focus terminal input when terminal tab is active
        if (tabName === 'terminal') {
            setTimeout(() => {
                if (this.terminal) {
                    this.terminal.focus();
                }
            }, 100);
        }
    }

    /**
     * Initialize theme toggle
     */
    initThemeToggle() {
        const themeToggle = this.domCache.get('#themeToggle') || document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = this.stateManager.get('theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.stateManager.set('theme', newTheme);
                document.body.setAttribute('data-theme', newTheme);
                this.showToast(`Switched to ${newTheme} theme`, 'info');
            });
        }
    }

    /**
     * Initialize settings modal
     */
    initSettingsModal() {
        const settingsBtn = this.domCache.get('#settingsBtn') || document.getElementById('settingsBtn');
        const settingsModal = this.domCache.get('#settingsModal') || document.getElementById('settingsModal');
        const settingsClose = this.domCache.get('#settingsClose') || document.getElementById('settingsClose');

        if (settingsBtn && settingsModal && settingsClose) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.classList.add('show');
                this.loadSettings();
            });

            settingsClose.addEventListener('click', () => {
                settingsModal.classList.remove('show');
            });

            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.classList.remove('show');
                }
            });

            // Settings controls
            const soundToggle = this.domCache.get('#soundToggle') || document.getElementById('soundToggle');
            const animationsToggle = this.domCache.get('#animationsToggle') || document.getElementById('animationsToggle');
            const autosaveToggle = this.domCache.get('#autosaveToggle') || document.getElementById('autosaveToggle');
            const fontSizeSelect = this.domCache.get('#fontSizeSelect') || document.getElementById('fontSizeSelect');

            if (soundToggle) {
                soundToggle.addEventListener('change', (e) => {
                    const settings = this.stateManager.get('settings');
                    settings.sound = e.target.checked;
                    this.stateManager.set('settings', settings);
                    this.saveSettings();
                });
            }

            if (animationsToggle) {
                animationsToggle.addEventListener('change', (e) => {
                    const settings = this.stateManager.get('settings');
                    settings.animations = e.target.checked;
                    this.stateManager.set('settings', settings);
                    document.body.style.setProperty(
                        '--transition-fast',
                        e.target.checked ? '0.1s ease' : '0s'
                    );
                    document.body.style.setProperty(
                        '--transition-normal',
                        e.target.checked ? '0.2s ease' : '0s'
                    );
                    this.saveSettings();
                });
            }

            if (autosaveToggle) {
                autosaveToggle.addEventListener('change', (e) => {
                    const settings = this.stateManager.get('settings');
                    settings.autosave = e.target.checked;
                    this.stateManager.set('settings', settings);
                    this.saveSettings();
                });
            }

            if (fontSizeSelect) {
                fontSizeSelect.addEventListener('change', (e) => {
                    const settings = this.stateManager.get('settings');
                    settings.fontSize = parseInt(e.target.value);
                    this.stateManager.set('settings', settings);
                    const terminalBody = document.querySelector('.terminal-body');
                    const terminalInput = document.querySelector('.terminal-input');
                    if (terminalBody) terminalBody.style.fontSize = `${e.target.value}px`;
                    if (terminalInput) terminalInput.style.fontSize = `${e.target.value}px`;
                    this.saveSettings();
                });
            }
        }
    }

    /**
     * Load settings ke UI
     */
    loadSettings() {
        const settings = this.stateManager.get('settings');
        const soundToggle = this.domCache.get('#soundToggle') || document.getElementById('soundToggle');
        const animationsToggle = this.domCache.get('#animationsToggle') || document.getElementById('animationsToggle');
        const autosaveToggle = this.domCache.get('#autosaveToggle') || document.getElementById('autosaveToggle');
        const fontSizeSelect = this.domCache.get('#fontSizeSelect') || document.getElementById('fontSizeSelect');

        if (soundToggle) soundToggle.checked = settings.sound;
        if (animationsToggle) animationsToggle.checked = settings.animations;
        if (autosaveToggle) autosaveToggle.checked = settings.autosave;
        if (fontSizeSelect) fontSizeSelect.value = settings.fontSize;
    }

    /**
     * Save settings
     */
    saveSettings() {
        const settings = this.stateManager.get('settings');
        if (settings.autosave) {
            StorageService.saveSettings(settings);
        }
    }

    /**
     * Initialize profile modal
     */
    initProfileModal() {
        const profileBtn = this.domCache.get('#profileBtn') || document.getElementById('profileBtn');
        const profileModal = this.domCache.get('#profileModal') || document.getElementById('profileModal');
        const profileClose = this.domCache.get('#profileClose') || document.getElementById('profileClose');

        if (profileBtn && profileModal && profileClose) {
            profileBtn.addEventListener('click', () => {
                profileModal.classList.add('show');
                this.updateProfile();
            });

            profileClose.addEventListener('click', () => {
                profileModal.classList.remove('show');
            });

            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    profileModal.classList.remove('show');
                }
            });
        }
    }

    /**
     * Update profile display
     */
    updateProfile() {
        const level = this.stateManager.get('level') || 1;
        const xp = this.stateManager.get('xp') || 0;
        const completedMissions = this.stateManager.get('completedMissions') || 0;
        const missions = this.stateManager.get('missions') || [];
        const totalMissions = missions.length;

        const profileLevel = this.domCache.get('#profileLevel') || document.getElementById('profileLevel');
        const profileXP = this.domCache.get('#profileXP') || document.getElementById('profileXP');
        const profileMissions = this.domCache.get('#profileMissions') || document.getElementById('profileMissions');

        if (profileLevel) profileLevel.textContent = level;
        if (profileXP) profileXP.textContent = xp;
        if (profileMissions) profileMissions.textContent = `${completedMissions}/${totalMissions}`;
    }

    /**
     * Initialize inbox
     */
    initInbox() {
        const inboxList = this.domCache.get('#inboxList') || document.getElementById('inboxList');
        if (!inboxList) return;

        const messages = this.stateManager.get('messages') || [];
        DOMUtils.clearChildren(inboxList);

        messages.forEach((message) => {
            const item = DOMUtils.createElement('div', {
                className: `inbox-item ${message.read ? '' : 'unread'}`,
            });
            const time = new Date(message.time);
            const timeStr = this.getTimeAgo(time);

            // Inbox icon
            const icon = DOMUtils.createElement('div', {
                className: 'inbox-icon',
                textContent: '📧',
            });

            // Inbox content
            const content = DOMUtils.createElement('div', { className: 'inbox-content' });

            // Header
            const header = DOMUtils.createElement('div', { className: 'inbox-header' });
            const sender = DOMUtils.createElement('span', {
                className: 'inbox-sender',
                textContent: SecurityUtils.escapeHtml(message.sender),
            });
            const timeSpan = DOMUtils.createElement('span', {
                className: 'inbox-time',
                textContent: timeStr,
            });
            header.appendChild(sender);
            header.appendChild(timeSpan);

            // Subject
            const subject = DOMUtils.createElement('div', {
                className: 'inbox-subject',
                textContent: SecurityUtils.escapeHtml(message.subject),
            });

            // Preview
            const preview = DOMUtils.createElement('div', {
                className: 'inbox-preview',
                textContent: SecurityUtils.escapeHtml(message.preview),
            });

            content.appendChild(header);
            content.appendChild(subject);
            content.appendChild(preview);

            item.appendChild(icon);
            item.appendChild(content);

            item.addEventListener('click', () => {
                message.read = true;
                item.classList.remove('unread');
                this.showToast(`Message: ${message.subject}`, 'info');
            });

            inboxList.appendChild(item);
        });
    }

    /**
     * Initialize system tools
     */
    initSystemTools() {
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach((card) => {
            card.addEventListener('click', () => {
                const toolName = card.querySelector('.tool-name').textContent;
                this.switchTab('terminal');
                setTimeout(() => {
                    const terminal = this.domCache.get('#terminalInput') || document.getElementById('terminalInput');
                    if (terminal) {
                        if (toolName === 'Network Scanner') {
                            terminal.value = 'scan';
                        } else if (toolName === 'Password Cracker') {
                            terminal.value = 'bruteforce';
                        } else if (toolName === 'Signal Interceptor') {
                            terminal.value = 'scan';
                        } else if (toolName === 'Firewall Bypass') {
                            terminal.value = 'decrypt firewall.enc';
                        }
                        terminal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                    }
                }, 100);
            });
        });
    }

    /**
     * Add XP dengan visual feedback dan badge effects
     * @param {number} amount - XP amount
     */
    addXP(amount) {
        // Play sound
        if (this.audioSystem) {
            this.audioSystem.playSound('xp_gain');
        }
        // Apply badge XP bonus
        const badgeEffects = BadgeSystem.applyBadgeEffects(this.stateManager);
        const bonusAmount = Math.floor(amount * (badgeEffects.xpBonus - 1.0));
        const totalAmount = amount + bonusAmount;
        
        const currentXP = this.stateManager.get('xp') || 0;
        const newXP = currentXP + totalAmount;
        this.stateManager.set('xp', newXP);

        // Show XP gain animation
        const statXP = this.domCache.get('#statXP') || document.getElementById('statXP');
        if (statXP) {
            const rect = statXP.getBoundingClientRect();
            VisualEffects.showXPGain(totalAmount, {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
            
            // Show bonus if any
            if (bonusAmount > 0) {
                setTimeout(() => {
                    VisualEffects.showXPGain(bonusAmount, {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2 - 30
                    });
                }, 200);
            }
        } else {
            // Fallback: center of screen
            VisualEffects.showXPGain(totalAmount);
        }

        // Level up calculation menggunakan ProgressionSystem
        const currentLevel = this.stateManager.get('level') || 1;
        const newLevel = ProgressionSystem.getLevelFromXP(newXP);
        
        if (newLevel > currentLevel) {
            this.stateManager.set('level', newLevel);
            
            // Check milestone rewards
            const milestone = RewardSystem.checkMilestones(newLevel, this.stateManager);
            const unlocks = [];
            if (milestone) {
                unlocks.push(milestone.name);
                this.showToast(milestone.message, 'success');
                eventBus.emit('activity:add', milestone.message);
            }
            
            // Play level up sound
            if (this.audioSystem) {
                this.audioSystem.playSound('level_up');
            }
            
            // Show level up celebration
            VisualEffects.showLevelUp(newLevel, {
                unlocks: unlocks
            });
            
            this.showToast(`Level Up! You are now level ${newLevel}`, 'success');
            eventBus.emit('activity:add', `Leveled up to level ${newLevel}!`);
            
            // Check achievements and goals
            AchievementSystem.checkAchievements(this.stateManager);
            LongTermGoalsSystem.checkGoals(this.stateManager);
            
            // Unlock level-based collectibles
            if (newLevel >= 25) {
                CollectionSystem.unlockCollectible('themes', 'neon_terminal', this.stateManager);
            }
            if (newLevel >= 20) {
                CollectionSystem.unlockCollectible('titles', 'elite_hacker', this.stateManager);
            }
        }

        this.dashboardController.updateDashboard();
        this.updateProfile();
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        const toast = this.domCache.get('#toast') || document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    /**
     * Add initial logs
     */
    addInitialLogs() {
        const logs = [
            {
                time: new Date().toISOString(),
                level: 'INFO',
                message: 'System initialized successfully ♡',
            },
            {
                time: new Date().toISOString(),
                level: 'SUCCESS',
                message: 'Terminal ready for commands',
            },
        ];

        this.stateManager.set('logs', logs);
    }

    /**
     * Check welcome screen
     */
    checkWelcomeScreen() {
        const seen = StorageService.hasSeenWelcome();
        if (seen) {
            this.closeWelcome();
        }
    }

    /**
     * Close welcome screen
     */
    closeWelcome() {
        const welcomeScreen = this.domCache.get('#welcomeScreen') || document.getElementById('welcomeScreen');
        const dashboardContent = this.domCache.get('#dashboardContent') || document.getElementById('dashboardContent');

        if (welcomeScreen && dashboardContent) {
            welcomeScreen.style.display = 'none';
            dashboardContent.style.display = 'block';
            this.dashboardController.updateDashboard();
        }

        StorageService.markWelcomeSeen();
    }

    /**
     * Get time ago helper
     * @param {Date} date - Date object
     * @returns {string} Time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
}

// Global function untuk closeWelcome (dipanggil dari HTML)
window.closeWelcome = function () {
    if (window.app) {
        window.app.closeWelcome();
    }
};

// Global function untuk switchTab (dipanggil dari HTML)
window.switchTab = function (tabName) {
    if (window.app) {
        window.app.switchTab(tabName);
    }
};

// Initialize app when DOM is ready
const app = new App();
window.app = app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

