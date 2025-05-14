import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import './styles/main.css';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/UsersPage'));
const AdminOrganizers = lazy(() => import('./pages/admin/OrganizersPage'));
const AdminEvents = lazy(() => import('./pages/admin/EventsPage'));
const AdminAnalytics = lazy(() => import('./pages/admin/AnalyticsPage'));
const AdminModeration = lazy(() => import('./pages/admin/ModerationPage'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AnnouncementsPage'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const EventFeedback = lazy(() => import('./pages/EventFeedback'));
const EventManagePage = lazy(() => import('./pages/EventManagePage'));

// Dashboard router component that routes to the appropriate dashboard based on user role
const DashboardRouter = () => {
	const { user, isAdmin, isOrganizer, loading, token } = useAuth();

	// If still loading and we have a token, don't redirect yet
	if (loading && token) {
		return (
			<div className="flex flex-col justify-center items-center h-[70vh]">
				<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
				<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading</h2>
			</div>
		);
	}

	// Only redirect to login if we're sure the user is not authenticated
	if (!user && !loading) return <Navigate to="/login" />;

	if (isAdmin) {
		return <AdminDashboard />;
	} else if (isOrganizer) {
		return <OrganizerDashboard />;
	} else {
		return <UserDashboard />;
	}
};

function AppRoutes() {
	return (
		<AuthProvider>
			<Router>
				<div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
					<Navigation />
					<main className="flex-grow pt-16 flex flex-col min-h-screen">
						<Suspense fallback={
							<div className="flex flex-col justify-center items-center h-[70vh]">
								<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
								<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading</h2>
							</div>
						}>
							<div className="min-h-[calc(100vh-80px)]">
								<Routes>
									{/* Public routes */}
									<Route path="/" element={<HomePage />} />
									<Route path="/login" element={<LoginPage />} />
									<Route path="/register" element={<RegisterPage />} />
									<Route path="/event/:id" element={<EventDetails />} />

									{/* Protected routes */}
									<Route path="/dashboard" element={<DashboardRouter />} />
									
									{/* User routes */}
									<Route element={<ProtectedRoute />}>
										<Route path="/user/profile" element={<UserDashboard />} />
										<Route path="/my-events" element={<MyEvents />} />
										<Route path="/event/:id/feedback" element={<EventFeedback />} />
									</Route>

									{/* Admin routes */}
									<Route element={<ProtectedRoute requiredRole="admin" />}>
										<Route path="/admin/dashboard" element={<AdminDashboard />} />
										<Route path="/admin/users" element={<AdminUsers />} />
										<Route path="/admin/organizers" element={<AdminOrganizers />} />
										<Route path="/admin/events" element={<AdminEvents />} />
										<Route path="/admin/analytics" element={<AdminAnalytics />} />
										<Route path="/admin/moderation" element={<AdminModeration />} />
										<Route path="/admin/announcements" element={<AdminAnnouncements />} />
									</Route>

									{/* Organizer routes */}
									<Route element={<ProtectedRoute requiredRole={['organizer', 'admin']} />}>
										<Route path="/organizer/events" element={<OrganizerDashboard />} />
										<Route path="/organizer/event/:id" element={<EventManagePage />} />
									</Route>

									{/* Fallback route */}
									<Route path="*" element={<Navigate to="/" />} />
								</Routes>
							</div>
						</Suspense>
					</main>
					<Footer />
				</div>
			</Router>
		</AuthProvider>
	);
}

export default AppRoutes;