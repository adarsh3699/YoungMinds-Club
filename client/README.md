# YoungMinds Club Frontend

This is the frontend application for the YoungMinds Club platform, built with React and Vite.

## Features

- Modern React application with functional components and hooks
- Complete authentication flow (register, login, profile management)
- Role-based dashboards (user, organizer, admin)
- Event browsing and booking for users
- Event management for organizers
- User management for admins
- Responsive design with Tailwind CSS

## Project Structure

```
src/
├── assets/           # Static assets like images and icons
├── components/       # Reusable UI components
│   ├── admin/        # Admin-specific components
│   ├── auth/         # Authentication components
│   ├── common/       # Shared components
│   ├── organizer/    # Organizer-specific components
│   └── user/         # User-specific components
├── context/          # React context providers
├── lib/              # Libraries and configuration
├── pages/            # Page components
│   ├── admin/        # Admin pages
│   ├── organizer/    # Organizer pages
│   └── user/         # User pages
├── styles/           # Global styles and Tailwind configuration
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
