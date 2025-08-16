require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const organizerRoutes = require("./routes/organizer");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");
const internshipRoutes = require("./routes/internship");
const filtersRoutes = require("./routes/filters");
const emailMonitoringRoutes = require("./routes/emailMonitoring");

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

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/eventplatform")
	.then(() => console.log("Connected to MongoDB"))
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
app.get("/leaderboard", require("./controllers/userActivityController").getLeaderboard);

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

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
