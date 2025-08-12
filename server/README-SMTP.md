# SMTP Configuration for Forgot Password Feature

This document explains how to configure SMTP for the forgot password functionality in the YoungMinds Club application.

## Environment Variables

Add the following environment variables to your `.env` file in the server directory:

```env
# SMTP Configuration for Email Sending (Amazon SES)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_FROM=your-verified-email@yourdomain.com
```

## Amazon SES Setup (Recommended for Production)

### Step 1: Set Up Amazon SES

1. **Sign in to AWS Console** and navigate to Amazon SES
2. **Verify your domain or email address**:

    - Go to "Verified identities"
    - Add your domain or email address
    - Complete the verification process (DNS records for domain, or email click for email)

3. **Request Production Access** (if needed):
    - By default, SES is in sandbox mode (can only send to verified addresses)
    - Submit a request to move out of sandbox for production use

### Step 2: Create SMTP Credentials

1. **Navigate to SMTP Settings** in SES console
2. **Create SMTP Credentials**:
    - Click "Create SMTP credentials"
    - Choose a username or use the generated one
    - Download the credentials CSV file
    - **Important**: Save the SMTP username and password securely

### Step 3: Configuration

Choose the appropriate region endpoint for your SES setup:

**US East (N. Virginia) - ap-south-1**:

```env
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_FROM=your-verified-email@yourdomain.com
```

### Step 4: Important Notes for Amazon SES

-   **From Address**: Must be a verified email address or from a verified domain
-   **Sandbox Mode**: Can only send to verified email addresses
-   **Production Mode**: Can send to any email address (after approval)
-   **Rate Limits**: SES has sending rate limits (starts at 200 emails/day, 1 email/second)
-   **Bounce Handling**: Set up bounce and complaint handling for production use

## Amazon SES Additional Regions

Here are all available Amazon SES regions and their SMTP endpoints:

| Region                | Endpoint                                |
| --------------------- | --------------------------------------- |
| US East (N. Virginia) | email-smtp.us-east-1.amazonaws.com      |
| US West (Oregon)      | email-smtp.us-west-2.amazonaws.com      |
| Europe (Ireland)      | email-smtp.eu-west-1.amazonaws.com      |
| Asia Pacific (Sydney) | email-smtp.ap-southeast-2.amazonaws.com |
| Asia Pacific (Tokyo)  | email-smtp.ap-northeast-1.amazonaws.com |
| Canada (Central)      | email-smtp.ca-central-1.amazonaws.com   |
| Europe (Frankfurt)    | email-smtp.eu-central-1.amazonaws.com   |
| Europe (London)       | email-smtp.eu-west-2.amazonaws.com      |

## Alternative Email Providers (for reference)

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-gmail@gmail.com
```

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Security Considerations

1. **Never commit SMTP credentials** to version control
2. **Use app passwords** instead of regular passwords when available
3. **Enable 2FA** on your email account
4. **Use environment variables** for all sensitive configuration
5. **Consider using a dedicated email service** like SendGrid, Mailgun, or AWS SES for production

## Testing the Configuration

1. Start your server with the SMTP configuration
2. Navigate to `/forgot-password` in your application
3. Enter a valid email address
4. Check if the email is received
5. Click the reset link and test the password reset flow

## Features Included

-   **Forgot Password**: Users can request a password reset email
-   **Reset Password**: Users can reset their password using the token from email
-   **Google OAuth Integration**: Google users can create passwords for email login too
-   **Email Templates**: Professional HTML email templates with branding
-   **Security**: Tokens expire in 10 minutes for security
-   **Error Handling**: Graceful error handling for email failures
-   **Confirmation Emails**: Users receive confirmation when password is changed
-   **Dual Authentication**: Users can log in with both Google and email/password after setup

## API Endpoints

-   `POST /auth/forgot-password` - Request password reset email
-   `POST /auth/reset-password` - Reset password with token

## Frontend Routes

-   `/forgot-password` - Forgot password form
-   `/reset-password?token=xyz` - Reset password form

## Troubleshooting

### Email not sending

1. Check SMTP credentials
2. Verify network connectivity
3. Check server logs for error messages
4. Test with a simple SMTP client

### Email going to spam

1. Configure SPF records for your domain
2. Use a reputable email service
3. Avoid spam trigger words in email content
4. Set up DKIM signing if possible

### Token invalid/expired

-   Tokens expire in 10 minutes for security
-   Users need to request a new reset link if expired
-   Check server time synchronization

### Amazon SES Specific Issues

1. **Sandbox Mode Restrictions**:

    - Can only send to verified email addresses
    - Error: "Email address not verified"
    - Solution: Verify recipient emails or request production access

2. **Rate Limiting**:

    - Default: 200 emails/day, 1 email/second
    - Error: "Sending quota exceeded" or "Maximum sending rate exceeded"
    - Solution: Request limit increase or implement queuing

3. **Verification Issues**:

    - Error: "Email address not verified" for sender
    - Solution: Verify your domain or email in SES console

4. **Region Mismatch**:
    - Error: "The security token included in the request is invalid"
    - Solution: Use correct region endpoint for your SES setup

## Production Recommendations

1. **Amazon SES Best Practices**:

    - Set up dedicated IP (for high volume)
    - Configure bounce and complaint handling
    - Monitor reputation metrics
    - Set up SPF, DKIM, and DMARC records

2. **General Recommendations**:
    - Implement rate limiting for password reset requests
    - Log email sending attempts for debugging
    - Monitor email delivery rates and bounces
    - Use email templates for consistency
