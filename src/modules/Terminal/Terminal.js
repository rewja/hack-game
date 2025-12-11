import { CommandRegistry } from './CommandRegistry.js';
import { CommandHandlers } from './CommandHandlers.js';
import { SecurityUtils } from '../../utils/security.js';
import { ValidationUtils } from '../../utils/validation.js';
import { DOMUtils } from '../../utils/dom.js';
import { DOMCache } from '../../utils/dom.js';
import { batchDOMUpdates } from '../../utils/performance.js';
import { CONSTANTS } from '../../core/Constants.js';
import { eventBus } from '../../core/EventBus.js';
import { ErrorHandler } from '../../core/ErrorHandler.js';

/**
 * Terminal class untuk menangani command execution
 */
export class Terminal {
    constructor(stateManager) {
        this.state = stateManager;
        this.domCache = new DOMCache();
        this.body = this.domCache.get('#terminalBody');
        this.input = this.domCache.get('#terminalInput');
        this.commandRegistry = new CommandRegistry();
        this.commandHandlers = new CommandHandlers(this, stateManager);
        this.pendingLines = []; // Batch lines untuk performance
        this.batchRendererInterval = null; // Store interval ID untuk cleanup

        this.init();
        this.registerCommands();
        this.startBatchRenderer();
    }

    /**
     * Initialize terminal
     */
    init() {
        if (!this.body || !this.input) {
            console.error('Terminal elements not found');
            return;
        }

        // Bind handlers untuk bisa di-remove saat cleanup
        this.boundHandleKeyDown = (e) => this.handleKeyDown(e);
        this.boundHandleInput = () => this.handleInput();

        this.input.addEventListener('keydown', this.boundHandleKeyDown);
        this.input.addEventListener('input', this.boundHandleInput);
        this.input.focus();
    }

    /**
     * Register all commands
     */
    registerCommands() {
        this.commandRegistry.register('help', () => this.commandHandlers.showHelp(), {
            description: 'Show available commands',
        });
        this.commandRegistry.register('clear', () => this.commandHandlers.clearTerminal(), {
            description: 'Clear terminal screen',
        });
        this.commandRegistry.register('scan', () => this.commandHandlers.scanNetwork(), {
            description: 'Scan network for targets',
        });
        this.commandRegistry.register('bruteforce', () => this.commandHandlers.bruteforce(), {
            description: 'Brute force password attack',
        });
        this.commandRegistry.register('decrypt', (args) => this.commandHandlers.decrypt(args), {
            description: 'Decrypt encrypted files',
        });
        this.commandRegistry.register('ping', (args) => this.commandHandlers.ping(args), {
            description: 'Ping a network host',
        });
        this.commandRegistry.register('missions', () => this.commandHandlers.showMissions(), {
            description: 'Show available missions',
        });
        this.commandRegistry.register('logs', () => this.commandHandlers.showLogs(), {
            description: 'Display system logs',
        });
        this.commandRegistry.register('whoami', () => this.commandHandlers.whoami(), {
            description: 'Show current user info',
        });
        this.commandRegistry.register('date', () => this.commandHandlers.showDate(), {
            description: 'Show current date and time',
        });
        this.commandRegistry.register('echo', (args) => this.commandHandlers.echo(args), {
            description: 'Echo text to terminal',
        });
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (e.key === 'Enter') {
            this.executeCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocomplete();
        }
    }

    /**
     * Handle input events
     */
    handleInput() {
        const suggestion = this.body.querySelector('.terminal-suggestion');
        if (suggestion) {
            suggestion.remove();
        }
    }

    /**
     * Execute command
     */
    executeCommand() {
        const command = this.input.value.trim();
        if (!command) return;

        try {
            // Sanitize input
            const sanitized = SecurityUtils.sanitizeInput(command);

            // Validate command
            const allowedCommands = this.commandRegistry.getAllNames();
            if (!SecurityUtils.validateCommand(sanitized, allowedCommands)) {
                this.addLine('Invalid command format', 'error');
                return;
            }

            // Add to history
            const history = this.state.get('commandHistory') || [];
            history.push(sanitized);
            if (history.length > CONSTANTS.TERMINAL.MAX_HISTORY) {
                history.shift();
            }
            this.state.set('commandHistory', history);
            this.state.set('historyIndex', history.length);

            // Display command
            this.addLine(`soft-hacker@terminal:~$ ${sanitized}`, 'prompt');

            // Execute
            const [cmd, ...args] = sanitized.split(' ');
            const commandObj = this.commandRegistry.get(cmd.toLowerCase());

            if (commandObj) {
                // Validate command arguments jika ada schema
                if (commandObj.validate && !commandObj.validate(args)) {
                    this.addLine(`Invalid arguments for command: ${cmd}`, 'error');
                    this.addLine(`Usage: ${commandObj.help}`, 'info');
                    return;
                }

                commandObj.handler(args);
            } else {
                this.addLine(
                    `Command not found: ${cmd}. Type 'help' for available commands.`,
                    'error'
                );
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Terminal.executeCommand');
            this.addLine(`Error executing command: ${error.message}`, 'error');
        } finally {
            // Clear input
            this.input.value = '';
        }
    }

    /**
     * Navigate command history
     * @param {number} direction - Direction (-1 for up, 1 for down)
     */
    navigateHistory(direction) {
        const history = this.state.get('commandHistory') || [];
        if (history.length === 0) return;

        let historyIndex = this.state.get('historyIndex') || history.length;
        historyIndex += direction;

        if (historyIndex < 0) {
            historyIndex = 0;
        } else if (historyIndex >= history.length) {
            historyIndex = history.length;
            this.input.value = '';
            this.state.set('historyIndex', historyIndex);
            return;
        }

        this.input.value = history[historyIndex];
        this.state.set('historyIndex', historyIndex);
    }

    /**
     * Autocomplete command
     */
    autocomplete() {
        const input = this.input.value.trim();
        const commands = this.commandRegistry.getAllNames();
        const matches = commands.filter((cmd) => cmd.startsWith(input.toLowerCase()));

        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.addLine(`Possible completions: ${matches.join(', ')}`, 'info');
        }
    }

    /**
     * Start batch renderer untuk performance
     */
    startBatchRenderer() {
        // Clear existing interval jika ada
        if (this.batchRendererInterval) {
            clearInterval(this.batchRendererInterval);
        }
        
        this.batchRendererInterval = setInterval(() => {
            this.flushPendingLines();
        }, CONSTANTS.TERMINAL.BATCH_RENDER_INTERVAL);
    }

    /**
     * Stop batch renderer dan cleanup
     */
    stopBatchRenderer() {
        if (this.batchRendererInterval) {
            clearInterval(this.batchRendererInterval);
            this.batchRendererInterval = null;
        }
        // Flush any remaining pending lines
        this.flushPendingLines();
    }

    /**
     * Flush pending lines ke DOM
     */
    flushPendingLines() {
        if (this.pendingLines.length === 0) return;

        const fragment = document.createDocumentFragment();
        this.pendingLines.forEach((lineData) => {
            const line = this.createLineElement(lineData.text, lineData.type);
            fragment.appendChild(line);
        });

        if (this.body) {
            this.body.appendChild(fragment);
            
            // Limit terminal history untuk prevent memory leak
            this.limitTerminalHistory();
            
            this.scrollToBottom();
        }

        this.pendingLines = [];
    }

    /**
     * Limit terminal history untuk prevent memory leak
     * Remove old lines jika melebihi MAX_LINES
     */
    limitTerminalHistory() {
        if (!this.body) return;

        const maxLines = CONSTANTS.TERMINAL.MAX_LINES;
        const lines = this.body.querySelectorAll('.terminal-line');
        
        if (lines.length > maxLines) {
            // Remove oldest lines (keep last maxLines)
            const linesToRemove = lines.length - maxLines;
            for (let i = 0; i < linesToRemove; i++) {
                lines[i].remove();
            }
        }
    }

    /**
     * Create line element
     * @param {string} text - Text content
     * @param {string} type - Line type
     * @returns {HTMLElement} Line element
     */
    createLineElement(text, type = 'text') {
        const line = DOMUtils.createElement('div', { className: 'terminal-line' });

        if (type === 'prompt') {
            const span = DOMUtils.createElement('span', { className: 'terminal-prompt' });
            span.textContent = SecurityUtils.escapeHtml(text);
            line.appendChild(span);
        } else if (type === 'error') {
            const span = DOMUtils.createElement('span', {
                className: 'terminal-text',
                style: 'color: #FF6B9D;',
            });
            span.textContent = SecurityUtils.escapeHtml(text);
            line.appendChild(span);
        } else if (type === 'success') {
            const span = DOMUtils.createElement('span', {
                className: 'terminal-text',
                style: 'color: #6BCB77;',
            });
            span.textContent = SecurityUtils.escapeHtml(text);
            line.appendChild(span);
        } else if (type === 'info') {
            const span = DOMUtils.createElement('span', {
                className: 'terminal-text',
                style: 'color: #9A7BB3;',
            });
            span.textContent = SecurityUtils.escapeHtml(text);
            line.appendChild(span);
        } else {
            const span = DOMUtils.createElement('span', { className: 'terminal-text' });
            span.textContent = SecurityUtils.escapeHtml(text);
            line.appendChild(span);
        }

        return line;
    }

    /**
     * Add line to terminal (batched untuk performance)
     * @param {string} text - Text to add
     * @param {string} type - Line type (prompt, error, success, info, text)
     */
    addLine(text, type = 'text') {
        if (!this.body) return;

        // Add to pending batch
        this.pendingLines.push({ text, type });

        // Flush immediately jika terlalu banyak pending
        if (this.pendingLines.length > 10) {
            this.flushPendingLines();
        }
    }

    /**
     * Clear terminal
     */
    clear() {
        if (this.body) {
            DOMUtils.clearChildren(this.body);
        }
        // Clear pending lines juga
        this.pendingLines = [];
    }

    /**
     * Cleanup - dipanggil saat terminal di-destroy
     */
    destroy() {
        this.stopBatchRenderer();
        this.pendingLines = [];
        // Remove event listeners jika ada
        if (this.input && this.boundHandleKeyDown && this.boundHandleInput) {
            this.input.removeEventListener('keydown', this.boundHandleKeyDown);
            this.input.removeEventListener('input', this.boundHandleInput);
        }
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        if (this.body) {
            DOMUtils.scrollToBottom(this.body);
        }
    }

    /**
     * Add log entry
     * @param {string} message - Log message
     * @param {string} level - Log level
     */
    addLog(message, level = 'info') {
        const logs = this.state.get('logs') || [];
        logs.push({
            time: new Date().toISOString(),
            level: level.toUpperCase(),
            message: message,
        });
        this.state.set('logs', logs);

        // Emit event untuk update logs display
        eventBus.emit('logs:updated', logs);
    }

    /**
     * Focus input
     */
    focus() {
        if (this.input) {
            this.input.focus();
        }
    }
}

