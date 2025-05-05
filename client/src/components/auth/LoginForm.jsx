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
			try {
				await login(formData);
				navigate('/dashboard');
			} catch (error) {
				console.error('Login error:', error);
			}
		}
	};

	return (
		<div className="p-8">
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
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
				/>

				<FormInput
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					label="Password"
					error={formErrors.password}
				/>

				<Button type="submit" fullWidth className="py-3 text-base font-medium">
					Log In
				</Button>
			</form>

			<div className="mt-6 text-center">
				<p className="text-gray-600">
					Don't have an account?{' '}
					<Link to="/register" className="text-blue-500 hover:underline font-medium">
						Register
					</Link>
				</p>
			</div>

			<SocialLogin />
		</div>
	);
};

export default LoginForm;
