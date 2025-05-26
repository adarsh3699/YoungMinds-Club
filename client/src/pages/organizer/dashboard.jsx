import { useState, useEffect } from 'react';
import axios from 'axios';
import CreateEventModal from '../../components/organizer/CreateEventModal';
import {
	DashboardOverview,
	EventRegistrationChart,
	FeedbackSummary,
	EventsList,
	LoadingState,
	ErrorState,
} from '../../components/organizer/dashboard';

const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dashboardData, setDashboardData] = useState(null);
	const [events, setEvents] = useState([]);
	const [feedbackSummary, setFeedbackSummary] = useState(null);
	const [eventFilter, setEventFilter] = useState('all');
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const response = await axios.get('/organizer/dashboard');
				setDashboardData(response.data.data);

				// Fetch events in the same call
				const eventsResponse = await axios.get('/organizer/events');
				setEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);

				// Fetch feedback summary
				const feedbackResponse = await axios.get('/organizer/feedback/summary');
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

	const toggleCreateModal = () => {
		setShowCreateModal(!showCreateModal);
	};

	const handleEventCreated = (newEvent) => {
		// Add the new event to the events list
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const filterOptions = [
		{ value: 'all', label: 'All Events' },
		{ value: 'upcoming', label: 'Upcoming Events' },
		{ value: 'past', label: 'Past Events' },
		{ value: 'draft', label: 'Draft Events' },
	];

	// Calculate total registrations from events as a fallback
	const calculatedTotalRegistrations = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);

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
