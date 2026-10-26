// ============================================================
// SafeCampusSOS - API Service
// ============================================================

// Change this URL later if your real backend is deployed.
const API_URL = "http://localhost:5000/api";


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Something went wrong"
            );
        }


        return data;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        throw error;
    }
}


// ============================================================
// BACKEND STATUS
// ============================================================

export async function checkBackendStatus() {

    return await apiRequest(
        "/status"
    );
}


// ============================================================
// SEND EMERGENCY REPORT
// ============================================================

export async function sendEmergencyReport(
    type,
    description = "",
    location = ""
) {

    return await apiRequest(
        "/report",
        {
            method: "POST",

            body: JSON.stringify({

                type: type,

                description: description,

                location: location

            })
        }
    );
}


// ============================================================
// GET ALL EMERGENCY REPORTS
// ============================================================

export async function getReports() {

    return await apiRequest(
        "/reports"
    );
}


// ============================================================
// MEDICAL EMERGENCY
// ============================================================

export async function reportMedicalEmergency(
    description = "",
    location = ""
) {

    return await sendEmergencyReport(
        "Medical Emergency",
        description,
        location
    );
}


// ============================================================
// FIRE EMERGENCY
// ============================================================

export async function reportFireEmergency(
    description = "",
    location = ""
) {

    return await sendEmergencyReport(
        "Fire Emergency",
        description,
        location
    );
}


// ============================================================
// SECURITY EMERGENCY
// ============================================================

export async function reportSecurityEmergency(
    description = "",
    location = ""
) {

    return await sendEmergencyReport(
        "Security Emergency",
        description,
        location
    );
}


// ============================================================
// RAGGING / HARASSMENT
// ============================================================

export async function reportRagging(
    description = "",
    location = ""
) {

    return await sendEmergencyReport(
        "Ragging / Harassment",
        description,
        location
    );
}


// ============================================================
// LOST CARD
// ============================================================

export async function reportLostCard(
    description = "",
    location = ""
) {

    return await sendEmergencyReport(
        "Lost Card",
        description,
        location
    );
}

// ============================================================
// STUDENT REGISTRATION
// ============================================================

export async function registerStudent(
    name,
    email,
    password,
    rollNumber = "",
    department = ""
) {
    return await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password,
            rollNumber,
            department
        })
    });
}

// ============================================================
// STUDENT LOGIN
// ============================================================

export async function loginStudent(email, password) {
    const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });

    if (data.token) {
        localStorage.setItem("sosToken", data.token);
        localStorage.setItem("sosUser", JSON.stringify(data.user));
    }

    return data;
}

// ============================================================
// GET CURRENT LOGGED-IN USER
// ============================================================

export async function getCurrentUser() {
    const token = localStorage.getItem("sosToken");

    if (!token) {
        throw new Error("Please login first");
    }

    return await apiRequest("/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// ============================================================
// LOGOUT
// ============================================================

export function logoutStudent() {
    localStorage.removeItem("sosToken");
    localStorage.removeItem("sosUser");
}
