# Event Booking Platform

A comprehensive event booking and hosting platform with role-based access control (RBAC), built using the MERN stack.

## Features

- User registration and authentication (JWT + Google OAuth)
- Role-based access control (User, Organizer, Admin)
- Dashboard views for different user roles
- Event creation and management (coming soon)
- Event discovery and booking (coming soon)

## Tech Stack

### Frontend

- React (with Vite)
- React Router DOM for routing
- Tailwind CSS for styling
- JWT Decode for token handling
- Axios for API requests

### Backend

- Node.js and Express.js
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for Google OAuth
- Bcrypt for password hashing
- Express Validator for request validation

## Project Structure

```
event-platform/
├── client/                 # Frontend - React application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # React components
│       ├── context/        # Context providers (Auth)
│       ├── assets/         # Images, fonts, etc.
│       └── App.jsx         # Main application component
│
└── server/                 # Backend - Express application
    ├── config/             # Configuration files
    ├── controllers/        # Route controllers
    ├── middlewares/        # Custom middlewares
    ├── models/             # Mongoose models
    ├── routes/             # Express routes
    ├── utils/              # Utility functions
    └── index.js            # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd event-platform
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
MONGODB_URI=mongodb://localhost:27017/eventplatform
CLIENT_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
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

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### User

- `GET /api/user/dashboard` - Get user dashboard data
- `PUT /api/user/profile` - Update user profile

### Organizer

- `GET /api/organizer/dashboard` - Get organizer dashboard data
- `GET /api/organizer/events` - Get events created by the organizer

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a specific user
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete a user

## License

This project is licensed under the MIT License - see the LICENSE file for details.
