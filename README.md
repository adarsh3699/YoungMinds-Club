# YoungMinds Club 🌟

A comprehensive platform for youth engagement, event management, and career opportunities with advanced role-based access control (RBAC), built using the modern MERN stack with TypeScript.

## ✨ Key Features

### 🔐 **Authentication & Security**

-   **JWT Authentication** with secure token handling
-   **Google OAuth Integration** for seamless social login
-   **Role-Based Access Control** (User, Organizer, Admin)
-   **Password Reset** with email verification
-   **Account Security** with bcrypt encryption

### 🎉 **Event Management System**

-   **Complete Event Lifecycle** - Create, update, manage, and track events
-   **Event Discovery** with smart filtering and search
-   **QR Code Generation** for event tickets and check-ins
-   **Registration Management** with capacity tracking
-   **Event Analytics** with detailed performance metrics
-   **Featured Events** system for promoting key events

### 💼 **Internship Management Platform**

-   **Full Internship Lifecycle** - Post, manage, and track internships
-   **Application System** with status tracking
-   **Compensation Management** (Paid/Unpaid with currency support)
-   **Location Types** - Remote, On-site, Hybrid
-   **Skills & Requirements** matching
-   **Application Analytics** with daily tracking
-   **Third-party Integration** support

### 👤 **Advanced User Profiles**

-   **XP (Experience Points) System** with activity tracking
-   **Badge Collection** - Newbie, Regular, Champ, Veteran, Master
-   **Streak Tracking** for consistent engagement
-   **Profile Customization** with image uploads
-   **Organizer Application System** with approval workflow
-   **Activity History** and achievement tracking

### 🛡️ **Admin Dashboard & Analytics**

-   **Comprehensive User Management** with role modifications
-   **Content Moderation** with flagging system
-   **Real-time Analytics** and performance metrics
-   **System-wide Announcements** management
-   **Email Monitoring Dashboard** with deliverability tracking
-   **Advanced Filtering** and search capabilities

### 📧 **Professional Email System**

-   **Automated Email Notifications** for all user actions
-   **Email Monitoring & Analytics** with delivery tracking
-   **Bounce & Complaint Handling** with automatic suppression
-   **Professional HTML Templates** with responsive design
-   **Rate Limiting** to prevent spam
-   **Email Health Scoring** (0-100 performance metrics)

### 🎨 **Modern UI/UX**

-   **Responsive Design** optimized for all devices
-   **Dark/Light Theme** support
-   **Smooth Animations** with CSS transitions
-   **Accessible Components** using Headless UI
-   **Interactive Elements** with Heroicons
-   **Professional Styling** with Tailwind CSS

## 🚀 Technology Stack

### Frontend (React + TypeScript)

-   **React 19** - Latest React with concurrent features
-   **TypeScript 5.8** - Full type safety and better DX
-   **Vite 6.3** - Lightning-fast build tool and dev server
-   **React Router DOM 7.5** - Client-side routing
-   **Tailwind CSS 4.1** - Utility-first CSS framework
-   **Headless UI 2.2** - Unstyled, accessible UI components
-   **Heroicons 2.2** - Beautiful hand-crafted SVG icons

### Backend (Node.js + Express)

-   **Node.js** - JavaScript runtime
-   **Express.js 4.19** - Web application framework
-   **MongoDB** - NoSQL database
-   **Mongoose 8.2** - MongoDB object modeling
-   **JWT 9.0** - JSON Web Token authentication
-   **Google APIs 133.0** - OAuth integration

### Cloud Services & Integrations

-   **Cloudinary 1.41** - Image and video management
-   **Nodemailer 7.0** - Email sending service
-   **Google Calendar API** - Calendar integration
-   **AWS SES** - Email monitoring and delivery

### Development Tools

-   **ESLint 9.22** - Code linting and formatting
-   **Nodemon 3.1** - Development auto-restart
-   **Morgan 1.10** - HTTP request logging
-   **Express Rate Limit 8.0** - API rate limiting
-   **Express Validator 7.0** - Request validation

## 📁 Project Architecture

```
YoungMinds Club/
├── client/                     # Frontend Application (React + TypeScript)
│   ├── public/                 # Static assets and favicon
│   │   ├── brandLogo_3.png    # Main brand logo
│   │   └── dummy-profile.svg   # Default profile image
│   ├── src/
│   │   ├── assets/            # Images, logos, and static files
│   │   ├── components/        # Reusable React components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   │   ├── cards/     # Stats and user cards
│   │   │   │   ├── forms/     # Announcement forms
│   │   │   │   ├── layout/    # Admin layout components
│   │   │   │   ├── modals/    # Admin confirmation modals
│   │   │   │   └── tables/    # Data tables with filtering
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── common/        # Shared UI components
│   │   │   ├── home_comp/     # Homepage sections
│   │   │   ├── organizer/     # Organizer dashboard components
│   │   │   └── user/          # User profile and dashboard
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.tsx    # Authentication state
│   │   │   └── ErrorContext.tsx   # Global error handling
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin management pages
│   │   │   ├── auth/          # Login, register, password reset
│   │   │   ├── organizer/     # Organizer dashboard and tools
│   │   │   └── user/          # User dashboard and profile
│   │   ├── styles/            # Global CSS and themes
│   │   ├── types/             # TypeScript type definitions
│   │   │   ├── admin.types.ts     # Admin-specific types
│   │   │   ├── core.types.ts      # Core application types
│   │   │   ├── events.types.ts    # Event-related types
│   │   │   ├── internships.types.ts # Internship types
│   │   │   └── user.types.ts      # User and profile types
│   │   └── utils/             # Utility functions
│   ├── package.json           # Frontend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite build configuration
│   └── vercel.json            # Vercel deployment config
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── config/                # Service configurations
│   │   ├── cloudinary.js      # Image upload configuration
│   │   └── google.js          # Google OAuth setup
│   ├── controllers/           # Route controllers and business logic
│   │   ├── adminController.js         # Admin management
│   │   ├── announcementController.js  # System announcements
│   │   ├── authController.js          # Authentication
│   │   ├── emailMonitoringController.js # Email analytics
│   │   ├── eventController.js         # Event management
│   │   ├── filtersController.js       # Search and filtering
│   │   ├── internshipController.js    # Internship management
│   │   ├── organizerController.js     # Organizer features
│   │   ├── userActivityController.js  # XP and badge system
│   │   └── userController.js          # User management
│   ├── docs/                  # API documentation
│   │   └── google-apis.md     # Google integration guide
│   ├── middlewares/           # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── otherUtils.js      # Utility middleware
│   │   └── rateLimiting.js    # API rate limiting
│   ├── models/                # MongoDB schemas
│   │   ├── Announcement.js        # System announcements
│   │   ├── Event.js               # Event data model
│   │   ├── EventRegistration.js   # Event registrations
│   │   ├── Internship.js          # Internship data model
│   │   ├── InternshipApplication.js # Internship applications
│   │   ├── User.js                # User accounts
│   │   └── UserActivity.js        # XP, badges, and streaks
│   ├── routes/                # API route definitions
│   │   ├── admin.js           # Admin endpoints
│   │   ├── auth.js            # Authentication routes
│   │   ├── emailMonitoring.js # Email analytics routes
│   │   ├── event.js           # Event CRUD operations
│   │   ├── filters.js         # Search and filter endpoints
│   │   ├── internship.js      # Internship CRUD operations
│   │   ├── organizer.js       # Organizer dashboard routes
│   │   └── user.js            # User profile and activity
│   ├── services/              # Business logic services
│   │   ├── emailMonitoring.js # Email tracking and analytics
│   │   ├── emailService.js    # Email sending service
│   │   └── googleCalendar.js  # Calendar integration
│   ├── utils/                 # Helper functions
│   │   ├── cloudinary.js      # Image processing
│   │   ├── eventHelpers.js    # Event utilities
│   │   ├── filterConstants.js # Search constants
│   │   └── jwt.js             # Token utilities
│   ├── package.json           # Backend dependencies
│   ├── vercel.json            # Vercel serverless config
│   └── example.env            # Environment variables template
│
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

## 🛠️ Installation & Setup

### Prerequisites

-   **Node.js** (v18 or higher)
-   **npm** or **pnpm** (recommended)
-   **MongoDB** (local or Atlas)
-   **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "YoungMinds Club"
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/youngmindsclub

# Client URL
CLIENT_URL=http://localhost:5173

# CORS Configuration
CORS_URL_LIST=http://localhost:5173,http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Cloudinary Configuration (Get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (SMTP)
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_not_regular_password
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_CLIENT_URL=http://localhost:5173
```

### 4. Start Development Servers

**Backend Server:**

```bash
cd server
npm run dev
```

**Frontend Development Server:**

```bash
cd client
npm run dev
```

### 5. Access the Application

-   **Frontend:** http://localhost:5173
-   **Backend API:** http://localhost:4000

## 🌐 Production Deployment

### Vercel Deployment (Recommended)

This project is optimized for **Vercel** deployment with separate configurations for frontend and backend.

#### Frontend Deployment

-   Automatically deploys from the `client` directory
-   Uses Vite build system with TypeScript compilation
-   SPA routing handled by `vercel.json` configuration
-   Environment variables configured in Vercel dashboard

#### Backend Deployment

-   Deploys as serverless functions on Vercel
-   Uses Node.js runtime with Express.js
-   MongoDB Atlas recommended for production database
-   Environment variables configured in Vercel dashboard

### Build Commands

**Frontend Production Build:**

```bash
cd client
npm run build
```

**Backend Production Start:**

```bash
cd server
npm start
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| `POST` | `/auth/signup`          | Register new user account    |
| `POST` | `/auth/login`           | Login with email/password    |
| `GET`  | `/auth/logout`          | Logout current session       |
| `GET`  | `/auth/me`              | Get current user profile     |
| `GET`  | `/auth/google`          | Initiate Google OAuth flow   |
| `GET`  | `/auth/google/callback` | Handle Google OAuth callback |
| `POST` | `/auth/forgot-password` | Request password reset       |
| `POST` | `/auth/reset-password`  | Reset password with token    |

### User Management Endpoints

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| `GET`  | `/user/profile`               | Get user profile with XP/badges |
| `PUT`  | `/user/profile`               | Update user profile information |
| `POST` | `/user/profile/picture`       | Upload profile picture          |
| `GET`  | `/user/dashboard`             | Get user dashboard data         |
| `GET`  | `/user/xp-history`            | Get XP earning history          |
| `GET`  | `/user/badges`                | Get user badge collection       |
| `POST` | `/user/organizer-application` | Apply to become organizer       |

### Event Management Endpoints

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| `GET`  | `/events`              | Get all published events with filtering |
| `GET`  | `/events/:id`          | Get specific event details              |
| `POST` | `/events/:id/register` | Register for an event                   |
| `GET`  | `/events/:id/qr`       | Generate QR code for event              |
| `POST` | `/events/:id/feedback` | Submit event feedback                   |

### Internship Management Endpoints

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| `GET`  | `/internships`            | Get all published internships   |
| `GET`  | `/internships/:id`        | Get specific internship details |
| `POST` | `/internships/:id/apply`  | Apply for internship            |
| `GET`  | `/internships/categories` | Get internship categories       |
| `GET`  | `/internships/filters`    | Get filter options              |

### Organizer Endpoints

| Method   | Endpoint                     | Description                   |
| -------- | ---------------------------- | ----------------------------- |
| `GET`    | `/organizer/dashboard`       | Get organizer dashboard stats |
| `GET`    | `/organizer/events`          | Get organizer's events        |
| `POST`   | `/organizer/events`          | Create new event              |
| `PUT`    | `/organizer/events/:id`      | Update existing event         |
| `DELETE` | `/organizer/events/:id`      | Delete event                  |
| `GET`    | `/organizer/internships`     | Get organizer's internships   |
| `POST`   | `/organizer/internships`     | Create new internship         |
| `PUT`    | `/organizer/internships/:id` | Update internship             |
| `DELETE` | `/organizer/internships/:id` | Delete internship             |

### Admin Management Endpoints

| Method   | Endpoint                         | Description                        |
| -------- | -------------------------------- | ---------------------------------- |
| `GET`    | `/admin/dashboard/stats`         | Get admin dashboard statistics     |
| `GET`    | `/admin/users`                   | Get all users with filtering       |
| `PUT`    | `/admin/users/:id/role`          | Update user role                   |
| `DELETE` | `/admin/users/:id`               | Delete user account                |
| `GET`    | `/admin/events`                  | Get all events for management      |
| `PUT`    | `/admin/events/:id/feature`      | Toggle event featured status       |
| `PUT`    | `/admin/events/:id/flag`         | Flag/unflag event                  |
| `GET`    | `/admin/internships`             | Get all internships for management |
| `PUT`    | `/admin/internships/:id/feature` | Toggle internship featured status  |
| `PUT`    | `/admin/internships/:id/flag`    | Flag/unflag internship             |
| `GET`    | `/admin/announcements`           | Get system announcements           |
| `POST`   | `/admin/announcements`           | Create new announcement            |

### Email Monitoring Endpoints

| Method | Endpoint                               | Description                   |
| ------ | -------------------------------------- | ----------------------------- |
| `GET`  | `/email-monitoring/dashboard`          | Get email system overview     |
| `GET`  | `/email-monitoring/stats`              | Get delivery statistics       |
| `GET`  | `/email-monitoring/stats/by-type`      | Get stats by email type       |
| `GET`  | `/email-monitoring/problematic-emails` | Get high-risk email addresses |

## 🎮 Gamification System

### XP (Experience Points) System

-   **Event Registration:** +10 XP
-   **Event Attendance:** +25 XP
-   **Internship Application:** +15 XP
-   **Profile Completion:** +20 XP
-   **Daily Login Streak:** +5 XP per day

### Badge Progression

-   **Newbie** (0-49 XP) - New to the platform
-   **Regular** (50-149 XP) - Active participant
-   **Champ** (150-299 XP) - Engaged community member
-   **Veteran** (300-499 XP) - Experienced user
-   **Master** (500+ XP) - Platform expert

### Streak System

-   Daily login streaks tracked automatically
-   Bonus XP for maintaining streaks
-   Visual indicators for streak achievements

## 📧 Email System Features

### Email Types Monitored

1. **Authentication Emails**

    - Password reset requests
    - Password setup for Google users
    - Password change confirmations

2. **Event Notifications**

    - Event registration confirmations
    - Event reminder notifications

3. **Internship Communications**

    - Application confirmations
    - Status update notifications

4. **Administrative Emails**
    - Organizer approval/rejection
    - System announcements

### Email Performance Metrics

-   **Delivery Rate:** >98% target
-   **Bounce Rate:** <2% target
-   **Complaint Rate:** <0.1% target
-   **Health Score:** 90-100 (excellent)

### Advanced Features

-   **Automatic Suppression** for problematic email addresses
-   **Real-time Monitoring** with bounce/complaint tracking
-   **Professional HTML Templates** with responsive design
-   **Rate Limiting** to prevent spam
-   **Performance Analytics** with detailed reporting

## 🔧 Development Scripts

### Frontend (client/)

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production with TypeScript
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint with TypeScript support
npm run preview      # Preview production build locally
```

### Backend (server/)

```bash
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
npm test             # Run tests (placeholder)
```

## 🛡️ Security Features

### Authentication Security

-   **JWT Tokens** with secure expiration
-   **Password Hashing** using bcrypt
-   **Rate Limiting** on authentication endpoints
-   **CORS Protection** with configurable origins

### Data Protection

-   **Input Validation** using Express Validator
-   **XSS Protection** with sanitized inputs
-   **MongoDB Injection** prevention
-   **File Upload Security** with Cloudinary integration

### Role-Based Access Control

-   **Three-tier Role System** (User, Organizer, Admin)
-   **Protected Routes** with middleware authentication
-   **Permission-based Actions** for sensitive operations
-   **Audit Logging** for administrative actions

## 🎨 UI/UX Features

### Design System

-   **Consistent Color Palette** with CSS custom properties
-   **Responsive Breakpoints** for all device sizes
-   **Accessible Components** following WCAG guidelines
-   **Smooth Animations** with CSS transitions
-   **Loading States** for better user experience

### Interactive Elements

-   **Real-time Feedback** for form submissions
-   **Toast Notifications** for user actions
-   **Modal Dialogs** for confirmations
-   **Skeleton Loading** for content placeholders
-   **Infinite Scroll** for large data sets

### Mobile Optimization

-   **Touch-friendly Interface** with appropriate tap targets
-   **Swipe Gestures** for navigation
-   **Optimized Images** with responsive loading
-   **Fast Loading Times** with code splitting

## 🚀 Performance Optimizations

### Frontend Optimizations

-   **Code Splitting** with React lazy loading
-   **Bundle Analysis** with Vite build tools
-   **Image Optimization** with Cloudinary transformations
-   **Caching Strategies** for API responses
-   **Tree Shaking** for minimal bundle size

### Backend Optimizations

-   **Database Indexing** for fast queries
-   **Connection Pooling** for MongoDB
-   **Compression Middleware** for response optimization
-   **Caching Headers** for static assets
-   **Rate Limiting** for API protection

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

-   **TypeScript** for type safety in frontend
-   **ESLint** configuration for consistent code style
-   **Meaningful Commit Messages** following conventional commits
-   **Component Documentation** with JSDoc comments
-   **Test Coverage** for new features

### Pull Request Guidelines

-   Include detailed description of changes
-   Add screenshots for UI changes
-   Ensure all tests pass
-   Update documentation as needed
-   Request review from maintainers

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   **MERN Stack Community** for excellent documentation and support
-   **TypeScript Team** for making JavaScript development better
-   **Tailwind CSS** for the amazing utility-first CSS framework
-   **Vercel Platform** for seamless deployment experience
-   **MongoDB Atlas** for reliable cloud database hosting
-   **Cloudinary** for powerful image and video management
-   **Google APIs** for authentication and calendar integration

## 📞 Support & Contact

For questions, bug reports, or feature requests:

-   **Create an Issue** in the GitHub repository
-   **Join our Community** discussions
-   **Follow Updates** on our social media channels

---

**Built with ❤️ by the YoungMinds Club team**

_Empowering young professionals through technology and community_
