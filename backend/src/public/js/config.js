/**
 * API Configuration
 * 
 * This configuration detects the deployment environment and sets the correct
 * backend URL for API calls.
 * 
 * - Production frontend (dockerized-nodejs-cloud-app.onrender.com): Points to backend domain
 * - Local development or backend pages: Uses relative URLs
 */

const API_CONFIG = {
    // Backend URL - automatically detected based on hostname
    BACKEND_URL: window.location.hostname.includes('dockerized-nodejs-cloud-app.onrender.com')
        ? 'https://civicsphere-backend.onrender.com'
        : '',

    /**
     * Get the full API URL for a given path
     * @param {string} path - API path (e.g., '/api/auth/login')
     * @returns {string} - Full URL
     */
    getApiUrl: function (path) {
        return this.BACKEND_URL + path;
    }
};

// Export for use in other scripts
window.API_CONFIG = API_CONFIG;
