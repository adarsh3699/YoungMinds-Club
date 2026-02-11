# YoungMinds Club Backend

This is the backend server for the YoungMinds Club platform, built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture
- JWT authentication with Google OAuth support
- Role-based access control (RBAC)
- MongoDB database with Mongoose ODM
- Secure password handling with bcrypt
- Image upload with Cloudinary

## Project Structure

```
server/
├── index.js          # Main application entry point
├── package.json      # Dependencies and scripts
├── vercel.json       # Vercel deployment configuration
├── example.env       # Environment variables template
├── docs/             # API documentation and guides
├── src/              # Source code directory
│   ├── config/       # Configuration files (database, cloudinary, etc.)
│   ├── controllers/  # Route controllers for all endpoints
│   ├── middlewares/  # Custom middleware functions (auth, rate limiting)
│   ├── models/       # Mongoose database models
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic services (email, calendar)
│   └── utils/        # Utility functions and helpers
└── node_modules/     # Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- pnpm (recommended) or npm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository and navigate to the server directory

```bash
cd server
```

2. Install dependencies

```bash
pnpm install
# or
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=4000
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

# AWS SES Configuration (Email Service)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
SMTP_FROM=your_verified_sender_email
```

4. Start the development server

```bash
pnpm dev
# or
npm run dev
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login a user
- `GET /auth/logout` - Logout a user
- `GET /auth/me` - Get current user data
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/profile/picture` - Upload profile picture

### Events

- `GET /events` - Get all events
- `GET pi/events/:id` - Get event by ID
- `POST /events` - Create event (organizer only)
- `PUT /events/:id` - Update event (organizer only)
- `DELETE /events/:id` - Delete event (organizer only)

### Admin

- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/events` - Get all events with admin data
- `PUT /admin/events/:id` - Update event status

## Available Scripts

- `pnpm start` - Start the production server
- `pnpm dev` - Start the development server with nodemon
- `pnpm test` - Run tests

> Note: You can also use `npm run <script>` instead of `pnpm <script>`

## Deployment

### Vercel Deployment

This server is configured for easy deployment on Vercel:

1. Install Vercel CLI:

```bash
pnpm add -g vercel
# or
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel --prod
```

4. Configure environment variables in the Vercel dashboard with your production values.

### Environment Variables for Production

For production deployment, make sure to set these environment variables:

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong secret key for JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `CLOUDINARY_*` - Cloudinary configuration for image uploads
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - AWS credentials for SES
- `SMTP_FROM` - Verified sender email address
- `CORS_URL_LIST` - Comma-separated list of allowed origins
- `CLIENT_URL` - Frontend application URL

## Development

The codebase follows a clean architecture pattern:

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic
- **Models** define database schemas
- **Middlewares** handle cross-cutting concerns (auth, validation, etc.)
- **Routes** define API endpoints
- **Utils** contain helper functions
- **Config** manages application configuration

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Write meaningful commit messages
4. Test your changes locally before submitting
