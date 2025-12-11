/**
 * MissionSolutionSystem - Sistem untuk multiple solution paths
 * Phase 1: Core Gameplay Improvements
 */

import { CONSTANTS } from '../../core/Constants.js';
import { eventBus } from '../../core/EventBus.js';

/**
 * MissionSolutionSystem class untuk menangani multiple solution paths
 */
export class MissionSolutionSystem {
    /**
     * Create mission dengan multiple solution paths
     * @param {Object} missionData - Mission data
     * @returns {Object} Mission dengan solutions
     */
    static createMissionWithSolutions(missionData) {
        // Default solutions jika tidak ada di missionData
        const defaultSolutions = this.getDefaultSolutions(missionData.id);
        
        return {
            ...missionData,
            solutions: missionData.solutions || defaultSolutions,
            currentSolution: null, // Track solution yang sedang digunakan
            solutionProgress: {} // Track progress per solution
        };
    }
    
    /**
     * Get default solutions untuk mission
     * @param {string} missionId - Mission ID
     * @returns {Array} Array of solutions
     */
    static getDefaultSolutions(missionId) {
        // Default solutions berdasarkan mission type
        const solutionTemplates = {
            'mission-01': [
                {
                    id: 'bruteforce',
                    type: 'bruteforce',
                    name: 'Brute Force Attack',
                    description: 'Direct brute force attack',
                    steps: ['scan', 'bruteforce'],
                    difficulty: 'easy',
                    reward: { xp: 50, bonus: 0 },
                    successRate: 0.7
                },
                {
                    id: 'social_engineering',
                    type: 'social_engineering',
                    name: 'Social Engineering',
                    description: 'Use social engineering techniques',
                    steps: ['scan', 'decrypt', 'phish'],
                    difficulty: 'medium',
                    reward: { xp: 75, bonus: 10 },
                    successRate: 0.85
                }
            ],
            'mission-02': [
                {
                    id: 'intercept',
                    type: 'intercept',
                    name: 'Direct Interception',
                    description: 'Intercept messages directly',
                    steps: ['scan', 'decrypt'],
                    difficulty: 'easy',
                    reward: { xp: 75, bonus: 0 },
                    successRate: 0.8
                },
                {
                    id: 'exploit',
                    type: 'exploit',
                    name: 'Protocol Exploit',
                    description: 'Exploit protocol vulnerabilities',
                    steps: ['scan', 'exploit', 'bypass'],
                    difficulty: 'hard',
                    reward: { xp: 100, bonus: 20 },
                    successRate: 0.6
                }
            ],
            'mission-03': [
                {
                    id: 'decrypt',
                    type: 'decrypt',
                    name: 'Direct Decryption',
                    description: 'Decrypt archive directly',
                    steps: ['decrypt'],
                    difficulty: 'medium',
                    reward: { xp: 100, bonus: 0 },
                    successRate: 0.8
                },
                {
                    id: 'bypass',
                    type: 'bypass',
                    name: 'Bypass Encryption',
                    description: 'Bypass encryption layers',
                    steps: ['scan', 'exploit', 'decrypt'],
                    difficulty: 'hard',
                    reward: { xp: 125, bonus: 25 },
                    successRate: 0.65
                }
            ]
        };
        
        return solutionTemplates[missionId] || [
            {
                id: 'default',
                type: 'default',
                name: 'Standard Approach',
                description: 'Standard mission completion',
                steps: [],
                difficulty: 'medium',
                reward: { xp: 50, bonus: 0 },
                successRate: 0.8
            }
        ];
    }
    
    /**
     * Select solution untuk mission
     * @param {Object} mission - Mission object
     * @param {string} solutionId - Solution ID
     * @returns {Object} Selected solution
     */
    static selectSolution(mission, solutionId) {
        const solution = mission.solutions?.find(s => s.id === solutionId);
        if (!solution) {
            throw new Error(`Solution ${solutionId} not found for mission ${mission.id}`);
        }
        
        mission.currentSolution = solutionId;
        mission.solutionProgress[solutionId] = {
            stepsCompleted: [],
            startTime: Date.now()
        };
        
        return solution;
    }
    
    /**
     * Complete step untuk solution
     * @param {Object} mission - Mission object
     * @param {string} stepId - Step ID
     * @returns {boolean} True jika solution complete
     */
    static completeSolutionStep(mission, stepId) {
        if (!mission.currentSolution) return false;
        
        const solution = mission.solutions.find(s => s.id === mission.currentSolution);
        if (!solution) return false;
        
        const progress = mission.solutionProgress[mission.currentSolution];
        if (!progress.stepsCompleted.includes(stepId)) {
            progress.stepsCompleted.push(stepId);
        }
        
        // Check if all steps completed
        const allStepsCompleted = solution.steps.every(step => {
            // Check if step is completed (either in solution steps or mission steps)
            return progress.stepsCompleted.includes(step) || 
                   mission.steps.find(s => s.id === step)?.completed;
        });
        
        if (allStepsCompleted) {
            return this.completeSolution(mission, solution);
        }
        
        return false;
    }
    
    /**
     * Complete solution
     * @param {Object} mission - Mission object
     * @param {Object} solution - Solution object
     * @returns {boolean} True jika berhasil
     */
    static completeSolution(mission, solution) {
        const progress = mission.solutionProgress[mission.currentSolution];
        const timeTaken = Date.now() - progress.startTime;
        
        // Calculate reward dengan bonus
        const baseReward = solution.reward.xp;
        const bonus = solution.reward.bonus || 0;
        const totalReward = baseReward + bonus;
        
        // Emit events
        eventBus.emit('xp:add', totalReward);
        eventBus.emit('mission:solution:complete', {
            missionId: mission.id,
            solutionId: solution.id,
            reward: totalReward,
            timeTaken: timeTaken
        });
        
        return true;
    }
    
    /**
     * Get available solutions untuk mission
     * @param {Object} mission - Mission object
     * @returns {Array} Available solutions
     */
    static getAvailableSolutions(mission) {
        if (!mission.solutions) return [];
        
        // Filter solutions berdasarkan requirements
        return mission.solutions.filter(solution => {
            // Check if solution has requirements
            if (solution.requires) {
                // TODO: Check requirements (level, completed missions, etc.)
                return true;
            }
            return true;
        });
    }
}

