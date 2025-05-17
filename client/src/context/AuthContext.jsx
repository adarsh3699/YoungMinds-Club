import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token') || null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	// Check if token is valid and get user data
	useEffect(() => {
		const verifyToken = async () => {
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				// Check if token is expired
				const decodedToken = jwtDecode(token);
				if (decodedToken.exp * 1000 < Date.now()) {
					localStorage.removeItem('token');
					setToken(null);
					setUser(null);
					setLoading(false);
					return;
				}

				// Verify token with backend
				const response = await axios.get('/auth/me');

				if (response.data.success) {
					setUser(response.data.user);
				} else {
					localStorage.removeItem('token');
					setToken(null);
					setUser(null);
				}
			} catch (error) {
				console.error('Token verification error:', error);
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
	const register = async (userData) => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post('/auth/signup', userData);

			if (response.data.success) {
				localStorage.setItem('token', response.data.token);
				setToken(response.data.token);
				setUser(response.data.user);
			}

			return response.data;
		} catch (error) {
			setError(
				error.response?.data?.message ||
					error.response?.data?.errors?.[0]?.msg ||
					'Registration failed. Please try again.'
			);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Login user
	const login = async (userData) => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post('/auth/login', userData);

			if (response.data.success) {
				localStorage.setItem('token', response.data.token);
				setToken(response.data.token);
				setUser(response.data.user);
			}

			return response.data;
		} catch (error) {
			setError(
				error.response?.data?.message ||
					error.response?.data?.errors?.[0]?.msg ||
					'Login failed. Please check your credentials.'
			);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Logout user
	const logout = async () => {
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
	const value = {
		user,
		token,
		loading,
		error,
		register,
		login,
		logout,
		isAuthenticated: !!user,
		isAdmin: user?.role === 'admin',
		isOrganizer: user?.role === 'organizer',
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};
