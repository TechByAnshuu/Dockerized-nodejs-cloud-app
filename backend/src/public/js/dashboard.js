const API_URL = '/api/complaints';

// Check Auth
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = '/login.html';
}

// Logout logic is handled in dashboard.html inline script

// Fetch Complaints
async function fetchComplaints() {
    try {
        console.log('Fetching complaints...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            let errorMessage = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                if (errorData.message) errorMessage = errorData.message;
            } catch (e) {
                // Ignore parsing error, stick to status code
            }
            throw new Error(errorMessage);
        }

        const complaints = await res.json();
        console.log('Complaints received:', complaints);

        if (typeof window.renderComplaints === 'function') {
            window.renderComplaints(complaints);
        } else {
            renderComplaintsDefault(complaints);
        }
        return complaints;
    } catch (err) {
        console.error('Error fetching complaints:', err);
        // Try to find table body first (new layout)
        const tableBody = document.getElementById('complaints-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">
                        Error loading complaints: ${err.message}<br>
                        <span style="font-size: 0.8rem; opacity: 0.7;">Check console for details</span>
                    </td>
                </tr>
            `;
        } else {
            // Fallback for old layout
            const list = document.getElementById('complaints-list');
            if (list) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <p>Error loading complaints: ${err.message}</p>
                    </div>
                `;
            }
        }
    }
}

// Default render function (fallback)
function renderComplaintsDefault(complaints) {
    const list = document.getElementById('complaints-list');

    if (!list) {
        console.error('complaints-list element not found');
        return;
    }

    if (complaints.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No complaints found. Create your first complaint!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = complaints.map(c => {
        const imageSrc = (c.images && c.images.length > 0) ? c.images[0] : (c.imageUrl || '');
        return `
        <div class="metric-card" style="margin-bottom: 1rem;">
            ${imageSrc ? `<img src="${imageSrc}" alt="Complaint" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
                <h4 style="font-size: 1rem; margin: 0;">${c.title}</h4>
                <span style="background: ${getStatusColor(c.status)}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${c.status}</span>
            </div>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.8rem;">${c.description}</p>
            <div style="font-size: 0.75rem; opacity: 0.5; display: flex; gap: 1rem;">
                <span>📍 ${c.location}</span>
                <span>🏷️ ${c.category}</span>
                <span>📅 ${new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `}).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'Pending': return 'rgba(251, 191, 36, 0.2); color: #fbbf24';
        case 'In Progress': return 'rgba(59, 130, 246, 0.2); color: #3b82f6';
        case 'Resolved': return 'rgba(34, 197, 94, 0.2); color: #22c55e';
        default: return 'rgba(255, 255, 255, 0.1)';
    }
}

// Start fetching
console.log('Dashboard.js loaded, fetching complaints...');
fetchComplaints();

// Poll for updates every 30 seconds
// setInterval(fetchComplaints, 30000);

// Debug: Auto-fetch on load if token exists
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        console.log('Auto-fetch complaints...');
        fetchComplaints();
    }
});
// Navigation helpers: attach after DOM ready so elements exist
document.addEventListener('DOMContentLoaded', () => {
    const navComplaints = document.getElementById('nav-my-complaints');
    const navAnalytics = document.getElementById('nav-analytics');
    const tabComplaints = document.getElementById('tab-complaints');
    const tabAnalytics = document.getElementById('tab-analytics');

    navComplaints?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('nav-my-complaints clicked');
        // Toggle active class on sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        navComplaints.classList.add('active');
        // Ensure complaints are fetched and rendered, then scroll
        try {
            const complaints = await fetchComplaints();
            const el = document.getElementById('complaints-table-body');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching complaints on nav click:', err);
        }
    });

    navAnalytics?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('nav-analytics clicked');
        // Toggle active class on sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        navAnalytics.classList.add('active');
        const analyticsEl = document.getElementById('user-analytics-details');
        if (analyticsEl) analyticsEl.style.display = 'block';
        try {
            const complaints = await fetchComplaints();
            renderUserAnalytics(complaints || []);
            const el = document.getElementById('analytics-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching complaints for analytics:', err);
        }
    });

    // Bind header tab clicks as well
    tabComplaints?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('tab-complaints clicked');
        // Toggle active header
        document.querySelectorAll('.main-with-sidebar [role="tab"]')?.forEach(a => a?.classList?.remove('active'));
        tabComplaints.classList.add('active');
        try {
            const complaints = await fetchComplaints();
            const el = document.getElementById('complaints-table-body');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching complaints for header tab:', err);
        }
    });

    tabAnalytics?.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('tab-analytics clicked');
        // Toggle active header
        document.querySelectorAll('.main-with-sidebar [role="tab"]')?.forEach(a => a?.classList?.remove('active'));
        tabAnalytics.classList.add('active');
        const analyticsEl = document.getElementById('user-analytics-details');
        if (analyticsEl) analyticsEl.style.display = 'block';
        try {
            const complaints = await fetchComplaints();
            renderUserAnalytics(complaints || []);
            const el = document.getElementById('analytics-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching complaints for header analytics:', err);
        }
    });
});

// Render a simple analytics breakdown for the user's complaints
function renderUserAnalytics(complaints) {
    const container = document.getElementById('analytics-breakdown');
    if (!container) return;
    if (!complaints || complaints.length === 0) {
        container.innerHTML = '<div style="color: var(--text-gray);">No complaints to analyze.</div>';
        return;
    }

    // Category counts
    const byCategory = complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {});

    // Status counts
    const byStatus = complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});

    // Urgency average
    const avgUrgency = (complaints.reduce((s, c) => s + (Number(c.urgency) || 0), 0) / complaints.length).toFixed(2);

    // Build HTML
    const categoryHtml = Object.keys(byCategory).map(k => `<div style="padding:0.6rem 0.8rem; background:var(--bg-gray); border-radius:6px; min-width:120px;
        "><strong>${k}</strong><div style="font-size:0.9rem; color:var(--text-gray);">${byCategory[k]} complaint(s)</div></div>`).join('');

    const statusHtml = Object.keys(byStatus).map(k => `<div style="padding:0.6rem 0.8rem; background:var(--bg-gray); border-radius:6px; min-width:120px;
        "><strong>${k}</strong><div style="font-size:0.9rem; color:var(--text-gray);">${byStatus[k]}</div></div>`).join('');

    container.innerHTML = `
        <div style="display:flex; gap:1rem; flex-wrap:wrap; width:100%;">
            <div style="flex:1; min-width:200px;">
                <h5 style="margin:0 0 0.5rem 0;">By Category</h5>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">${categoryHtml}</div>
            </div>
            <div style="flex:1; min-width:200px;">
                <h5 style="margin:0 0 0.5rem 0;">By Status</h5>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">${statusHtml}</div>
            </div>
            <div style="min-width:160px;">
                <h5 style="margin:0 0 0.5rem 0;">Avg Urgency</h5>
                <div style="padding:0.6rem 0.8rem; background:var(--bg-gray); border-radius:6px; text-align:center;">
                    <strong>${avgUrgency}</strong>
                    <div style="font-size:0.85rem; color:var(--text-gray);">(0-5 scale)</div>
                </div>
            </div>
        </div>
    `;
}
