import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import EventCard from '../components/organizer/EventCard';
import { SearchAndFilter } from '../components/common';
import EventCardSkeleton from '../components/organizer/EventCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EventDiscoverData, EventsApiResponse, SelectOption } from '@/types';
import { EVENT_CATEGORIES as BASE_EVENT_CATEGORIES, EVENT_TYPES } from '../utils/eventConstants';

// Categories with "All Categories" option
const EVENT_CATEGORIES: SelectOption[] = [{ label: 'All Categories', value: '' }, ...BASE_EVENT_CATEGORIES];

// Sort options
const SORT_OPTIONS: SelectOption[] = [
	{ label: 'All Status', value: 'all' },
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Upcoming', value: 'upcoming' },
	{ label: 'Ongoing', value: 'ongoing' },
	{ label: 'Completed', value: 'completed' },
];

const EventsPage: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// State for events data
	const [events, setEvents] = useState<EventDiscoverData[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<EventDiscoverData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = (filtered: any[]) => {
		setFilteredEvents(filtered as EventDiscoverData[]);
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
			<div className="container mx-auto px-4 py-12 mt-6">
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
					data={events}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="events"
					searchPlaceholder="Search events by title, location, or tags..."
					animationDelay="0.1s"
					showCategory={true}
					showAdvancedFilters={true}
					categoryOptions={EVENT_CATEGORIES}
					statusOptions={SORT_OPTIONS}
					eventTypeOptions={[{ label: 'All Types', value: '' }, ...EVENT_TYPES]}
					enableDateRange={true}
					enableEventType={true}
					enableOrganizer={true}
					enableRegistrationRange={true}
					enablePriceRange={true}
					enableOnlineOnly={true}
					enableFreeOnly={true}
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
