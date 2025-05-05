import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/main.css';

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
				<div className="min-h-screen bg-gray-100">
					<Navigation />
					<main>
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
					</main>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default AppRoutes;
