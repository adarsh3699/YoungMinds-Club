import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput, Button } from "../common";
import { ResetPasswordFormData, AuthFormErrors } from "@/types";
import { isAxiosError } from "axios";

const ResetPasswordForm: React.FC = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") || "";

	const [formData, setFormData] = useState<ResetPasswordFormData>({
		password: "",
		confirmPassword: "",
	});
	const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const { resetPassword } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
		// Clear errors when user starts typing
		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: "",
			});
		}
		if (error) setError("");
	};

	const validateForm = (data: ResetPasswordFormData): AuthFormErrors => {
		const errors: AuthFormErrors = {};

		if (!data.password) {
			errors.password = "Password is required";
		} else if (data.password.length < 8) {
			errors.password = "Password must be at least 8 characters long";
		}

		if (!data.confirmPassword) {
			errors.confirmPassword = "Please confirm your password";
		} else if (data.password !== data.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setError("");

		if (!token) {
			setError("Invalid or missing reset token. Please request a new password reset.");
			return;
		}

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			setIsSubmitting(true);
			try {
				await resetPassword({
					token,
					password: formData.password,
				});
				navigate("/dashboard");
			} catch (error: unknown) {
				console.error("Reset password error:", error);
				const errorMessage = isAxiosError(error)
					? error.response?.data?.message ||
					  error.response?.data?.errors?.[0]?.msg ||
					  "Failed to reset password. Please try again."
					: "Failed to reset password. Please try again.";
				setError(errorMessage);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	// If no token, show error state
	if (!token) {
		return (
			<div className="p-8 text-center">
				<div className="mb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							></path>
						</svg>
					</div>
					<h3 className="text-xl font-semibold ym-text-primary mb-2">Invalid Reset Link</h3>
					<p className="ym-text-secondary leading-relaxed mb-6">
						This password reset link is invalid or has expired. Please request a new password reset.
					</p>
				</div>

				<div className="space-y-4">
					<Link to="/forgot-password">
						<Button className="w-full">Request New Reset Link</Button>
					</Link>

					<Link
						to="/login"
						className="block text-center ym-text-yellow-600 hover:ym-text-yellow-700 font-medium transition-colors hover:underline"
					>
						Back to Login
					</Link>
				</div>
			</div>
		);
	}

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

			<div className="mb-8 text-center">
				<h3 className="text-xl font-semibold ym-text-primary mb-2">Set Your Password</h3>
				<p className="ym-text-secondary text-sm leading-relaxed">
					Enter your new password below. Make sure it's strong and secure.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<FormInput
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					label="New Password"
					error={formErrors.password}
					placeholder="Enter your new password"
					disabled={isSubmitting}
					showPasswordToggle={true}
				/>

				<FormInput
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					label="Confirm New Password"
					error={formErrors.confirmPassword}
					placeholder="Confirm your new password"
					disabled={isSubmitting}
					showPasswordToggle={true}
				/>

				<div className="text-sm ym-text-muted">
					<p className="mb-2">Your password should:</p>
					<ul className="list-disc list-inside space-y-1 text-xs">
						<li>Be at least 8 characters long</li>
						<li>Include a mix of letters, numbers, and symbols</li>
						<li>Be unique and not used elsewhere</li>
					</ul>
				</div>

				<Button type="submit" className="w-full py-3 text-base font-medium" disabled={isSubmitting}>
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
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Setting Password...
						</div>
					) : (
						"Set Password"
					)}
				</Button>
			</form>

			<div className="mt-8 text-center">
				<p className="ym-text-secondary text-sm">
					Remember your password?{" "}
					<Link
						to="/login"
						className="ym-text-yellow-600 hover:ym-text-yellow-700 font-medium transition-colors hover:underline"
					>
						Back to Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ResetPasswordForm;
