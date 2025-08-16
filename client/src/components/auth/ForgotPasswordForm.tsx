import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FormInput, Button } from "../common";
import { ForgotPasswordFormData, AuthFormErrors } from "@/types";
import axios, { isAxiosError } from "axios";
import { ClockIcon } from "@heroicons/react/24/outline";

const ForgotPasswordForm: React.FC = () => {
	const [formData, setFormData] = useState<ForgotPasswordFormData>({
		email: "",
	});
	const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
	const [remainingTime, setRemainingTime] = useState<string>("");

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
		if (isRateLimited) {
			setIsRateLimited(false);
			setRemainingTime("");
		}
	};

	const validateForm = (data: ForgotPasswordFormData): AuthFormErrors => {
		const errors: AuthFormErrors = {};

		if (!data.email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
			errors.email = "Email is invalid";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		const errors = validateForm(formData);
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			setIsSubmitting(true);
			try {
				const response = await axios.post("/auth/forgot-password", formData);

				if (response.data.success) {
					setSuccess(true);
					setFormData({ email: "" });
				}
			} catch (error: unknown) {
				console.error("Forgot password error:", error);

				if (isAxiosError(error) && error.response?.status === 429) {
					// Rate limiting error
					const remainingTimeMsg = error.response?.data?.remainingTime || "15 minutes";
					setIsRateLimited(true);
					setRemainingTime(remainingTimeMsg);
					setError(error.response?.data?.message || "Too many requests. Please try again later.");
				} else {
					// Regular error
					const errorMessage = isAxiosError(error)
						? error.response?.data?.message ||
						  error.response?.data?.errors?.[0]?.msg ||
						  "Something went wrong. Please try again."
						: "Something went wrong. Please try again.";
					setError(errorMessage);
				}
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	if (success) {
		return (
			<div className="p-8 text-center">
				<div className="mb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
						<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
					</div>
					<h3 className="text-xl font-semibold ym-text-primary mb-2">Check your email</h3>
				</div>

				<div className="space-y-4">
					<p className="text-sm ym-text-muted">
						Didn't receive the email? Check your spam folder or try again.
					</p>

					<Button
						type="button"
						className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
						onClick={() => {
							setSuccess(false);
							setFormData({ email: "" });
						}}
					>
						Try Again
					</Button>

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
				<div
					className={`ym-bg-card border px-4 py-3 rounded-lg mb-6 ${
						isRateLimited
							? "border-orange-400 bg-orange-50/80 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
							: "border-red-400 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400"
					}`}
				>
					<div className="flex items-center">
						<div
							className={`w-1 h-4 rounded-full mr-3 ${isRateLimited ? "bg-orange-500" : "bg-red-500"}`}
						></div>
						<div className="flex-1">
							{error}
							{isRateLimited && remainingTime && (
								<div className="mt-2 text-sm">
									<div className="flex items-center space-x-2">
										<ClockIcon className="w-4 h-4" />
										<span>
											Try again in: <strong>{remainingTime}</strong>
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<div className="mb-8 text-center">
				<h3 className="text-xl font-semibold ym-text-primary mb-2">Forgot your password?</h3>
				<p className="ym-text-secondary text-sm leading-relaxed">
					No worries! Enter your email address and we'll send you a link to reset your password.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<FormInput
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					label="Email Address"
					error={formErrors.email}
					placeholder="your.email@example.com"
					disabled={isSubmitting}
				/>

				<Button
					type="submit"
					className="w-full py-3 text-base font-medium"
					disabled={isSubmitting || isRateLimited}
				>
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
							Sending...
						</div>
					) : isRateLimited ? (
						`Try again in ${remainingTime}`
					) : (
						"Send Reset Link"
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

export default ForgotPasswordForm;
