// Theme Switcher for CivicSphere
// Handles dark mode toggle and saves user preference

(function () {
    'use strict';

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Create theme toggle button
    function createThemeToggle() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        toggleButton.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';

        toggleButton.addEventListener('click', toggleTheme);
        document.body.appendChild(toggleButton);

        return toggleButton;
    }

    // Toggle theme function
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');

        const isDarkMode = document.body.classList.contains('dark-mode');
        const theme = isDarkMode ? 'dark' : 'light';

        // Save preference
        localStorage.setItem('theme', theme);

        // Update button icon
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.innerHTML = isDarkMode ? '☀️' : '🌙';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createThemeToggle);
    } else {
        createThemeToggle();
    }
})();
