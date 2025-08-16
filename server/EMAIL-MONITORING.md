# Email Monitoring System

This document explains the comprehensive email monitoring system implemented for YoungMinds Club, which tracks email delivery rates, bounces, and complaints to ensure optimal email deliverability.

## 📊 Overview

The email monitoring system provides:

-   **Real-time email tracking** for all outbound emails
-   **Delivery rate monitoring** with detailed statistics
-   **Bounce and complaint handling** with automatic suppression
-   **Health scoring** to assess email system performance
-   **Admin dashboard** for monitoring email performance
-   **Automatic email suppression** for problematic addresses

## 🚀 Features

### ✅ Current Email Types Monitored

1. **Authentication Emails**:

    - `password_reset` - Password reset requests
    - `password_setup` - Google users setting up password
    - `password_change_confirmation` - Password change confirmations

2. **Event Emails** (Ready for implementation):

    - `event_registration` - Event registration confirmations
    - `event_reminder` - Event reminders

3. **Internship Emails** (Ready for implementation):

    - `internship_application` - Internship application confirmations
    - `internship_status_update` - Application status updates

4. **Administrative Emails**:
    - `organizer_approval` - Organizer approval notifications
    - `organizer_rejection` - Organizer rejection notifications

### 📈 Monitoring Capabilities

-   **Delivery Statistics**: Track sent, delivered, bounced, and complaint rates
-   **Email Health Score**: 0-100 score based on performance metrics
-   **Problematic Email Detection**: Identify high-risk email addresses
-   **Automatic Suppression**: Prevent emails to problematic addresses
-   **Real-time Alerts**: Get notified of delivery issues

## 🔧 Technical Implementation

### Database Schema

```javascript
// Email Log Schema
{
  messageId: String (unique),
  emailType: Enum,
  recipientEmail: String,
  recipientName: String,
  subject: String,
  status: Enum ['sent', 'delivered', 'bounced', 'complained', 'failed'],
  bounceType: Enum ['hard', 'soft', 'transient'],
  bounceReason: String,
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  internshipId: ObjectId (ref: Internship),
  contentHash: String,
  timestamps: true
}
```

### API Endpoints

#### Admin Monitoring Endpoints (Require Admin Access)

```
GET /email-monitoring/dashboard
- Get comprehensive dashboard data
- Query params: ?timeRange=30

GET /email-monitoring/stats
- Get overall delivery statistics
- Query params: ?timeRange=30&emailType=password_reset

GET /email-monitoring/stats/by-type
- Get statistics grouped by email type
- Query params: ?timeRange=30

GET /email-monitoring/problematic-emails
- Get list of problematic email addresses
- Query params: ?minAttempts=3

POST /email-monitoring/ses-webhook
- SES webhook endpoint for bounce/complaint notifications
- No authentication required (webhook)
```

### Health Scoring Algorithm

```javascript
// Health Score Calculation (0-100)
let score = 100;

// Penalize high bounce rates
if (bounceRate > 5%) score -= 30;
else if (bounceRate > 2%) score -= 15;

// Penalize complaints
if (complaintRate > 0.1%) score -= 40;
else if (complaintRate > 0%) score -= 20;

// Reward high delivery rates
if (deliveryRate < 95%) score -= 20;
else if (deliveryRate < 98%) score -= 10;
```

## 🎯 Email Suppression Logic

Emails are automatically suppressed for addresses that:

1. **Have any complaints** (marked as spam)
2. **Have 2+ hard bounces** (invalid email addresses)
3. **Have >50% bounce rate** with at least 3 attempts

### Suppression Response

When an email is suppressed:

```javascript
{
  success: true,
  messageId: null,
  suppressed: true
}
```

## 📊 Performance Benchmarks

### Excellent Performance

-   ✅ Delivery Rate: >98%
-   ✅ Bounce Rate: <2%
-   ✅ Complaint Rate: <0.1%
-   ✅ Health Score: 90-100

### Good Performance

-   🟡 Delivery Rate: 95-98%
-   🟡 Bounce Rate: 2-5%
-   🟡 Complaint Rate: 0.1-0.2%
-   🟡 Health Score: 70-89

### Poor Performance (Needs Attention)

-   ❌ Delivery Rate: <95%
-   ❌ Bounce Rate: >5%
-   ❌ Complaint Rate: >0.2%
-   ❌ Health Score: <70

## 🔔 Alert System

The system generates alerts for:

### Error Alerts (Red)

-   Bounce rate >5%
-   Complaint rate >0.1%
-   Health score <70

### Warning Alerts (Orange)

-   Bounce rate >2%
-   Any complaints received
-   Delivery rate <95%

### Info Alerts (Blue)

-   High-risk email addresses detected
-   Unusual sending patterns

## 🚀 Usage Examples

### 1. Send Event Registration Email (Future Implementation)

```javascript
const { sendEventRegistrationEmail } = require("../services/emailService");

// In your event registration controller
await sendEventRegistrationEmail(
	user.email,
	user.name,
	{
		id: event._id,
		title: event.title,
		date: event.date,
		time: event.time,
		location: event.location,
	},
	user._id
);
```

### 2. Send Internship Application Email (Future Implementation)

```javascript
const { sendInternshipApplicationEmail } = require("../services/emailService");

// In your internship application controller
await sendInternshipApplicationEmail(
	user.email,
	user.name,
	{
		id: internship._id,
		title: internship.title,
		companyName: internship.companyName,
		duration: internship.duration,
	},
	user._id
);
```

### 3. Get Email Statistics

```javascript
const { EmailMonitoringService } = require("../services/emailMonitoring");

// Get last 30 days stats
const stats = await EmailMonitoringService.getDeliveryStats(30);

// Get stats for specific email type
const passwordResetStats = await EmailMonitoringService.getDeliveryStats(30, "password_reset");

// Check if email should be suppressed
const suppressionCheck = await EmailMonitoringService.shouldSuppressEmail("user@example.com");
```

## 🔧 Amazon SES Integration

### Setting up SES Webhooks

1. **Create SNS Topic** in AWS Console
2. **Subscribe your webhook endpoint**:
    ```
    https://yourdomain.com/email-monitoring/ses-webhook
    ```
3. **Configure SES to publish to SNS**:
    - Bounces → SNS Topic
    - Complaints → SNS Topic
    - Deliveries → SNS Topic (optional)

### SES Configuration Set (Recommended)

```javascript
// Add to your email sending
const mailOptions = {
	// ... other options
	headers: {
		"X-SES-CONFIGURATION-SET": "your-configuration-set-name",
	},
};
```

## 📱 Frontend Integration (Future)

### Admin Dashboard Component

```jsx
// Example React component structure
const EmailMonitoringDashboard = () => {
	const [dashboardData, setDashboardData] = useState(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	return (
		<div>
			<HealthScoreCard score={dashboardData.healthScore} />
			<StatsOverview stats={dashboardData.overview} />
			<EmailTypeBreakdown data={dashboardData.byEmailType} />
			<ProblematicEmailsList emails={dashboardData.problematicEmails} />
			<AlertsList alerts={dashboardData.alerts} />
		</div>
	);
};
```

## 🔍 Troubleshooting

### Common Issues

1. **High Bounce Rate**:

    - Clean your email list
    - Validate email addresses before sending
    - Remove inactive subscribers

2. **Emails Going to Spam**:

    - Set up SPF, DKIM, and DMARC records
    - Use reputable sending domain
    - Monitor complaint rates

3. **Low Delivery Rate**:
    - Check email authentication
    - Review email content for spam triggers
    - Monitor sender reputation

### Debugging Commands

```bash
# Check recent email logs
db.emaillogs.find().sort({createdAt: -1}).limit(10)

# Find bounced emails
db.emaillogs.find({status: "bounced"})

# Get stats for specific email type
db.emaillogs.aggregate([
  {$match: {emailType: "password_reset"}},
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

## 🚀 Future Enhancements

### Planned Features

1. **Email Templates Management**:

    - Dynamic template system
    - A/B testing for email content
    - Template versioning

2. **Advanced Analytics**:

    - Open rate tracking (with pixel tracking)
    - Click-through rate monitoring
    - Geographic delivery analysis

3. **Automated Actions**:

    - Auto-retry failed emails
    - Intelligent send time optimization
    - Automatic list cleaning

4. **Integration Enhancements**:
    - Multiple email provider support
    - Webhook retry mechanisms
    - Real-time monitoring dashboard

## 📚 Best Practices

### Email Sending Best Practices

1. **List Hygiene**:

    - Regularly clean email lists
    - Use double opt-in for subscriptions
    - Remove bounced emails promptly

2. **Content Quality**:

    - Avoid spam trigger words
    - Include clear unsubscribe links
    - Use professional email templates

3. **Sender Reputation**:
    - Warm up new sending domains
    - Maintain consistent sending patterns
    - Monitor feedback loops

### Monitoring Best Practices

1. **Regular Review**:

    - Check dashboard weekly
    - Monitor health score trends
    - Address alerts promptly

2. **Performance Optimization**:

    - Target >98% delivery rate
    - Keep bounce rate <2%
    - Maintain zero complaints

3. **Data Retention**:
    - Archive old email logs
    - Maintain 90-day active monitoring
    - Export reports for compliance

---

This email monitoring system ensures high deliverability rates and provides comprehensive insights into your email performance, making it ready for scaling as you add more email features for events and internships.
