import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthRouteGuardProps {
	children: React.ReactNode;
	redirectTo?: string;
}

/**
 * AuthRouteGuard prevents authenticated users from accessing authentication pages
 * like login and register by redirecting them to home page or specified route
 */
const AuthRouteGuard: React.FC<AuthRouteGuardProps> = ({ children, redirectTo = '/' }) => {
	const { isAuthenticated, loading } = useAuth();

	// Show loading spinner while checking authentication status
	if (loading) {
		return (
			<div className="flex flex-col justify-center items-center h-[70vh]">
				<div
					className="w-16 h-16 border-t-4 border-solid rounded-full animate-spin mb-4"
					style={{ borderTopColor: 'var(--ring)' }}
				></div>
				<h2 className="text-xl font-semibold ym-text-primary">Loading</h2>
			</div>
		);
	}

	// If user is authenticated, redirect them away from auth pages
	if (isAuthenticated) {
		return <Navigate to={redirectTo} replace />;
	}

	// If not authenticated, show the auth page (login/register)
	return <>{children}</>;
};

export default AuthRouteGuard; 