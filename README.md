# YoungMinds Club 🌟

A comprehensive platform for youth engagement activities and events with role-based access control (RBAC), built using the MERN stack. This platform enables seamless event management, user authentication, and role-based dashboards for different user types.

## ✨ Features

-   🔐 **Secure Authentication**: JWT + Google OAuth integration
-   👥 **Role-Based Access Control**: User, Organizer, and Admin roles
-   📱 **Responsive Dashboards**: Tailored views for different user roles
-   🎉 **Event Management**: Create, update, and manage events
-   🔍 **Event Discovery**: Browse and book available events
-   👤 **Profile Management**: Complete profile system with image uploads
-   ☁️ **Cloud Storage**: Cloudinary integration for image handling
-   📊 **QR Code Generation**: Event ticketing with QR codes

## 🚀 Tech Stack

### Frontend

-   **React 19** with **TypeScript** support and Vite for fast development
-   **React Router DOM 7.5** for client-side routing
-   **Tailwind CSS 4.1** for modern, responsive styling with animation support
-   **Headless UI 2.2** and **Heroicons 2.2** for accessible components
-   **Axios 1.8** for API communication
-   **JWT Decode 4.0** for token handling
-   **React Datepicker 8.4** for date selection
-   **React Dropzone 14.3** for file uploads
-   **QRCode.react 4.2** for QR code generation
-   **Date-fns 4.1** for date utilities

### Backend

-   **Node.js** with **Express.js 4.19** framework
-   **MongoDB** with **Mongoose 8.2** ODM
-   **JWT 9.0** for secure authentication
-   **Google APIs 133.0** for OAuth integration
-   **Bcrypt 5.1** for password encryption
-   **Express Validator 7.0** for request validation
-   **Cloudinary 1.41** for cloud-based image storage
-   **Multer 1.4** for file upload handling
-   **Cookie Parser 1.4** for cookie management
-   **CORS 2.8** for cross-origin resource sharing

### Development Tools

-   **TypeScript 5.8** for type-safe development
-   **ESLint 9.22** for code linting
-   **Vite 6.3** for fast build tooling
-   **Nodemon 3.1** for development server auto-restart
-   **Morgan 1.10** for HTTP request logging

## 📁 Project Structure

```
YoungMinds Club/
├── client/                 # Frontend - React + TypeScript application
│   ├── public/             # Static files
│   ├── src/                # TypeScript source files
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Shared/reusable components
│   │   │   ├── organizer/  # Organizer-specific components
│   │   │   └── user/       # User-specific components
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── organizer/  # Organizer dashboard pages
│   │   │   └── user/       # User dashboard pages
│   │   ├── styles/         # Global CSS files
│   │   └── utils/          # Utility functions
│   ├── dist/               # Production build output
│   ├── package.json        # Frontend dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite configuration
│   ├── vercel.json         # Vercel deployment config
│   └── .env                # Environment variables
│
├── server/                 # Backend - Express application
│   ├── config/             # Database and service configurations
│   ├── controllers/        # Route controllers and business logic
│   ├── docs/               # API documentation
│   ├── middlewares/        # Custom Express middlewares
│   ├── models/             # Mongoose database models
│   ├── routes/             # Express route definitions
│   ├── services/           # Business service layer
│   ├── utils/              # Utility functions and helpers
│   ├── index.js            # Server entry point
│   ├── package.json        # Backend dependencies
│   ├── vercel.json         # Vercel deployment config
│   └── .env                # Environment variables
│
├── .gitignore              # Git ignore rules
├── .prettierrc.json        # Prettier configuration
└── README.md               # Project documentation
```

## 🛠️ Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **npm** or **yarn**
-   **MongoDB** (local installation or MongoDB Atlas)
-   **Git** for version control

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd "YoungMinds Club"
    ```

2. **Install backend dependencies**

    ```bash
    cd server
    npm install
    ```

3. **Set up backend environment variables**

    Create a `.env` file in the `server` directory:

    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # Database
    MONGODB_URI=mongodb://localhost:27017/youngmindsclub

    # Frontend URL
    CLIENT_URL=http://localhost:5173

    # JWT Configuration
    JWT_SECRET=your_super_secure_jwt_secret_key_here
    JWT_EXPIRES_IN=7d

    # Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4. **Install frontend dependencies**

    ```bash
    cd ../client
    npm install
    ```

5. **Set up frontend environment variables**

    Create a `.env` file in the `client` directory:

    ```env
    VITE_API_URL=http://localhost:5000
    VITE_CLIENT_URL=http://localhost:5173
    ```

### 🚀 Running the Application

#### Development Mode

1. **Start the backend server**

    ```bash
    cd server
    npm run dev
    ```

2. **Start the frontend development server**

    ```bash
    cd client
    npm run dev
    ```

3. **Access the application**
    - **Frontend**: http://localhost:5173
    - **Backend API**: http://localhost:5000

#### Production Build

1. **Build the frontend**

    ```bash
    cd client
    npm run build
    ```

2. **Start the production server**
    ```bash
    cd server
    npm start
    ```

## 🌐 Deployment

This project is configured for deployment on **Vercel** with separate deployments for frontend and backend.

### Frontend Deployment

-   Automatically deploys from the `client` directory
-   Uses Vite build system with TypeScript support for optimized production builds
-   SPA routing handled by `vercel.json` configuration

### Backend Deployment

-   Deploys as a serverless function on Vercel
-   Uses Node.js runtime with Express.js
-   Environment variables configured in Vercel dashboard

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| `POST` | `/auth/signup`          | Register a new user       |
| `POST` | `/auth/login`           | Login with email/password |
| `GET`  | `/auth/logout`          | Logout current user       |
| `GET`  | `/auth/me`              | Get current user profile  |
| `GET`  | `/auth/google`          | Initiate Google OAuth     |
| `GET`  | `/auth/google/callback` | Google OAuth callback     |

### User Endpoints

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| `GET`  | `/user/dashboard` | Get user dashboard data  |
| `PUT`  | `/user/profile`   | Update user profile      |
| `GET`  | `/user/events`    | Get user's booked events |

### Organizer Endpoints

| Method   | Endpoint                | Description             |
| -------- | ----------------------- | ----------------------- |
| `GET`    | `/organizer/dashboard`  | Get organizer dashboard |
| `GET`    | `/organizer/events`     | Get organizer's events  |
| `POST`   | `/organizer/events`     | Create a new event      |
| `PUT`    | `/organizer/events/:id` | Update an event         |
| `DELETE` | `/organizer/events/:id` | Delete an event         |

### Admin Endpoints

| Method   | Endpoint                | Description         |
| -------- | ----------------------- | ------------------- |
| `GET`    | `/admin/users`          | Get all users       |
| `GET`    | `/admin/users/:id`      | Get specific user   |
| `PUT`    | `/admin/users/:id/role` | Update user role    |
| `DELETE` | `/admin/users/:id`      | Delete a user       |
| `GET`    | `/admin/events`         | Get all events      |
| `PUT`    | `/admin/events/:id`     | Update event status |

## 🔧 Development Scripts

### Frontend (client)

```bash
npm run dev      # Start development server with TypeScript
npm run build    # Build for production (includes type checking)
npm run preview  # Preview production build
npm run lint     # Run ESLint with TypeScript support
```

### Backend (server)

```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production server
npm test         # Run tests (placeholder)
```

## 🛠️ TypeScript Support

The frontend is built with **TypeScript** for enhanced development experience:

-   **Type Safety**: Catch errors at compile time
-   **Better IntelliSense**: Enhanced autocompletion and documentation
-   **Refactoring Support**: Safe code transformations
-   **Modern ES Features**: Latest JavaScript features with backward compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

-   Follow TypeScript best practices for frontend development
-   Use ESLint configuration for consistent code style
-   Write meaningful commit messages
-   Add proper type annotations for new components and functions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   Built with ❤️ using the MERN stack + TypeScript
-   UI components powered by Tailwind CSS and Headless UI
-   Cloud storage provided by Cloudinary
-   Deployed on Vercel platform
-   Fast development experience with Vite

---

For questions or support, please open an issue in the repository.
