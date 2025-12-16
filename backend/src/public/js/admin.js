const API_URL = '/api/admin';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Check Auth & Admin Role
if (!token || !user || user.role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.href = '/login.html';
}

if (user) {
    document.getElementById('admin-name').textContent = user.name;
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
});

let allComplaints = [];

// Fetch Analytics
async function fetchAnalytics() {
    try {
        const res = await fetch(`${API_URL}/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        renderAnalytics(data);
    } catch (err) {
        console.error(err);
    }
}

function renderAnalytics(data) {
    const statsGrid = document.getElementById('stats-grid');
    // Normalize byStatus to a map whether it's returned as an array or object
    const byStatusRaw = data.byStatus || {};
    const statusMap = Array.isArray(byStatusRaw)
        ? byStatusRaw.reduce((acc, s) => (acc[s._id] = s.count, acc), {})
        : byStatusRaw;

    statsGrid.innerHTML = `
        <div class="glass-panel stat-card">
            <h3>${data.total || 0}</h3>
            <p>Total Complaints</p>
        </div>
        <div class="glass-panel stat-card">
            <h3>${statusMap['Pending'] || 0}</h3>
            <p>Pending</p>
        </div>
        <div class="glass-panel stat-card">
            <h3>${statusMap['In Progress'] || 0}</h3>
            <p>In Progress</p>
        </div>
        <div class="glass-panel stat-card">
            <h3>${statusMap['Resolved'] || 0}</h3>
            <p>Resolved</p>
        </div>
    `;
}

// Fetch All Complaints
async function fetchComplaints() {
    try {
        const res = await fetch(`${API_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // API returns an object { count, complaints, ... } — normalize to complaints array
        allComplaints = Array.isArray(data) ? data : (data.complaints || []);
        renderComplaints(allComplaints);
    } catch (err) {
        console.error(err);
        document.getElementById('complaints-tbody').innerHTML = '<tr><td colspan="6">Error loading complaints.</td></tr>';
    }
}

function renderComplaints(complaints) {
    const tbody = document.getElementById('complaints-tbody');

    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No complaints found.</td></tr>';
        return;
    }

    tbody.innerHTML = complaints.map(c => `
        <tr>
            <td><strong>${c.title}</strong><br><small style="opacity: 0.7;">${c.description.substring(0, 50)}...</small></td>
            <td>${c.user?.name || 'Unknown'}</td>
            <td>${c.category}</td>
            <td><span class="badge badge-${getStatusClass(c.status)}">${c.status}</span></td>
            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
            <td>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <select class="filter-select btn-sm" onchange="updateStatus('${c._id}', this.value)" style="width: auto;">
                        <option value="">Change Status</option>
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button onclick="deleteComplaint('${c._id}')" class="btn-sm" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending': return 'pending';
        case 'In Progress': return 'progress';
        case 'Resolved': return 'resolved';
        default: return 'pending';
    }
}

// Delete Complaint
async function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;

    try {
        const res = await fetch(`${API_URL}/complaints/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Complaint deleted successfully');
            fetchComplaints(); // Refresh
            fetchAnalytics(); // Refresh stats
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to delete complaint');
        }
    } catch (err) {
        console.error(err);
        alert('Error deleting complaint');
    }
}

// Update Status
async function updateStatus(id, status) {
    if (!status) return;

    try {
        const res = await fetch(`${API_URL}/complaints/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            fetchComplaints(); // Refresh
            fetchAnalytics(); // Refresh stats
        } else {
            alert('Failed to update status');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating status');
    }
}

// Filters
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);

function applyFilters() {
    const category = document.getElementById('filter-category').value;
    const status = document.getElementById('filter-status').value;

    let filtered = allComplaints;

    if (category) {
        filtered = filtered.filter(c => c.category === category);
    }

    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }

    renderComplaints(filtered);
}

// Initialize
fetchAnalytics();
fetchComplaints();
