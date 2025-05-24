import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ requiredRole, redirectPath = '/login' }) => {
	const { user, loading, isAuthenticated, token } = useAuth();

	// If still loading and we have a token, don't redirect, just show loading
	if (loading && token) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="w-16 h-16 border-t-4 border-amber-500 border-solid rounded-full animate-spin mb-4"></div>
				<h2 className="text-xl font-semibold ym-text-primary ml-4">Loading...</h2>
			</div>
		);
	}

	// If not authenticated, redirect to login
	if (!isAuthenticated && !loading) {
		return <Navigate to={redirectPath} replace />;
	}

	// If no specific role required, just be authenticated
	if (!requiredRole) {
		return <Outlet />;
	}

	// Check if user has required role
	const hasRequiredRole = Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole;

	// If user doesn't have the required role, redirect to homepage
	if (!hasRequiredRole) {
		return <Navigate to="/" replace />;
	}

	// If all checks pass, render the protected content
	return <Outlet />;
};

export default ProtectedRoute;
