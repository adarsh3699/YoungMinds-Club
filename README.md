# YoungMinds Club

A comprehensive platform for youth engagement activities and events with role-based access control (RBAC), built using the MERN stack.

## Features

-   User registration and authentication (JWT + Google OAuth)
-   Role-based access control (User, Organizer, Admin)
-   Dashboard views for different user roles
-   Event creation and management
-   Event discovery and booking
-   Profile management with picture uploads (Cloudinary integration)

## Tech Stack

### Frontend

-   React (with Vite)
-   React Router DOM for routing
-   Tailwind CSS for styling
-   JWT Decode for token handling
-   Axios for API requests

### Backend

-   Node.js and Express.js
-   MongoDB with Mongoose
-   JWT for authentication
-   Passport.js for Google OAuth
-   Bcrypt for password hashing
-   Express Validator for request validation
-   Cloudinary for image uploads

## Project Structure

```
YoungMinds Club/
├── client/                 # Frontend - React application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # React components
│       │   ├── admin/      # Admin components
│       │   ├── auth/       # Authentication components
│       │   ├── common/     # Shared components
│       │   ├── organizer/  # Organizer components
│       │   └── user/       # User components
│       ├── context/        # Context providers (Auth)
│       ├── lib/            # Library files
│       ├── pages/          # Page components
│       │   ├── admin/      # Admin pages
│       │   ├── organizer/  # Organizer pages
│       │   └── user/       # User pages
│       ├── styles/         # CSS files
│       └── utils/          # Utility functions
│
└── server/                 # Backend - Express application
    ├── config/             # Configuration files
    ├── controllers/        # Route controllers
    ├── docs/               # Documentation
    ├── middlewares/        # Custom middlewares
    ├── models/             # Mongoose models
    ├── public/uploads/     # Uploaded files
    ├── routes/             # Express routes
    ├── services/           # Service layer
    └── utils/              # Utility functions
```

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd YoungMinds-Club
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Set up environment variables
   Create a `.env` file in the server directory with the following variables:

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
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Install frontend dependencies

```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server

```bash
cd server
npm run dev
```

2. Start the frontend development server

```bash
cd client
npm run dev
```

3. Access the application

-   Frontend: http://localhost:5173
-   Backend API: http://localhost:4000

## API Endpoints

### Authentication

-   `POST /auth/signup` - Register a new user
-   `POST /auth/login` - Login a user
-   `GET /auth/logout` - Logout a user
-   `GET /auth/me` - Get current user
-   `GET /auth/google` - Google OAuth login
-   `GET /auth/google/callback` - Google OAuth callback

### User

-   `GET /user/dashboard` - Get user dashboard data
-   `PUT /user/profile` - Update user profile

### Organizer

-   `GET /organizer/dashboard` - Get organizer dashboard data
-   `GET /organizer/events` - Get events created by the organizer
-   `POST /organizer/events` - Create a new event
-   `PUT /organizer/events/:id` - Update an event
-   `DELETE /organizer/events/:id` - Delete an event

### Admin

-   `GET /admin/users` - Get all users
-   `GET /admin/users/:id` - Get a specific user
-   `PUT /admin/users/:id/role` - Update user role
-   `DELETE /admin/users/:id` - Delete a user
-   `GET /admin/events` - Get all events
-   `PUT /admin/events/:id` - Update event status

## License

This project is licensed under the MIT License - see the LICENSE file for details.
