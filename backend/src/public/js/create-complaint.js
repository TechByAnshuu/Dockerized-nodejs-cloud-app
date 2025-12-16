const API_URL = '/api/complaints';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login.html';
}

const form = document.getElementById('complaint-form');
const statusMsg = document.getElementById('status-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    // Location input was removed from UI, defaulting to "Not Specified" or empty
    const location = "Not Specified";
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('description', description);
    if (imageFile) {
        formData.append('images', imageFile);
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Don't set Content-Type header when sending FormData
        });

        if (res.ok) {
            statusMsg.textContent = 'Complaint submitted successfully!';
            statusMsg.style.color = '#4caf50';
            statusMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            const data = await res.json();
            throw new Error(data.message || 'Submission failed');
        }
    } catch (err) {
        statusMsg.textContent = err.message;
        statusMsg.style.color = '#ff4d4d';
        statusMsg.style.display = 'block';
    }
});
