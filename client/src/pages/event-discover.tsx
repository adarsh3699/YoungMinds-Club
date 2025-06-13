import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import EventCard from '../components/organizer/EventCard';
import { SearchAndFilter } from '../components/common';
import EventCardSkeleton from '../components/organizer/EventCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EventDiscoverData, EventsApiResponse, DateRange, SelectOption } from '@/types';
import { EVENT_CATEGORIES as BASE_EVENT_CATEGORIES, EVENT_TYPES } from '../utils/eventConstants';

// Categories with "All Categories" option
const EVENT_CATEGORIES: SelectOption[] = [{ label: 'All Categories', value: '' }, ...BASE_EVENT_CATEGORIES];

// Sort options
const SORT_OPTIONS: SelectOption[] = [
	{ label: 'Newest', value: 'newest' },
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Upcoming', value: 'upcoming' },
	{ label: 'Outgoing', value: 'outgoing' },
];

const EventsPage: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// State for events data
	const [events, setEvents] = useState<EventDiscoverData[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<EventDiscoverData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// State for filters and search
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedEventType, setSelectedEventType] = useState<string>('');
	const [selectedLocation, setSelectedLocation] = useState<string>('');
	const [isOnlineOnly, setIsOnlineOnly] = useState<boolean>(false);
	const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
	const [sortBy, setSortBy] = useState<string>('newest');

	// Additional advanced filters
	const [selectedTags, setSelectedTags] = useState<string>('');
	const [selectedOrganizer, setSelectedOrganizer] = useState<string>('');
	const [registrationRange, setRegistrationRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
	const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

	// Fetch events data
	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			try {
				const response: AxiosResponse<EventsApiResponse> = await axios.get('/events');
				if (response.data.success) {
					const eventsData = response.data.events as EventDiscoverData[];
					setEvents(eventsData);
					setFilteredEvents(eventsData);
				} else {
					console.error('Error fetching events:', response.data.message);
					setError('Failed to load events. Please try again later.');
					setEvents([]);
					setFilteredEvents([]);
				}
			} catch (err) {
				console.error('Error fetching events:', err);
				setError('Failed to load events. Please try again later.');
				setEvents([]);
				setFilteredEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	// Apply filters and search
	useEffect(() => {
		if (!events.length) {
			setFilteredEvents([]);
			return;
		}

		let result = [...events];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(event) =>
					event.title.toLowerCase().includes(query) ||
					(event.tags && event.tags.some((tag) => tag.toLowerCase().includes(query)))
			);
		}

		// Apply category filter
		if (selectedCategory) {
			result = result.filter((event) => event.category === selectedCategory);
		}

		// Apply event type filter
		if (selectedEventType) {
			result = result.filter((event) => event.type === selectedEventType);
		}

		// Apply location filter
		if (selectedLocation) {
			const locationQuery = selectedLocation.toLowerCase();
			result = result.filter((event) => {
				// Handle online events
				if (selectedLocation === 'Online' && event.location?.type === 'online') {
					return true;
				}

				// For text searches, check if the query matches any location field
				return (
					event.location?.city?.toLowerCase().includes(locationQuery) ||
					event.location?.venue?.toLowerCase().includes(locationQuery)
				);
			});
		}

		// Apply online only filter
		if (isOnlineOnly) {
			result = result.filter((event) => event.location?.type === 'online');
		}

		// Apply date range filter
		if (dateRange.start) {
			const startDate = new Date(dateRange.start);
			result = result.filter((event) => new Date(event.date) >= startDate);
		}
		if (dateRange.end) {
			const endDate = new Date(dateRange.end);
			result = result.filter((event) => new Date(event.date) <= endDate);
		}

		// Apply tags filter
		if (selectedTags) {
			const tagsQuery = selectedTags.toLowerCase();
			result = result.filter(
				(event) => event.tags && event.tags.some((tag) => tag.toLowerCase().includes(tagsQuery))
			);
		}

		// Apply organizer filter
		if (selectedOrganizer) {
			const organizerQuery = selectedOrganizer.toLowerCase();
			result = result.filter(
				(event) => event.organizer?.name && event.organizer.name.toLowerCase().includes(organizerQuery)
			);
		}

		// Apply registration range filter
		if (registrationRange.min) {
			const minRegistrations = parseInt(registrationRange.min);
			result = result.filter((event) => (event.registrationCount || 0) >= minRegistrations);
		}
		if (registrationRange.max) {
			const maxRegistrations = parseInt(registrationRange.max);
			result = result.filter((event) => (event.registrationCount || 0) <= maxRegistrations);
		}

		// Apply price range filter
		if (priceRange.min) {
			const minPrice = parseFloat(priceRange.min);
			result = result.filter((event) => (event.price || 0) >= minPrice);
		}
		if (priceRange.max) {
			const maxPrice = parseFloat(priceRange.max);
			result = result.filter((event) => (event.price || 0) <= maxPrice);
		}

		// Apply sorting
		switch (sortBy) {
			case 'newest':
				result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				break;
			case 'popular':
				result.sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0));
				break;
			case 'upcoming':
				result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
				break;
			case 'outgoing':
				result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
				break;
			default:
				break;
		}

		setFilteredEvents(result);
	}, [
		events,
		searchQuery,
		selectedCategory,
		selectedEventType,
		selectedLocation,
		isOnlineOnly,
		dateRange,
		sortBy,
		selectedTags,
		selectedOrganizer,
		registrationRange,
		priceRange,
	]);

	const resetFilters = (): void => {
		setSearchQuery('');
		setSelectedCategory('');
		setSelectedEventType('');
		setSelectedLocation('');
		setIsOnlineOnly(false);
		setDateRange({ start: '', end: '' });
		setSortBy('newest');
		setSelectedTags('');
		setSelectedOrganizer('');
		setRegistrationRange({ min: '', max: '' });
		setPriceRange({ min: '', max: '' });
	};

	// Handle saving/unsaving event
	const handleSaveToggle = async (eventId: string): Promise<void> => {
		if (!isAuthenticated) {
			// Redirect to login if not authenticated
			navigate('/login');
			return;
		}

		try {
			// Always use POST method, as the server endpoint handles both save and unsave
			await axios.post(`/events/${eventId}/save`);
		} catch (error) {
			console.error('Error toggling saved event:', error);
		}
	};

	// Error state
	if (error) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
					<strong className="font-bold">Error! </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-events-bg pb-50">
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="mb-8 text-center p-20">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold ym-text-primary mb-4">
						Discover <span className="gradient-text">Events</span>
					</h1>
					<p className="text-lg md:text-xl ym-text-secondary max-w-2xl mx-auto">
						Find and register for exciting events in your area or online
					</p>
				</div>

				{/* Search and Filter Section */}
				<SearchAndFilter
					searchTerm={searchQuery}
					setSearchTerm={setSearchQuery}
					statusFilter={sortBy}
					setStatusFilter={setSortBy}
					statusOptions={SORT_OPTIONS.map((opt) => ({ value: opt.value.toString(), label: opt.label }))}
					categoryFilter={selectedCategory}
					setCategoryFilter={setSelectedCategory}
					categoryOptions={EVENT_CATEGORIES.map((opt) => ({ value: opt.value.toString(), label: opt.label }))}
					filteredCount={filteredEvents.length}
					totalCount={events.length}
					itemType="events"
					searchPlaceholder="Search events by title, or tags..."
					showCategory={true}
					advancedFilters={{
						showAdvancedFilters: true,
						dateRange: {
							startDate: dateRange.start,
							endDate: dateRange.end,
							setStartDate: (date) => setDateRange((prev) => ({ ...prev, start: date })),
							setEndDate: (date) => setDateRange((prev) => ({ ...prev, end: date })),
						},
						location: {
							value: selectedLocation,
							setValue: setSelectedLocation,
						},
						eventType: {
							value: selectedEventType,
							setValue: setSelectedEventType,
							options: [{ value: '', label: 'All Types' }, ...EVENT_TYPES].map((opt) => ({
								value: opt.value.toString(),
								label: opt.label,
							})),
						},
						organizer: {
							value: selectedOrganizer,
							setValue: setSelectedOrganizer,
						},
						registrationRange: {
							min: registrationRange.min,
							max: registrationRange.max,
							setMin: (min) => setRegistrationRange((prev) => ({ ...prev, min })),
							setMax: (max) => setRegistrationRange((prev) => ({ ...prev, max })),
						},
						priceRange: {
							min: priceRange.min,
							max: priceRange.max,
							setMin: (min) => setPriceRange((prev) => ({ ...prev, min })),
							setMax: (max) => setPriceRange((prev) => ({ ...prev, max })),
						},
						toggleFilters: {
							isOnlineOnly: {
								value: isOnlineOnly,
								setValue: setIsOnlineOnly,
							},
						},
						onResetAllFilters: resetFilters,
					}}
				/>

				{/* Events Grid */}
				<div>
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<EventCardSkeleton key={i} />
							))}
						</div>
					) : filteredEvents.length === 0 ? (
						<div className="ym-bg-card rounded-lg p-8 text-center border ym-border-card shadow-md">
							<svg
								className="mx-auto h-12 w-12 ym-text-muted"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h3 className="mt-2 text-lg font-medium ym-text-primary">No events found</h3>
							<p className="mt-1 text-sm ym-text-secondary">
								Try adjusting your search or filter criteria to find events.
							</p>
							<div className="mt-6">
								<button
									type="button"
									className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ym-text-white gradient-bg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
									onClick={resetFilters}
								>
									Reset all filters
								</button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredEvents.map((event) => (
								<EventCard
									key={event._id}
									event={event}
									onSaveToggle={handleSaveToggle}
									onManage={() => {}}
									onEdit={() => {}}
									onDelete={() => {}}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default EventsPage;
