import { DOMUtils, DOMCache } from '../../utils/dom.js';
import { SecurityUtils } from '../../utils/security.js';
import { ValidationUtils } from '../../utils/validation.js';
import { batchDOMUpdates } from '../../utils/performance.js';
import { CONSTANTS } from '../../core/Constants.js';
import { eventBus } from '../../core/EventBus.js';
import { ErrorHandler } from '../../core/ErrorHandler.js';
import { MissionSolutionSystem } from './MissionSolutionSystem.js';
import { ProceduralMissionGenerator } from './ProceduralMissionGenerator.js';
import { LeaderboardSystem } from '../../core/LeaderboardSystem.js';
import { DailyChallengeSystem } from './DailyChallengeSystem.js';
import { MISSION_TYPES, checkMissionTypeRequirements } from './MissionTypes.js';

/**
 * MissionSystem - Mengelola missions dan rendering
 */
export class MissionSystem {
    constructor(stateManager) {
        this.state = stateManager;
        this.domCache = new DOMCache();
        this.missionsLoaded = false;
        this.missionsLoading = false; // Prevent multiple simultaneous loads
        this.lastRenderedMissions = null; // Cache untuk prevent unnecessary re-renders
        try {
            this.setupEventListeners();
            // Lazy load missions (async, but don't await in constructor)
            this.loadMissions().catch(error => {
                ErrorHandler.handle(error, 'MissionSystem.constructor.loadMissions');
            });
        } catch (error) {
            ErrorHandler.handle(error, 'MissionSystem.constructor');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen untuk mission step completion
        eventBus.on('mission:step:complete', (data) => {
            this.completeMissionStep(data.missionId, data.stepId);
        });
    }

    /**
     * Load missions dari data (lazy loading)
     * @returns {Promise<void>} Promise that resolves when missions are loaded
     */
    async loadMissions() {
        // Prevent multiple simultaneous loads
        if (this.missionsLoading) {
            // Wait for current load to complete
            while (this.missionsLoading) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            return;
        }

        // Only load jika belum loaded dan missions tab is active atau missions empty
        const missions = this.state.get('missions') || [];
        if (this.missionsLoaded && missions.length > 0) {
            return;
        }

        // Set loading flag and load
        this.missionsLoading = true;
        try {
            await this.loadMissionsFromFile();
        } finally {
            this.missionsLoading = false;
        }
    }

    /**
     * Render missions ke grid dengan batch updates
     */
    async renderMissions() {
        const grid = this.domCache.get('#missionsGrid');
        if (!grid) {
            console.warn('missionsGrid element not found, retrying...');
            setTimeout(() => {
                const retryGrid = this.domCache.get('#missionsGrid', true);
                if (retryGrid) {
                    this.renderMissions();
                }
            }, 100);
            return;
        }

        const missions = this.state.get('missions') || [];
        
        // Check if missions actually changed (prevent unnecessary re-renders)
        const missionsKey = JSON.stringify(missions.map(m => ({
            id: m.id,
            status: m.status,
            progress: m.progress,
            steps: m.steps.map(s => ({ id: s.id, completed: s.completed }))
        })));
        
        if (this.lastRenderedMissions === missionsKey && missions.length > 0) {
            // Missions haven't changed, skip re-render
            return;
        }
        
        // If missions are empty and not loading, try to load them
        if (missions.length === 0 && !this.missionsLoading) {
            DOMUtils.clearChildren(grid);
            const loadingDiv = DOMUtils.createElement('div', {
                style: 'text-align: center; padding: 40px; color: var(--color-text-light);',
                textContent: 'Loading missions...',
            });
            grid.appendChild(loadingDiv);
            // Try to load missions (async, will re-render when done)
            this.loadMissions().catch(error => {
                ErrorHandler.handle(error, 'MissionSystem.renderMissions.loadMissions');
            });
            return;
        }

        // If missions are loading, show loading state
        if (this.missionsLoading && missions.length === 0) {
            DOMUtils.clearChildren(grid);
            const loadingDiv = DOMUtils.createElement('div', {
                style: 'text-align: center; padding: 40px; color: var(--color-text-light);',
                textContent: 'Loading missions...',
            });
            grid.appendChild(loadingDiv);
            return;
        }

        // Batch DOM updates untuk performance
        batchDOMUpdates(() => {
            DOMUtils.clearChildren(grid);
            console.log('Rendering', missions.length, 'missions');

            // Use document fragment untuk batch append
            const fragment = document.createDocumentFragment();
            missions.forEach((mission) => {
                const card = this.createMissionCard(mission);
                fragment.appendChild(card);
            });
            grid.appendChild(fragment);
            
            // Cache rendered missions state
            this.lastRenderedMissions = missionsKey;
        });
    }

    /**
     * Load missions from JSON file
     */
    async loadMissionsFromFile() {
        try {
            const response = await fetch('/data/missions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const missions = await response.json();

            // Validate missions data
            const validMissions = ValidationUtils.validateMissions(missions);
            if (validMissions.length === 0 && missions.length > 0) {
                throw new Error('Invalid missions data structure');
            }

            // Add multiple solution paths to missions
            const missionsWithSolutions = validMissions.map(mission => 
                MissionSolutionSystem.createMissionWithSolutions(mission)
            );
            
            // Add procedural missions untuk variety
            const proceduralMissions = ProceduralMissionGenerator.generateMissions(3, 'medium');
            const allMissions = [...missionsWithSolutions, ...proceduralMissions];

            this.state.set('missions', JSON.parse(JSON.stringify(allMissions)));
            this.missionsLoaded = true;
            this.renderMissions();
        } catch (error) {
            ErrorHandler.handle(error, 'MissionSystem.loadMissionsFromFile', {
                showToUser: true,
                userMessage: 'Failed to load missions. Please refresh the page.',
            });
            this.state.set('missions', []);
            this.showError('Failed to load missions. Please check console for details.');
        }
    }

    /**
     * Create mission card element
     * @param {Object} mission - Mission object
     * @returns {HTMLElement} Mission card element
     */
    createMissionCard(mission) {
        const card = DOMUtils.createElement('div', { className: 'mission-card' });
        if (mission.status === CONSTANTS.MISSION.STATUS.LOCKED) {
            card.style.opacity = '0.6';
        }

        const completedSteps = mission.steps.filter((s) => s.completed).length;
        const totalSteps = mission.steps.length;
        const progress = Math.round((completedSteps / totalSteps) * 100);

        // Mission header
        const header = DOMUtils.createElement('div', { className: 'mission-header' });
        const title = DOMUtils.createElement('div', {
            className: 'mission-title',
            textContent: SecurityUtils.escapeHtml(mission.title),
        });
        const badge = DOMUtils.createElement('div', {
            className: 'mission-badge',
            textContent: mission.status.toUpperCase(),
        });
        header.appendChild(title);
        header.appendChild(badge);

        // Mission description
        const description = DOMUtils.createElement('div', {
            className: 'mission-description',
            textContent: SecurityUtils.escapeHtml(mission.description),
        });

        // Mission steps
        const stepsContainer = DOMUtils.createElement('div', { className: 'mission-steps' });
        mission.steps.forEach((step) => {
            const stepDiv = DOMUtils.createElement('div', {
                className: `mission-step ${step.completed ? 'completed' : ''}`,
            });
            const checkbox = DOMUtils.createElement('div', { className: 'step-checkbox' });
            const stepText = DOMUtils.createElement('span', {
                textContent: SecurityUtils.escapeHtml(step.text),
            });
            stepDiv.appendChild(checkbox);
            stepDiv.appendChild(stepText);
            stepsContainer.appendChild(stepDiv);
        });

        // Progress bar
        const progressContainer = DOMUtils.createElement('div', { className: 'mission-progress' });
        const progressBar = DOMUtils.createElement('div', { className: 'progress-bar' });
        const progressFill = DOMUtils.createElement('div', {
            className: 'progress-fill',
            style: `width: ${progress}%`,
        });
        progressBar.appendChild(progressFill);
        const progressText = DOMUtils.createElement('div', {
            className: 'progress-text',
            textContent: `${progress}% Complete`,
        });
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        // Reward
        const reward = DOMUtils.createElement('div', {
            style: 'margin-top: 12px; font-size: 12px; color: var(--color-violet);',
            textContent: `Reward: ${SecurityUtils.escapeHtml(mission.reward)}`,
        });

        // Append all
        DOMUtils.appendChildren(card, [header, description, stepsContainer, progressContainer, reward]);

        // Add click handler untuk active missions
        if (mission.status === CONSTANTS.MISSION.STATUS.ACTIVE) {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Mission: ${SecurityUtils.escapeHtml(mission.title)}`);
            
            card.addEventListener('click', () => {
                this.startMission(mission);
            });
            
            // Keyboard navigation
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.startMission(mission);
                }
            });
        }

        return card;
    }

    /**
     * Start mission dengan solution selection
     * @param {Object} mission - Mission object
     */
    startMission(mission) {
        // Track mission start time
        mission.startTime = Date.now();
        
        // Jika mission punya multiple solutions, show selection
        const availableSolutions = MissionSolutionSystem.getAvailableSolutions(mission);
        
        if (availableSolutions.length > 1) {
            this.showSolutionSelection(mission, availableSolutions);
        } else {
            // Single solution atau default
            const solutionId = availableSolutions[0]?.id || 'default';
            MissionSolutionSystem.selectSolution(mission, solutionId);
            
            eventBus.emit('toast:show', {
                message: `Starting mission: ${mission.title}`,
                type: 'success',
            });
            eventBus.emit('activity:add', `Started mission: ${mission.title}`);
            eventBus.emit('tab:switch', 'terminal');
        }
    }
    
    /**
     * Show solution selection UI
     * @param {Object} mission - Mission object
     * @param {Array} solutions - Available solutions
     */
    showSolutionSelection(mission, solutions) {
        // Create modal untuk solution selection
        const modal = document.createElement('div');
        modal.className = 'solution-selection-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #9A7BB3 0%, #E4C8F7 100%);
            padding: 30px;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const title = document.createElement('h2');
        title.textContent = `Choose Approach: ${mission.title}`;
        title.style.cssText = `
            color: #fff;
            margin-bottom: 20px;
            text-align: center;
        `;
        
        const solutionsList = document.createElement('div');
        solutionsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;
        
        solutions.forEach(solution => {
            const solutionCard = document.createElement('div');
            solutionCard.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                padding: 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: transform 0.2s, background 0.2s;
                border: 2px solid transparent;
            `;
            
            solutionCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h3 style="color: #fff; margin: 0;">${SecurityUtils.escapeHtml(solution.name)}</h3>
                    <span style="color: #FF6B9D; font-weight: bold;">${solution.difficulty.toUpperCase()}</span>
                </div>
                <p style="color: #E4C8F7; margin: 10px 0;">${SecurityUtils.escapeHtml(solution.description)}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                    <span style="color: #6BCB77;">Reward: ${solution.reward.xp} XP${solution.reward.bonus ? ` + ${solution.reward.bonus} bonus` : ''}</span>
                    <span style="color: #9A7BB3;">Success: ${(solution.successRate * 100).toFixed(0)}%</span>
                </div>
            `;
            
            solutionCard.addEventListener('mouseenter', () => {
                solutionCard.style.transform = 'scale(1.02)';
                solutionCard.style.borderColor = '#FF6B9D';
            });
            solutionCard.addEventListener('mouseleave', () => {
                solutionCard.style.transform = 'scale(1)';
                solutionCard.style.borderColor = 'transparent';
            });
            
            solutionCard.addEventListener('click', () => {
                MissionSolutionSystem.selectSolution(mission, solution.id);
                modal.remove();
                
                eventBus.emit('toast:show', {
                    message: `Starting mission with ${solution.name}`,
                    type: 'success',
                });
                eventBus.emit('activity:add', `Started mission: ${mission.title} (${solution.name})`);
                eventBus.emit('tab:switch', 'terminal');
            });
            
            solutionsList.appendChild(solutionCard);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cancel';
        closeBtn.style.cssText = `
            margin-top: 20px;
            width: 100%;
            padding: 12px;
            background: rgba(255, 107, 157, 0.8);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        container.appendChild(title);
        container.appendChild(solutionsList);
        container.appendChild(closeBtn);
        modal.appendChild(container);
        document.body.appendChild(modal);
    }

    /**
     * Complete mission step
     * @param {string} missionId - Mission ID
     * @param {string} stepId - Step ID
     */
    completeMissionStep(missionId, stepId) {
        const missions = this.state.get('missions') || [];
        const mission = missions.find((m) => m.id === missionId);
        if (!mission) return;

        const step = mission.steps.find((s) => s.id === stepId);
        if (!step || step.completed) return;

        step.completed = true;

        // Update progress
        const completedSteps = mission.steps.filter((s) => s.completed).length;
        const totalSteps = mission.steps.length;
        mission.progress = Math.round((completedSteps / totalSteps) * 100);

        // Update state
        this.state.set('missions', missions);

        // Re-render missions
        this.renderMissions();

        // Check if mission is complete
        const allCompleted = mission.steps.every((s) => s.completed);
        if (allCompleted && mission.status === CONSTANTS.MISSION.STATUS.ACTIVE) {
            this.completeMission(mission);
        }
    }

    /**
     * Complete mission dengan achievement tracking dan leaderboard
     * @param {Object} mission - Mission object
     */
    completeMission(mission) {
        const missions = this.state.get('missions') || [];
        const missionIndex = missions.findIndex((m) => m.id === mission.id);

        if (missionIndex === -1) return;

        missions[missionIndex].status = CONSTANTS.MISSION.STATUS.COMPLETED;
        const completedMissions = (this.state.get('completedMissions') || 0) + 1;
        this.state.set('completedMissions', completedMissions);
        this.state.set('missions', missions);

        // Track mission completion time
        const missionStartTime = mission.startTime || Date.now();
        const completionTime = Date.now() - missionStartTime;
        
        // Track fastest mission
        const fastestMission = this.state.get('fastestMissionCompletion') || null;
        if (!fastestMission || completionTime < fastestMission.time) {
            this.state.set('fastestMissionCompletion', {
                missionId: mission.id,
                time: completionTime
            });
        }
        
        // Track perfect missions (no failed steps)
        const hasFailedSteps = mission.steps.some(step => step.failed);
        if (!hasFailedSteps) {
            const perfectMissions = (this.state.get('perfectMissions') || 0) + 1;
            this.state.set('perfectMissions', perfectMissions);
        }
        
        // Track night missions (after midnight)
        const now = new Date();
        if (now.getHours() >= 0 && now.getHours() < 6) {
            const nightMissions = (this.state.get('nightMissions') || 0) + 1;
            this.state.set('nightMissions', nightMissions);
        }
        
        // Track daily completions
        const today = new Date().toDateString();
        const dailyCompletions = this.state.get('dailyCompletions') || {};
        dailyCompletions[today] = (dailyCompletions[today] || 0) + 1;
        this.state.set('dailyCompletions', dailyCompletions);
        
        // Unlock first mission badge
        if (completedMissions === 1) {
            import('../../core/BadgeSystem.js').then(({ BadgeSystem }) => {
                BadgeSystem.unlockBadge('hacker_badge', this.state);
            });
        }

        // Calculate and submit leaderboard score
        const playerId = this.state.get('playerId') || `player_${Date.now()}`;
        this.state.set('playerId', playerId);
        
        const score = LeaderboardSystem.calculateScore(mission, {
            timeTaken: completionTime,
            retries: mission.retries || 0,
            stepsCompleted: mission.steps.filter(s => s.completed).length
        });
        
        const rankInfo = LeaderboardSystem.submitScore(playerId, score, mission.id, this.state);
        
        // Award XP
        const xpMatch = mission.reward.match(/\d+/);
        const xpReward = xpMatch ? parseInt(xpMatch[0]) : 50;
        eventBus.emit('xp:add', xpReward);

        eventBus.emit('toast:show', {
            message: `Mission completed! +${xpReward} XP (Rank: #${rankInfo.rank})`,
            type: 'success',
        });
        eventBus.emit('activity:add', `Completed mission: ${mission.title} (+${xpReward} XP, Score: ${score})`);
        
        // Emit mission complete event untuk delayed satisfaction
        eventBus.emit('mission:complete', {
            mission: mission,
            score: score,
            rank: rankInfo.rank
        });

        // Check daily challenge completion
        DailyChallengeSystem.completeDailyChallenge(this.state);

        // Unlock next mission
        if (missionIndex < missions.length - 1) {
            const nextMission = missions[missionIndex + 1];
            if (nextMission.status === CONSTANTS.MISSION.STATUS.LOCKED) {
                // Check mission type requirements
                if (checkMissionTypeRequirements(nextMission.type, this.state.getState())) {
                    nextMission.status = CONSTANTS.MISSION.STATUS.ACTIVE;
                    eventBus.emit('toast:show', {
                        message: `New mission unlocked: ${nextMission.title}`,
                        type: 'info',
                    });
                    this.state.set('missions', missions);
                    this.renderMissions();
                }
            }
        }
        
        // Check achievements
        import('../../core/AchievementSystem.js').then(({ AchievementSystem }) => {
            AchievementSystem.checkAchievements(this.state);
        });
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const grid = document.getElementById('missionsGrid');
        if (grid) {
            DOMUtils.clearChildren(grid);
            const errorDiv = DOMUtils.createElement('div', {
                style: 'text-align: center; padding: 40px; color: #FF6B9D;',
                textContent: SecurityUtils.escapeHtml(message),
            });
            grid.appendChild(errorDiv);
        }
    }
}

