/**
 * MissionTypes - Definisi mission types dan varieties
 * Phase 3: Content & Replayability
 */

/**
 * Mission types configuration
 */
export const MISSION_TYPES = {
    TUTORIAL: {
        name: 'Tutorial',
        description: 'Learn the basics',
        difficulty: 'easy',
        timeLimit: null,
        retryable: true,
        icon: '📚'
    },
    STORY: {
        name: 'Story Mission',
        description: 'Main storyline missions',
        difficulty: 'medium',
        timeLimit: null,
        retryable: true,
        icon: '📖'
    },
    CHALLENGE: {
        name: 'Challenge',
        description: 'Time-limited challenges',
        difficulty: 'hard',
        timeLimit: 300, // 5 minutes in seconds
        retryable: false,
        icon: '⚡'
    },
    DAILY: {
        name: 'Daily Challenge',
        description: 'Daily rotating challenges',
        difficulty: 'variable',
        timeLimit: 86400, // 24 hours in seconds
        retryable: false,
        rewards: { xp: 200, bonus: true },
        icon: '📅'
    },
    BOSS: {
        name: 'Boss Mission',
        description: 'Epic final missions',
        difficulty: 'very_hard',
        timeLimit: null,
        retryable: true,
        requires: ['level_10', 'all_story_complete'],
        icon: '👑'
    },
    RANDOM: {
        name: 'Random Event',
        description: 'Randomly generated missions',
        difficulty: 'variable',
        timeLimit: null,
        retryable: true,
        procedurallyGenerated: true,
        icon: '🎲'
    }
};

/**
 * Get mission type info
 * @param {string} type - Mission type
 * @returns {Object|null} Mission type info
 */
export function getMissionType(type) {
    return MISSION_TYPES[type] || null;
}

/**
 * Check if mission type requirements are met
 * @param {string} type - Mission type
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if requirements met
 */
export function checkMissionTypeRequirements(type, gameState) {
    const missionType = MISSION_TYPES[type];
    if (!missionType || !missionType.requires) return true;
    
    const requirements = missionType.requires;
    
    // Check level requirement
    if (requirements.includes('level_10')) {
        if ((gameState.level || 1) < 10) return false;
    }
    
    // Check story completion
    if (requirements.includes('all_story_complete')) {
        const missions = gameState.missions || [];
        const storyMissions = missions.filter(m => m.type === 'STORY');
        const allStoryComplete = storyMissions.length > 0 && 
            storyMissions.every(m => m.status === 'completed');
        if (!allStoryComplete) return false;
    }
    
    return true;
}

