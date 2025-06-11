import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRouteProps } from '@/types';
import SuspendedAccountModal from './SuspendedAccountModal';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, redirectPath = '/login' }) => {
	const { user, loading, isAuthenticated, token } = useAuth();
	const [showSuspendedModal, setShowSuspendedModal] = useState<boolean>(false);

	// If still loading and we have a token, don't redirect, just show loading
	if (loading && token) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div
					className="w-16 h-16 border-t-4 border-solid rounded-full animate-spin mb-4"
					style={{ borderTopColor: 'var(--ring)' }}
				></div>
				<h2 className="text-xl font-semibold ym-text-primary ml-4">Loading...</h2>
			</div>
		);
	}

	// If not authenticated, redirect to login
	if (!isAuthenticated && !loading) {
		return <Navigate to={redirectPath} replace />;
	}

	// Check if user is suspended - show modal instead of redirecting
	if (user && user.status === 'suspended') {
		if (!showSuspendedModal) {
			setShowSuspendedModal(true);
		}
		return (
			<>
				<Navigate to="/" replace />
				<SuspendedAccountModal
					isOpen={showSuspendedModal}
					onClose={() => {
						setShowSuspendedModal(false);
						window.location.href = '/';
					}}
				/>
			</>
		);
	}

	// If no specific role required, just be authenticated
	if (!requiredRole) {
		return <Outlet />;
	}

	// Check if user has required role
	if (!user) {
		return <Navigate to={redirectPath} replace />;
	}

	const hasRequiredRole = Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole;

	// If user doesn't have the required role, redirect to homepage
	if (!hasRequiredRole) {
		return <Navigate to="/" replace />;
	}

	// If all checks pass, render the protected content
	return <Outlet />;
};

export default ProtectedRoute;
