import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import CreateEventModal from '../../components/organizer/CreateEventModal';
import {
	DashboardOverview,
	EventRegistrationChart,
	FeedbackSummary,
	EventsList,
	LoadingState,
	ErrorState,
} from '../../components/organizer/dashboard';
import {
	OrganizerDashboardData,
	OrganizerEvent,
	OrganizerFeedbackSummary,
	FilterOption,
	OrganizerDashboardApiResponse,
	OrganizerEventsApiResponse,
	OrganizerFeedbackApiResponse,
} from '@/types';

const Dashboard: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [dashboardData, setDashboardData] = useState<OrganizerDashboardData | null>(null);
	const [events, setEvents] = useState<OrganizerEvent[]>([]);
	const [feedbackSummary, setFeedbackSummary] = useState<OrganizerFeedbackSummary | null>(null);
	const [eventFilter, setEventFilter] = useState<string>('all');
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async (): Promise<void> => {
			try {
				setLoading(true);
				const response: AxiosResponse<OrganizerDashboardApiResponse> = await axios.get('/organizer/dashboard');
				setDashboardData(response.data.data);

				// Fetch events in the same call
				const eventsResponse: AxiosResponse<OrganizerEventsApiResponse> = await axios.get('/organizer/events');
				setEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);

				// Fetch feedback summary
				const feedbackResponse: AxiosResponse<OrganizerFeedbackApiResponse> = await axios.get(
					'/organizer/feedback/summary'
				);
				if (feedbackResponse.data.success) {
					setFeedbackSummary(feedbackResponse.data.summary);
				}

				setLoading(false);
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				setError('Failed to load dashboard data. Please try again.');
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const toggleCreateModal = (): void => {
		setShowCreateModal(!showCreateModal);
	};

	const handleEventCreated = (newEvent: OrganizerEvent): void => {
		// Add the new event to the events list
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const filterOptions: FilterOption[] = [
		{ value: 'all', label: 'All Events' },
		{ value: 'upcoming', label: 'Upcoming Events' },
		{ value: 'past', label: 'Past Events' },
		{ value: 'draft', label: 'Draft Events' },
	];

	// Calculate total registrations from events as a fallback
	const calculatedTotalRegistrations: number = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);

	if (loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} />;
	}

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-8 mt-12">
				{/* Create Event Modal */}
				{showCreateModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
						<div className="ym-bg-card rounded-xl shadow-xl w-full max-w-5xl mx-auto overflow-hidden">
							<CreateEventModal onClose={toggleCreateModal} onSuccess={handleEventCreated} />
						</div>
					</div>
				)}

				{/* Dashboard Overview (Header + Stats) */}
				<DashboardOverview
					onCreateEvent={toggleCreateModal}
					dashboardData={dashboardData}
					calculatedTotalRegistrations={calculatedTotalRegistrations}
					feedbackSummary={feedbackSummary}
				/>

				{/* Event Registration Chart */}
				<EventRegistrationChart events={events} />

				{/* Feedback Summary */}
				<FeedbackSummary feedbackSummary={feedbackSummary} />

				{/* Events List */}
				<EventsList
					events={events}
					eventFilter={eventFilter}
					setEventFilter={setEventFilter}
					filterOptions={filterOptions}
					onCreateEvent={toggleCreateModal}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
