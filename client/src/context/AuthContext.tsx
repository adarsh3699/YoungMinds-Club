import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios, { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType, ApiResponse, RegisterData, LoginData } from '@/types';
import SuspendedAccountModal from '@/components/common/SuspendedAccountModal';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AuthProviderProps {
	children: ReactNode;
}

interface JWTPayload {
	exp: number;
	iat: number;
	userId: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showSuspendedModal, setShowSuspendedModal] = useState<boolean>(false);

	// Set up axios defaults
	axios.defaults.baseURL = API_URL;
	axios.defaults.withCredentials = true;

	// Add token to axios defaults if it exists
	useEffect(() => {
		if (token) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common['Authorization'];
		}
	}, [token]);

	// Handle suspended user - clear session and show modal
	const handleSuspendedUser = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
		setShowSuspendedModal(true);
	};

	// Close suspended modal and logout
	const closeSuspendedModal = () => {
		setShowSuspendedModal(false);
		// Optional: redirect to home page
		window.location.href = '/';
	};

	// Check if token is valid and get user data
	useEffect(() => {
		const verifyToken = async (): Promise<void> => {
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				// Check if token is expired
				const decodedToken = jwtDecode<JWTPayload>(token);
				if (decodedToken.exp * 1000 < Date.now()) {
					localStorage.removeItem('token');
					setToken(null);
					setUser(null);
					setLoading(false);
					return;
				}

				// Verify token with backend
				const response: AxiosResponse<ApiResponse<User>> = await axios.get('/auth/me');

				if (response.data.success && response.data.user) {
					// Check if user is suspended
					if (response.data.user.status === 'suspended') {
						handleSuspendedUser();
						setLoading(false);
						return;
					}
					setUser(response.data.user);
				} else {
					localStorage.removeItem('token');
					setToken(null);
					setUser(null);
				}
			} catch (error: any) {
				console.error('Token verification error:', error);

				// Handle suspended user specifically
				if (error.response?.data?.isSuspended) {
					handleSuspendedUser();
					setLoading(false);
					return;
				}

				// Don't immediately remove token on network errors
				// This prevents logout on temporary server issues or connectivity problems
				if (error.response && (error.response.status === 401 || error.response.status === 403)) {
					localStorage.removeItem('token');
					setToken(null);
					setUser(null);
				}
			}

			setLoading(false);
		};

		verifyToken();
	}, [token]);

	// Register user
	const register = async (userData: RegisterData): Promise<ApiResponse> => {
		setLoading(true);
		setError(null);

		try {
			const response: AxiosResponse<ApiResponse> = await axios.post('/auth/signup', userData);

			if (response.data.success && response.data.token && response.data.user) {
				localStorage.setItem('token', response.data.token);
				setToken(response.data.token);
				setUser(response.data.user);
			}

			return response.data;
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.errors?.[0]?.msg ||
				'Registration failed. Please try again.';
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Login user
	const login = async (userData: LoginData): Promise<ApiResponse> => {
		setLoading(true);
		setError(null);

		try {
			const response: AxiosResponse<ApiResponse> = await axios.post('/auth/login', userData);

			if (response.data.success && response.data.token && response.data.user) {
				// Check if user is suspended
				if (response.data.user.status === 'suspended') {
					handleSuspendedUser();
					setLoading(false);
					throw new Error('Account suspended');
				}

				localStorage.setItem('token', response.data.token);
				setToken(response.data.token);
				setUser(response.data.user);
			}

			return response.data;
		} catch (error: any) {
			// Handle suspended user specifically
			if (error.response?.data?.isSuspended) {
				handleSuspendedUser();
				setLoading(false);
				throw error;
			}

			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.errors?.[0]?.msg ||
				'Login failed. Please check your credentials.';
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Logout user
	const logout = async (): Promise<void> => {
		try {
			await axios.get('/auth/logout');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			localStorage.removeItem('token');
			setToken(null);
			setUser(null);
		}
	};

	// Value to be provided to consuming components
	const value: AuthContextType = {
		user,
		token,
		loading,
		error,
		register,
		login,
		logout,
		setToken,
		setUser,
		isAuthenticated: !!user,
		isAdmin: user?.role === 'admin',
		isOrganizer: user?.role === 'organizer',
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
			<SuspendedAccountModal isOpen={showSuspendedModal} onClose={closeSuspendedModal} />
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};
