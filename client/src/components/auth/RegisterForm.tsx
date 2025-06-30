import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput, Button, SelectInput } from "../common";
import { SocialLogin } from "./";
import { RegisterFormData, AuthFormErrors, RoleOption } from "@/types";

const RegisterForm: React.FC = () => {
	const [formData, setFormData] = useState<RegisterFormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "user",
	});
	const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const { register, error } = useAuth();
	const navigate = useNavigate();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } }
	): void => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const validateForm = (data: RegisterFormData): AuthFormErrors => {
		const errors: AuthFormErrors = {};

		if (!data.name?.trim()) {
			errors.name = "Name is required";
		}

		if (!data.email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
			errors.email = "Email is invalid";
		}

		if (!data.password) {
			errors.password = "Password is required";
		} else if (data.password.length < 6) {
			errors.password = "Password must be at least 6 characters";
		}

		if (data.password !== data.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			// Remove confirmPassword before sending to API
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { confirmPassword, ...registerData } = formData;

			setIsSubmitting(true);
			try {
				await register({
					name: registerData.name,
					email: registerData.email,
					password: registerData.password,
					role: registerData.role,
				});
				navigate("/dashboard");
			} catch (error) {
				console.error("Registration error:", error);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const roleOptions: RoleOption[] = [
		{ value: "user", label: "Attendee" },
		{ value: "organizer", label: "Event Organizer" },
	];

	return (
		<div className="p-8">
			{error && (
				<div className="ym-bg-card border border-red-400 ym-text-card px-4 py-3 rounded-lg mb-6 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400">
					<div className="flex items-center">
						<div className="w-1 h-4 bg-red-500 rounded-full mr-3"></div>
						{error}
					</div>
				</div>
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
					disabled={isSubmitting}
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

				<FormInput
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					label="Confirm Password"
					error={formErrors.confirmPassword}
					disabled={isSubmitting}
				/>

				<SelectInput
					id="role"
					name="role"
					value={formData.role}
					onChange={handleChange}
					label="Register as"
					options={roleOptions}
					disabled={isSubmitting}
				/>

				<Button type="submit" className="w-full py-3 text-base font-medium mt-8" disabled={isSubmitting}>
					{isSubmitting ? (
						<div className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Registering...
						</div>
					) : (
						"Register"
					)}
				</Button>
			</form>

			<div className="mt-8 text-center">
				<p className="ym-text-secondary">
					Already have an account?{" "}
					<Link
						to="/login"
						className="ym-text-yellow-600 hover:ym-text-yellow-700 font-medium transition-colors hover:underline"
					>
						Log In here
					</Link>
				</p>
			</div>

			<SocialLogin />
		</div>
	);
};

export default RegisterForm;
