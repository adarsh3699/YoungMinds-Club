import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const GoogleCallback = () => {
	const [searchParams] = useSearchParams();
	const [error, setError] = useState(null);
	const { setToken, setUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const token = searchParams.get('token');

		const processGoogleAuth = async () => {
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
					const response = await axios.get(`${API_URL}/auth/me`, {
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
				setError(error.message || 'Authentication failed.');

				// Redirect to login after a delay
				setTimeout(() => {
					navigate('/login');
				}, 3000);
			}
		};

		processGoogleAuth();
	}, [searchParams, setToken, setUser, navigate]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
			<div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
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
						<p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
						<p className="text-gray-500 dark:text-gray-400">Redirecting to login...</p>
					</>
				) : (
					<>
						<div className="text-blue-500 mb-4">
							<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
							<p className="text-xl font-semibold">Logging you in...</p>
						</div>
						<p className="text-gray-600 dark:text-gray-300">Please wait while we set up your session.</p>
					</>
				)}
			</div>
		</div>
	);
};

export default GoogleCallback;
