
// ============================================================
// SafeCampusSOS - Backend + Frontend Server
// ============================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = 5000;
const JWT_SECRET =
    process.env.JWT_SECRET ||
    "development_secret_change_before_deployment";

const REPORT_FILE = path.join(__dirname, "reports.json");
const USER_FILE = path.join(__dirname, "users.json");

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// HOME PAGE - REDIRECT TO LOGIN
// This route must be registered before express.static().
// ============================================================

app.get("/", (req, res) => {
    res.redirect(302, "/login.html");
});

// ============================================================
// SERVE FRONTEND FILES
// ============================================================

app.use(express.static(__dirname));

// ============================================================
// CREATE DATA FILES IF THEY DO NOT EXIST
// ============================================================

if (!fs.existsSync(REPORT_FILE)) {
    fs.writeFileSync(REPORT_FILE, JSON.stringify([], null, 4));
}

if (!fs.existsSync(USER_FILE)) {
    fs.writeFileSync(USER_FILE, JSON.stringify([], null, 4));
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function readUsers() {
    return JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
}

function saveUsers(users) {
    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 4));
}

function readReports() {
    return JSON.parse(fs.readFileSync(REPORT_FILE, "utf8"));
}

function saveReports(reports) {
    fs.writeFileSync(REPORT_FILE, JSON.stringify(reports, null, 4));
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

function protect(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            message: "Please login first"
        });
    }

    try {
        const token = header.split(" ")[1];

        req.user = jwt.verify(token, JWT_SECRET);

        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token"
        });
    }
}

// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            status: "error",
            message: "Admin access required"
        });
    }

    next();
}

// ============================================================
// BACKEND STATUS
// ============================================================

app.get("/api/status", (req, res) => {
    res.json({
        status: "success",
        message: "SafeCampusSOS backend is connected",
        time: new Date().toLocaleString()
    });
});

// ============================================================
// STUDENT REGISTRATION
// ============================================================

app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            rollNumber,
            department
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "error",
                message: "Password must contain at least 8 characters"
            });
        }

        const users = readUsers();
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            name: name.trim(),
            email: normalizedEmail,
            rollNumber: rollNumber || "",
            department: department || "",
            password: hashedPassword,
            role: "student",
            createdAt: new Date().toISOString()
        };

        users.push(user);
        saveUsers(users);

        res.status(201).json({
            status: "success",
            message: "Registration successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                department: user.department,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            status: "error",
            message: "Unable to register user"
        });
    }
});

// ============================================================
// LOGIN
// ============================================================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        const users = readUsers();
        const normalizedEmail = email.trim().toLowerCase();

        const user = users.find(
            item => item.email === normalizedEmail
        );

        if (
            !user ||
            !(await bcrypt.compare(password, user.password))
        ) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            status: "success",
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                department: user.department,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            status: "error",
            message: "Unable to login"
        });
    }
});

// ============================================================
// GET LOGGED-IN USER
// ============================================================

app.get("/api/me", protect, (req, res) => {
    try {
        const users = readUsers();

        const user = users.find(
            item => item.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.json({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                department: user.department,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            status: "error",
            message: "Unable to get user details"
        });
    }
});

// ============================================================
// SUBMIT EMERGENCY REPORT
// ============================================================

app.post("/api/report", (req, res) => {
    try {
        const {
            type,
            description,
            location
        } = req.body;

        const report = {
            id: Date.now().toString(),
            type: type || "Unknown",
            description: description || "",
            location: location || "",
            timestamp: new Date().toISOString(),
            status: "Pending"
        };

        const reports = readReports();

        reports.push(report);
        saveReports(reports);

        io.emit("newEmergency", report);

        console.log("Emergency report received:", report.type);

        res.status(201).json({
            status: "success",
            message: "Emergency report saved successfully",
            report: report
        });
    } catch (error) {
        console.error("Report error:", error);

        res.status(500).json({
            status: "error",
            message: "Unable to save emergency report"
        });
    }
});

// ============================================================
// GET ALL REPORTS
// ============================================================

app.get("/api/reports", (req, res) => {
    try {
        res.json({
            status: "success",
            reports: readReports()
        });
    } catch (error) {
        console.error("Read reports error:", error);

        res.status(500).json({
            status: "error",
            message: "Unable to read reports"
        });
    }
});

// ============================================================
// ADMIN: UPDATE REPORT STATUS
// ============================================================

app.put(
    "/api/reports/:id/status",
    protect,
    adminOnly,
    (req, res) => {
        try {
            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "In Progress",
                "Resolved"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid report status"
                });
            }

            const reports = readReports();

            const report = reports.find(
                item => item.id === req.params.id
            );

            if (!report) {
                return res.status(404).json({
                    status: "error",
                    message: "Report not found"
                });
            }

            report.status = status;
            saveReports(reports);

            io.emit("reportUpdated", report);

            res.json({
                status: "success",
                message: "Report status updated",
                report: report
            });
        } catch (error) {
            console.error("Update report error:", error);

            res.status(500).json({
                status: "error",
                message: "Unable to update report"
            });
        }
    }
);

// ============================================================
// SOCKET.IO CONNECTION
// ============================================================

io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ============================================================
// 404 HANDLER FOR UNKNOWN API ROUTES
// ============================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        status: "error",
        message: "API endpoint not found"
    });
});

// ============================================================
// START SERVER
// ============================================================

server.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("   SafeCampusSOS Backend Started");
    console.log("======================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Login: http://localhost:${PORT}/login.html`);
    console.log(`Register: http://localhost:${PORT}/register.html`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Reports: http://localhost:${PORT}/api/reports`);
    console.log("Real-time alerts: Socket.IO enabled");
    console.log("======================================");
    console.log("");
});
