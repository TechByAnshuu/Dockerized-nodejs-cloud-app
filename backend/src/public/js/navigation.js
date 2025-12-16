// Navigation functionality for CivicSphere
// Handles profile dropdown, logout, and navigation

(function () {
    'use strict';

    // Profile Dropdown Toggle
    function initProfileDropdown() {
        const profileIcon = document.querySelector('.user-icon');
        if (!profileIcon) return;

        // Determine correct dashboard link based on user role
        let dashboardHref = 'dashboard.html';
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user && (user.role === 'admin' || user.role === 'superadmin')) {
                    dashboardHref = 'admin.html';
                }
            }
        } catch (err) {
            // ignore parse errors
        }

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <a href="${dashboardHref}" class="dropdown-item">
                <span>📊</span> Dashboard
            </a>
            <a href="#" class="dropdown-item">
                <span>👤</span> My Profile
            </a>
            <a href="#" class="dropdown-item">
                <span>⚙️</span> Settings
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="logout-link">
                <span>🚪</span> Logout
            </a>
        `;

        profileIcon.style.position = 'relative';
        profileIcon.style.cursor = 'pointer';
        profileIcon.appendChild(dropdown);

        // Toggle dropdown
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Logout handler
        const logoutLink = dropdown.querySelector('#logout-link');
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Logout Function
    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear authentication
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to landing page
            window.location.href = 'index.html';
        }
    }

    // Make Logo Clickable
    function makeLogoClickable() {
        const logos = document.querySelectorAll('img[alt*="CivicSphere"]');
        logos.forEach(logo => {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        });

        // Also make logo text clickable
        const logoTexts = document.querySelectorAll('.navbar-brand, .logo-with-text, .top-bar-title');
        logoTexts.forEach(text => {
            text.style.cursor = 'pointer';
            text.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        });
    }

    // Back Button Handler
    function initBackButton() {
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        });
    }

    // Update any Dashboard links across the page to the correct dashboard for the user role
    function updateDashboardLinks() {
        let dashboardHref = 'dashboard.html';
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user && (user.role === 'admin' || user.role === 'superadmin')) {
                    dashboardHref = 'admin.html';
                }
            }
        } catch (err) {
            // ignore
        }

        const anchors = document.querySelectorAll('a[href="dashboard.html"]');
        anchors.forEach(a => a.setAttribute('href', dashboardHref));
    }

    // Initialize all navigation features
    function init() {
        initProfileDropdown();
        updateDashboardLinks();
        makeLogoClickable();
        initBackButton();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
