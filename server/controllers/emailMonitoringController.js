const { EmailMonitoringService } = require("../services/emailMonitoring");

// Get overall email delivery statistics
exports.getDeliveryStats = async (req, res) => {
	try {
		const { timeRange = 30, emailType } = req.query;

		const stats = await EmailMonitoringService.getDeliveryStats(parseInt(timeRange), emailType || null);

		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error getting delivery stats:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get delivery statistics",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get statistics by email type
exports.getStatsByEmailType = async (req, res) => {
	try {
		const { timeRange = 30 } = req.query;

		const stats = await EmailMonitoringService.getStatsByEmailType(parseInt(timeRange));

		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error getting stats by email type:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get email type statistics",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get problematic email addresses
exports.getProblematicEmails = async (req, res) => {
	try {
		const { minAttempts = 3 } = req.query;

		const problematicEmails = await EmailMonitoringService.getProblematicEmails(parseInt(minAttempts));

		res.status(200).json({
			success: true,
			data: problematicEmails,
		});
	} catch (error) {
		console.error("Error getting problematic emails:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get problematic emails",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Handle SES bounce/complaint notifications (webhook endpoint)
exports.handleSESNotification = async (req, res) => {
	try {
		const notification = req.body;

		// Handle SNS message confirmation
		if (notification.Type === "SubscriptionConfirmation") {
			// In production, you might want to automatically confirm the subscription
			console.log("SNS Subscription confirmation:", notification.SubscribeURL);
			return res.status(200).json({ message: "Subscription confirmation received" });
		}

		// Handle bounce/complaint notifications
		if (notification.Type === "Notification") {
			const message = JSON.parse(notification.Message);

			if (message.notificationType === "Bounce") {
				await handleBounce(message);
			} else if (message.notificationType === "Complaint") {
				await handleComplaint(message);
			} else if (message.notificationType === "Delivery") {
				await handleDelivery(message);
			}
		}

		res.status(200).json({ message: "Notification processed" });
	} catch (error) {
		console.error("Error handling SES notification:", error);
		res.status(500).json({
			success: false,
			message: "Failed to process SES notification",
		});
	}
};

// Helper function to handle bounce notifications
async function handleBounce(message) {
	try {
		const { mail, bounce } = message;

		for (const bouncedRecipient of bounce.bouncedRecipients) {
			await EmailMonitoringService.updateEmailStatus(mail.messageId, "bounced", {
				bounceType: bounce.bounceType.toLowerCase(), // hard, soft, transient
				bounceReason: bouncedRecipient.diagnosticCode || bounce.bounceSubType,
			});

			console.log(`📧 Bounce recorded: ${bouncedRecipient.emailAddress} (${bounce.bounceType})`);
		}
	} catch (error) {
		console.error("Error handling bounce:", error);
	}
}

// Helper function to handle complaint notifications
async function handleComplaint(message) {
	try {
		const { mail, complaint } = message;

		for (const complainedRecipient of complaint.complainedRecipients) {
			await EmailMonitoringService.updateEmailStatus(mail.messageId, "complained", {
				complaintType: complaint.complaintFeedbackType || "unknown",
			});

			console.log(`📧 Complaint recorded: ${complainedRecipient.emailAddress}`);
		}
	} catch (error) {
		console.error("Error handling complaint:", error);
	}
}

// Helper function to handle delivery notifications
async function handleDelivery(message) {
	try {
		const { mail } = message;

		await EmailMonitoringService.updateEmailStatus(mail.messageId, "delivered");
		console.log(`📧 Delivery confirmed: ${mail.messageId}`);
	} catch (error) {
		console.error("Error handling delivery:", error);
	}
}

// Get email monitoring dashboard data
exports.getDashboardData = async (req, res) => {
	try {
		const { timeRange = 30 } = req.query;
		const timeRangeInt = parseInt(timeRange);

		// Get parallel data
		const [overallStats, statsByType, problematicEmails] = await Promise.all([
			EmailMonitoringService.getDeliveryStats(timeRangeInt),
			EmailMonitoringService.getStatsByEmailType(timeRangeInt),
			EmailMonitoringService.getProblematicEmails(3),
		]);

		// Calculate health score (0-100)
		const healthScore = calculateHealthScore(overallStats);

		// Get alerts
		const alerts = generateAlerts(overallStats, problematicEmails);

		res.status(200).json({
			success: true,
			data: {
				overview: overallStats,
				byEmailType: statsByType,
				problematicEmails: problematicEmails.slice(0, 10), // Top 10 problematic
				healthScore,
				alerts,
				timeRange: timeRangeInt,
			},
		});
	} catch (error) {
		console.error("Error getting dashboard data:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get dashboard data",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Calculate email health score (0-100)
function calculateHealthScore(stats) {
	if (stats.totalSent === 0) return 100;

	let score = 100;

	// Penalize high bounce rates
	if (stats.bounceRate > 5) score -= 30;
	else if (stats.bounceRate > 2) score -= 15;

	// Penalize any complaints
	if (stats.complaintRate > 0.1) score -= 40;
	else if (stats.complaintRate > 0) score -= 20;

	// Reward high delivery rates
	if (stats.deliveryRate < 95) score -= 20;
	else if (stats.deliveryRate < 98) score -= 10;

	return Math.max(0, Math.min(100, score));
}

// Generate alerts based on email performance
function generateAlerts(stats, problematicEmails) {
	const alerts = [];

	// High bounce rate alert
	if (stats.bounceRate > 5) {
		alerts.push({
			type: "error",
			title: "High Bounce Rate",
			message: `Bounce rate is ${stats.bounceRate}%. Recommended: <2%`,
			action: "Review email list quality and remove invalid addresses",
		});
	} else if (stats.bounceRate > 2) {
		alerts.push({
			type: "warning",
			title: "Elevated Bounce Rate",
			message: `Bounce rate is ${stats.bounceRate}%. Monitor closely.`,
			action: "Consider email list cleanup",
		});
	}

	// Complaint rate alert
	if (stats.complaintRate > 0.1) {
		alerts.push({
			type: "error",
			title: "High Complaint Rate",
			message: `Complaint rate is ${stats.complaintRate}%. This can hurt deliverability.`,
			action: "Review email content and sending practices",
		});
	} else if (stats.complaintRate > 0) {
		alerts.push({
			type: "warning",
			title: "Complaints Received",
			message: `${stats.complained} complaint(s) received.`,
			action: "Monitor complaint patterns",
		});
	}

	// Low delivery rate alert
	if (stats.deliveryRate < 95) {
		alerts.push({
			type: "warning",
			title: "Low Delivery Rate",
			message: `Delivery rate is ${stats.deliveryRate}%. Target: >95%`,
			action: "Check email authentication and content",
		});
	}

	// Problematic emails alert
	const highRiskEmails = problematicEmails.filter((email) => email.riskLevel === "HIGH");
	if (highRiskEmails.length > 0) {
		alerts.push({
			type: "info",
			title: "High-Risk Email Addresses",
			message: `${highRiskEmails.length} email address(es) with complaints or multiple bounces`,
			action: "Consider suppressing these addresses",
		});
	}

	return alerts;
}
