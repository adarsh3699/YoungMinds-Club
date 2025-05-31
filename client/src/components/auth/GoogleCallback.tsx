import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { AuthMeResponse } from '@/types';

const GoogleCallback: React.FC = () => {
	const [searchParams] = useSearchParams();
	const [error, setError] = useState<string | null>(null);
	const { setToken, setUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const token = searchParams.get('token');

		const processGoogleAuth = async (): Promise<void> => {
			try {
				if (!token) {
					throw new Error('Authentication failed. No token received.');
				}

				// Store the token in localStorage
				localStorage.setItem('token', token);

				// Update auth context
				setToken(token);

				// Fetch current user data
				try {
					const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
					const response = await axios.get<AuthMeResponse>(`${API_URL}/auth/me`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.data?.user) {
						setUser(response.data.user);
					}
				} catch (userError) {
					console.error('Error fetching user data:', userError);
					// Continue with login even if user fetch fails
				}

				// Redirect to dashboard
				navigate('/dashboard');
			} catch (error) {
				console.error('Google authentication error:', error);
				const errorMessage = error instanceof Error ? error.message : 'Authentication failed.';
				setError(errorMessage);

				// Redirect to login after a delay
				setTimeout(() => {
					navigate('/login');
				}, 3000);
			}
		};

		processGoogleAuth();
	}, [searchParams, setToken, setUser, navigate]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center ym-bg-yellow-100">
			<div className="w-full max-w-md p-8 ym-bg-card rounded-xl shadow-lg text-center border ym-border-card">
				{error ? (
					<>
						<div className="text-red-500 text-xl mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12 mx-auto mb-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Authentication Error
						</div>
						<p className="ym-text-secondary mb-4">{error}</p>
						<p className="ym-text-muted">Redirecting to login...</p>
					</>
				) : (
					<>
						<div className="ym-text-yellow-600 mb-4">
							<div
								className="w-16 h-16 border-t-4 border-solid rounded-full animate-spin mx-auto mb-2"
								style={{ borderTopColor: 'var(--ring)' }}
							></div>
							<p className="text-xl font-semibold">Logging you in...</p>
						</div>
						<p className="ym-text-secondary">Please wait while we set up your session.</p>
					</>
				)}
			</div>
		</div>
	);
};

export default GoogleCallback; 