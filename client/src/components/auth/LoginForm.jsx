import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Button } from '../common';
import { SocialLogin } from './';

const LoginForm = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login, error } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const validateForm = (data) => {
		const errors = {};

		if (!data.email) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
			errors.email = 'Email is invalid';
		}

		if (!data.password) {
			errors.password = 'Password is required';
		}

		return errors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			setIsSubmitting(true);
			try {
				await login(formData);
				navigate('/dashboard');
			} catch (error) {
				console.error('Login error:', error);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	return (
		<div className="p-8">
			{error && (
				<div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<FormInput
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					label="Email"
					error={formErrors.email}
					placeholder="your.email@example.com"
					disabled={isSubmitting}
				/>

				<FormInput
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					label="Password"
					error={formErrors.password}
					disabled={isSubmitting}
				/>

				<Button type="submit" fullWidth className="py-3 text-base font-medium" disabled={isSubmitting}>
					{isSubmitting ? (
						<div className="flex items-center justify-center">
							<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Logging in...
						</div>
					) : (
						'Log In'
					)}
				</Button>
			</form>

			<div className="mt-6 text-center">
				<p className="text-gray-600 dark:text-gray-300">
					Don't have an account?{' '}
					<Link to="/register" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
						Register
					</Link>
				</p>
			</div>

			<SocialLogin />
		</div>
	);
};

export default LoginForm;
