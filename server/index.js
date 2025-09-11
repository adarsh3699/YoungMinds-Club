require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

// Import routes
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");
const organizerRoutes = require("./src/routes/organizer");
const userRoutes = require("./src/routes/user");
const eventRoutes = require("./src/routes/event");
const internshipRoutes = require("./src/routes/internship");
const filtersRoutes = require("./src/routes/filters");
const emailMonitoringRoutes = require("./src/routes/emailMonitoring");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.CORS_URL_LIST?.split(",") || ["http://localhost:5173"],
		credentials: true,
	})
);
app.use(cookieParser());
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize database connection on startup
connectDB()
	.then(() => console.log("Database connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/organizer", organizerRoutes);
app.use("/user", userRoutes);
app.use("/events", eventRoutes);
app.use("/internships", internshipRoutes);
app.use("/filters", filtersRoutes);
app.use("/email-monitoring", emailMonitoringRoutes);

// Additional public routes
app.get("/leaderboard", require("./src/controllers/userActivityController").getLeaderboard);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "Internal Server Error",
		error: process.env.NODE_ENV === "development" ? err.message : null,
	});
});

// Root route
app.get("/", (req, res) => {
	res.send("Event Booking API is running");
});

// Export the app for Vercel
module.exports = app;

// Only start server if not in production (for local development)
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}
