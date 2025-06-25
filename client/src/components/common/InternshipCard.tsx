import { useState, useEffect, useMemo } from "react";
import {
	ClockIcon,
	BookmarkIcon,
	BuildingOfficeIcon,
	BanknotesIcon,
	ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { InternshipCardData } from "@/types";

// Function to calculate countdown for application deadline
const useCountdown = (targetDate: string) => {
	const [countdown, setCountdown] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		if (!targetDate) return undefined;

		const deadline = new Date(targetDate);

		// Check if deadline is valid
		if (isNaN(deadline.getTime())) {
			return undefined;
		}

		const updateCountdown = () => {
			const now = new Date();
			const difference = deadline.getTime() - now.getTime();

			if (difference <= 0) {
				setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				return;
			}

			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			setCountdown({ days, hours, minutes, seconds });
		};

		// Initial update
		updateCountdown();

		// Set up interval only if deadline is in the future
		const now = new Date();
		if (deadline.getTime() > now.getTime()) {
			const interval = setInterval(updateCountdown, 1000);
			return () => clearInterval(interval);
		}

		return undefined;
	}, [targetDate]);

	return countdown;
};

interface InternshipCardProps {
	internship: InternshipCardData;
	isFeatured?: boolean;
	isRecruiter?: boolean;
	onManage?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onSaveToggle?: (internshipId: string) => void;
}

const InternshipCard = ({ internship, isRecruiter = false, onManage, onEdit, onSaveToggle }: InternshipCardProps) => {
	const [isSaved, setIsSaved] = useState(internship.isSaved || false);

	// Get countdown for application deadline
	const countdown = useCountdown(internship.applicationDeadline);

	// Handle bookmark toggle
	const handleSaveToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsSaved(!isSaved);

		if (onSaveToggle) {
			onSaveToggle(internship.id || internship._id || "");
		}
	};

	// Memoized compensation formatting
	const formatCompensation = useMemo(() => {
		if (!internship.compensation) {
			return "Unpaid";
		}

		// Handle new compensation object structure
		if (typeof internship.compensation === "object") {
			const { type, amount, currency } = internship.compensation;

			if (type === "Unpaid") {
				return "Unpaid";
			}
			if (type === "Certificate") {
				return "Certificate Only";
			}
			if (type === "Experience") {
				return "Experience Letter";
			}
			if ((type === "Paid" || type === "Stipend") && amount) {
				const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
				return `${currencySymbol} ${amount.toLocaleString()}`;
			}
			return type;
		}

		// Handle legacy string format for backward compatibility
		if (internship.compensation === "Unpaid") {
			return "Unpaid";
		}
		if (internship.compensation === "Paid" && internship.stipend) {
			return `₹ ${internship.stipend.toLocaleString()}`;
		}
		return String(internship.compensation);
	}, [internship.compensation, internship.stipend]);

	// Memoized deadline check
	const isDeadlinePast = useMemo(() => {
		return new Date(internship.applicationDeadline) < new Date();
	}, [internship.applicationDeadline]);

	// Memoized location display
	const getLocationDisplay = useMemo(() => {
		console.log(internship);
		switch (internship.location?.type) {
			case "remote":
				return "Work from home";
			case "on-site":
				return internship.location?.city || "Location not specified";
			case "hybrid":
				return `Hybrid${internship.location?.city ? ` • ${internship.location.city}` : ""}`;
			default:
				return internship.location?.city || "Location not specified";
		}
	}, [internship.location?.type, internship.location?.city]);

	// Memoized posting time calculation
	const postingTimeInfo = useMemo(() => {
		const extendedInternship = internship as InternshipCardData & { createdAt?: string; postedAt?: string };
		const postedDate =
			extendedInternship.createdAt || extendedInternship.postedAt || internship.applicationDeadline;

		if (!postedDate) return { display: null, isToday: false, isRecent: false };

		const posted = new Date(postedDate);
		const now = new Date();
		const diffMs = now.getTime() - posted.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		// Check if posted today
		const isToday = posted.toDateString() === now.toDateString();

		let display = null;
		let isRecent = false;

		if (diffHours < 1) {
			display = "Just now";
			isRecent = true;
		} else if (diffHours < 24 && isToday) {
			if (diffHours < 6) {
				display = "Few hours ago";
			} else {
				display = "Today";
			}
			isRecent = true;
		} else if (diffDays === 1) {
			display = "1 day ago";
		} else if (diffDays < 7) {
			display = `${diffDays} days ago`;
		}

		return { display, isToday, isRecent };
	}, [internship.applicationDeadline]);

	// Memoize the actively hiring status to prevent unnecessary recalculations
	const isActivelyHiring = useMemo(() => {
		// Don't show if deadline is very close (less than 7 days) - indicates urgency/desperation
		if ((countdown.days < 7 && countdown.days > 0) || countdown.days === 0) {
			return false;
		}

		// Don't show if deadline has passed
		if (isDeadlinePast) {
			return false;
		}

		// Check multiple factors for high activity and trust
		const factors = {
			// Recently posted (within last 3 days)
			recentlyPosted: postingTimeInfo.isRecent,

			// Good application timeline (deadline more than 7 days away)
			goodTimeline: countdown.days >= 7,

			// Not too many applications yet (suggests they're being selective)
			selectiveHiring: internship.applicationCount < 50,

			// Has complete company profile (name and logo)
			hasCompleteProfile: !!(
				internship.company?.name &&
				internship.company.name !== "Company Name" &&
				(internship.logo || internship.companyLogo)
			),

			// Has proper compensation structure
			hasCompensation: !!(internship.compensation && formatCompensation !== "Unpaid"),

			// Reasonable duration (not too short or too long)
			reasonableDuration: internship.duration && !internship.duration.toLowerCase().includes("week"),
		};

		// Count positive factors
		const positiveFactors = Object.values(factors).filter(Boolean).length;

		// Show "Actively hiring" if at least 3 out of 6 factors are positive
		return positiveFactors >= 3;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		countdown.days,
		internship.applicationCount,
		internship.company?.name,
		internship.logo,
		internship.companyLogo,
		internship.compensation,
		internship.duration,
		internship.applicationDeadline,
	]);

	// Memoized format duration for display
	const formatDuration = useMemo(() => {
		if (!internship.duration) return "";

		// Convert duration to a more readable format
		const duration = internship.duration.toLowerCase();
		if (duration.includes("month")) {
			const months = parseInt(duration);
			return months === 1 ? "1 Month" : `${months} Months`;
		}
		return internship.duration;
	}, [internship.duration]);

	return (
		<div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden w-full">
			<Link to={`/internship/${internship.id || internship._id}`} className="block">
				<div className="p-6">
					{/* Header Section - Horizontal Layout */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1 min-w-0">
							{/* Title */}
							<div className="flex items-center gap-3 mb-2">
								<h3 className="text-xl font-semibold text-gray-900 truncate">{internship.title}</h3>
							</div>

							{/* Company Name with Actively Hiring Badge */}
							<div className="flex items-center gap-3 mb-4">
								<p className="text-gray-600 font-medium text-lg">
									{internship.company?.name || "Company Name"}
								</p>
								{isActivelyHiring && (
									<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
										Actively hiring
									</span>
								)}
							</div>

							{/* Details Section - Horizontal Layout */}
							<div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mb-4">
								{/* Location */}
								<div className="flex items-center gap-2">
									<ComputerDesktopIcon className="h-4 w-4 flex-shrink-0" />
									<span>{getLocationDisplay}</span>
								</div>

								{/* Compensation */}
								{formatCompensation !== "Unpaid" && (
									<div className="flex items-center gap-2">
										<BanknotesIcon className="h-4 w-4 flex-shrink-0" />
										<span className="font-medium">{formatCompensation}/month</span>
									</div>
								)}

								{/* Duration */}
								{formatDuration && (
									<div className="flex items-center gap-2">
										<ClockIcon className="h-4 w-4 flex-shrink-0" />
										<span>{formatDuration}</span>
									</div>
								)}
							</div>

							{/* Status and Badges Section */}
							<div className="flex items-center flex-wrap gap-4">
								{/* Posted Time */}
								{postingTimeInfo.display && (
									<div className="flex items-center gap-2 text-green-600 text-sm">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="font-medium">{postingTimeInfo.display}</span>
									</div>
								)}

								{/* Early Applicant Badge - Only for today posted internships */}
								{postingTimeInfo.isToday && internship.applicationCount < 10 && (
									<div className="flex items-center gap-2 text-orange-600 text-sm">
										<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
										<span className="font-medium">Be an early applicant</span>
									</div>
								)}

								{/* Part Time Badge */}
								{internship.tags && internship.tags.includes("part-time") && (
									<span className="text-gray-500 text-sm">• Part time</span>
								)}

								{/* Special Offers */}
								{internship.tags &&
									internship.tags.some((tag) => tag.toLowerCase().includes("job offer")) && (
										<div className="flex items-center gap-2 text-orange-600 text-sm">
											<BuildingOfficeIcon className="h-4 w-4 flex-shrink-0" />
											<span className="font-medium">Job offer upto ₹ 6LPA post internship</span>
										</div>
									)}
							</div>
						</div>

						{/* Right Side - Logo and Actions */}
						<div className="flex items-start gap-3 ml-6 flex-shrink-0">
							{/* Save Button */}
							{onSaveToggle && (
								<button
									onClick={handleSaveToggle}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									{isSaved ? (
										<BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
									) : (
										<BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-blue-600" />
									)}
								</button>
							)}

							{/* Company Logo */}
							<div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
								<img
									src={
										internship.logo ||
										internship.companyLogo ||
										"https://via.placeholder.com/64x64?text=Logo"
									}
									alt={internship.company?.name || "Company"}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</div>

					{/* Quick Actions for Recruiters */}
					{isRecruiter && (
						<div className="flex gap-3 pt-4 border-t border-gray-100">
							{onEdit && (
								<button
									onClick={(e) => {
										e.preventDefault();
										onEdit();
									}}
									className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
								>
									Edit
								</button>
							)}
							{onManage && (
								<button
									onClick={(e) => {
										e.preventDefault();
										onManage();
									}}
									className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
								>
									Manage
								</button>
							)}
						</div>
					)}

					{/* Deadline Warning for Urgent Applications */}
					{!isRecruiter && countdown.days <= 3 && countdown.days > 0 && (
						<div className="mt-4 pt-4 border-t border-gray-100">
							<div className="flex items-center gap-2 text-red-600 text-sm">
								<ClockIcon className="h-4 w-4" />
								<span className="font-medium">
									Application deadline in {countdown.days} day{countdown.days !== 1 ? "s" : ""}
								</span>
							</div>
						</div>
					)}
				</div>
			</Link>
		</div>
	);
};

export default InternshipCard;
