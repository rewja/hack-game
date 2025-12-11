import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Terminal } from '../../src/modules/Terminal/Terminal.js';
import { StateManager } from '../../src/core/StateManager.js';
import { CONSTANTS } from '../../src/core/Constants.js';

describe('Terminal', () => {
    let terminal;
    let stateManager;
    let mockBody;
    let mockInput;
    
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="terminalBody"></div>
            <input id="terminalInput" />
        `;
        
        mockBody = document.getElementById('terminalBody');
        mockInput = document.getElementById('terminalInput');
        
        stateManager = new StateManager({
            commandHistory: [],
            historyIndex: 0,
            logs: []
        });
        
        terminal = new Terminal(stateManager);
    });
    
    afterEach(() => {
        terminal.destroy();
        vi.clearAllTimers();
    });
    
    describe('Batch Renderer', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        
        afterEach(() => {
            vi.useRealTimers();
        });
        
        it('should batch render lines', () => {
            terminal.addLine('Line 1');
            terminal.addLine('Line 2');
            terminal.addLine('Line 3');
            
            // Lines should be in pending, not yet in DOM
            expect(mockBody.children.length).toBe(0);
            
            // Advance timer to trigger flush
            vi.advanceTimersByTime(CONSTANTS.TERMINAL.BATCH_RENDER_INTERVAL);
            
            // Now lines should be in DOM
            expect(mockBody.children.length).toBe(3);
        });
        
        it('should flush immediately if too many pending lines', () => {
            // Add more than 10 lines
            for (let i = 0; i < 15; i++) {
                terminal.addLine(`Line ${i}`);
            }
            
            // Should flush immediately
            expect(mockBody.children.length).toBeGreaterThan(10);
        });
        
        it('should limit terminal history to MAX_LINES', () => {
            const maxLines = CONSTANTS.TERMINAL.MAX_LINES;
            
            // Add more than max lines
            for (let i = 0; i < maxLines + 100; i++) {
                terminal.addLine(`Line ${i}`);
            }
            
            // Flush all
            terminal.flushPendingLines();
            
            // Should not exceed max lines
            expect(mockBody.children.length).toBeLessThanOrEqual(maxLines);
        });
    });
    
    describe('Memory Management', () => {
        it('should cleanup interval on destroy', () => {
            const stopSpy = vi.spyOn(terminal, 'stopBatchRenderer');
            
            terminal.destroy();
            
            expect(stopSpy).toHaveBeenCalled();
            expect(terminal.batchRendererInterval).toBeNull();
        });
        
        it('should clear pending lines on destroy', () => {
            terminal.addLine('Test line');
            expect(terminal.pendingLines.length).toBeGreaterThan(0);
            
            terminal.destroy();
            
            expect(terminal.pendingLines.length).toBe(0);
        });
        
        it('should remove event listeners on destroy', () => {
            const removeEventListenerSpy = vi.spyOn(mockInput, 'removeEventListener');
            
            terminal.destroy();
            
            // Should remove both keydown and input listeners
            expect(removeEventListenerSpy).toHaveBeenCalled();
        });
    });
    
    describe('Command History', () => {
        it('should add command to history', () => {
            // Mock executeCommand to avoid actual execution
            const originalExecute = terminal.executeCommand.bind(terminal);
            terminal.executeCommand = vi.fn(() => {
                const history = stateManager.get('commandHistory') || [];
                history.push('scan');
                if (history.length > CONSTANTS.TERMINAL.MAX_HISTORY) {
                    history.shift();
                }
                stateManager.set('commandHistory', history);
            });
            
            mockInput.value = 'scan';
            
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            terminal.handleKeyDown(event);
            
            const history = stateManager.get('commandHistory');
            expect(history).toContain('scan');
        });
        
        it('should limit history to MAX_HISTORY', () => {
            const maxHistory = CONSTANTS.TERMINAL.MAX_HISTORY;
            
            // Add more than max history
            for (let i = 0; i < maxHistory + 50; i++) {
                const history = stateManager.get('commandHistory') || [];
                history.push(`command-${i}`);
                if (history.length > maxHistory) {
                    history.shift();
                }
                stateManager.set('commandHistory', history);
            }
            
            const finalHistory = stateManager.get('commandHistory');
            expect(finalHistory.length).toBeLessThanOrEqual(maxHistory);
        });
    });
    
    describe('Clear Terminal', () => {
        it('should clear terminal body', () => {
            terminal.addLine('Test line');
            terminal.flushPendingLines();
            
            expect(mockBody.children.length).toBeGreaterThan(0);
            
            terminal.clear();
            
            expect(mockBody.children.length).toBe(0);
        });
        
        it('should clear pending lines', () => {
            terminal.addLine('Test line');
            expect(terminal.pendingLines.length).toBeGreaterThan(0);
            
            terminal.clear();
            
            expect(terminal.pendingLines.length).toBe(0);
        });
    });
});

