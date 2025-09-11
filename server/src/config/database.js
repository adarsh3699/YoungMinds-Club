const mongoose = require("mongoose");

// Global variable to store the connection
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	// If we have a cached connection, use it
	if (cached.conn) {
		return cached.conn;
	}

	// If we don't have a promise, create one
	if (!cached.promise) {
		const opts = {
			// Optimized settings for serverless environment
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			family: 4, // Use IPv4, skip trying IPv6
		};

		cached.promise = mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/youngmindsclub", opts);
	}

	try {
		cached.conn = await cached.promise;
		console.log("Connected to MongoDB");
		return cached.conn;
	} catch (e) {
		cached.promise = null;
		console.error("MongoDB connection error:", e);
		throw e;
	}
}

module.exports = connectDB;
