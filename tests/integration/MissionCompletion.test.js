import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandHandlers } from '../../src/modules/Terminal/CommandHandlers.js';
import { MissionSystem } from '../../src/modules/Missions/MissionSystem.js';
import { StateManager } from '../../src/core/StateManager.js';
import { eventBus } from '../../src/core/EventBus.js';

// Mock Terminal
class MockTerminal {
    constructor() {
        this.lines = [];
    }
    
    addLine(text, type = 'text') {
        this.lines.push({ text, type });
    }
    
    clear() {
        this.lines = [];
    }
    
    addLog(message, level) {
        this.logs = this.logs || [];
        this.logs.push({ message, level });
    }
}

describe('Mission Completion Integration', () => {
    let stateManager;
    let missionSystem;
    let commandHandlers;
    let mockTerminal;
    
    beforeEach(() => {
        stateManager = new StateManager({
            missions: [
                {
                    id: 'mission-01',
                    title: 'Recover Lost Password',
                    status: 'active',
                    progress: 0,
                    steps: [
                        { id: 'step-1', text: 'Scan for password files in the system', completed: false },
                        { id: 'step-2', text: 'Decrypt the password hash', completed: false },
                        { id: 'step-3', text: 'Run brute force attack', completed: false },
                        { id: 'step-4', text: 'Recover and verify password', completed: false },
                    ],
                    reward: '50 XP + Hacker Badge'
                }
            ],
            xp: 0,
            level: 1,
            completedMissions: 0
        });
        
        mockTerminal = new MockTerminal();
        missionSystem = new MissionSystem(stateManager);
        commandHandlers = new CommandHandlers(mockTerminal, stateManager);
    });
    
    it('should complete mission step when command matches', () => {
        const missions = stateManager.get('missions');
        expect(missions[0].steps[0].completed).toBe(false);
        
        // Simulate scan command completing step-1
        const emitSpy = vi.spyOn(eventBus, 'emit');
        commandHandlers.completeMatchingMissionSteps('scan');
        
        // Verify event was emitted
        expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-1'
        });
    });
    
    it('should update mission progress when steps are completed', () => {
        const missions = stateManager.get('missions');
        const mission = missions[0];
        
        // Complete step-1
        eventBus.emit('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-1'
        });
        
        // MissionSystem should handle this and update progress
        const updatedMissions = stateManager.get('missions');
        const updatedMission = updatedMissions.find(m => m.id === 'mission-01');
        
        // Progress should be updated (1/4 = 25%)
        expect(updatedMission.progress).toBe(25);
        expect(updatedMission.steps[0].completed).toBe(true);
    });
    
    it('should complete mission when all steps are done', () => {
        const missions = stateManager.get('missions');
        const mission = missions[0];
        
        // Complete all steps
        mission.steps.forEach((step, index) => {
            eventBus.emit('mission:step:complete', {
                missionId: 'mission-01',
                stepId: step.id
            });
        });
        
        const updatedMissions = stateManager.get('missions');
        const updatedMission = updatedMissions.find(m => m.id === 'mission-01');
        
        // All steps should be completed
        expect(updatedMission.steps.every(s => s.completed)).toBe(true);
        expect(updatedMission.progress).toBe(100);
    });
    
    it('should not complete step twice', () => {
        const missions = stateManager.get('missions');
        const mission = missions[0];
        
        // Complete step-1 twice
        eventBus.emit('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-1'
        });
        
        const firstProgress = stateManager.get('missions')[0].progress;
        
        eventBus.emit('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-1'
        });
        
        const secondProgress = stateManager.get('missions')[0].progress;
        
        // Progress should not change
        expect(firstProgress).toBe(secondProgress);
    });
    
    it('should handle multiple commands completing different steps', () => {
        const emitSpy = vi.spyOn(eventBus, 'emit');
        
        // Scan should complete step-1
        commandHandlers.completeMatchingMissionSteps('scan');
        
        // Decrypt should complete step-2
        commandHandlers.completeMatchingMissionSteps('decrypt');
        
        // Bruteforce should complete step-3
        commandHandlers.completeMatchingMissionSteps('bruteforce');
        
        // Verify all events were emitted
        expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-1'
        });
        expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-2'
        });
        expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
            missionId: 'mission-01',
            stepId: 'step-3'
        });
    });
});

