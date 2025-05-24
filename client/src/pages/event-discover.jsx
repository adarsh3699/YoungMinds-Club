import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Disclosure, Transition } from '@headlessui/react';
import {
	MagnifyingGlassIcon,
	FunnelIcon,
	CalendarIcon,
	MapPinIcon,
	ChevronDownIcon,
	AdjustmentsHorizontalIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import EventCard from '../components/organizer/EventCard';
import { SelectInput, Switch } from '../components/common';
import EventCardSkeleton from '../components/organizer/EventCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Categories
const EVENT_CATEGORIES = [
	{ label: 'All Categories', value: '' },
	{ label: 'Model United Nations', value: 'MUN' },
	{ label: 'Debate', value: 'Debate' },
	{ label: 'Hackathon', value: 'Hackathon' },
	{ label: 'Workshop', value: 'Workshop' },
	{ label: 'Competition', value: 'Competition' },
	{ label: 'Conference', value: 'Conference' },
];

// Locations
const LOCATIONS = [
	{ label: 'All Locations', value: '' },
	{ label: 'Mumbai', value: 'Mumbai' },
	{ label: 'Delhi', value: 'Delhi' },
	{ label: 'Bangalore', value: 'Bangalore' },
	{ label: 'Hyderabad', value: 'Hyderabad' },
	{ label: 'Chennai', value: 'Chennai' },
	{ label: 'Online', value: 'Online' },
];

// Sort options
const SORT_OPTIONS = [
	{ label: 'Newest', value: 'newest' },
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Upcoming', value: 'upcoming' },
	{ label: 'Outgoing', value: 'outgoing' },
];

const EventsPage = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	// State for events data
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [savedEventIds, setSavedEventIds] = useState([]);

	// State for filters and search
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('');
	const [isOnlineOnly, setIsOnlineOnly] = useState(false);
	const [dateRange, setDateRange] = useState({ start: '', end: '' });
	const [dateError, setDateError] = useState('');
	const [sortBy, setSortBy] = useState('newest');

	// Mobile filters visibility
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	// Fetch events data
	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			try {
				const response = await axios.get('/events');
				// Extract events array from response structure
				const eventsData = response.data.events || [];
				setEvents(eventsData);
				setFilteredEvents(eventsData);
			} catch (err) {
				console.error('Error fetching events:', err);
				setError('Failed to load events. Please try again later.');
				// Initialize with empty array on error
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
					(event.description && event.description.toLowerCase().includes(query)) ||
					(event.tags && event.tags.some((tag) => tag.toLowerCase().includes(query)))
			);
		}

		// Apply category filter
		if (selectedCategory) {
			result = result.filter((event) => event.type === selectedCategory);
		}

		// Apply location filter
		if (selectedLocation) {
			result = result.filter(
				(event) => event.location.city === selectedLocation || (selectedLocation === 'Online' && event.isOnline)
			);
		}

		// Apply online only filter
		if (isOnlineOnly) {
			result = result.filter((event) => event.isOnline);
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

		// Apply sorting
		switch (sortBy) {
			case 'newest':
				result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				break;
			case 'popular':
				result.sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0));
				break;
			case 'upcoming':
				result.sort((a, b) => new Date(a.date) - new Date(b.date));
				break;
			case 'outgoing':
				result.sort((a, b) => new Date(b.date) - new Date(a.date));
				break;
			default:
				break;
		}

		setFilteredEvents(result);
	}, [events, searchQuery, selectedCategory, selectedLocation, isOnlineOnly, dateRange, sortBy]);

	const resetFilters = () => {
		setSearchQuery('');
		setSelectedCategory('');
		setSelectedLocation('');
		setIsOnlineOnly(false);
		setDateRange({ start: '', end: '' });
		setDateError('');
		setSortBy('newest');
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleCategoryChange = (e) => {
		setSelectedCategory(e.target.value);
	};

	const handleLocationChange = (e) => {
		setSelectedLocation(e.target.value);
	};

	const handleOnlineToggle = (e) => {
		setIsOnlineOnly(e.target.checked);
	};

	const handleSortChange = (e) => {
		setSortBy(e.target.value);
	};

	const handleDateChange = (field, value) => {
		// Create a new date range object
		const newDateRange = { ...dateRange, [field]: value };

		// Clear previous errors
		setDateError('');

		// Validate that end date is not before start date
		if (newDateRange.start && newDateRange.end) {
			const startDate = new Date(newDateRange.start);
			const endDate = new Date(newDateRange.end);

			if (endDate < startDate) {
				setDateError('To Date cannot be earlier than From Date');
				// Still update the date but show error
			}
		}

		// Update the date range
		setDateRange(newDateRange);
	};

	// Handle saving/unsaving event
	const handleSaveToggle = async (eventId, isSaved) => {
		if (!isAuthenticated) {
			// Redirect to login if not authenticated
			navigate('/login');
			return;
		}

		try {
			// Always use POST method, as the server endpoint handles both save and unsave
			const response = await axios.post(`/events/${eventId}/save`);

			// Get updated saved status from server response
			const { isSaved: newSavedStatus } = response.data;

			// Update saved events list
			if (newSavedStatus) {
				setSavedEventIds((prev) => [...prev, eventId]);
			} else {
				setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
			}
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
		<div className="min-h-screen ym-events-bg">
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="mb-8 text-center">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold ym-text-primary mb-4">
						Discover <span className="gradient-text">Events</span>
					</h1>
					<p className="text-lg md:text-xl ym-text-secondary max-w-2xl mx-auto">
						Find and register for exciting events in your area or online
					</p>
				</div>

				{/* Search and Filter Section */}
				<div className="mb-8">
					{/* Main Search Bar */}
					<div className="ym-bg-card rounded-xl shadow-lg border ym-border-card p-6 mb-4">
						<div className="flex flex-col lg:flex-row gap-4">
							{/* Search Input */}
							<div className="relative flex-grow">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<MagnifyingGlassIcon className="h-5 w-5 ym-text-yellow-600" />
								</div>
								<input
									type="text"
									className="block w-full pl-12 pr-4 py-3 border ym-border-card rounded-lg ym-bg-card ym-text-card placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm text-base"
									placeholder="Search events by title, description, or tags..."
									value={searchQuery}
									onChange={handleSearchChange}
								/>
							</div>

							{/* Sort Dropdown */}
							<div className="w-full lg:w-56">
								<SelectInput
									id="sort"
									name="sort"
									value={sortBy}
									onChange={handleSortChange}
									options={SORT_OPTIONS}
									className="ym-bg-card"
									placeholder="Sort by"
								/>
							</div>

							{/* Mobile Filter Button */}
							<button
								type="button"
								className="lg:hidden inline-flex items-center justify-center px-6 py-3 border ym-border-card rounded-lg shadow-sm text-base font-medium ym-text-card ym-bg-card hover:ym-bg-card-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
								onClick={() => setShowMobileFilters(true)}
							>
								<FunnelIcon className="h-5 w-5 mr-2 ym-text-yellow-600" aria-hidden="true" />
								Filters
							</button>
						</div>
					</div>

					{/* Desktop Advanced Filters */}
					<Disclosure as="div" className="hidden lg:block">
						{({ open }) => (
							<>
								<Disclosure.Button className="w-full flex justify-between items-center px-6 py-4 text-base font-medium ym-text-card ym-bg-card hover:ym-bg-card-hover rounded-xl transition-all shadow-md hover:shadow-lg border ym-border-card">
									<div className="flex items-center">
										<AdjustmentsHorizontalIcon className="mr-3 h-6 w-6 ym-text-yellow-600" />
										<span>Advanced Filters</span>
									</div>
									<ChevronDownIcon
										className={`${
											open ? 'rotate-180 transform' : ''
										} h-5 w-5 ym-text-yellow-600 transition-transform duration-200`}
									/>
								</Disclosure.Button>

								<Transition
									enter="transition duration-200 ease-out"
									enterFrom="transform scale-95 opacity-0"
									enterTo="transform scale-100 opacity-100"
									leave="transition duration-150 ease-in"
									leaveFrom="transform scale-100 opacity-100"
									leaveTo="transform scale-95 opacity-0"
								>
									<Disclosure.Panel className="mt-4 ym-bg-card rounded-xl p-6 shadow-lg border ym-border-card">
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
											{/* Category Filter */}
											<div>
												<SelectInput
													id="category"
													name="category"
													label="Category"
													value={selectedCategory}
													onChange={handleCategoryChange}
													options={EVENT_CATEGORIES}
													className="ym-bg-card"
												/>
											</div>

											{/* Location Filter */}
											<div>
												<SelectInput
													id="location"
													name="location"
													label="Location"
													value={selectedLocation}
													onChange={handleLocationChange}
													options={LOCATIONS}
													className="ym-bg-card"
												/>
											</div>

											{/* From Date */}
											<div>
												<label className="block ym-text-primary font-semibold mb-3">
													From Date
												</label>
												<div className="relative">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
													</div>
													<input
														type="date"
														className="block w-full pl-10 pr-4 py-3 border ym-border-card rounded-lg ym-bg-card ym-text-card focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
														value={dateRange.start}
														onChange={(e) => handleDateChange('start', e.target.value)}
													/>
												</div>
											</div>

											{/* To Date */}
											<div>
												<label className="block ym-text-primary font-semibold mb-3">
													To Date
												</label>
												<div className="relative">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
													</div>
													<input
														type="date"
														className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm
														${dateError ? 'border-red-500 ym-bg-card ym-text-card' : 'ym-border-card ym-bg-card'} 
														ym-text-card`}
														value={dateRange.end}
														onChange={(e) => handleDateChange('end', e.target.value)}
													/>
												</div>
												{dateError && (
													<p className="mt-2 text-sm text-red-600 font-medium">{dateError}</p>
												)}
											</div>
										</div>

										<div className="flex items-center justify-between mt-8 pt-6 border-t ym-border-card">
											<div>
												<Switch
													enabled={isOnlineOnly}
													onChange={handleOnlineToggle}
													label="Online Events Only"
													name="online-only"
												/>
											</div>
											<button
												type="button"
												onClick={resetFilters}
												className="inline-flex items-center px-6 py-2.5 border border-red-300 rounded-lg text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 hover:text-red-800 transition-all shadow-sm hover:shadow-md"
											>
												Reset Filters
											</button>
										</div>
									</Disclosure.Panel>
								</Transition>
							</>
						)}
					</Disclosure>
				</div>

				{/* Mobile Filters Modal */}
				{showMobileFilters && (
					<div className="fixed inset-0 z-40 overflow-y-auto lg:hidden">
						<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							{/* Backdrop */}
							<div
								className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
								onClick={() => setShowMobileFilters(false)}
							></div>

							{/* Modal Content */}
							<div className="inline-block align-bottom ym-bg-card rounded-t-2xl sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border ym-border-card">
								{/* Header */}
								<div className="px-6 pt-6 pb-4 border-b ym-border-card">
									<div className="flex justify-between items-center">
										<h3 className="text-xl font-bold ym-text-primary">Filter Events</h3>
										<button
											type="button"
											className="ym-bg-card rounded-lg p-2 ym-text-muted hover:ym-text-secondary hover:ym-bg-card-hover focus:outline-none transition-colors"
											onClick={() => setShowMobileFilters(false)}
										>
											<span className="sr-only">Close</span>
											<XMarkIcon className="h-6 w-6" aria-hidden="true" />
										</button>
									</div>
								</div>

								{/* Filters */}
								<div className="px-6 py-6 space-y-6">
									{/* Category Filter */}
									<div>
										<SelectInput
											id="category-mobile"
											name="category"
											label="Category"
											value={selectedCategory}
											onChange={handleCategoryChange}
											options={EVENT_CATEGORIES}
											className="ym-bg-card"
										/>
									</div>

									{/* Location Filter */}
									<div>
										<SelectInput
											id="location-mobile"
											name="location"
											label="Location"
											value={selectedLocation}
											onChange={handleLocationChange}
											options={LOCATIONS}
											className="ym-bg-card"
										/>
									</div>

									{/* Date Range */}
									<div className="space-y-4">
										<div>
											<label className="block ym-text-primary font-semibold mb-3">
												From Date
											</label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
												</div>
												<input
													type="date"
													className="block w-full pl-10 pr-4 py-3 border ym-border-card rounded-lg ym-bg-card ym-text-card focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
													value={dateRange.start}
													onChange={(e) => handleDateChange('start', e.target.value)}
												/>
											</div>
										</div>

										<div>
											<label className="block ym-text-primary font-semibold mb-3">To Date</label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
												</div>
												<input
													type="date"
													className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm
													${dateError ? 'border-red-500 ym-bg-card ym-text-card' : 'ym-border-card ym-bg-card'} 
													ym-text-card`}
													value={dateRange.end}
													onChange={(e) => handleDateChange('end', e.target.value)}
												/>
											</div>
											{dateError && (
												<p className="mt-2 text-sm text-red-600 font-medium">{dateError}</p>
											)}
										</div>
									</div>

									{/* Online Events Toggle */}
									<div className="pt-4 border-t ym-border-card">
										<Switch
											enabled={isOnlineOnly}
											onChange={handleOnlineToggle}
											label="Online Events Only"
											name="online-only"
										/>
									</div>
								</div>

								{/* Footer Buttons */}
								<div className="ym-bg-yellow-100 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
									<button
										type="button"
										className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 gradient-bg text-base font-semibold ym-text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:w-auto transition-all"
										onClick={() => setShowMobileFilters(false)}
									>
										Apply Filters
									</button>
									<button
										type="button"
										className="mt-3 w-full inline-flex justify-center rounded-lg border border-red-300 shadow-sm px-6 py-3 bg-red-50 text-base font-medium text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto transition-colors"
										onClick={resetFilters}
									>
										Reset
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

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
									onSaveToggle={isAuthenticated ? handleSaveToggle : undefined}
									isSaved={savedEventIds.includes(event._id)}
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
