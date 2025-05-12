import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import './styles/main.css';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Dashboard router component that routes to the appropriate dashboard based on user role
const DashboardRouter = () => {
	const { user, isAdmin, isOrganizer } = useAuth();

	if (!user) return <Navigate to="/login" />;

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
				<div className="min-h-screen bg-gray-100 pt-16">
					<Navigation />
					<main>
						<Suspense fallback={
							<div className="flex flex-col justify-center items-center h-[70vh]">
								<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
								<h2 className="text-xl font-semibold text-gray-700">Loading</h2>
							</div>
						}>
							<Routes>
								{/* Public routes */}
								<Route path="/" element={<HomePage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/register" element={<RegisterPage />} />

								{/* Protected routes */}
								<Route path="/dashboard" element={<DashboardRouter />} />

								{/* Admin routes */}
								<Route element={<ProtectedRoute requiredRole="admin" />}>
									<Route path="/admin/users" element={<AdminDashboard />} />
								</Route>

								{/* Organizer routes */}
								<Route element={<ProtectedRoute requiredRole={['organizer', 'admin']} />}>
									<Route path="/organizer/events" element={<OrganizerDashboard />} />
								</Route>

								{/* User routes */}
								<Route element={<ProtectedRoute />}>
									<Route path="/user/profile" element={<UserDashboard />} />
								</Route>

								{/* Fallback route */}
								<Route path="*" element={<Navigate to="/" />} />
							</Routes>
						</Suspense>
					</main>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default AppRoutes;