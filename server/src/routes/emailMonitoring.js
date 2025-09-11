const express = require("express");
const emailMonitoringController = require("../controllers/emailMonitoringController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// All email monitoring routes require admin access
router.use(isAuthenticated);
router.use(authorizeRoles("admin"));

// Get email monitoring dashboard data
router.get("/dashboard", emailMonitoringController.getDashboardData);

// Get overall delivery statistics
router.get("/stats", emailMonitoringController.getDeliveryStats);

// Get statistics by email type
router.get("/stats/by-type", emailMonitoringController.getStatsByEmailType);

// Get problematic email addresses
router.get("/problematic-emails", emailMonitoringController.getProblematicEmails);

// SES webhook endpoint (no auth required for webhooks)
router.post("/ses-webhook", emailMonitoringController.handleSESNotification);

module.exports = router;
