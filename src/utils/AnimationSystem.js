/**
 * AnimationSystem - Sistem untuk enhanced animations & transitions
 * Phase 5: Polish & UX
 */

/**
 * AnimationSystem class
 */
export class AnimationSystem {
    /**
     * Smooth page transitions
     * @param {HTMLElement} from - Element yang akan di-animate out
     * @param {HTMLElement} to - Element yang akan di-animate in
     * @param {string} direction - Direction ('forward' atau 'backward')
     */
    static transitionPage(from, to, direction = 'forward') {
        if (!from || !to) return;
        
        const container = from.parentElement || document.querySelector('.main-content');
        if (!container) return;
        
        // Add transition class
        container.classList.add('page-transition');
        
        // Set initial states
        from.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        to.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        to.style.opacity = '0';
        
        // Animate out
        const translateX = direction === 'forward' ? '-100%' : '100%';
        from.style.transform = `translateX(${translateX})`;
        from.style.opacity = '0';
        
        // Animate in
        setTimeout(() => {
            to.style.transform = 'translateX(0)';
            to.style.opacity = '1';
        }, 50);
        
        // Cleanup
        setTimeout(() => {
            container.classList.remove('page-transition');
            from.style.transform = '';
            from.style.opacity = '';
            from.style.transition = '';
            to.style.transform = '';
            to.style.opacity = '';
            to.style.transition = '';
        }, 300);
    }
    
    /**
     * Button press animation
     * @param {HTMLElement} button - Button element
     */
    static animateButtonPress(button) {
        if (!button) return;
        
        button.style.transition = 'transform 0.1s ease';
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            setTimeout(() => {
                button.style.transition = '';
                button.style.transform = '';
            }, 100);
        }, 100);
    }
    
    /**
     * Success celebration animation
     * @param {HTMLElement} element - Element yang akan di-animate
     */
    static celebrateSuccess(element) {
        if (!element) return;
        
        // Pulse animation
        element.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.1)', opacity: 0.9, offset: 0.5 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        // Add glow effect
        element.classList.add('success-glow');
        setTimeout(() => {
            element.classList.remove('success-glow');
        }, 2000);
    }
    
    /**
     * Fade in animation
     * @param {HTMLElement} element - Element yang akan di-animate
     * @param {number} duration - Animation duration in ms
     */
    static fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    }
    
    /**
     * Fade out animation
     * @param {HTMLElement} element - Element yang akan di-animate
     * @param {number} duration - Animation duration in ms
     */
    static fadeOut(element, duration = 300) {
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    }
    
    /**
     * Slide in from direction
     * @param {HTMLElement} element - Element yang akan di-animate
     * @param {string} direction - Direction ('left', 'right', 'top', 'bottom')
     * @param {number} duration - Animation duration in ms
     */
    static slideIn(element, direction = 'left', duration = 300) {
        if (!element) return;
        
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            top: 'translateY(-100%)',
            bottom: 'translateY(100%)'
        };
        
        element.style.transform = transforms[direction] || transforms.left;
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';
        });
        
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    }
    
    /**
     * Shake animation untuk error feedback
     * @param {HTMLElement} element - Element yang akan di-animate
     */
    static shake(element) {
        if (!element) return;
        
        element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
    }
    
    /**
     * Bounce animation
     * @param {HTMLElement} element - Element yang akan di-animate
     */
    static bounce(element) {
        if (!element) return;
        
        element.animate([
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(-20px) scale(1.1)', offset: 0.5 },
            { transform: 'translateY(0) scale(1)' }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
    }
}

