import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios, { AxiosResponse } from "axios";
import { formatDate } from "../utils/formatDate";
import { Tabs, MsgAlert } from "../components/common";
import {
	InternshipDetailsData,
	InternshipApplicationResponse,
	InternshipSaveResponse,
	InternshipDetailsResponse,
} from "@/types";

const InternshipDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated } = useAuth();

	const [internship, setInternship] = useState<InternshipDetailsData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaved, setIsSaved] = useState<boolean>(false);
	const [isApplied, setIsApplied] = useState<boolean>(false);
	const [applicationError, setApplicationError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>("details");

	// Check for application success from URL query
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		if (queryParams.get("applied") === "true") {
			setSuccessMessage(
				"You have successfully applied for this internship. You earned 15 XP for applying. Keep it up!"
			);
			// Clear the URL parameter without refreshing the page
			const newUrl = window.location.pathname;
			window.history.replaceState({}, "", newUrl);
		}
	}, [location.search]);

	// Fetch internship details
	useEffect(() => {
		const fetchInternshipDetails = async () => {
			if (!id) return;

			setLoading(true);
			try {
				const response: AxiosResponse<InternshipDetailsResponse> = await axios.get(`/internships/${id}`);
				setInternship(response.data.internship || null);

				// Set user status from the response (if authenticated)
				if (response.data.userStatus) {
					setIsSaved(response.data.userStatus.isSaved);
					setIsApplied(response.data.userStatus.isApplied);
				} else {
					// Reset status if not authenticated
					setIsSaved(false);
					setIsApplied(false);
				}
			} catch (error) {
				console.error("Error fetching internship details:", error);
				setError("Failed to load internship details. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchInternshipDetails();
	}, [id, isAuthenticated]);

	// Handle saving/unsaving internship
	const handleSaveInternship = async () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { from: `/internship/${id}` } });
			return;
		}

		if (!id) return;

		try {
			const response: AxiosResponse<InternshipSaveResponse> = await axios.post(`/internships/${id}/save`);
			setIsSaved(response.data.isSaved);
		} catch (error) {
			console.error("Error saving internship:", error);
			setError("Failed to save internship. Please try again.");
		}
	};

	// Handle application
	const handleApply = async () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { from: `/internship/${id}` } });
			return;
		}

		if (!id) return;

		// Check if there's a third-party registration link
		if (internship?.thirdPartyRegistrationLink) {
			// Redirect to the external registration link
			window.open(internship.thirdPartyRegistrationLink, "_blank", "noopener,noreferrer");
			return;
		}

		setApplicationError(null);

		try {
			const response: AxiosResponse<InternshipApplicationResponse> = await axios.post(`/internships/${id}/apply`);
			setIsApplied(true);
			setSuccessMessage(
				`Application successful! You have successfully applied for this internship.${
					response.data.xp ? ` You earned ${response.data.xp} XP for applying. Keep it up!` : ""
				}`
			);
			setApplicationError(null);
		} catch (error: unknown) {
			console.error("Error applying for internship:", error);
			const axiosError = error as { response?: { data?: { message?: string } } };
			setApplicationError(axiosError.response?.data?.message || "Failed to apply. Please try again.");
		}
	};

	// Generate WhatsApp share link
	const generateWhatsAppLink = (): string => {
		if (!internship) return "#";

		const startDate = formatDate(internship.startDate);
		const shareText = `Check out this internship: "${internship.title}" at ${
			internship.companyName || internship.company?.name || "this company"
		}. Starts ${startDate}. Apply here: ${window.location.href}`;

		return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
	};

	// Check if application deadline has passed
	const isDeadlinePast = (): boolean => {
		if (!internship) return false;
		return new Date(internship.applicationDeadline) < new Date();
	};

	// Calculate days remaining for application
	const getDaysRemaining = (): number => {
		if (!internship) return 0;
		const deadline = new Date(internship.applicationDeadline);
		const now = new Date();
		const diffTime = deadline.getTime() - now.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	// Get apply button text based on application type
	const getApplyButtonText = (): string => {
		if (internship?.thirdPartyRegistrationLink) {
			return "Apply Externally";
		}
		return "Apply Now";
	};

	// Check if this is an external application
	const isExternalApplication = (): boolean => {
		return !!internship?.thirdPartyRegistrationLink;
	};

	// Format compensation display
	const formatCompensation = (): string => {
		if (!internship) return "";

		if (!internship.compensation) {
			return "Not specified";
		}

		// Handle new compensation object structure
		if (typeof internship.compensation === "object") {
			const { type, amount, currency } = internship.compensation;

			if (type === "Unpaid") {
				return "Unpaid";
			}
			if (type === "Paid" && amount) {
				const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
				return `${currencySymbol}${amount}/month`;
			}
			return type;
		}

		// Handle legacy string format for backward compatibility
		if (internship.compensation === "Unpaid") {
			return "Unpaid";
		}
		if (internship.compensation === "Paid" && internship.stipend) {
			return `₹${internship.stipend}/month`;
		}
		return String(internship.compensation);
	};

	// Show loading state
	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="flex flex-col items-center justify-center h-64">
					<div
						className="w-12 h-12 border-t-4 border-solid rounded-full animate-spin mb-4"
						style={{ borderTopColor: "var(--ring)" }}
					></div>
					<h2 className="text-xl font-semibold ym-text-secondary">Loading internship details...</h2>
				</div>
			</div>
		);
	}

	// Show error state
	if (error || !internship) {
		return (
			<div className="container mx-auto px-4 py-12 mt-6">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> {error || "Internship not found"}</span>
					<button
						onClick={() => navigate("/internship-discover")}
						className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
					>
						Back to Internships
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-features-bg">
			{/* Message Alerts */}
			<MsgAlert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
			<MsgAlert message={applicationError} type="error" onClose={() => setApplicationError(null)} />
			<MsgAlert message={error} type="error" onClose={() => setError(null)} />

			{/* Draft/Flagged Internship Notice */}
			{internship && (!internship.isPublished || internship.isFlagged) && (
				<div className="bg-warning-10 border-l-4 border-warning p-4 mb-6">
					<div className="container mx-auto px-4">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg className="h-5 w-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-warning">
									{!internship.isPublished && (
										<span className="font-medium">
											This is a draft internship and is not visible to the public.
										</span>
									)}
									{internship.isFlagged && (
										<span className="font-medium">
											This internship has been flagged by administrators.
											{internship.flagReason && ` Reason: ${internship.flagReason}`}
										</span>
									)}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="container mx-auto px-4 py-12 mt-12">
				<div className="flex flex-col md:flex-row gap-8 mb-40">
					{/* Company Logo */}
					<div className="md:w-1/2 lg:w-2/5">
						<div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
							<img
								src={internship.logo || "https://via.placeholder.com/400x300?text=Company+Logo"}
								alt={internship.companyName || internship.company?.name || "Company Logo"}
								className="w-full h-auto object-cover"
							/>
						</div>

						{/* Deadline Warning */}
						{!isDeadlinePast() && getDaysRemaining() <= 7 && (
							<div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
								<div className="flex items-center">
									<svg
										className="h-5 w-5 text-orange-500 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="text-sm font-medium text-orange-700">
										Only {getDaysRemaining()} days left to apply!
									</span>
								</div>
							</div>
						)}

						{/* Action Buttons (Mobile) */}
						<div className="mt-6 flex flex-col gap-3 md:hidden">
							{!isApplied && !isDeadlinePast() ? (
								<button
									onClick={handleApply}
									className="w-full gradient-bg text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
								>
									{getApplyButtonText()}
									{isExternalApplication() && (
										<svg
											className="ml-2 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									)}
								</button>
							) : isApplied ? (
								<button
									disabled
									className="w-full ym-bg-success text-white py-3 px-4 rounded-lg font-medium cursor-default flex items-center justify-center"
								>
									✓ Applied
								</button>
							) : (
								<button
									disabled
									className="w-full ym-bg-muted ym-text-muted py-3 px-4 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
								>
									Application Closed
								</button>
							)}

							<button
								onClick={handleSaveInternship}
								className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
									isSaved
										? "ym-bg-amber-100 ym-text-yellow-700"
										: "ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card"
								}`}
							>
								{isSaved ? (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
										</svg>
										Saved
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
											/>
										</svg>
										Save Internship
									</>
								)}
							</button>
						</div>
					</div>

					{/* Internship Details */}
					<div className="md:w-1/2 lg:w-3/5">
						<div className="mb-4">
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-2xl md:text-3xl font-bold ym-text-primary mb-2">
										{internship.title}
									</h1>
									<p className="ym-text-secondary mb-3">{internship.companyDescription}</p>
									<p className="text-lg font-semibold ym-text-primary mb-3">
										{internship.companyName ||
											internship.company?.name ||
											"Company Name Not Available"}
									</p>
								</div>

								<div className="text-right">
									<span className="ym-bg-success text-white text-lg font-semibold rounded-lg py-1 px-3 block mb-2">
										{formatCompensation()}
									</span>
									<span className="text-sm ym-text-muted">{internship.duration}</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 mb-6">
								<span className="ym-bg-amber-100 ym-text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded">
									{internship.category}
								</span>
								<span className="ym-bg-orange-400 text-white text-xs font-medium px-2.5 py-0.5 rounded">
									{internship.type}
								</span>
								<span className="ym-bg-blue-100 ym-text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">
									{internship.location.type === "remote"
										? "Remote"
										: internship.location.type === "hybrid"
										? "Hybrid"
										: "On-site"}
								</span>
								{internship.tags &&
									internship.tags.map((tag, index) => (
										<span
											key={index}
											className="ym-bg-card ym-text-card text-xs font-medium px-2.5 py-0.5 rounded border ym-border-card"
										>
											{tag}
										</span>
									))}
							</div>
						</div>

						{/* Action Buttons (Desktop) */}
						<div className="hidden mb-8 md:flex gap-3">
							{!isApplied && !isDeadlinePast() ? (
								<button
									onClick={handleApply}
									className="gradient-bg text-white py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center"
								>
									{getApplyButtonText()}
									{isExternalApplication() && (
										<svg
											className="ml-2 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									)}
								</button>
							) : isApplied ? (
								<button
									disabled
									className="ym-bg-success text-white py-2 px-6 rounded-lg font-medium cursor-default flex items-center"
								>
									✓ Applied
								</button>
							) : (
								<button
									disabled
									className="ym-bg-muted ym-text-muted py-2 px-6 rounded-lg font-medium cursor-not-allowed flex items-center"
								>
									Application Closed
								</button>
							)}

							<button
								onClick={handleSaveInternship}
								className={`flex items-center py-2 px-6 rounded-lg font-medium transition-all duration-300 ${
									isSaved
										? "ym-bg-amber-100 ym-text-yellow-700"
										: "ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card"
								}`}
							>
								{isSaved ? (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
										</svg>
										Saved
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
											/>
										</svg>
										Save Internship
									</>
								)}
							</button>
						</div>

						{/* Internship Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">📅 Duration</h3>
								<p className="ym-text-secondary text-sm">{internship.duration}</p>
							</div>

							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">📍 Location</h3>
								<p className="ym-text-secondary text-sm">
									{internship.location.type === "remote"
										? "Remote"
										: `${internship.location.city}, ${internship.location.state}`}
								</p>
							</div>

							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">📅 Start Date</h3>
								<p className="ym-text-secondary text-sm">{formatDate(internship.startDate)}</p>
							</div>

							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">⏰ Apply By</h3>
								<p
									className={`text-sm font-medium ${
										isDeadlinePast()
											? "text-red-600"
											: getDaysRemaining() <= 7
											? "text-orange-600"
											: "ym-text-secondary"
									}`}
								>
									{formatDate(internship.applicationDeadline)}
									{!isDeadlinePast() && (
										<span className="block text-xs ym-text-muted">
											{getDaysRemaining()} days remaining
										</span>
									)}
								</p>
							</div>

							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">👥 Applications</h3>
								<p className="ym-text-secondary text-sm">{internship.applicationCount} applications</p>
							</div>

							<div className="ym-bg-card border ym-border-card rounded-lg p-4">
								<h3 className="font-semibold ym-text-primary mb-2">💰 Compensation</h3>
								<p className="ym-text-secondary text-sm">{formatCompensation()}</p>
							</div>

							{/* External Application Indicator */}
							{isExternalApplication() && (
								<div className="ym-bg-blue-50 border border-blue-200 rounded-lg p-4 md:col-span-2">
									<div className="flex items-center gap-2 mb-2">
										<svg
											className="h-5 w-5 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
										<h3 className="font-semibold text-blue-800">🔗 External Application</h3>
									</div>
									<p className="text-blue-700 text-sm">
										This internship uses an external application system. You'll be redirected to the
										company's website to complete your application.
									</p>
								</div>
							)}
						</div>

						{/* Tabs for detailed information */}
						<Tabs
							activeTab={activeTab}
							onTabChange={setActiveTab}
							tabs={[
								{
									id: "details",
									label: "Details",
									content: (
										<div className="space-y-6">
											{/* Description */}
											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-3">
													About this Internship
												</h3>
												<div className="ym-text-secondary prose prose-sm max-w-none">
													<p>
														{internship.internshipDescription || "No description available"}
													</p>
												</div>
											</div>

											{/* Responsibilities */}
											{internship.responsibilities && internship.responsibilities.length > 0 && (
												<div>
													<h3 className="text-lg font-semibold ym-text-primary mb-3">
														Key Responsibilities
													</h3>
													<ul className="space-y-2">
														{internship.responsibilities.map((responsibility, index) => (
															<li
																key={index}
																className="flex items-start ym-text-secondary"
															>
																<span className="text-green-500 mr-2 mt-1">•</span>
																{responsibility}
															</li>
														))}
													</ul>
												</div>
											)}

											{/* Requirements */}
											{internship.requirements && internship.requirements.length > 0 && (
												<div>
													<h3 className="text-lg font-semibold ym-text-primary mb-3">
														Requirements
													</h3>
													<ul className="space-y-2">
														{internship.requirements.map((requirement, index) => (
															<li
																key={index}
																className="flex items-start ym-text-secondary"
															>
																<span className="text-blue-500 mr-2 mt-1">•</span>
																{requirement}
															</li>
														))}
													</ul>
												</div>
											)}

											{/* Skills */}
											{internship.skills && internship.skills.length > 0 && (
												<div>
													<h3 className="text-lg font-semibold ym-text-primary mb-3">
														Required Skills
													</h3>
													<div className="flex flex-wrap gap-2">
														{internship.skills.map((skill, index) => (
															<span
																key={index}
																className="ym-bg-blue-100 ym-text-blue-700 text-sm px-3 py-1 rounded-full"
															>
																{skill}
															</span>
														))}
													</div>
												</div>
											)}

											{/* Benefits */}
											{internship.benefits && internship.benefits.length > 0 && (
												<div>
													<h3 className="text-lg font-semibold ym-text-primary mb-3">
														Benefits
													</h3>
													<ul className="space-y-2">
														{internship.benefits.map((benefit, index) => (
															<li
																key={index}
																className="flex items-start ym-text-secondary"
															>
																<span className="text-green-500 mr-2 mt-1">✓</span>
																{benefit}
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									),
								},
								{
									id: "company",
									label: "Company",
									content: (
										<div className="space-y-6">
											{/* Company Header with Logo */}
											<div className="flex items-start gap-4">
												{/* Company Logo */}
												{(internship.organizerId?.organizerBrandLogo || internship.logo) && (
													<div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
														<img
															src={
																internship.organizerId?.organizerBrandLogo ||
																internship.logo
															}
															alt="Company Logo"
															className="w-full h-full object-cover"
														/>
													</div>
												)}

												{/* Company Info */}
												<div className="flex-1">
													<h3 className="text-xl font-bold ym-text-primary">
														{internship.organizerId?.organizationName ||
															internship.companyName ||
															"Company Name"}
													</h3>
												</div>
											</div>

											{/* Company Details Grid */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{/* Contact Information */}
												<div className="space-y-4">
													<h4 className="font-semibold ym-text-primary text-lg">
														Contact Information
													</h4>

													{internship.organizerId?.email && (
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
																<svg
																	className="w-4 h-4 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
																	<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
																</svg>
															</div>
															<div>
																<p className="text-sm font-medium ym-text-primary">
																	Email
																</p>
																<a
																	href={`mailto:${internship.organizerId.email}`}
																	className="text-blue-600 hover:text-blue-800 underline text-sm"
																>
																	{internship.organizerId.email}
																</a>
															</div>
														</div>
													)}

													{internship.organizerId?.website && (
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
																<svg
																	className="w-4 h-4 text-green-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<div>
																<p className="text-sm font-medium ym-text-primary">
																	Website
																</p>
																<a
																	href={
																		internship.organizerId.website.startsWith(
																			"http"
																		)
																			? internship.organizerId.website
																			: `https://${internship.organizerId.website}`
																	}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-blue-600 hover:text-blue-800 underline text-sm"
																>
																	{internship.organizerId.website}
																</a>
															</div>
														</div>
													)}
												</div>

												{/* Organization Details */}
												<div className="space-y-4">
													<h4 className="font-semibold ym-text-primary text-lg">
														Organization Details
													</h4>

													{internship.organizerId?.name && (
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
																<svg
																	className="w-4 h-4 text-purple-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<div>
																<p className="text-sm font-medium ym-text-primary">
																	Organizer
																</p>
																<p className="text-sm ym-text-secondary">
																	{internship.organizerId.name}
																</p>
															</div>
														</div>
													)}

													<div className="flex items-center gap-3">
														<div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
															<svg
																className="w-4 h-4 text-indigo-600"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<div>
															<p className="text-sm font-medium ym-text-primary">
																Organization Type
															</p>
															<p className="text-sm ym-text-secondary">
																{internship.organizerId?.organizationName
																	? "Organization"
																	: "Individual"}
															</p>
														</div>
													</div>
												</div>
											</div>

											{/* Social Media Links */}
											{((internship.organizerId?.socialLinks &&
												(internship.organizerId.socialLinks?.linkedin ||
													internship.organizerId.socialLinks?.twitter ||
													internship.organizerId.socialLinks?.instagram ||
													internship.organizerId.socialLinks?.website)) ||
												internship.organizerId?.website) && (
												<div>
													<h4 className="font-semibold ym-text-primary text-lg mb-3">
														Connect with Us
													</h4>
													<div className="flex flex-wrap gap-3">
														{(internship.organizerId?.socialLinks?.website ||
															internship.organizerId?.website) && (
															<a
																href={
																	(
																		internship.organizerId.socialLinks?.website ||
																		internship.organizerId.website
																	)?.startsWith("http")
																		? internship.organizerId.socialLinks?.website ||
																		  internship.organizerId.website
																		: `https://${
																				internship.organizerId.socialLinks
																					?.website ||
																				internship.organizerId.website
																		  }`
																}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
															>
																<svg
																	className="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		fillRule="evenodd"
																		d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
																		clipRule="evenodd"
																	/>
																</svg>
																Website
															</a>
														)}

														{internship.organizerId?.socialLinks?.linkedin && (
															<a
																href={
																	internship.organizerId?.socialLinks?.linkedin?.startsWith(
																		"http"
																	)
																		? internship.organizerId.socialLinks.linkedin
																		: `https://linkedin.com/in/${internship.organizerId?.socialLinks?.linkedin}`
																}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
															>
																<svg
																	className="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
																</svg>
																LinkedIn
															</a>
														)}

														{internship.organizerId?.socialLinks?.twitter && (
															<a
																href={
																	internship.organizerId?.socialLinks?.twitter?.startsWith(
																		"http"
																	)
																		? internship.organizerId?.socialLinks?.twitter
																		: `https://twitter.com/${internship.organizerId?.socialLinks?.twitter}`
																}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium"
															>
																<svg
																	className="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
																</svg>
																Twitter
															</a>
														)}

														{internship.organizerId?.socialLinks?.instagram && (
															<a
																href={
																	internship.organizerId?.socialLinks?.instagram?.startsWith(
																		"http"
																	)
																		? internship.organizerId?.socialLinks?.instagram
																		: `https://instagram.com/${internship.organizerId?.socialLinks?.instagram}`
																}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors text-sm font-medium"
															>
																<svg
																	className="w-4 h-4"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
																</svg>
																Instagram
															</a>
														)}
													</div>
												</div>
											)}

											{/* Additional Company Description */}
											{(internship.companyDescription ||
												internship.organizerId?.description ||
												internship.organizerId?.bio) && (
												<div>
													<h4 className="font-semibold ym-text-primary text-lg mb-3">
														About the Company
													</h4>
													<div className="ym-text-secondary text-sm leading-relaxed">
														{internship.companyDescription ||
															internship.organizerId?.description ||
															internship.organizerId?.bio}
													</div>
												</div>
											)}
										</div>
									),
								},
								{
									id: "share",
									label: "Share",
									content: (
										<div className="space-y-4">
											<h3 className="text-lg font-semibold ym-text-primary mb-4">
												Share this Internship
											</h3>
											<div className="flex flex-col space-y-3">
												<a
													href={generateWhatsAppLink()}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors"
												>
													<svg
														className="w-5 h-5 mr-2"
														fill="currentColor"
														viewBox="0 0 24 24"
													>
														<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
													</svg>
													Share on WhatsApp
												</a>

												<button
													onClick={() => {
														navigator.clipboard.writeText(window.location.href);
														setSuccessMessage("Link copied to clipboard!");
													}}
													className="flex items-center justify-center ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card py-3 px-4 rounded-lg transition-colors"
												>
													<svg
														className="w-5 h-5 mr-2"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
													Copy Link
												</button>
											</div>
										</div>
									),
								},
							]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InternshipDetails;
