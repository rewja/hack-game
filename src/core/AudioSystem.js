/**
 * AudioSystem - Sistem audio untuk sound effects dan music
 * Phase 5: Polish & UX
 */

import { eventBus } from './EventBus.js';

/**
 * AudioSystem class
 */
export class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7,
            musicVolume: 0.5
        };
        
        this.loadSettings();
        this.initializeSounds();
    }
    
    /**
     * Initialize sound effects (placeholder - akan di-load dari files jika ada)
     */
    initializeSounds() {
        // Sound effects akan di-load dari files jika tersedia
        // Untuk sekarang, kita buat placeholder
        this.sounds = {
            command_success: null, // new Audio('/sounds/success.mp3'),
            command_fail: null, // new Audio('/sounds/fail.mp3'),
            level_up: null, // new Audio('/sounds/levelup.mp3'),
            mission_complete: null, // new Audio('/sounds/mission_complete.mp3'),
            xp_gain: null, // new Audio('/sounds/xp_gain.mp3'),
            typing: null, // new Audio('/sounds/typing.mp3'),
            click: null // new Audio('/sounds/click.mp3')
        };
        
        this.music = {
            ambient: null, // new Audio('/music/ambient.mp3'),
            action: null // new Audio('/music/action.mp3')
        };
        
        // Setup music loop
        Object.values(this.music).forEach(track => {
            if (track) {
                track.loop = true;
            }
        });
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Error loading audio settings:', e);
            }
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    }
    
    /**
     * Play sound effect
     * @param {string} soundName - Sound name
     */
    playSound(soundName) {
        if (!this.settings.soundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            // Generate beep sound sebagai fallback
            this.playBeep(soundName);
            return;
        }
        
        try {
            sound.volume = this.settings.volume;
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.warn('Audio play failed:', e);
                this.playBeep(soundName);
            });
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }
    
    /**
     * Play beep sound sebagai fallback
     * @param {string} type - Sound type
     */
    playBeep(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies untuk different sounds
        const frequencies = {
            command_success: 800,
            command_fail: 400,
            level_up: 1000,
            mission_complete: 1200,
            xp_gain: 600,
            typing: 300,
            click: 500
        };
        
        oscillator.frequency.value = frequencies[type] || 500;
        oscillator.type = 'sine';
        gainNode.gain.value = this.settings.volume * 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    /**
     * Play background music
     * @param {string} trackName - Track name
     * @param {boolean} loop - Loop music
     */
    playMusic(trackName, loop = true) {
        if (!this.settings.musicEnabled) return;
        
        const track = this.music[trackName];
        if (!track) return;
        
        try {
            track.volume = this.settings.musicVolume;
            track.loop = loop;
            track.play().catch(e => console.warn('Music play failed:', e));
        } catch (e) {
            console.warn('Error playing music:', e);
        }
    }
    
    /**
     * Stop music
     * @param {string} trackName - Track name
     */
    stopMusic(trackName) {
        const track = this.music[trackName];
        if (track) {
            track.pause();
            track.currentTime = 0;
        }
    }
    
    /**
     * Stop all music
     */
    stopAllMusic() {
        Object.keys(this.music).forEach(trackName => {
            this.stopMusic(trackName);
        });
    }
    
    /**
     * Set sound enabled
     * @param {boolean} enabled - Enabled state
     */
    setSoundEnabled(enabled) {
        this.settings.soundEnabled = enabled;
        this.saveSettings();
    }
    
    /**
     * Set music enabled
     * @param {boolean} enabled - Enabled state
     */
    setMusicEnabled(enabled) {
        this.settings.musicEnabled = enabled;
        this.saveSettings();
        if (!enabled) {
            this.stopAllMusic();
        }
    }
    
    /**
     * Set volume
     * @param {number} volume - Volume (0.0 - 1.0)
     */
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume (0.0 - 1.0)
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        
        // Update current playing tracks
        Object.values(this.music).forEach(track => {
            if (track && !track.paused) {
                track.volume = this.settings.musicVolume;
            }
        });
    }
}

// Singleton instance
let audioSystemInstance = null;

/**
 * Get audio system instance
 * @returns {AudioSystem} Audio system instance
 */
export function getAudioSystem() {
    if (!audioSystemInstance) {
        audioSystemInstance = new AudioSystem();
    }
    return audioSystemInstance;
}

