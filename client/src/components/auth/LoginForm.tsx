import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput, Button } from "../common";
import { SocialLogin } from "./";
import { LoginFormData, AuthFormErrors } from "@/types";

const LoginForm: React.FC = () => {
	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});
	const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const { login, error } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const validateForm = (data: LoginFormData): AuthFormErrors => {
		const errors: AuthFormErrors = {};

		if (!data.email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
			errors.email = "Email is invalid";
		}

		if (!data.password) {
			errors.password = "Password is required";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			setIsSubmitting(true);
			try {
				await login(formData);
				navigate("/dashboard");
			} catch (error) {
				console.error("Login error:", error);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

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
					placeholder="Enter your password"
					disabled={isSubmitting}
					showPasswordToggle={true}
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
							Logging in...
						</div>
					) : (
						"Log In"
					)}
				</Button>
			</form>

			<div className="mt-8 text-center">
				<p className="ym-text-secondary">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="ym-text-yellow-600 hover:ym-text-yellow-700 font-medium transition-colors hover:underline"
					>
						Register here
					</Link>
				</p>
			</div>

			<SocialLogin />
		</div>
	);
};

export default LoginForm;
