import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
	CalendarIcon,
	MapPinIcon,
	UserGroupIcon,
	PencilIcon,
	TrashIcon,
	ArrowRightIcon,
	VideoCameraIcon,
	ClockIcon,
	BookmarkIcon,
	UserIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Vibrant colors for different event types
const getCategoryColor = (type) => {
	const colors = {
		Workshop: 'from-violet-500 to-indigo-600',
		MUN: 'from-sky-500 to-blue-600',
		Debate: 'from-orange-500 to-red-600',
		Hackathon: 'from-emerald-500 to-teal-600',
		Competition: 'from-pink-500 to-rose-600',
		Conference: 'from-amber-500 to-yellow-600',
		default: 'from-blue-500 to-indigo-600',
	};

	return colors[type] || colors.default;
};

// Function to calculate countdown
const useCountdown = (targetDate) => {
	const [countdown, setCountdown] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		if (!targetDate) return;

		const eventDate = new Date(targetDate);

		const interval = setInterval(() => {
			const now = new Date();
			const difference = eventDate.getTime() - now.getTime();

			if (difference <= 0) {
				clearInterval(interval);
				setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				return;
			}

			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			setCountdown({ days, hours, minutes, seconds });
		}, 1000);

		return () => clearInterval(interval);
	}, [targetDate]);

	return countdown;
};

const EventCard = ({ event, isFeatured = false, isOrganizer = false, onManage, onEdit, onDelete, onSaveToggle }) => {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);
	const [isSaved, setIsSaved] = useState(event.isSaved || false);

	// Get countdown
	const countdown = useCountdown(event.date);

	// Format date and time
	const formatEventDate = (dateString) => {
		try {
			const date = new Date(dateString);
			return format(date, 'MMM d, yyyy');
		} catch (error) {
			return 'Invalid Date';
		}
	};

	const formatEventTime = (dateString) => {
		try {
			const date = new Date(dateString);
			return format(date, 'h:mm a');
		} catch (error) {
			return 'Invalid Time';
		}
	};

	// Handle bookmark toggle
	const handleSaveToggle = (e) => {
		e.preventDefault();
		e.stopPropagation();

		setIsSaved(!isSaved);

		if (onSaveToggle) {
			onSaveToggle(event.id || event._id, !isSaved);
		}
	};

	// Price formatting
	const formatPrice = () => {
		if (!event.price || event.price === 0) {
			return 'Free';
		}
		return `₹${event.price}`;
	};

	// Check if event is past
	const isEventPast = () => {
		return new Date(event.date) < new Date();
	};

	// Get category color gradient
	const categoryColorGradient = getCategoryColor(event.type);

	return (
		<div
			className="relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Card Container */}
			<div className="ym-bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border ym-border-card">
				{/* Image Section with Overlay */}
				<Link to={`/event/${event.id || event._id}`} className="block relative h-52 overflow-hidden">
					<img
						src={event.poster || 'https://via.placeholder.com/400x200?text=No+Image'}
						alt={event.title}
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

					{/* Organizer Badge */}
					<div className="absolute top-3 left-3 z-5">
						<div className="flex items-center ym-bg-white-90 ym-text-primary text-xs px-2 py-1 rounded-full">
							<UserIcon className="h-3 w-3 mr-1" />
							<span>By {event.organizer?.name || 'Organizer'}</span>
						</div>
					</div>

					{/* Category Badge */}
					<div className="absolute top-3 right-3 z-5">
						<span
							className={`bg-gradient-to-r ${categoryColorGradient} ym-text-white text-xs font-semibold px-3 py-1.5 rounded-full`}
						>
							{event.type}
						</span>
					</div>

					{/* Price Tag */}
					<div className="absolute bottom-3 right-3 z-5">
						<span className="ym-bg-white-90 ym-text-primary text-sm font-bold px-3 py-1 rounded-lg">
							{formatPrice()}
						</span>
					</div>
				</Link>

				{/* Content Section */}
				<div className="p-4 flex-grow flex flex-col">
					{/* Event Title with Bookmark */}
					<div className="flex justify-between items-start mb-2">
						<Link to={`/event/${event.id || event._id}`} className="flex-grow">
							<h3 className="font-bold text-lg ym-text-primary line-clamp-2 hover:ym-text-yellow-700 transition-colors">
								{event.title}
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

					{/* Countdown Timer or Past Event Indicator */}
					{!isEventPast() ? (
						<div className="mb-3">
							<p className="text-xs ym-text-muted mb-1">Event starts in:</p>
							<div className="flex space-x-2">
								<div className="ym-bg-yellow-100 px-2 py-1 rounded text-center min-w-[40px]">
									<span className="ym-text-yellow-700 text-sm font-bold">{countdown.days}</span>
									<p className="ym-text-muted text-xs">days</p>
								</div>
								<div className="ym-bg-yellow-100 px-2 py-1 rounded text-center min-w-[40px]">
									<span className="ym-text-yellow-700 text-sm font-bold">{countdown.hours}</span>
									<p className="ym-text-muted text-xs">hrs</p>
								</div>
								<div className="ym-bg-yellow-100 px-2 py-1 rounded text-center min-w-[40px]">
									<span className="ym-text-yellow-700 text-sm font-bold">{countdown.minutes}</span>
									<p className="ym-text-muted text-xs">mins</p>
								</div>
								<div className="ym-bg-yellow-100 px-2 py-1 rounded text-center min-w-[40px]">
									<span className="ym-text-yellow-700 text-sm font-bold">{countdown.seconds}</span>
									<p className="ym-text-muted text-xs">secs</p>
								</div>
							</div>
						</div>
					) : (
						<div className="mb-3">
							<div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
								<p className="text-xs ym-text-muted text-center">This event has ended</p>
							</div>
						</div>
					)}

					{/* Event Short Description */}
					<p className="ym-text-secondary text-sm mb-3 line-clamp-2">{event.shortDescription}</p>

					{/* Meta Information */}
					<div className="space-y-1.5 mb-4">
						<div className="flex items-center ym-text-secondary text-sm">
							<CalendarIcon className="h-4 w-4 mr-2 ym-text-yellow-600" />
							<span>{formatEventDate(event.date)}</span>
						</div>

						<div className="flex items-center ym-text-secondary text-sm">
							<ClockIcon className="h-4 w-4 mr-2 ym-text-yellow-600" />
							<span>{formatEventTime(event.date)}</span>
						</div>

						<div className="flex items-center ym-text-secondary text-sm">
							<MapPinIcon className="h-4 w-4 mr-2 ym-text-yellow-600" />
							{event.location?.type === 'online' ? (
								<span className="ym-text-success font-medium">Fully Online</span>
							) : (
								<span>
									{event.location?.city}, {event.location?.venue}
								</span>
							)}
						</div>
					</div>

					{/* Registration Stats - Only show for upcoming events */}
					<div className="mt-auto">
						{!isEventPast() && (
							<>
								<div className="w-full ym-bg-yellow-100 rounded-full h-2 mb-2">
									<div
										className={`h-2 rounded-full gradient-bg`}
										style={{
											width: `${Math.min(
												100,
												(event.registrationCount / event.capacity) * 100
											)}%`,
										}}
									></div>
								</div>
								<div className="flex justify-between text-xs ym-text-muted mb-3">
									<span>{event.registrationCount} registered</span>
									<span>{event.capacity - event.registrationCount} spots left</span>
								</div>
							</>
						)}

						{/* Register Button - Different states based on event timing */}
						{isEventPast() ? (
							<div className="w-full py-2.5 text-center font-bold bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed shadow-sm border ym-border-card">
								Event Ended
							</div>
						) : (
							<Link
								to={`/event/${event.id || event._id}`}
								className="block w-full py-2.5 text-center font-bold ym-text-white gradient-bg hover:shadow-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
							>
								Register Now
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Action buttons (Only visible for organizers) */}
			{isOrganizer && (
				<div className="ym-bg-yellow-100 p-4 flex justify-between items-center">
					<button
						onClick={onManage}
						className="ym-text-yellow-700 text-sm font-medium flex items-center hover:ym-text-yellow-700"
					>
						View Details
						<ArrowRightIcon className="ml-1 h-4 w-4" />
					</button>

					<div className="flex space-x-2">
						<button
							onClick={onEdit}
							className="p-1.5 rounded-full ym-text-muted hover:ym-bg-card-hover hover:ym-text-yellow-600"
							aria-label="Edit event"
						>
							<PencilIcon className="h-5 w-5" />
						</button>
						<button
							onClick={onDelete}
							className="p-1.5 rounded-full ym-text-muted hover:ym-bg-card-hover hover:text-red-600"
							aria-label="Delete event"
						>
							<TrashIcon className="h-5 w-5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventCard;
