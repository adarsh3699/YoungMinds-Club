const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT || 587,
		secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken, isGoogleUser = false) => {
	try {
		const transporter = createTransporter();

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

		const info = await transporter.sendMail(mailOptions);
		console.log("Password reset email sent:", info.messageId);

		return {
			success: true,
			messageId: info.messageId,
		};
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error("Failed to send password reset email");
	}
};

// Send password change confirmation email
const sendPasswordChangeConfirmation = async (userEmail, userName) => {
	try {
		const transporter = createTransporter();

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

		const info = await transporter.sendMail(mailOptions);
		console.log("Password change confirmation email sent:", info.messageId);

		return {
			success: true,
			messageId: info.messageId,
		};
	} catch (error) {
		console.error("Error sending password change confirmation email:", error);
		throw new Error("Failed to send password change confirmation email");
	}
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

module.exports = {
	sendPasswordResetEmail,
	sendPasswordChangeConfirmation,
	sendOrganizerApprovalEmail,
	sendOrganizerRejectionEmail,
};
