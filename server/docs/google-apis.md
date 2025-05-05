# Using Google APIs in the Event Platform

This document outlines how to extend our application to use additional Google APIs beyond just authentication.

## Current Implementation

We currently use the `googleapis` library for:

-   OAuth2 authentication
-   Retrieving user profile information

## Adding Additional Google API Services

### 1. Calendar API

The Calendar API allows you to create, read, and manage calendar events. Useful for:

-   Creating event entries in users' Google Calendars
-   Syncing event schedules with users' calendars
-   Sending calendar invites to event attendees

```javascript
// Example: Creating a calendar event
const createCalendarEvent = async (auth, eventDetails) => {
	const calendar = google.calendar({ version: 'v3', auth });

	try {
		const response = await calendar.events.insert({
			calendarId: 'primary',
			resource: {
				summary: eventDetails.title,
				location: eventDetails.location,
				description: eventDetails.description,
				start: {
					dateTime: eventDetails.startTime,
					timeZone: 'UTC',
				},
				end: {
					dateTime: eventDetails.endTime,
					timeZone: 'UTC',
				},
				attendees: eventDetails.attendees,
				reminders: {
					useDefault: false,
					overrides: [
						{ method: 'email', minutes: 24 * 60 },
						{ method: 'popup', minutes: 30 },
					],
				},
			},
		});

		return response.data;
	} catch (error) {
		console.error('Error creating calendar event:', error);
		throw error;
	}
};
```

### 2. Google Drive API

The Drive API allows you to store and retrieve files. Useful for:

-   Storing event images and files
-   Sharing documents with event attendees
-   Managing event materials

```javascript
// Example: Uploading a file to Google Drive
const uploadFileToDrive = async (auth, fileMetadata, media) => {
	const drive = google.drive({ version: 'v3', auth });

	try {
		const response = await drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: 'id',
		});

		return response.data;
	} catch (error) {
		console.error('Error uploading file to Drive:', error);
		throw error;
	}
};
```

### 3. Gmail API

The Gmail API allows you to send emails. Useful for:

-   Sending event confirmations
-   Sending reminders
-   Custom email communications to attendees

```javascript
// Example: Sending an email
const sendEmail = async (auth, options) => {
	const gmail = google.gmail({ version: 'v1', auth });

	const message = [
		`From: ${options.from}`,
		`To: ${options.to}`,
		`Subject: ${options.subject}`,
		'',
		options.text,
	].join('\n');

	const encodedMessage = Buffer.from(message)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	try {
		const response = await gmail.users.messages.send({
			userId: 'me',
			resource: {
				raw: encodedMessage,
			},
		});

		return response.data;
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
};
```

## Setting Up Additional Scopes

When requesting additional API access, you'll need to add the appropriate scopes to the OAuth consent screen:

```javascript
// In server/config/google.js
const getGoogleAuthURL = () => {
	const scopes = [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email',
		// Add additional scopes as needed:
		'https://www.googleapis.com/auth/calendar',
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/gmail.send',
	];

	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: scopes,
	});
};
```

## Handling Tokens

For ongoing API access, store the refresh token:

```javascript
// In server/config/google.js
const getGoogleUser = async (code) => {
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Store refresh token in user model if needed for ongoing access
    if (tokens.refresh_token) {
      // Save refresh_token to user model
    }

    oauth2Client.setCredentials(tokens);
    // ...rest of function
  }
};
```

## Implementation Strategy

1. Add the required scope to the OAuth consent
2. Create a utility module for each Google API service
3. Store necessary tokens in the user model
4. Create controllers that use these services

## Google API Documentation

-   [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
-   [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
-   [Gmail API](https://developers.google.com/gmail/api/guides)
-   [People API](https://developers.google.com/people/api/rest)
-   [Google Maps API](https://developers.google.com/maps/documentation)
