
const socket = io();

// Check the server connection
socket.on("connect", () => {
    console.log("SafeCampusSOS connected successfully!");
});

socket.on("connect_error", (error) => {
    console.log("Connection error:", error.message);
});

// Listen for new emergency reports
socket.on("newEmergency", (report) => {
    console.log("New emergency:", report);

    const type = report.type || "Emergency";
    const location = report.location || "Location not provided";

    alert(
        "NEW EMERGENCY ALERT!\n\n" +
        "Type: " + type + "\n" +
        "Location: " + location
    );

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification("SafeCampusSOS Emergency Alert", {
            body: "Type: " + type + "\nLocation: " + location
        });
    }

    window.dispatchEvent(
        new CustomEvent("sosNewEmergency", {
            detail: report
        })
    );
});

// Listen for report status updates
socket.on("reportUpdated", (report) => {
    console.log("Report status updated:", report);

    window.dispatchEvent(
        new CustomEvent("sosReportUpdated", {
            detail: report
        })
    );
});

// Enable browser notifications when requested
window.enableSOSNotifications = async function () {
    if (!("Notification" in window)) {
        alert("Your browser does not support notifications.");
        return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        alert("Notifications enabled successfully!");
    } else {
        alert("Browser notifications were not enabled.");
    }
};

// Detect disconnection
socket.on("disconnect", () => {
    console.log("Disconnected from SafeCampusSOS server.");
});
