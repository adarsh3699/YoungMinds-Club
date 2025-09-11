const { google } = require('googleapis');
const User = require('../models/User');

// Create and configure OAuth2 client
const createOAuth2Client = (refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return oauth2Client;
};

/**
 * Creates an event in the user's Google Calendar
 * @param {string} userId - ID of the user in our database
 * @param {Object} eventDetails - Details of the event to create
 * @returns {Promise<Object>} The created event
 */
const createCalendarEvent = async (userId, eventDetails) => {
    try {
        // Find user to get their refresh token
        const user = await User.findById(userId);

        if (!user || !user.googleRefreshToken) {
            throw new Error('User not found or has no Google refresh token');
        }

        // Create OAuth2 client with user's refresh token
        const auth = createOAuth2Client(user.googleRefreshToken);

        // Create Calendar API client
        const calendar = google.calendar({ version: 'v3', auth });

        // Create the event
        const response = await calendar.events.insert({
            calendarId: 'primary', // Use the user's primary calendar
            resource: {
                summary: eventDetails.title,
                location: eventDetails.location,
                description: eventDetails.description,
                start: {
                    dateTime: eventDetails.startTime,
                    timeZone: eventDetails.timeZone || 'UTC',
                },
                end: {
                    dateTime: eventDetails.endTime,
                    timeZone: eventDetails.timeZone || 'UTC',
                },
                attendees: eventDetails.attendees?.map(email => ({ email })),
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

/**
 * Lists upcoming events from user's Google Calendar
 * @param {string} userId - ID of the user in our database
 * @param {number} maxResults - Maximum number of events to return
 * @returns {Promise<Array>} List of upcoming events
 */
const listUpcomingEvents = async (userId, maxResults = 10) => {
    try {
        // Find user to get their refresh token
        const user = await User.findById(userId);

        if (!user || !user.googleRefreshToken) {
            throw new Error('User not found or has no Google refresh token');
        }

        // Create OAuth2 client with user's refresh token
        const auth = createOAuth2Client(user.googleRefreshToken);

        // Create Calendar API client
        const calendar = google.calendar({ version: 'v3', auth });

        // Get the current date
        const now = new Date();

        // List upcoming events
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            maxResults: maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    } catch (error) {
        console.error('Error listing calendar events:', error);
        throw error;
    }
};

module.exports = {
    createCalendarEvent,
    listUpcomingEvents
}; 