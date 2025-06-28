import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { BriefcaseIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import CreateEventModal from "../../components/organizer/CreateEventModal";
import CreateInternshipModal from "../../components/organizer/CreateInternshipModal";
import {
	DashboardOverview,
	EventRegistrationChart,
	FeedbackSummary,
	EventsList,
	InternshipsList,
	LoadingState,
	ErrorState,
} from "../../components/organizer/dashboard";

import {
	OrganizerEvent,
	OrganizerInternship,
	OrganizerFeedbackSummary,
	FilterOption,
	OrganizerEventsApiResponse,
	OrganizerInternshipsApiResponse,
	OrganizerFeedbackApiResponse,
} from "@/types";

const Dashboard: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [events, setEvents] = useState<OrganizerEvent[]>([]);
	const [internships, setInternships] = useState<OrganizerInternship[]>([]);
	const [feedbackSummary, setFeedbackSummary] = useState<OrganizerFeedbackSummary | null>(null);
	const [eventFilter, setEventFilter] = useState<string>("all");
	const [internshipFilter, setInternshipFilter] = useState<string>("all");
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [showCreateInternshipModal, setShowCreateInternshipModal] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("events");

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async (): Promise<void> => {
			try {
				setLoading(true);

				// Fetch events
				const eventsResponse: AxiosResponse<OrganizerEventsApiResponse> = await axios.get("/organizer/events");
				setEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);

				// Fetch internships
				try {
					const internshipsResponse: AxiosResponse<OrganizerInternshipsApiResponse> = await axios.get(
						"/organizer/internships"
					);
					setInternships(
						Array.isArray(internshipsResponse.data.internships) ? internshipsResponse.data.internships : []
					);
				} catch (internshipError) {
					console.error("Error fetching internships:", internshipError);
					setInternships([]);
				}

				// Fetch feedback summary
				const feedbackResponse: AxiosResponse<OrganizerFeedbackApiResponse> = await axios.get(
					"/organizer/feedback/summary"
				);
				if (feedbackResponse.data.success) {
					setFeedbackSummary(feedbackResponse.data.summary);
				}

				setLoading(false);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				setError("Failed to load dashboard data. Please try again.");
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const toggleCreateModal = (): void => {
		setShowCreateModal(!showCreateModal);
	};

	const toggleCreateInternshipModal = (): void => {
		setShowCreateInternshipModal(!showCreateInternshipModal);
	};

	const handleEventCreated = (newEvent: OrganizerEvent): void => {
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const handleInternshipCreated = (newInternship: OrganizerInternship): void => {
		setInternships([newInternship, ...internships]);
		setShowCreateInternshipModal(false);
	};

	const eventFilterOptions: FilterOption[] = [
		{ value: "all", label: "All Events" },
		{ value: "upcoming", label: "Upcoming Events" },
		{ value: "past", label: "Past Events" },
		{ value: "draft", label: "Draft Events" },
	];

	const internshipFilterOptions: FilterOption[] = [
		{ value: "all", label: "All Internships" },
		{ value: "active", label: "Active Internships" },
		{ value: "expired", label: "Expired Internships" },
		{ value: "draft", label: "Draft Internships" },
	];

	const tabs = [
		{ id: "events", label: "Events", count: events.length },
		{ id: "internships", label: "Internships", count: internships.length },
	];

	const calculatedTotalRegistrations: number = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);
	const calculatedTotalApplications: number = internships.reduce(
		(sum, internship) => sum + (internship.applicationCount || 0),
		0
	);

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
					<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-2 sm:p-4">
						<div className="ym-bg-card rounded-xl shadow-xl w-full max-w-5xl mx-auto overflow-hidden">
							<CreateEventModal onClose={toggleCreateModal} onSuccess={handleEventCreated} />
						</div>
					</div>
				)}

				{/* Create Internship Modal */}
				{showCreateInternshipModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-2 sm:p-4">
						<div className="ym-bg-card rounded-xl shadow-xl w-full max-w-6xl mx-auto overflow-hidden">
							<CreateInternshipModal
								onClose={toggleCreateInternshipModal}
								onSuccess={handleInternshipCreated}
							/>
						</div>
					</div>
				)}

				{/* Main Dashboard Header */}
				<div className="mb-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
						<div>
							<h1 className="text-3xl font-bold ym-text-primary mb-2">Organizer Dashboard</h1>
							<p className="ym-text-secondary">Manage your events and internships</p>
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="mb-8">
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card overflow-hidden">
						<div className="flex border-b ym-border-card">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex-1 py-4 px-6 font-medium text-center transition-all duration-200 ${
										activeTab === tab.id
											? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
											: "ym-text-muted hover:ym-text-secondary hover:bg-gray-50"
									}`}
								>
									<div className="flex items-center justify-center space-x-2">
										<span>{tab.label}</span>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												activeTab === tab.id
													? "bg-white/20 text-white"
													: "ym-bg-gray-100 ym-text-muted"
											}`}
										>
											{tab.count}
										</span>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === "events" ? (
					<div className="space-y-8">
						{/* Events Dashboard Overview */}
						<DashboardOverview
							type="events"
							onCreateAction={toggleCreateModal}
							title="Events Management"
							subtitle="Create and manage your events, track registrations"
							buttonText="Create New Event"
							totalEvents={events.length}
							totalRegistrations={calculatedTotalRegistrations}
							upcomingEvents={
								events.filter((event) => new Date(event.date) >= new Date() && event.status !== "draft")
									.length
							}
							averageRating={
								feedbackSummary?.averageRating ? feedbackSummary.averageRating.toFixed(1) : "N/A"
							}
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
							filterOptions={eventFilterOptions}
							onCreateEvent={toggleCreateModal}
						/>
					</div>
				) : (
					<div className="space-y-8">
						{/* Internships Dashboard Overview */}
						<DashboardOverview
							type="internships"
							onCreateAction={toggleCreateInternshipModal}
							title="Internships Management"
							subtitle="Create and manage your internships, track applications"
							buttonText="Create New Internship"
							totalInternships={internships.length}
							totalApplications={calculatedTotalApplications}
							activeInternships={
								internships.filter(
									(internship) =>
										new Date(internship.applicationDeadline) >= new Date() &&
										internship.status !== "draft"
								).length
							}
							avgApplications={
								internships.length > 0
									? Math.round(calculatedTotalApplications / internships.length)
									: 0
							}
						/>

						{/* Internships Performance Analytics */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card overflow-hidden">
							<div className="p-6 pb-0">
								<div className="flex items-center mb-4">
									<div className="bg-purple-10 p-3 rounded-full mr-4">
										<ChartBarIcon className="h-6 w-6 text-purple" />
									</div>
									<div>
										<h2 className="text-xl font-semibold ym-text-primary">
											Internship Application Analytics
										</h2>
										<p className="text-sm ym-text-secondary">
											Track your internship application performance
										</p>
									</div>
								</div>
							</div>

							<div className="p-6">
								{internships.length === 0 ? (
									<div className="text-center py-8">
										<BriefcaseIcon className="mx-auto h-12 w-12 ym-text-muted mb-4" />
										<p className="ym-text-muted">
											No internships yet. Create your first internship to see analytics.
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{internships.slice(0, 5).map((internship) => (
											<div
												key={internship._id}
												className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
											>
												<div className="flex items-center space-x-4">
													<div className="flex-shrink-0">
														<div className="w-10 h-10 bg-purple-10 rounded-full flex items-center justify-center">
															<span className="text-sm font-medium text-purple">
																{internship.title.charAt(0).toUpperCase()}
															</span>
														</div>
													</div>
													<div>
														<h3 className="font-medium ym-text-primary">
															{internship.title}
														</h3>
														<p className="text-sm ym-text-secondary">
															{internship.companyName}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-lg font-semibold ym-text-primary">
														{internship.applicationCount || 0}
													</p>
													<p className="text-sm ym-text-secondary">applications</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Internships List */}
						<InternshipsList
							internships={internships}
							internshipFilter={internshipFilter}
							setInternshipFilter={setInternshipFilter}
							filterOptions={internshipFilterOptions}
							onCreateInternship={toggleCreateInternshipModal}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
