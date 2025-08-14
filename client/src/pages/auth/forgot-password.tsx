import React from "react";
import { ForgotPasswordForm } from "../../components/auth";
import { AcademicCapIcon, KeyIcon } from "@heroicons/react/24/outline";

const ForgotPasswordPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			{/* Left side - Image/Brand */}
			<div className="hidden md:flex md:w-1/2 enhanced-hero-bg text-white p-12 flex-col justify-between relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white animate-float"></div>
					<div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-white animate-pulse"></div>
					<div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white animate-bounce"></div>
				</div>

				<div className="relative z-10">
					<div className="flex items-center mb-6">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl mr-4 shadow-lg">
							<AcademicCapIcon className="w-8 h-8 text-amber-600" />
						</div>
						<div>
							<h1 className="text-4xl font-bold contrast-text-white-bold">YoungMinds Club</h1>
							<p className="contrast-text-white text-sm font-medium">Empowering young thinkers</p>
						</div>
					</div>
					<p className="text-xl contrast-text-white leading-relaxed">
						Don't worry, we've all been there. Let's get you back to your account quickly and securely.
					</p>
				</div>

				<div className="space-y-8 relative z-10">
					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<KeyIcon className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Secure Reset</h3>
							<p className="contrast-text-white leading-relaxed">
								We'll send you a secure link to reset your password safely
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<svg
								className="w-6 h-6 text-amber-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								></path>
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Quick & Easy</h3>
							<p className="contrast-text-white leading-relaxed">
								The reset process takes just a few minutes to complete
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<svg
								className="w-6 h-6 text-amber-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Back in Control</h3>
							<p className="contrast-text-white leading-relaxed">
								Once reset, you'll have full access to your account again
							</p>
						</div>
					</div>
				</div>

				{/* Bottom decorative gradient */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
			</div>

			{/* Right side - Forgot Password Form */}
			<div className="flex-1 flex items-start justify-center p-6 ym-features-bg relative">
				{/* Background pattern */}
				<div className="absolute inset-0 auth-pattern-bg opacity-30"></div>

				<div className="w-full max-w-md relative z-10">
					<div className="text-center mb-10">
						<div className="inline-flex items-center justify-center w-16 h-16 ym-bg-amber-400 rounded-xl mb-4 shadow-lg">
							<KeyIcon className="w-8 h-8 text-white" />
						</div>
						<h2 className="text-3xl font-bold ym-text-primary mb-2">Reset Password</h2>
					</div>

					<div className="ym-bg-card rounded-2xl auth-card-shadow backdrop-blur-sm border ym-border-card overflow-hidden">
						{/* Card header with gradient */}
						<div className="h-2 gradient-bg"></div>
						<ForgotPasswordForm />
					</div>

					{/* Mobile brand info */}
					<div className="md:hidden mt-8 text-center">
						<div className="flex items-center justify-center mb-4">
							<div className="ym-bg-amber-400 p-2 rounded-lg mr-3">
								<AcademicCapIcon className="w-5 h-5 text-white" />
							</div>
							<h3 className="text-lg font-bold ym-text-primary">YoungMinds Club</h3>
						</div>
						<p className="text-sm ym-text-muted">Empowering young thinkers worldwide</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
