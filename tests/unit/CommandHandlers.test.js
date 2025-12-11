import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandHandlers } from '../../src/modules/Terminal/CommandHandlers.js';
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

describe('CommandHandlers', () => {
    let commandHandlers;
    let mockTerminal;
    let mockStateManager;
    
    beforeEach(() => {
        mockTerminal = new MockTerminal();
        mockStateManager = {
            get: vi.fn((key) => {
                const state = {
                    missions: [
                        {
                            id: 'mission-01',
                            status: 'active',
                            steps: [
                                { id: 'step-1', text: 'Scan for password files in the system', completed: false },
                                { id: 'step-2', text: 'Decrypt the password hash', completed: false },
                                { id: 'step-3', text: 'Run brute force attack', completed: false },
                                { id: 'step-4', text: 'Recover and verify password', completed: false },
                            ]
                        },
                        {
                            id: 'mission-02',
                            status: 'active',
                            steps: [
                                { id: 'step-1', text: 'Locate CuteChat network traffic', completed: false },
                            ]
                        }
                    ],
                    usedCommands: [],
                    level: 1,
                    xp: 0,
                    completedMissions: 0,
                    logs: []
                };
                return state[key];
            }),
            set: vi.fn()
        };
        
        commandHandlers = new CommandHandlers(mockTerminal, mockStateManager);
        
        // Clear event listeners
        eventBus.off('mission:step:complete');
    });
    
    describe('completeMatchingMissionSteps', () => {
        it('should complete matching mission steps for scan command', () => {
            const emitSpy = vi.spyOn(eventBus, 'emit');
            
            commandHandlers.completeMatchingMissionSteps('scan');
            
            // Should emit event for mission-02 step-1 (contains "Locate" and "network")
            expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
                missionId: 'mission-02',
                stepId: 'step-1'
            });
        });
        
        it('should complete matching mission steps for decrypt command', () => {
            const emitSpy = vi.spyOn(eventBus, 'emit');
            
            commandHandlers.completeMatchingMissionSteps('decrypt');
            
            // Should emit event for mission-01 step-2 (contains "Decrypt" and "hash")
            expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
                missionId: 'mission-01',
                stepId: 'step-2'
            });
        });
        
        it('should complete matching mission steps for bruteforce command', () => {
            const emitSpy = vi.spyOn(eventBus, 'emit');
            
            commandHandlers.completeMatchingMissionSteps('bruteforce');
            
            // Should emit event for mission-01 step-3 (contains "brute", "force", "attack")
            expect(emitSpy).toHaveBeenCalledWith('mission:step:complete', {
                missionId: 'mission-01',
                stepId: 'step-3'
            });
        });
        
        it('should not complete already completed steps', () => {
            mockStateManager.get = vi.fn((key) => {
                if (key === 'missions') {
                    return [{
                        id: 'mission-01',
                        status: 'active',
                        steps: [
                            { id: 'step-1', text: 'Scan for password files', completed: true },
                        ]
                    }];
                }
                return null;
            });
            
            const emitSpy = vi.spyOn(eventBus, 'emit');
            
            commandHandlers.completeMatchingMissionSteps('scan');
            
            // Should not emit for already completed step
            expect(emitSpy).not.toHaveBeenCalled();
        });
        
        it('should not complete steps for locked missions', () => {
            mockStateManager.get = vi.fn((key) => {
                if (key === 'missions') {
                    return [{
                        id: 'mission-01',
                        status: 'locked',
                        steps: [
                            { id: 'step-1', text: 'Scan for password files', completed: false },
                        ]
                    }];
                }
                return null;
            });
            
            const emitSpy = vi.spyOn(eventBus, 'emit');
            
            commandHandlers.completeMatchingMissionSteps('scan');
            
            // Should not emit for locked mission
            expect(emitSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('trackCommandUsage', () => {
        it('should track command usage', () => {
            mockStateManager.get = vi.fn((key) => {
                if (key === 'usedCommands') return [];
                return null;
            });
            
            commandHandlers.trackCommandUsage('scan');
            
            expect(mockStateManager.set).toHaveBeenCalledWith('usedCommands', ['scan']);
        });
        
        it('should not duplicate command in usedCommands', () => {
            mockStateManager.get = vi.fn((key) => {
                if (key === 'usedCommands') return ['scan'];
                return null;
            });
            
            commandHandlers.trackCommandUsage('scan');
            
            // Should not call set again if command already exists
            expect(mockStateManager.set).not.toHaveBeenCalled();
        });
    });
    
    describe('calculateSuccessRate', () => {
        it('should return base success rate for new command', () => {
            const rate = commandHandlers.calculateSuccessRate('scan');
            // Base rate for scan is 0.95 from CONSTANTS
            expect(rate).toBeGreaterThan(0.9);
            expect(rate).toBeLessThanOrEqual(1.0);
        });
        
        it('should decrease success rate after retries', () => {
            commandHandlers.recordCommandAttempt('scan', false);
            commandHandlers.recordCommandAttempt('scan', false);
            
            const rate = commandHandlers.calculateSuccessRate('scan');
            // Should be lower than base rate due to retry penalty
            expect(rate).toBeLessThan(0.95);
        });
        
        it('should reset success rate after successful attempt', () => {
            commandHandlers.recordCommandAttempt('scan', false);
            commandHandlers.recordCommandAttempt('scan', true);
            
            const rate = commandHandlers.calculateSuccessRate('scan');
            // Should be back to base rate
            expect(rate).toBeGreaterThan(0.9);
        });
    });
    
    describe('recordCommandAttempt', () => {
        it('should reset retries on success', () => {
            commandHandlers.recordCommandAttempt('scan', false);
            commandHandlers.recordCommandAttempt('scan', false);
            expect(commandHandlers.commandRetries.get('scan')).toBe(2);
            
            commandHandlers.recordCommandAttempt('scan', true);
            expect(commandHandlers.commandRetries.get('scan')).toBe(0);
        });
        
        it('should increment retries on failure', () => {
            commandHandlers.recordCommandAttempt('scan', false);
            expect(commandHandlers.commandRetries.get('scan')).toBe(1);
            
            commandHandlers.recordCommandAttempt('scan', false);
            expect(commandHandlers.commandRetries.get('scan')).toBe(2);
        });
    });
    
    describe('showHelp', () => {
        it('should display help message', () => {
            commandHandlers.showHelp();
            
            expect(mockTerminal.lines.length).toBeGreaterThan(0);
            expect(mockTerminal.lines.some(line => line.text.includes('help'))).toBe(true);
            expect(mockTerminal.lines.some(line => line.text.includes('scan'))).toBe(true);
        });
    });
    
    describe('clearTerminal', () => {
        it('should clear terminal and show success message', () => {
            mockTerminal.lines = [{ text: 'test', type: 'text' }];
            
            commandHandlers.clearTerminal();
            
            expect(mockTerminal.lines.length).toBe(1);
            expect(mockTerminal.lines[0].text).toContain('Terminal cleared');
            expect(mockTerminal.lines[0].type).toBe('success');
        });
    });
});

