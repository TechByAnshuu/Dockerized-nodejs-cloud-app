// Use API_CONFIG if available (loaded from config.js), otherwise fallback to relative URL
const API_URL = window.API_CONFIG ? window.API_CONFIG.getApiUrl("/api/auth") : "/api/auth";

/* ----------------------------------------------------
   Helper Functions
---------------------------------------------------- */
const showError = (msg) => {
    const errorDiv = document.getElementById("login-error") || document.getElementById("register-error");
    if (errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.style.display = "block";
    }
};

const showSuccess = (msg) => {
    const successDiv = document.getElementById("success-message");
    if (successDiv) {
        successDiv.textContent = msg;
        successDiv.style.display = "block";
    }
};

const saveUserSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
};

/* ----------------------------------------------------
   LOGIN HANDLER
---------------------------------------------------- */
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Invalid login credentials");
                return;
            }

            saveUserSession(data);

            // Redirect based on user role
            if (data.user.role === "admin" || data.user.role === "superadmin") {
                window.location.href = "/admin.html";
            } else if (data.user.role === "staff") {
                window.location.href = "/staff-dashboard.html";
            } else {
                window.location.href = "/dashboard.html";
            }

        } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
        }
    });
}

/* ----------------------------------------------------
   REGISTER HANDLER
---------------------------------------------------- */
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const phone = document.getElementById("phone")?.value.trim();
        const address = document.getElementById("address")?.value.trim();

        const payload = {
            name,
            email,
            password,
            phone,
            phone,
            address,
        };

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Registration failed");
                return;
            }

            saveUserSession(data);

            // Default redirect → dashboard for citizens
            window.location.href = "/dashboard.html";

        } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
        }
    });
}


