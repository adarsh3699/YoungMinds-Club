import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
	CalendarIcon,
	MapPinIcon,
	UserGroupIcon,
	ClockIcon,
	BookmarkIcon,
	BuildingOfficeIcon,
	BanknotesIcon,
	ComputerDesktopIcon,
	ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { InternshipCardData } from '@/types';

// Vibrant colors for different internship categories
const getCategoryColor = (category: string) => {
	const colors = {
		Technology: 'from-violet-500 to-indigo-600',
		Business: 'from-sky-500 to-blue-600',
		Marketing: 'from-orange-500 to-red-600',
		Design: 'from-emerald-500 to-teal-600',
		Finance: 'from-pink-500 to-rose-600',
		Engineering: 'from-amber-500 to-yellow-600',
		default: 'from-blue-500 to-indigo-600',
	};

	return colors[category as keyof typeof colors] || colors.default;
};

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

const InternshipCard = ({
	internship,
	isFeatured = false,
	isRecruiter = false,
	onManage,
	onEdit,
	onSaveToggle,
}: InternshipCardProps) => {
	const [isSaved, setIsSaved] = useState(internship.isSaved || false);

	// Get countdown for application deadline
	const countdown = useCountdown(internship.applicationDeadline);

	// Format date
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return format(date, 'MMM d, yyyy');
		} catch {
			return 'Invalid Date';
		}
	};

	// Handle bookmark toggle
	const handleSaveToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsSaved(!isSaved);

		if (onSaveToggle) {
			onSaveToggle(internship.id || internship._id || '');
		}
	};

	// Compensation formatting
	const formatCompensation = () => {
		if (internship.compensation === 'Unpaid') {
			return 'Unpaid';
		}
		if (internship.compensation === 'Paid' && internship.stipend) {
			return `₹${internship.stipend}/month`;
		}
		return internship.compensation || 'Not specified';
	};

	// Check if application deadline is past
	const isDeadlinePast = () => {
		return new Date(internship.applicationDeadline) < new Date();
	};

	// Get category color gradient
	const categoryColorGradient = getCategoryColor(internship.category || '');

	// Get location display
	const getLocationDisplay = () => {
		if (internship.location?.type === 'remote') {
			return 'Remote';
		}
		return internship.location?.city || 'Location not specified';
	};

	// Get location icon
	const getLocationIcon = () => {
		if (internship.location?.type === 'remote') {
			return <ComputerDesktopIcon className="h-4 w-4" />;
		}
		return <MapPinIcon className="h-4 w-4" />;
	};

	return (
		<div className="relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
			{/* Card Container */}
			<div className="ym-bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border ym-border-card">
				{/* Image Section with Overlay */}
				<Link
					to={`/internship/${internship.id || internship._id}`}
					className="block relative h-52 overflow-hidden"
				>
					<img
						src={
							internship.logo ||
							internship.companyLogo ||
							'https://via.placeholder.com/400x200?text=Company+Logo'
						}
						alt={internship.title}
						className="w-full h-full object-cover"
					/>

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>

					{/* Featured Badge */}
					{isFeatured && (
						<div className="absolute top-3 left-3 z-5">
							<span className="gradient-bg ym-text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
								<span className="mr-1">⭐</span> FEATURED
							</span>
						</div>
					)}

					{/* Company Badge */}
					<div className="absolute top-3 left-3 z-5">
						<div className="flex items-center ym-bg-white-90 ym-text-primary text-xs px-2 py-1 rounded-full">
							<BuildingOfficeIcon className="h-3 w-3 mr-1" />
							<span>{internship.company?.name || 'Company'}</span>
						</div>
					</div>

					{/* Category Badge */}
					<div className="absolute top-3 right-3 z-5">
						<span
							className={`bg-gradient-to-r ${categoryColorGradient} ym-text-white text-xs font-semibold px-3 py-1.5 rounded-full`}
						>
							{internship.category}
						</span>
					</div>

					{/* Compensation Tag */}
					<div className="absolute bottom-3 right-3 z-5">
						<span className="ym-bg-white-90 ym-text-primary text-sm font-bold px-3 py-1 rounded-lg flex items-center">
							<BanknotesIcon className="h-4 w-4 mr-1" />
							{formatCompensation()}
						</span>
					</div>

					{/* Deadline Warning */}
					{countdown.days <= 3 && countdown.days > 0 && (
						<div className="absolute bottom-3 left-3 z-5">
							<span className="bg-red-500 ym-text-white text-xs font-bold px-2 py-1 rounded-full">
								{countdown.days}d left
							</span>
						</div>
					)}
				</Link>

				{/* Content Section */}
				<div className="p-4 flex-grow flex flex-col">
					{/* Internship Title with Bookmark */}
					<div className="flex justify-between items-start mb-2">
						<Link to={`/internship/${internship.id || internship._id}`} className="flex-grow">
							<h3 className="font-bold text-lg ym-text-primary line-clamp-2 hover:ym-text-yellow-700 transition-colors">
								{internship.title}
							</h3>
						</Link>

						{/* Save/Bookmark Button - Only show if onSaveToggle is provided */}
						{onSaveToggle && (
							<button
								onClick={handleSaveToggle}
								className="ml-2 p-1 flex-shrink-0 transition-all duration-300"
							>
								{isSaved ? (
									<BookmarkSolidIcon className="h-5 w-5 ym-text-yellow-600" />
								) : (
									<BookmarkIcon className="h-5 w-5 ym-text-muted hover:ym-text-yellow-600" />
								)}
							</button>
						)}
					</div>

					{/* Short Description */}
					{internship.shortDescription && (
						<p className="ym-text-secondary text-sm mb-3 line-clamp-2">{internship.shortDescription}</p>
					)}

					{/* Internship Details */}
					<div className="space-y-2 mb-4">
						{/* Duration */}
						{internship.duration && (
							<div className="flex items-center ym-text-muted text-sm">
								<ClockIcon className="h-4 w-4 mr-2" />
								<span>{internship.duration}</span>
							</div>
						)}

						{/* Location */}
						<div className="flex items-center ym-text-muted text-sm">
							{getLocationIcon()}
							<span className="ml-2">{getLocationDisplay()}</span>
						</div>

						{/* Start Date */}
						<div className="flex items-center ym-text-muted text-sm">
							<CalendarIcon className="h-4 w-4 mr-2" />
							<span>Starts {formatDate(internship.startDate)}</span>
						</div>

						{/* Application Count */}
						<div className="flex items-center ym-text-muted text-sm">
							<UserGroupIcon className="h-4 w-4 mr-2" />
							<span>{internship.applicationCount} applications</span>
						</div>
					</div>

					{/* Tags */}
					{internship.tags && internship.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-4">
							{internship.tags.slice(0, 3).map((tag, index) => (
								<span key={index} className="ym-bg-muted ym-text-muted text-xs px-2 py-1 rounded-full">
									{tag}
								</span>
							))}
							{internship.tags.length > 3 && (
								<span className="ym-text-muted text-xs px-2 py-1">
									+{internship.tags.length - 3} more
								</span>
							)}
						</div>
					)}

					{/* Action Buttons */}
					<div className="mt-auto">
						{/* Deadline Info */}
						<div className="mb-3 text-sm">
							{isDeadlinePast() ? (
								<span className="ym-text-red-600 font-medium">Applications Closed</span>
							) : countdown.days <= 7 ? (
								<span className="ym-text-orange-600 font-medium">
									Deadline: {countdown.days}d {countdown.hours}h left
								</span>
							) : (
								<span className="ym-text-muted">
									Deadline: {formatDate(internship.applicationDeadline)}
								</span>
							)}
						</div>

						{/* Primary Action Button */}
						{isRecruiter ? (
							<div className="flex gap-2">
								{onEdit && (
									<button
										onClick={() => onEdit()}
										className="flex-1 bg-blue-600 hover:bg-blue-700 ym-text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
									>
										Edit
									</button>
								)}
								{onManage && (
									<button
										onClick={() => onManage()}
										className="flex-1 ym-bg-muted hover:ym-bg-muted-hover ym-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
									>
										Manage
									</button>
								)}
							</div>
						) : (
							<Link
								to={`/internship/${internship.id || internship._id}`}
								className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
									isDeadlinePast()
										? 'ym-bg-muted ym-text-muted cursor-not-allowed'
										: 'gradient-bg ym-text-white hover:shadow-lg hover:scale-105'
								}`}
							>
								{isDeadlinePast() ? 'Applications Closed' : 'View Details'}
								{!isDeadlinePast() && <ArrowRightIcon className="ml-2 h-4 w-4" />}
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InternshipCard;
