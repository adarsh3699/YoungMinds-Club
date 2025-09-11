const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		xp: {
			type: Number,
			default: 0,
		},
		badge: {
			type: String,
			enum: ["Newbie", "Regular", "Champ", "Veteran", "Master"],
			default: "Newbie",
		},
		lastActivityDate: {
			type: Date,
			default: null,
		},
		streakCount: {
			type: Number,
			default: 0,
		},
		// Keep saved items for user convenience
		savedEvents: [
			{
				event: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Event",
				},
				savedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		savedInternships: [
			{
				internship: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Internship",
				},
				savedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		// XP activity history for tracking where points came from
		xpHistory: [
			{
				type: {
					type: String,
					enum: [
						"event_registration",
						"event_attendance",
						"event_feedback",
						"internship_application",
						"streak_bonus",
						"other",
					],
					required: true,
				},
				amount: {
					type: Number,
					required: true,
				},
				description: {
					type: String,
					required: true,
				},
				referenceId: {
					type: mongoose.Schema.Types.ObjectId,
					refPath: "xpHistory.referenceModel",
				},
				referenceModel: {
					type: String,
					enum: ["Event", "EventRegistration", "InternshipApplication"],
				},
				earnedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Method to add XP points with activity tracking
userActivitySchema.methods.addXP = async function (
	points,
	activityType,
	description,
	referenceId = null,
	referenceModel = null
) {
	this.xp += points;

	// Update badge based on XP thresholds
	if (this.xp >= 500) {
		this.badge = "Master";
	} else if (this.xp >= 300) {
		this.badge = "Veteran";
	} else if (this.xp >= 150) {
		this.badge = "Champ";
	} else if (this.xp >= 50) {
		this.badge = "Regular";
	} else {
		this.badge = "Newbie";
	}

	// Add to XP history
	this.xpHistory.push({
		type: activityType,
		amount: points,
		description: description,
		referenceId: referenceId,
		referenceModel: referenceModel,
		earnedAt: new Date(),
	});

	// Update last activity date
	this.lastActivityDate = new Date();

	await this.save();
	return this;
};

// Method to check and update streak
userActivitySchema.methods.updateStreak = async function (eventDate) {
	const currentDate = new Date(eventDate);
	const lastDate = this.lastActivityDate;

	// Calculate difference in days
	const diffDays = lastDate ? Math.floor((currentDate - new Date(lastDate)) / (1000 * 60 * 60 * 24)) : null;

	// Check if this is a weekend attendance
	const dayOfWeek = currentDate.getDay();
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday

	if (isWeekend) {
		// If last event was on previous weekend, increment streak
		if (diffDays <= 14 && diffDays >= 1) {
			this.streakCount += 1;

			// If streak is a multiple of 3, give bonus XP
			if (this.streakCount % 3 === 0) {
				await this.addXP(15, "streak_bonus", `Weekend streak bonus (${this.streakCount} weeks)`);
			}
		} else if (diffDays > 14) {
			// Reset streak if more than 2 weeks passed
			this.streakCount = 1;
		}

		this.lastActivityDate = currentDate;
		await this.save();
	}

	return this;
};

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
