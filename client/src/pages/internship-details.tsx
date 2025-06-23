import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosResponse } from 'axios';
import { formatDate } from '../utils/formatDate';
import { Tabs, MsgAlert } from '../components/common';
import {
	InternshipDetailsData,
	InternshipApplicationResponse,
	InternshipSaveResponse,
	UserInternshipsResponse,
} from '@/types';

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
	const [activeTab, setActiveTab] = useState<string>('details');

	// Check for application success from URL query
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		if (queryParams.get('applied') === 'true') {
			setSuccessMessage(
				'You have successfully applied for this internship. You earned 15 XP for applying. Keep it up!'
			);
			// Clear the URL parameter without refreshing the page
			const newUrl = window.location.pathname;
			window.history.replaceState({}, '', newUrl);
		}
	}, [location.search]);

	// Fetch internship details
	useEffect(() => {
		const fetchInternshipDetails = async () => {
			if (!id) return;

			setLoading(true);
			try {
				const response: AxiosResponse<{ success: boolean; internship: InternshipDetailsData }> =
					await axios.get(`/internships/${id}`);
				setInternship(response.data.internship || null);

				// If user is authenticated, check if they've saved or applied for this internship
				if (isAuthenticated) {
					try {
						const userInternshipsResponse: AxiosResponse<UserInternshipsResponse> = await axios.get(
							'/user/internships'
						);

						// Check if internship is saved
						const internshipIsSaved = userInternshipsResponse.data.savedInternships?.some(
							(savedInternship) => savedInternship.id === id
						);
						setIsSaved(internshipIsSaved || false);

						// Check if internship is applied
						const internshipIsApplied = userInternshipsResponse.data.internships?.some(
							(appliedInternship) => appliedInternship.id === id
						);
						setIsApplied(internshipIsApplied || false);
					} catch (userDataError) {
						// Silently handle the case where user internships endpoint doesn't exist
						console.log('User internships data not available \n', userDataError);
						setIsSaved(false);
						setIsApplied(false);
					}
				}
			} catch (error) {
				console.error('Error fetching internship details:', error);
				setError('Failed to load internship details. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchInternshipDetails();
	}, [id, isAuthenticated]);

	// Handle saving/unsaving internship
	const handleSaveInternship = async () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: `/internship/${id}` } });
			return;
		}

		if (!id) return;

		try {
			const response: AxiosResponse<InternshipSaveResponse> = await axios.post(`/internships/${id}/save`);
			setIsSaved(response.data.isSaved);
		} catch (error) {
			console.error('Error saving internship:', error);
			setError('Failed to save internship. Please try again.');
		}
	};

	// Handle application
	const handleApply = async () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: `/internship/${id}` } });
			return;
		}

		if (!id) return;

		setApplicationError(null);

		try {
			const response: AxiosResponse<InternshipApplicationResponse> = await axios.post(`/internships/${id}/apply`);
			setIsApplied(true);
			setSuccessMessage(
				`Application successful! You have successfully applied for this internship.${
					response.data.xp ? ` You earned ${response.data.xp} XP for applying. Keep it up!` : ''
				}`
			);
			setApplicationError(null);
		} catch (error: any) {
			console.error('Error applying for internship:', error);
			setApplicationError(error.response?.data?.message || 'Failed to apply. Please try again.');
		}
	};

	// Generate WhatsApp share link
	const generateWhatsAppLink = (): string => {
		if (!internship) return '#';

		const startDate = formatDate(internship.startDate);
		const shareText = `Check out this internship: "${internship.title}" at ${internship.company.name}. Starts ${startDate}. Apply here: ${window.location.href}`;

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

	// Format compensation display
	const formatCompensation = (): string => {
		if (!internship) return '';
		
		if (!internship.compensation) {
			return 'Not specified';
		}
		
		// Handle new compensation object structure
		if (typeof internship.compensation === 'object') {
			const { type, amount, currency } = internship.compensation;
			
			if (type === 'Unpaid') {
				return 'Unpaid';
			}
			if (type === 'Certificate') {
				return 'Certificate Only';
			}
			if (type === 'Experience') {
				return 'Experience Letter';
			}
			if ((type === 'Paid' || type === 'Stipend') && amount) {
				const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
				return `${currencySymbol}${amount}/month`;
			}
			return type;
		}
		
		// Handle legacy string format for backward compatibility
		if (internship.compensation === 'Unpaid') {
			return 'Unpaid';
		}
		if (internship.compensation === 'Paid' && internship.stipend) {
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
						style={{ borderTopColor: 'var(--ring)' }}
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
					<span className="block sm:inline"> {error || 'Internship not found'}</span>
					<button
						onClick={() => navigate('/internship-discover')}
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
								src={internship.logo || 'https://via.placeholder.com/400x300?text=Company+Logo'}
								alt={internship.company.name}
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
									Apply Now
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
										? 'ym-bg-amber-100 ym-text-yellow-700'
										: 'ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card'
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
									<p className="ym-text-secondary mb-3">{internship.shortDescription}</p>
									<p className="text-lg font-semibold ym-text-primary mb-3">
										{internship.company.name}
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
									{internship.location.type === 'remote'
										? 'Remote'
										: internship.location.type === 'hybrid'
										? 'Hybrid'
										: 'On-site'}
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
									Apply Now
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
										? 'ym-bg-amber-100 ym-text-yellow-700'
										: 'ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card'
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
									{internship.location.type === 'remote'
										? 'Remote'
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
											? 'text-red-600'
											: getDaysRemaining() <= 7
											? 'text-orange-600'
											: 'ym-text-secondary'
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
						</div>

						{/* Tabs for detailed information */}
						<Tabs
							activeTab={activeTab}
							onTabChange={setActiveTab}
							tabs={[
								{
									id: 'details',
									label: 'Details',
									content: (
										<div className="space-y-6">
											{/* Description */}
											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-3">
													About this Internship
												</h3>
												<div className="ym-text-secondary prose prose-sm max-w-none">
													<p>{internship.description}</p>
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
									id: 'company',
									label: 'Company',
									content: (
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-3">
													About {internship.company.name}
												</h3>
												<div className="ym-text-secondary">
													{internship.company.description ||
														'Company information not available.'}
												</div>
											</div>

											{internship.company.website && (
												<div>
													<h4 className="font-semibold ym-text-primary mb-2">Website</h4>
													<a
														href={internship.company.website}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:text-blue-800 underline"
													>
														{internship.company.website}
													</a>
												</div>
											)}
										</div>
									),
								},
								{
									id: 'share',
									label: 'Share',
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
														setSuccessMessage('Link copied to clipboard!');
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
 