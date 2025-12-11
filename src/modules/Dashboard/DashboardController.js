import { DOMUtils, DOMCache } from '../../utils/dom.js';
import { FormatUtils } from '../../utils/format.js';
import { eventBus } from '../../core/EventBus.js';
import { throttle } from '../../utils/performance.js';
import { ProgressionSystem } from '../../core/ProgressionSystem.js';

/**
 * DashboardController - Mengelola dashboard UI
 */
export class DashboardController {
    constructor(stateManager) {
        this.state = stateManager;
        this.domCache = new DOMCache();
        // Throttle update untuk performance (lebih baik dari debounce untuk real-time updates)
        // Throttle memastikan update terjadi secara berkala, tidak terlewat seperti debounce
        this.updateDashboard = throttle(this.updateDashboard.bind(this), 50);
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen untuk state changes
        this.state.subscribe('xp', () => this.updateDashboard());
        this.state.subscribe('level', () => this.updateDashboard());
        this.state.subscribe('completedMissions', () => this.updateDashboard());
        this.state.subscribe('missions', () => this.updateDashboard());
        this.state.subscribe('activities', () => this.updateDashboard());

        // Listen untuk activity additions
        eventBus.on('activity:add', (text) => {
            this.addActivity(text);
        });
    }

    /**
     * Update dashboard display dengan exponential progression
     */
    updateDashboard() {
        const xp = this.state.get('xp') || 0;
        const level = this.state.get('level') || 1;
        const completedMissions = this.state.get('completedMissions') || 0;
        const missions = this.state.get('missions') || [];
        const activeMissions = missions.filter((m) => m.status === 'active').length;

        // Get XP progress menggunakan ProgressionSystem
        const xpProgress = ProgressionSystem.getXPProgress(xp);
        const actualLevel = xpProgress.level;
        
        // Update level jika berbeda
        if (actualLevel !== level) {
            this.state.set('level', actualLevel);
        }

        // Update stats dengan DOMCache
        const statXP = this.domCache.get('#statXP') || document.getElementById('statXP');
        const statLevel = this.domCache.get('#statLevel') || document.getElementById('statLevel');
        const statMissions = this.domCache.get('#statMissions') || document.getElementById('statMissions');
        const statActive = this.domCache.get('#statActive') || document.getElementById('statActive');

        if (statXP) statXP.textContent = FormatUtils.formatNumber(xp);
        if (statLevel) statLevel.textContent = actualLevel;
        if (statMissions) statMissions.textContent = completedMissions;
        if (statActive) statActive.textContent = activeMissions;
        
        // Update XP progress bar jika ada
        this.updateXPProgressBar(xpProgress);

        // Update activity list
        this.updateActivityList();
    }
    
    /**
     * Update XP progress bar
     * @param {Object} xpProgress - XP progress info dari ProgressionSystem
     */
    updateXPProgressBar(xpProgress) {
        // Cari atau buat progress bar
        let progressBar = this.domCache.get('#xpProgressBar');
        if (!progressBar) {
            const statXP = this.domCache.get('#statXP');
            if (statXP && statXP.parentElement) {
                progressBar = DOMUtils.createElement('div', {
                    id: 'xpProgressBar',
                    className: 'xp-progress-bar',
                    style: 'width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 8px; overflow: hidden;'
                });
                const progressFill = DOMUtils.createElement('div', {
                    className: 'xp-progress-fill',
                    style: `height: 100%; background: linear-gradient(90deg, #FF6B9D 0%, #9A7BB3 100%); width: ${xpProgress.progress * 100}%; transition: width 0.3s ease;`
                });
                progressBar.appendChild(progressFill);
                statXP.parentElement.appendChild(progressBar);
            }
        } else {
            const progressFill = progressBar.querySelector('.xp-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${xpProgress.progress * 100}%`;
            }
        }
    }

    /**
     * Update activity list
     */
    updateActivityList() {
        const activityList = this.domCache.get('#activityList') || document.getElementById('activityList');
        if (!activityList) return;

        const activities = this.state.get('activities') || [];
        DOMUtils.clearChildren(activityList);

        activities
            .slice(-5)
            .reverse()
            .forEach((activity) => {
                const item = DOMUtils.createElement('div', { className: 'activity-item' });
                const time = new Date(activity.time);
                const timeStr = FormatUtils.getTimeAgo(time);

                const timeSpan = DOMUtils.createElement('span', {
                    className: 'activity-time',
                    textContent: timeStr,
                });
                const textSpan = DOMUtils.createElement('span', {
                    className: 'activity-text',
                    textContent: activity.text,
                });

                item.appendChild(timeSpan);
                item.appendChild(textSpan);
                activityList.appendChild(item);
            });
    }

    /**
     * Add activity
     * @param {string} text - Activity text
     */
    addActivity(text) {
        const activities = this.state.get('activities') || [];
        activities.push({
            time: new Date().toISOString(),
            text: text,
        });
        this.state.set('activities', activities);
    }
}

