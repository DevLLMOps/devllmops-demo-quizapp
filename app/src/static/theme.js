// Theme management for dark/light mode switching
(function() {
    'use strict';

    // Theme constants
    const THEME_KEY = 'theme-preference';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    // Theme icons
    const THEME_ICONS = {
        [THEMES.LIGHT]: '☽', // Moon - click to go to dark mode
        [THEMES.DARK]: '☀'   // Sun - click to go to light mode
    };

    /**
     * Get the initial theme based on saved preference or system preference
     */
    function getInitialTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === THEMES.DARK || saved === THEMES.LIGHT) {
                return saved;
            }
        } catch (e) {
            // localStorage not available (private browsing, etc.)
            console.warn('localStorage not available for theme persistence');
        }
        
        // Fall back to OS preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEMES.DARK;
        }
        return THEMES.LIGHT;
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        const isDark = theme === THEMES.DARK;
        
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Update toggle button
        updateToggleButton(theme);
        
        // Save preference
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme preference to localStorage');
        }
    }

    /**
     * Update the theme toggle button appearance and aria-label
     */
    function updateToggleButton(currentTheme) {
        const toggleButton = document.getElementById('theme-toggle');
        const toggleIcon = toggleButton?.querySelector('.theme-toggle-icon');
        
        if (toggleButton && toggleIcon) {
            toggleIcon.textContent = THEME_ICONS[currentTheme];
            toggleButton.setAttribute('aria-label', 
                currentTheme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.classList.contains('dark') 
            ? THEMES.DARK 
            : THEMES.LIGHT;
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        
        applyTheme(newTheme);
    }

    /**
     * Initialize theme system
     */
    function initializeTheme() {
        // Apply initial theme immediately to prevent FOUC
        const initialTheme = getInitialTheme();
        applyTheme(initialTheme);
        
        // Wire up toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }
    }

    /**
     * Set up the theme toggle button event listener
     */
    function setupToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
            
            // Ensure button reflects current state
            const currentTheme = document.documentElement.classList.contains('dark') 
                ? THEMES.DARK 
                : THEMES.LIGHT;
            updateToggleButton(currentTheme);
        }
    }

    /**
     * Listen for system theme changes and update accordingly
     */
    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a manual preference
                try {
                    const savedTheme = localStorage.getItem(THEME_KEY);
                    if (!savedTheme) {
                        applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
                    }
                } catch (e) {
                    // localStorage not available, just ignore
                }
            });
        }
    }

    // Initialize theme system immediately
    initializeTheme();
    
    // Set up system theme listener when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSystemThemeListener);
    } else {
        setupSystemThemeListener();
    }

    // Expose theme functions globally for debugging
    window.themeSystem = {
        toggle: toggleTheme,
        set: applyTheme,
        get: () => document.documentElement.classList.contains('dark') ? THEMES.DARK : THEMES.LIGHT
    };
})();