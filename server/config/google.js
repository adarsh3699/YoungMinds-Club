const { google } = require('googleapis');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Create an OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

// Generate the Google login URL
const getGoogleAuthURL = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    });
};

// Exchange code for tokens and get user profile
const getGoogleUser = async (code) => {
    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user information
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();

        // Store refresh token if available
        if (tokens.refresh_token) {
            data.refreshToken = tokens.refresh_token;
        }

        return data;
    } catch (error) {
        console.error('Error getting Google user:', error);
        throw error;
    }
};

// Find or create user from Google data
const findOrCreateGoogleUser = async (googleUser) => {
    try {
        // Check if user already exists with googleId
        let user = await User.findOne({ googleId: googleUser.id });

        if (user) {
            // Update refresh token if available
            if (googleUser.refreshToken) {
                user.googleRefreshToken = googleUser.refreshToken;
                await user.save();
            }
            return user;
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: googleUser.email });

        if (user) {
            // Update existing user with Google data
            user.googleId = googleUser.id;
            if (googleUser.refreshToken) {
                user.googleRefreshToken = googleUser.refreshToken;
            }
            if (!user.profilePicture && googleUser.picture) {
                user.profilePicture = googleUser.picture;
            }
            await user.save();
            return user;
        }

        // Create new user
        const newUser = await User.create({
            name: googleUser.name,
            email: googleUser.email,
            googleId: googleUser.id,
            googleRefreshToken: googleUser.refreshToken || null,
            profilePicture: googleUser.picture || null,
            role: 'user' // Default role for new users
        });

        return newUser;
    } catch (error) {
        console.error('Error finding or creating Google user:', error);
        throw error;
    }
};

// Setup user authentication and return token
const setupGoogleAuth = async (code) => {
    try {
        // Get user information from Google
        const googleUser = await getGoogleUser(code);

        // Find or create user in database
        const user = await findOrCreateGoogleUser(googleUser);

        // Check if user account is suspended
        if (user.status === 'suspended') {
            const error = new Error('Your account has been suspended. Please contact support for assistance.');
            error.isSuspended = true;
            throw error;
        }

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                status: user.status
            },
            token
        };
    } catch (error) {
        console.error('Google authentication error:', error);
        throw error;
    }
};

module.exports = {
    getGoogleAuthURL,
    setupGoogleAuth
}; 