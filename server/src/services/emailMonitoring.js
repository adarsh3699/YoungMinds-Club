const mongoose = require("mongoose");

// Email Log Schema for tracking all email activities
const emailLogSchema = new mongoose.Schema(
	{
		messageId: {
			type: String,
			required: true,
			unique: true,
		},
		emailType: {
			type: String,
			required: true,
			enum: [
				"password_reset",
				"password_setup",
				"password_change_confirmation",
				"event_registration",
				"event_reminder",
				"internship_application",
				"internship_status_update",
				"welcome_email",
				"notification",
				"organizer_approval",
				"organizer_rejection",
			],
		},
		recipientEmail: {
			type: String,
			required: true,
		},
		recipientName: {
			type: String,
		},
		subject: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["sent", "delivered", "bounced", "complained", "failed"],
			default: "sent",
		},
		bounceType: {
			type: String,
			enum: ["hard", "soft", "transient"],
		},
		bounceReason: {
			type: String,
		},
		complaintType: {
			type: String,
		},
		deliveredAt: {
			type: Date,
		},
		bouncedAt: {
			type: Date,
		},
		complainedAt: {
			type: Date,
		},
		// Additional metadata
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
		},
		internshipId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Internship",
		},
		// Email content hash for duplicate detection
		contentHash: {
			type: String,
		},
		// SES specific data
		sesMessageId: {
			type: String,
		},
		sesConfigurationSet: {
			type: String,
		},
	},
	{
		timestamps: true,
		indexes: [
			{ recipientEmail: 1, createdAt: -1 },
			{ emailType: 1, createdAt: -1 },
			{ status: 1, createdAt: -1 },
			{ messageId: 1 },
		],
	}
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

// Email monitoring service
class EmailMonitoringService {
	// Log email send attempt
	static async logEmailSent({
		messageId,
		emailType,
		recipientEmail,
		recipientName,
		subject,
		userId = null,
		eventId = null,
		internshipId = null,
		contentHash = null,
		sesMessageId = null,
	}) {
		try {
			const emailLog = new EmailLog({
				messageId,
				emailType,
				recipientEmail,
				recipientName,
				subject,
				status: "sent",
				userId,
				eventId,
				internshipId,
				contentHash,
				sesMessageId,
			});

			await emailLog.save();
			console.log(`📧 Email logged: ${emailType} to ${recipientEmail}`);
			return emailLog;
		} catch (error) {
			console.error("Error logging email:", error);
			throw error;
		}
	}

	// Update email status (for SES webhooks/SNS notifications)
	static async updateEmailStatus(messageId, status, additionalData = {}) {
		try {
			const updateData = { status, ...additionalData };

			if (status === "delivered") {
				updateData.deliveredAt = new Date();
			} else if (status === "bounced") {
				updateData.bouncedAt = new Date();
			} else if (status === "complained") {
				updateData.complainedAt = new Date();
			}

			const emailLog = await EmailLog.findOneAndUpdate({ messageId }, updateData, { new: true });

			if (emailLog) {
				console.log(`📬 Email status updated: ${messageId} → ${status}`);
			}

			return emailLog;
		} catch (error) {
			console.error("Error updating email status:", error);
			throw error;
		}
	}

	// Get email delivery statistics
	static async getDeliveryStats(timeRange = 30, emailType = null) {
		try {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - timeRange);

			const matchQuery = {
				createdAt: { $gte: startDate },
			};

			if (emailType) {
				matchQuery.emailType = emailType;
			}

			const stats = await EmailLog.aggregate([
				{ $match: matchQuery },
				{
					$group: {
						_id: null,
						totalSent: { $sum: 1 },
						delivered: {
							$sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
						},
						bounced: {
							$sum: { $cond: [{ $eq: ["$status", "bounced"] }, 1, 0] },
						},
						complained: {
							$sum: { $cond: [{ $eq: ["$status", "complained"] }, 1, 0] },
						},
						failed: {
							$sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
						},
						hardBounces: {
							$sum: {
								$cond: [
									{
										$and: [{ $eq: ["$status", "bounced"] }, { $eq: ["$bounceType", "hard"] }],
									},
									1,
									0,
								],
							},
						},
						softBounces: {
							$sum: {
								$cond: [
									{
										$and: [{ $eq: ["$status", "bounced"] }, { $eq: ["$bounceType", "soft"] }],
									},
									1,
									0,
								],
							},
						},
					},
				},
			]);

			const result = stats[0] || {
				totalSent: 0,
				delivered: 0,
				bounced: 0,
				complained: 0,
				failed: 0,
				hardBounces: 0,
				softBounces: 0,
			};

			// Calculate rates
			const deliveryRate = result.totalSent > 0 ? (result.delivered / result.totalSent) * 100 : 0;
			const bounceRate = result.totalSent > 0 ? (result.bounced / result.totalSent) * 100 : 0;
			const complaintRate = result.totalSent > 0 ? (result.complained / result.totalSent) * 100 : 0;

			return {
				...result,
				deliveryRate: Math.round(deliveryRate * 100) / 100,
				bounceRate: Math.round(bounceRate * 100) / 100,
				complaintRate: Math.round(complaintRate * 100) / 100,
				timeRange,
				emailType,
			};
		} catch (error) {
			console.error("Error getting delivery stats:", error);
			throw error;
		}
	}

	// Get stats by email type
	static async getStatsByEmailType(timeRange = 30) {
		try {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - timeRange);

			const statsByType = await EmailLog.aggregate([
				{ $match: { createdAt: { $gte: startDate } } },
				{
					$group: {
						_id: "$emailType",
						totalSent: { $sum: 1 },
						delivered: {
							$sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
						},
						bounced: {
							$sum: { $cond: [{ $eq: ["$status", "bounced"] }, 1, 0] },
						},
						complained: {
							$sum: { $cond: [{ $eq: ["$status", "complained"] }, 1, 0] },
						},
					},
				},
				{
					$project: {
						emailType: "$_id",
						totalSent: 1,
						delivered: 1,
						bounced: 1,
						complained: 1,
						deliveryRate: {
							$round: [
								{
									$multiply: [{ $divide: ["$delivered", "$totalSent"] }, 100],
								},
								2,
							],
						},
						bounceRate: {
							$round: [
								{
									$multiply: [{ $divide: ["$bounced", "$totalSent"] }, 100],
								},
								2,
							],
						},
						complaintRate: {
							$round: [
								{
									$multiply: [{ $divide: ["$complained", "$totalSent"] }, 100],
								},
								2,
							],
						},
					},
				},
				{ $sort: { totalSent: -1 } },
			]);

			return statsByType;
		} catch (error) {
			console.error("Error getting stats by email type:", error);
			throw error;
		}
	}

	// Get problematic email addresses (high bounce/complaint rate)
	static async getProblematicEmails(minAttempts = 3) {
		try {
			const problematicEmails = await EmailLog.aggregate([
				{
					$group: {
						_id: "$recipientEmail",
						totalSent: { $sum: 1 },
						bounced: {
							$sum: { $cond: [{ $eq: ["$status", "bounced"] }, 1, 0] },
						},
						complained: {
							$sum: { $cond: [{ $eq: ["$status", "complained"] }, 1, 0] },
						},
						lastBounce: {
							$max: {
								$cond: [{ $eq: ["$status", "bounced"] }, "$bouncedAt", null],
							},
						},
						lastComplaint: {
							$max: {
								$cond: [{ $eq: ["$status", "complained"] }, "$complainedAt", null],
							},
						},
					},
				},
				{
					$match: {
						totalSent: { $gte: minAttempts },
						$or: [
							{ bounced: { $gte: 2 } }, // 2+ bounces
							{ complained: { $gte: 1 } }, // Any complaints
						],
					},
				},
				{
					$project: {
						email: "$_id",
						totalSent: 1,
						bounced: 1,
						complained: 1,
						bounceRate: {
							$round: [{ $multiply: [{ $divide: ["$bounced", "$totalSent"] }, 100] }, 2],
						},
						complaintRate: {
							$round: [{ $multiply: [{ $divide: ["$complained", "$totalSent"] }, 100] }, 2],
						},
						lastBounce: 1,
						lastComplaint: 1,
						riskLevel: {
							$cond: [
								{ $gte: ["$complained", 1] },
								"HIGH",
								{
									$cond: [{ $gte: ["$bounced", 3] }, "MEDIUM", "LOW"],
								},
							],
						},
					},
				},
				{ $sort: { riskLevel: 1, bounceRate: -1 } },
			]);

			return problematicEmails;
		} catch (error) {
			console.error("Error getting problematic emails:", error);
			throw error;
		}
	}

	// Check if email should be suppressed (too many bounces/complaints)
	static async shouldSuppressEmail(email) {
		try {
			const recentLogs = await EmailLog.find({
				recipientEmail: email,
				createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
			});

			const totalSent = recentLogs.length;
			const bounces = recentLogs.filter((log) => log.status === "bounced").length;
			const complaints = recentLogs.filter((log) => log.status === "complained").length;
			const hardBounces = recentLogs.filter(
				(log) => log.status === "bounced" && log.bounceType === "hard"
			).length;

			// Suppress if:
			// 1. Any complaints
			// 2. 2+ hard bounces
			// 3. Bounce rate > 50% with at least 3 attempts
			const shouldSuppress = complaints > 0 || hardBounces >= 2 || (totalSent >= 3 && bounces / totalSent > 0.5);

			return {
				shouldSuppress,
				reason:
					complaints > 0
						? "Complaint received"
						: hardBounces >= 2
						? "Multiple hard bounces"
						: bounces / totalSent > 0.5
						? "High bounce rate"
						: null,
				stats: { totalSent, bounces, complaints, hardBounces },
			};
		} catch (error) {
			console.error("Error checking email suppression:", error);
			return { shouldSuppress: false, reason: null };
		}
	}
}

module.exports = {
	EmailLog,
	EmailMonitoringService,
};
