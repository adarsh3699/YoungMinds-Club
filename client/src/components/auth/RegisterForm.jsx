import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Button, SelectInput } from '../common';
import { SocialLogin } from './';

const RegisterForm = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		role: 'user',
	});
	const [formErrors, setFormErrors] = useState({});
	const { register, error } = useAuth();
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

		if (!data.name?.trim()) {
			errors.name = 'Name is required';
		}

		if (!data.email) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
			errors.email = 'Email is invalid';
		}

		if (!data.password) {
			errors.password = 'Password is required';
		} else if (data.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}

		if (data.password !== data.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}

		return errors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			// Remove confirmPassword before sending to API
			const { confirmPassword: _confirmPassword, ...registerData } = formData;

			try {
				await register(registerData);
				navigate('/dashboard');
			} catch (error) {
				console.error('Registration error:', error);
			}
		}
	};

	const roleOptions = [
		{ value: 'user', label: 'Attendee' },
		{ value: 'organizer', label: 'Event Organizer' },
	];

	return (
		<div className="p-8">
			{error && (
				<div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<FormInput
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
					label="Full Name"
					error={formErrors.name}
					placeholder="John Doe"
				/>

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

				<FormInput
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					label="Confirm Password"
					error={formErrors.confirmPassword}
				/>

				<SelectInput
					id="role"
					name="role"
					value={formData.role}
					onChange={handleChange}
					label="Register as"
					options={roleOptions}
				/>

				<Button type="submit" fullWidth className="py-3 text-base font-medium mt-4">
					Register
				</Button>
			</form>

			<div className="mt-6 text-center">
				<p className="text-gray-600 dark:text-gray-300">
					Already have an account?{' '}
					<Link to="/login" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
						Log In
					</Link>
				</p>
			</div>

			<SocialLogin />
		</div>
	);
};

export default RegisterForm;
