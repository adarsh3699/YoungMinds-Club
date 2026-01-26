const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { EmailMonitoringService } = require("./emailMonitoring");

// Create reusable transporter object using SMTP transport
// Create reusable transporter object using SMTP transport
const createTransporter = () => {
	const config = {
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT || 587,
		secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
		// Add timeout settings (1 minute)
		connectionTimeout: 60000,
		greetingTimeout: 30000,
		socketTimeout: 60000,
		// Enable logging for debugging
		logger: true,
		debug: true,
	};

	console.log(`Creating mail transporter: ${config.host}:${config.port} (Secure: ${config.secure})`);

	return nodemailer.createTransport(config);
};

// Helper function to check email suppression and send email
const sendEmailWithMonitoring = async ({
	userEmail,
	userName,
	emailType,
	mailOptions,
	userId = null,
	eventId = null,
	internshipId = null,
	throwOnError = true,
}) => {
	try {
		// Check if email should be suppressed
		const suppressionCheck = await EmailMonitoringService.shouldSuppressEmail(userEmail);
		if (suppressionCheck.shouldSuppress) {
			console.warn(`${emailType} email suppressed for ${userEmail}: ${suppressionCheck.reason}`);
			return { success: true, messageId: null, suppressed: true };
		}

		// Create transporter and send email
		const transporter = createTransporter();
		const info = await transporter.sendMail(mailOptions);

		console.log(`${emailType} email sent:`, info.messageId);

		// Log email for monitoring
		const contentHash = crypto
			.createHash("md5")
			.update(mailOptions.html || mailOptions.text || "")
			.digest("hex");
		await EmailMonitoringService.logEmailSent({
			messageId: info.messageId,
			emailType,
			recipientEmail: userEmail,
			recipientName: userName,
			subject: mailOptions.subject,
			userId,
			eventId,
			internshipId,
			contentHash,
			sesMessageId: info.messageId,
		});

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error(`Error sending ${emailType} email:`, error);

		if (throwOnError) {
			throw new Error(`Failed to send ${emailType} email`);
		}

		return { success: false, error: error.message };
	}
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken, isGoogleUser = false, userId = null) => {
	// Get the client URL properly - handle comma-separated URLs
	const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
	const resetURL = `${clientURL}/reset-password?token=${resetToken}`;

	const emailSubject = isGoogleUser
		? "Set Up Password - YoungMinds Club"
		: "Password Reset Request - YoungMinds Club";

	const emailTitle = isGoogleUser ? "Set Up Password" : "Password Reset Request";

	const emailMessage = isGoogleUser
		? `We received a request to set up a password for your YoungMinds Club account that was created with Google. 
		   This will allow you to log in with either Google or your email and password. 
		   If you made this request, please click the button below to create your password:`
		: `We received a request to reset your password for your YoungMinds Club account. 
		   If you made this request, please click the button below to reset your password:`;

	const buttonText = isGoogleUser ? "Create Password" : "Reset Your Password";

	const mailOptions = {
		from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
		to: userEmail,
		subject: emailSubject,
		html: `
			<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 28px;">YoungMinds Club</h1>
					<p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">${emailTitle}</p>
				</div>
				
				<div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					<h2 style="color: #333; margin-top: 0; font-size: 24px;">Hello ${userName},</h2>
					
					<p style="font-size: 16px; margin-bottom: 20px;">
						${emailMessage}
					</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetURL}" 
						   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
								  color: white; 
								  text-decoration: none; 
								  padding: 15px 30px; 
								  border-radius: 5px; 
								  display: inline-block; 
								  font-weight: bold; 
								  font-size: 16px;
								  transition: opacity 0.3s;">
							${buttonText}
						</a>
					</div>
					
					<p style="font-size: 14px; color: #666; margin-top: 30px;">
						<strong>Important:</strong> This link will expire in 10 minutes for security reasons.
					</p>
					
					<p style="font-size: 14px; color: #666;">
						If you can't click the button above, copy and paste this link into your browser:
						<br>
						<a href="${resetURL}" style="color: #667eea; word-break: break-all;">${resetURL}</a>
					</p>
					
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					
					<p style="font-size: 14px; color: #666; margin-bottom: 0;">
						<strong>Didn't request this?</strong> You can safely ignore this email. 
						Your password will remain unchanged.
					</p>
					
					<p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
						This email was sent by YoungMinds Club. Please do not reply to this email.
					</p>
				</div>
			</div>
		`,
		text: `
Hello ${userName},

${
	isGoogleUser
		? `We received a request to set up a password for your YoungMinds Club account that was created with Google. This will allow you to log in with either Google or your email and password.

To create your password, please visit this link:`
		: `We received a request to reset your password for your YoungMinds Club account.

To reset your password, please visit this link:`
}
${resetURL}

This link will expire in 10 minutes for security reasons.

${
	isGoogleUser
		? `If you didn't request to set up a password, you can safely ignore this email and continue using Google to log in.`
		: `If you didn't request this password reset, you can safely ignore this email.`
}

Best regards,
YoungMinds Club Team
		`,
	};

	return await sendEmailWithMonitoring({
		userEmail,
		userName,
		emailType: isGoogleUser ? "password_setup" : "password_reset",
		mailOptions,
		userId,
		throwOnError: true,
	});
};

// Send password change confirmation email
const sendPasswordChangeConfirmation = async (userEmail, userName, userId = null) => {
	const mailOptions = {
		from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
		to: userEmail,
		subject: "Password Changed Successfully - YoungMinds Club",
		html: `
			<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 28px;">YoungMinds Club</h1>
					<p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Password Changed</p>
				</div>
				
				<div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					<h2 style="color: #333; margin-top: 0; font-size: 24px;">Hello ${userName},</h2>
					
					<p style="font-size: 16px; margin-bottom: 20px;">
						Your password has been successfully changed for your YoungMinds Club account.
					</p>
					
					<div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
						<strong>✓ Password Updated:</strong> ${new Date().toLocaleString()}
					</div>
					
					<p style="font-size: 14px; color: #666;">
						If you did not make this change, please contact our support team immediately.
						<br>
						<a href="mailto:clubyoungminds@gmail.com">clubyoungminds@gmail.com</a>
					</p>
					
					<p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
						This email was sent by YoungMinds Club. Please do not reply to this email.
					</p>
				</div>
			</div>
		`,
		text: `
Hello ${userName},

Your password has been successfully changed for your YoungMinds Club account.

Password Updated: ${new Date().toLocaleString()}

If you did not make this change, please contact our support team immediately.

Best regards,
YoungMinds Club Team
		`,
	};

	return await sendEmailWithMonitoring({
		userEmail,
		userName,
		emailType: "password_change_confirmation",
		mailOptions,
		userId,
		throwOnError: false, // Don't throw error for confirmation emails
	});
};

// Send organizer application approval email
const sendOrganizerApprovalEmail = async (userEmail, userName) => {
	try {
		const transporter = createTransporter();

		const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
		const dashboardURL = `${clientURL}/organizer/dashboard`;

		const mailOptions = {
			from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
			to: userEmail,
			subject: "Organizer Application Approved - YoungMinds Club",
			html: `
				<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">YoungMinds Club</h1>
						<p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Application Approved!</p>
					</div>
					
					<div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
						<h2 style="color: #1f2937; margin-top: 0;">Congratulations, ${userName}!</h2>
						
						<p style="color: #4b5563; font-size: 16px; margin: 20px 0;">
							Great news! Your organizer application has been approved. You can now create and manage events and internships on YoungMinds Club.
						</p>
						
						<div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
							<h3 style="color: #059669; margin: 0 0 10px 0;">What you can do now:</h3>
							<ul style="color: #4b5563; margin: 0; padding-left: 20px;">
								<li>Create and publish events</li>
								<li>Post internship opportunities</li>
								<li>Manage attendees and applications</li>
								<li>Access organizer analytics and insights</li>
							</ul>
						</div>
						
						<div style="text-align: center; margin: 30px 0;">
							<a href="${dashboardURL}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
								Go to Organizer Dashboard
							</a>
						</div>
						
						<p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
							Welcome to the YoungMinds Club organizer community! We're excited to see the amazing events and opportunities you'll create.
						</p>
						
						<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
						
						<p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
							This email was sent by YoungMinds Club. If you have any questions, please contact our support team.
						</p>
					</div>
				</div>
			`,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Organizer approval email sent:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending organizer approval email:", error);
		return { success: false, error: error.message };
	}
};

// Send organizer application rejection email
const sendOrganizerRejectionEmail = async (userEmail, userName, rejectionReason) => {
	try {
		const transporter = createTransporter();

		const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
		const profileURL = `${clientURL}/profile`;

		const mailOptions = {
			from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
			to: userEmail,
			subject: "Organizer Application Update - YoungMinds Club",
			html: `
				<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">YoungMinds Club</h1>
						<p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Application Update</p>
					</div>
					
					<div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
						<h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
						
						<p style="color: #4b5563; font-size: 16px; margin: 20px 0;">
							Thank you for your interest in becoming an organizer with YoungMinds Club. After careful review, we're unable to approve your application at this time.
						</p>
						
						${
							rejectionReason
								? `
						<div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
							<h3 style="color: #d97706; margin: 0 0 10px 0;">Feedback:</h3>
							<p style="color: #4b5563; margin: 0;">${rejectionReason}</p>
						</div>
						`
								: ""
						}
						
						<div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
							<h3 style="color: #1d4ed8; margin: 0 0 10px 0;">What's next?</h3>
							<ul style="color: #4b5563; margin: 0; padding-left: 20px;">
								<li>You can reapply for organizer status in the future</li>
								<li>Continue participating in events as an attendee</li>
								<li>Contact our support team if you have questions</li>
								<li>Build more experience organizing events and try again</li>
							</ul>
						</div>
						
						<div style="text-align: center; margin: 30px 0;">
							<a href="${profileURL}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
								Visit Your Profile
							</a>
						</div>
						
						<p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
							We appreciate your enthusiasm for organizing events and encourage you to stay engaged with our community. There may be opportunities to apply again in the future.
						</p>
						
						<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
						
						<p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
							This email was sent by YoungMinds Club. If you have any questions, please contact our support team.
						</p>
					</div>
				</div>
			`,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Organizer rejection email sent:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending organizer rejection email:", error);
		return { success: false, error: error.message };
	}
};

// Send event registration confirmation email
const sendEventRegistrationEmail = async (userEmail, userName, eventDetails, userId = null) => {
	const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
	const eventURL = `${clientURL}/event/${eventDetails.id}`;
	const dashboardURL = `${clientURL}/user/dashboard`;

	const mailOptions = {
		from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
		to: userEmail,
		subject: `Registration Confirmed - ${eventDetails.title}`,
		html: `
			<div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2d3748; background: #ffffff;">
				<!-- Header -->
				<div style="background: #667eea; padding: 32px 24px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">YoungMinds Club</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Event Registration Confirmed</p>
				</div>
				
				<!-- Main Content -->
				<div style="background: #ffffff; padding: 32px 24px;">
					<h2 style="color: #2d3748; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Hello ${userName},</h2>
					
					<p style="color: #4a5568; font-size: 16px; margin-bottom: 24px; line-height: 1.5;">
						Thank you for registering! Your spot for <strong>${eventDetails.title}</strong> has been confirmed.
					</p>
					
					<!-- Event Details Card -->
					<div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
						<h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px; font-weight: 600;">Event Information</h3>
						
						<div style="margin-bottom: 12px;">
							<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">EVENT NAME</span>
							<span style="color: #2d3748; font-size: 16px;">${eventDetails.title}</span>
						</div>
						
						<div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
							<div style="flex: 1; min-width: 120px;">
								<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">DATE</span>
								<span style="color: #2d3748; font-size: 16px;">${eventDetails.date}</span>
							</div>
							<div style="flex: 1; min-width: 120px;">
								<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">TIME</span>
								<span style="color: #2d3748; font-size: 16px;">${eventDetails.time}</span>
							</div>
						</div>
						
						<div style="margin-top: 16px;">
							<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">LOCATION</span>
							<span style="color: #2d3748; font-size: 16px;">${eventDetails.location}</span>
						</div>
					</div>
					
					<!-- Next Steps -->
					<div style="background: #edf2f7; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0;">
						<h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">What's Next</h4>
						<ul style="margin: 0; padding-left: 16px; color: #4a5568; font-size: 14px;">
							<li style="margin-bottom: 6px;">Save this confirmation email</li>
							<li style="margin-bottom: 6px;">Add the event to your calendar</li>
							<li style="margin-bottom: 6px;">Arrive 10 minutes early</li>
							<li style="margin-bottom: 6px;">Bring a valid ID if required</li>
						</ul>
					</div>
					
					<!-- Action Buttons -->
					<div style="text-align: center; margin: 32px 0;">
						<a href="${eventURL}" 
						   style="background: #667eea; 
								  color: #ffffff; 
								  padding: 12px 24px; 
								  text-decoration: none; 
								  border-radius: 6px; 
								  font-weight: 500; 
								  font-size: 14px;
								  display: inline-block;
								  margin: 0 8px 8px 0;">
							View Event Details
						</a>
						
						<a href="${dashboardURL}" 
						   style="background: #48bb78; 
								  color: #ffffff; 
								  padding: 12px 24px; 
								  text-decoration: none; 
								  border-radius: 6px; 
								  font-weight: 500; 
								  font-size: 14px;
								  display: inline-block;
								  margin: 0 8px 8px 0;">
							My Dashboard
						</a>
					</div>
					
					<!-- XP Reward -->
					<div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 6px; padding: 16px; margin: 24px 0; text-align: center;">
						<p style="margin: 0; color: #22543d; font-size: 14px;"><strong>+10 XP earned</strong> for registering for this event!</p>
					</div>
				</div>
				
				<!-- Footer -->
				<div style="background: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
					<p style="margin: 0 0 8px 0; font-size: 14px; color: #718096;">
						Questions? Contact us at <a href="mailto:clubyoungminds@gmail.com" style="color: #667eea; text-decoration: none;">clubyoungminds@gmail.com</a>
					</p>
					<p style="margin: 0; font-size: 12px; color: #a0aec0;">
						© ${new Date().getFullYear()} YoungMinds Club. All rights reserved.
					</p>
				</div>
			</div>
		`,
		text: `
Registration Confirmed - ${eventDetails.title}

Hello ${userName},

Thank you for registering! Your spot for "${eventDetails.title}" has been confirmed.

EVENT INFORMATION:
Event: ${eventDetails.title}
Date: ${eventDetails.date}
Time: ${eventDetails.time}
Location: ${eventDetails.location}

WHAT'S NEXT:
- Save this confirmation email
- Add the event to your calendar
- Arrive 10 minutes early
- Bring a valid ID if required

+10 XP earned for registering!

View event details: ${eventURL}
Visit your dashboard: ${dashboardURL}

Questions? Contact us at clubyoungminds@gmail.com

Best regards,
YoungMinds Club Team
		`,
	};

	return await sendEmailWithMonitoring({
		userEmail,
		userName,
		emailType: "event_registration",
		mailOptions,
		userId,
		eventId: eventDetails.id,
		throwOnError: false, // Don't break event registration if email fails
	});
};

// Send internship application confirmation email
const sendInternshipApplicationEmail = async (userEmail, userName, internshipDetails, userId = null) => {
	const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
	const internshipURL = `${clientURL}/internship/${internshipDetails.id}`;
	const dashboardURL = `${clientURL}/user/dashboard`;

	const mailOptions = {
		from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
		to: userEmail,
		subject: `Application Submitted - ${internshipDetails.title} at ${internshipDetails.companyName}`,
		html: `
			<div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2d3748; background: #ffffff;">
				<!-- Header -->
				<div style="background: #3182ce; padding: 32px 24px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">YoungMinds Club</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Internship Application Submitted</p>
				</div>
				
				<!-- Main Content -->
				<div style="background: #ffffff; padding: 32px 24px;">
					<h2 style="color: #2d3748; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Hello ${userName},</h2>
					
					<p style="color: #4a5568; font-size: 16px; margin-bottom: 24px; line-height: 1.5;">
						Thank you for your application! We have received your application for <strong>${internshipDetails.title}</strong> at ${
							internshipDetails.companyName
						}.
					</p>
					
					<!-- Application Status -->
					<div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
						<p style="margin: 0; color: #234e52; font-size: 16px; font-weight: 600;">Application Status: Under Review</p>
						<p style="margin: 8px 0 0 0; color: #285e61; font-size: 14px;">We'll notify you about the next steps via email.</p>
					</div>
					
					<!-- Internship Details Card -->
					<div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
						<h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px; font-weight: 600;">Application Details</h3>
						
						<div style="margin-bottom: 12px;">
							<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">POSITION</span>
							<span style="color: #2d3748; font-size: 16px;">${internshipDetails.category}</span>
						</div>
						
						<div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
							<div style="flex: 1; min-width: 120px;">
								<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">COMPANY</span>
								<span style="color: #2d3748; font-size: 16px;">${internshipDetails.companyName}</span>
							</div>
							<div style="flex: 1; min-width: 120px;">
								<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">DURATION</span>
								<span style="color: #2d3748; font-size: 16px;">${internshipDetails.duration}</span>
							</div>
						</div>
						
						<div style="margin-top: 16px;">
							<span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">APPLICATION DEADLINE</span>
							<span style="color: #2d3748; font-size: 16px;">${internshipDetails.applicationDeadline}</span>
						</div>
					</div>
					
					<!-- Next Steps -->
					<div style="background: #edf2f7; border-left: 4px solid #3182ce; padding: 20px; margin: 24px 0;">
						<h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">What Happens Next</h4>
						<ul style="margin: 0; padding-left: 16px; color: #4a5568; font-size: 14px;">
							<li style="margin-bottom: 6px;">Our team will review your application</li>
							<li style="margin-bottom: 6px;">You'll receive updates via email</li>
							<li style="margin-bottom: 6px;">If selected, we'll contact you for next steps</li>
							<li style="margin-bottom: 6px;">Keep exploring other opportunities</li>
						</ul>
					</div>
					
					<!-- Pro Tips -->
					<div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0;">
						<h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Pro Tips While You Wait</h4>
						<ul style="margin: 0; padding-left: 16px; color: #1e3a8a; font-size: 14px;">
							<li style="margin-bottom: 6px;">Research the company and role thoroughly</li>
							<li style="margin-bottom: 6px;">Update your LinkedIn profile</li>
							<li style="margin-bottom: 6px;">Prepare for potential interviews</li>
							<li style="margin-bottom: 6px;">Continue building relevant skills</li>
						</ul>
					</div>
					
					<!-- Action Buttons -->
					<div style="text-align: center; margin: 32px 0;">
						<a href="${internshipURL}" 
						   style="background: #3182ce; 
								  color: #ffffff; 
								  padding: 12px 24px; 
								  text-decoration: none; 
								  border-radius: 6px; 
								  font-weight: 500; 
								  font-size: 14px;
								  display: inline-block;
								  margin: 0 8px 8px 0;">
							View Internship Details
						</a>
						
						<a href="${dashboardURL}" 
						   style="background: #48bb78; 
								  color: #ffffff; 
								  padding: 12px 24px; 
								  text-decoration: none; 
								  border-radius: 6px; 
								  font-weight: 500; 
								  font-size: 14px;
								  display: inline-block;
								  margin: 0 8px 8px 0;">
							My Dashboard
						</a>
					</div>
					
					<!-- XP Reward -->
					<div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 6px; padding: 16px; margin: 24px 0; text-align: center;">
						<p style="margin: 0; color: #22543d; font-size: 14px;"><strong>+15 XP earned</strong> for submitting your internship application!</p>
					</div>
				</div>
				
				<!-- Footer -->
				<div style="background: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
					<p style="margin: 0 0 8px 0; font-size: 14px; color: #718096;">
						Questions? Contact us at <a href="mailto:clubyoungminds@gmail.com" style="color: #3182ce; text-decoration: none;">clubyoungminds@gmail.com</a>
					</p>
					<p style="margin: 0; font-size: 12px; color: #a0aec0;">
						© ${new Date().getFullYear()} YoungMinds Club. All rights reserved.
					</p>
				</div>
			</div>
		`,
		text: `
Application Submitted - ${internshipDetails.title} at ${internshipDetails.companyName}

Hello ${userName},

Thank you for your application! We have received your application for "${internshipDetails.title}" at ${internshipDetails.companyName}.

APPLICATION STATUS: Under Review
We'll notify you about the next steps via email.

APPLICATION DETAILS:
Position: ${internshipDetails.title}
Company: ${internshipDetails.companyName}
Duration: ${internshipDetails.duration}
Application Deadline: ${internshipDetails.applicationDeadline}

WHAT HAPPENS NEXT:
- Our team will review your application
- You'll receive updates via email
- If selected, we'll contact you for next steps
- Keep exploring other opportunities

PRO TIPS WHILE YOU WAIT:
- Research the company and role thoroughly
- Update your LinkedIn profile
- Prepare for potential interviews
- Continue building relevant skills

+15 XP earned for submitting your application!

View internship details: ${internshipURL}
Visit your dashboard: ${dashboardURL}

Questions? Contact us at clubyoungminds@gmail.com

Best regards,
YoungMinds Club Team
		`,
	};

	return await sendEmailWithMonitoring({
		userEmail,
		userName,
		emailType: "internship_application",
		mailOptions,
		userId,
		internshipId: internshipDetails.id,
		throwOnError: false, // Don't break internship application if email fails
	});
};

// Send welcome email for new user registration
const sendWelcomeEmail = async (userEmail, userName, userId = null) => {
	const mailOptions = {
		from: `"YoungMinds Club" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
		to: userEmail,
		subject: `Welcome to YoungMinds Club, ${userName}!`,
		html: `
			<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to YoungMinds Club!</h1>
					<p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your journey to growth starts here</p>
				</div>
				
				<div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					<h2 style="color: #333; margin-top: 0; font-size: 24px;">Hello ${userName},</h2>
					
					<p style="font-size: 16px; margin-bottom: 20px;">
						Welcome to YoungMinds Club! We're thrilled to have you join our community of learners, innovators, and future leaders.
					</p>
					
					<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
						<h3 style="margin-top: 0; color: #333;">What's Next?</h3>
						<ul style="margin: 10px 0; padding-left: 20px;">
							<li style="margin-bottom: 8px;">🎯 <strong>Explore Events:</strong> Discover workshops, seminars, and networking opportunities</li>
							<li style="margin-bottom: 8px;">💼 <strong>Find Internships:</strong> Browse exciting internship opportunities from top companies</li>
							<li style="margin-bottom: 8px;">👥 <strong>Connect & Network:</strong> Meet like-minded peers and industry professionals</li>
							<li style="margin-bottom: 8px;">🏆 <strong>Earn XP & Badges:</strong> Participate in activities and showcase your achievements</li>
						</ul>
					</div>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${process.env.CLIENT_URL || "http://localhost:5173"}" 
						   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
						          color: white; 
						          padding: 15px 30px; 
						          text-decoration: none; 
						          border-radius: 25px; 
						          font-weight: bold; 
						          display: inline-block;">
							🚀 Start Exploring
						</a>
					</div>
					
					<p style="font-size: 14px; color: #666; margin-top: 30px;">
						Need help getting started? Feel free to reach out to our community team. We're here to support your journey!
					</p>
					
					<p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
						This email was sent by YoungMinds Club. Please do not reply to this email.
					</p>
				</div>
			</div>
		`,
		text: `
Welcome to YoungMinds Club, ${userName}!

We're thrilled to have you join our community of learners, innovators, and future leaders.

What's Next?
- Explore Events: Discover workshops, seminars, and networking opportunities
- Find Internships: Browse exciting internship opportunities from top companies  
- Connect & Network: Meet like-minded peers and industry professionals
- Earn XP & Badges: Participate in activities and showcase your achievements

Visit ${process.env.CLIENT_URL || "http://localhost:5173"} to start exploring!

Best regards,
YoungMinds Club Team
		`,
	};

	return await sendEmailWithMonitoring({
		userEmail,
		userName,
		emailType: "welcome_email",
		mailOptions,
		userId,
		throwOnError: false, // Don't break user registration if welcome email fails
	});
};

module.exports = {
	sendPasswordResetEmail,
	sendPasswordChangeConfirmation,
	sendOrganizerApprovalEmail,
	sendOrganizerRejectionEmail,
	sendEventRegistrationEmail,
	sendInternshipApplicationEmail,
	sendWelcomeEmail,
};
