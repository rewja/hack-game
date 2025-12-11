/**
 * ProceduralMissionGenerator - Sistem untuk generate missions secara procedural
 * Phase 3: Content & Replayability
 */

/**
 * ProceduralMissionGenerator class
 */
export class ProceduralMissionGenerator {
    static MISSION_TEMPLATES = {
        easy: [
            { theme: 'password_recovery', commands: ['scan', 'bruteforce'] },
            { theme: 'file_access', commands: ['scan', 'decrypt'] },
            { theme: 'network_scan', commands: ['scan', 'ping'] }
        ],
        medium: [
            { theme: 'encryption_break', commands: ['scan', 'decrypt', 'bruteforce'] },
            { theme: 'firewall_bypass', commands: ['scan', 'exploit', 'bypass'] },
            { theme: 'data_intercept', commands: ['scan', 'intercept', 'decrypt'] }
        ],
        hard: [
            { theme: 'multi_layer_encryption', commands: ['scan', 'decrypt', 'bruteforce', 'bypass'] },
            { theme: 'secure_network_breach', commands: ['scan', 'exploit', 'bypass', 'decrypt'] },
            { theme: 'advanced_intrusion', commands: ['scan', 'intercept', 'exploit', 'bypass', 'decrypt'] }
        ]
    };
    
    static THEME_TITLES = {
        'password_recovery': ['Recover Lost Password', 'Crack User Account', 'Password Reset'],
        'file_access': ['Access Encrypted File', 'Decrypt Archive', 'Unlock Document'],
        'network_scan': ['Network Discovery', 'Scan Local Network', 'Find Targets'],
        'encryption_break': ['Break Encryption', 'Crack Security Layer', 'Decrypt System'],
        'firewall_bypass': ['Bypass Firewall', 'Penetrate Defense', 'Break Through Security'],
        'data_intercept': ['Intercept Data', 'Capture Transmission', 'Sniff Network'],
        'multi_layer_encryption': ['Multi-Layer Decryption', 'Break Complex Encryption', 'Crack Advanced Security'],
        'secure_network_breach': ['Secure Network Breach', 'Penetrate High Security', 'Break Fortress'],
        'advanced_intrusion': ['Advanced Intrusion', 'Elite Hacking Operation', 'Master Level Breach']
    };
    
    static THEME_DESCRIPTIONS = {
        'password_recovery': 'A user has forgotten their password. Help recover it using brute force techniques.',
        'file_access': 'An encrypted file needs to be accessed. Decrypt it to reveal its contents.',
        'network_scan': 'Scan the network to discover available targets and vulnerabilities.',
        'encryption_break': 'Break through encryption layers to access protected data.',
        'firewall_bypass': 'Bypass firewall protection to gain access to restricted systems.',
        'data_intercept': 'Intercept and decrypt network transmissions to extract valuable data.',
        'multi_layer_encryption': 'Break through multiple layers of encryption to access highly secured data.',
        'secure_network_breach': 'Penetrate a highly secure network with advanced security measures.',
        'advanced_intrusion': 'Execute an advanced intrusion operation requiring multiple hacking techniques.'
    };
    
    /**
     * Generate random mission
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @returns {Object} Generated mission
     */
    static generateMission(difficulty = 'medium') {
        const templates = this.MISSION_TEMPLATES[difficulty] || this.MISSION_TEMPLATES.medium;
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const theme = template.theme;
        const titles = this.THEME_TITLES[theme] || ['Generated Mission'];
        const descriptions = this.THEME_DESCRIPTIONS[theme] || ['A procedurally generated mission.'];
        
        const title = titles[Math.floor(Math.random() * titles.length)];
        const description = descriptions[0];
        
        return {
            id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            description: description,
            type: 'RANDOM',
            difficulty: difficulty,
            status: 'active',
            progress: 0,
            steps: this.generateSteps(template, difficulty),
            reward: this.calculateReward(difficulty),
            timeLimit: this.calculateTimeLimit(difficulty),
            procedurallyGenerated: true
        };
    }
    
    /**
     * Generate mission steps based on template
     * @param {Object} template - Mission template
     * @param {string} difficulty - Difficulty level
     * @returns {Array} Mission steps
     */
    static generateSteps(template, difficulty) {
        const stepCount = this.getStepCount(difficulty);
        const commands = template.commands;
        
        const stepTexts = {
            'scan': [
                'Scan the network for targets',
                'Locate network vulnerabilities',
                'Discover available systems'
            ],
            'bruteforce': [
                'Brute force the password',
                'Crack the encryption key',
                'Break through security'
            ],
            'decrypt': [
                'Decrypt the encrypted file',
                'Break the encryption layer',
                'Unlock the protected data'
            ],
            'ping': [
                'Ping the target system',
                'Test network connectivity',
                'Verify system availability'
            ],
            'exploit': [
                'Exploit system vulnerabilities',
                'Use security weaknesses',
                'Leverage system flaws'
            ],
            'bypass': [
                'Bypass security measures',
                'Circumvent protection',
                'Override security systems'
            ],
            'intercept': [
                'Intercept network traffic',
                'Capture data transmission',
                'Sniff network packets'
            ]
        };
        
        return Array.from({ length: stepCount }, (_, i) => {
            const command = commands[i % commands.length];
            const texts = stepTexts[command] || ['Complete this step'];
            const text = texts[Math.floor(Math.random() * texts.length)];
            
            return {
                id: `step_${i + 1}`,
                text: text,
                command: command,
                completed: false
            };
        });
    }
    
    /**
     * Get step count based on difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {number} Step count
     */
    static getStepCount(difficulty) {
        const counts = {
            easy: 2,
            medium: 3,
            hard: 4
        };
        return counts[difficulty] || 3;
    }
    
    /**
     * Calculate reward based on difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {string} Reward string
     */
    static calculateReward(difficulty) {
        const rewards = {
            easy: '50 XP',
            medium: '100 XP',
            hard: '150 XP'
        };
        return rewards[difficulty] || '100 XP';
    }
    
    /**
     * Calculate time limit based on difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {number|null} Time limit in seconds
     */
    static calculateTimeLimit(difficulty) {
        const limits = {
            easy: null,
            medium: 600, // 10 minutes
            hard: 300 // 5 minutes
        };
        return limits[difficulty] || null;
    }
    
    /**
     * Generate multiple missions
     * @param {number} count - Number of missions to generate
     * @param {string} difficulty - Difficulty level
     * @returns {Array} Array of generated missions
     */
    static generateMissions(count, difficulty = 'medium') {
        return Array.from({ length: count }, () => this.generateMission(difficulty));
    }
}

