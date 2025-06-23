# YoungMinds Club Backend

This is the backend server for the YoungMinds Club platform, built with Node.js, Express, and MongoDB.

## Features

-   RESTful API architecture
-   JWT authentication with Google OAuth support
-   Role-based access control (RBAC)
-   MongoDB database with Mongoose ODM
-   Secure password handling with bcrypt
-   Image upload with Cloudinary

## Project Structure

```
server/
├── config/           # Configuration files and environment setup
├── controllers/      # Route controllers for all endpoints
├── docs/             # API documentation
├── middlewares/      # Custom middleware functions
├── models/           # Mongoose models
├── public/           # Static files
│   └── uploads/      # Uploaded files before cloud storage
├── routes/           # API route definitions
├── services/         # Business logic services
└── utils/            # Utility functions and helpers
```

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   MongoDB (local or Atlas)

### Installation

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/youngmindsclub
CLIENT_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Start the development server

```bash
npm run dev
```

## API Endpoints

### Authentication

-   `POST /auth/signup` - Register a new user
-   `POST /auth/login` - Login a user
-   `GET /auth/logout` - Logout a user
-   `GET /auth/me` - Get current user data
-   `GET /auth/google` - Google OAuth login
-   `GET /auth/google/callback` - Google OAuth callback

### Users

-   `GET /users/profile` - Get user profile
-   `PUT /users/profile` - Update user profile
-   `POST /users/profile/picture` - Upload profile picture

### Events

-   `GET /events` - Get all events
-   `GET pi/events/:id` - Get event by ID
-   `POST /events` - Create event (organizer only)
-   `PUT /events/:id` - Update event (organizer only)
-   `DELETE /events/:id` - Delete event (organizer only)

### Admin

-   `GET /admin/users` - Get all users
-   `PUT /admin/users/:id/role` - Update user role
-   `DELETE /admin/users/:id` - Delete user
-   `GET /admin/events` - Get all events with admin data
-   `PUT /admin/events/:id` - Update event status

## Available Scripts

-   `npm run start` - Start the server
-   `npm run dev` - Start the server with nodemon
-   `npm run test` - Run tests
