import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { AdminPageHeader, AdminTable, AdminConfirmationModal, StatsCard } from "../../components/admin/dashboard";
import { SearchAndFilter } from "../../components/common";
import {
	ExclamationTriangleIcon,
	CalendarIcon,
	FlagIcon,
	TrashIcon,
	EyeIcon,
	DocumentCheckIcon,
	SparklesIcon,
	PencilIcon,
} from "@heroicons/react/24/outline";
import { AdminEventData } from "@/types";
import type { DataItem } from "../../components/common/SearchAndFilter";
import CreateEventModal from "../../components/organizer/CreateEventModal";
import { EVENT_CATEGORIES, EVENT_TYPES } from "../../utils/eventConstants";

// Enhanced modal state type to include edit
type EventModalState = {
	isOpen: boolean;
	type: "delete" | "flag" | "edit" | null;
	eventId: string | null;
	eventTitle: string;
	isFlagged: boolean;
	flagReason: string;
	eventData?: AdminEventData | null;
};

const EventsManagement: React.FC = () => {
	// State
	const [events, setEvents] = useState<AdminEventData[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<AdminEventData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modal, setModal] = useState<EventModalState>({
		isOpen: false,
		type: null,
		eventId: null,
		eventTitle: "",
		isFlagged: false,
		flagReason: "",
		eventData: null,
	});

	// Filter options
	const statusOptions = [
		{ value: "", label: "All Status" },
		{ value: "published", label: "Published" },
		{ value: "draft", label: "Draft" },
		{ value: "featured", label: "Featured" },
		{ value: "flagged", label: "Flagged" },
	];

	// Table columns
	const columns = [
		{ key: "event", label: "Event", className: "w-1/4 min-w-[280px]" },
		{ key: "date", label: "Date & Time", className: "w-1/6 min-w-[160px]" },
		{ key: "organizer", label: "Organizer", className: "w-1/8 min-w-[120px]" },
		{ key: "category", label: "Category", className: "w-1/12 min-w-[100px]" },
		{ key: "status", label: "Status", className: "w-1/12 min-w-[100px]" },
		{ key: "actions", label: "Actions", className: "w-1/6 min-w-[160px]" },
	];

	// Empty state config
	const emptyStateConfig = {
		icon: <CalendarIcon className="w-16 h-16 text-muted-foreground/50" />,
		title: "No events found",
		description: "Try adjusting your search or filters",
		noFiltersDescription: "No events have been created yet",
	};

	// Optimized stats calculation
	const stats = useMemo(() => {
		const total = events.length;
		const published = events.filter((e) => e.isPublished).length;
		const featured = events.filter((e) => e.isFeatured).length;
		const flagged = events.filter((e) => e.isFlagged).length;

		return {
			total,
			published,
			draft: total - published,
			featured,
			flagged,
		};
	}, [events]);

	// Stats cards data
	const statsCards = [
		{
			title: "Total Events",
			value: stats.total,
			description: "All registered events",
			icon: <CalendarIcon className="h-6 w-6 text-primary" />,
			bgClass: "bg-gradient-primary-light",
			borderClass: "border-primary-20",
			iconBgClass: "bg-primary-5",
		},
		{
			title: "Published",
			value: stats.published,
			description: "Live & visible events",
			icon: <EyeIcon className="h-6 w-6 text-success" />,
			bgClass: "bg-gradient-success-light",
			borderClass: "border-success-20",
			iconBgClass: "bg-success-5",
		},
		{
			title: "Draft",
			value: stats.draft,
			description: "Unpublished events",
			icon: <DocumentCheckIcon className="h-6 w-6 text-warning" />,
			bgClass: "bg-warning-10",
			borderClass: "border-warning-20",
			iconBgClass: "bg-warning-5",
		},
		{
			title: "Featured",
			value: stats.featured,
			description: "Highlighted events",
			icon: <SparklesIcon className="h-6 w-6 text-purple" />,
			bgClass: "bg-purple-10",
			borderClass: "border-purple-20",
			iconBgClass: "bg-purple-10",
		},
		{
			title: "Flagged",
			value: stats.flagged,
			description: "Requiring attention",
			icon: <FlagIcon className="h-6 w-6 text-destructive" />,
			bgClass: "bg-destructive-10",
			borderClass: "border-destructive-20",
			iconBgClass: "bg-destructive-10",
		},
	];

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = (filtered: DataItem[]) => {
		setFilteredEvents(filtered as AdminEventData[]);
	};

	// API functions
	const fetchEvents = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await axios.get("/admin/events");
			if (data.success) {
				setEvents(data.events);
				setFilteredEvents(data.events);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
			setError("Failed to load events. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteEvent = useCallback(async () => {
		if (!modal.eventId) return;

		try {
			const { data } = await axios.delete(`/admin/events/${modal.eventId}`);
			if (data.success) {
				setEvents((prev) => prev.filter((event) => event._id !== modal.eventId));
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error deleting event:", error);
			setError("Failed to delete event. Please try again.");
		}
	}, [modal.eventId]);

	const toggleFlag = useCallback(async () => {
		if (!modal.eventId) return;

		try {
			const { data } = await axios.put(`/admin/events/${modal.eventId}/flag`, {
				isFlagged: !modal.isFlagged,
				flagReason: modal.flagReason,
			});

			if (data.success) {
				setEvents((prev) =>
					prev.map((event) =>
						event._id === modal.eventId
							? {
									...event,
									isFlagged: !modal.isFlagged,
									flagReason: !modal.isFlagged ? modal.flagReason : null,
							  }
							: event
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error updating event flag status:", error);
			setError("Failed to update event flag status. Please try again.");
		}
	}, [modal.eventId, modal.isFlagged, modal.flagReason]);

	const toggleFeature = useCallback(
		async (eventId: string, currentFeaturedStatus: boolean) => {
			// Find the event to check if it's published
			const event = events.find((e) => e._id === eventId);
			if (!event?.isPublished && !currentFeaturedStatus) {
				setError("Only published events can be featured. Please publish the event first.");
				return;
			}

			try {
				const { data } = await axios.put(`/admin/events/${eventId}/feature`, {
					isFeatured: !currentFeaturedStatus,
				});

				if (data.success) {
					setEvents((prev) =>
						prev.map((event) =>
							event._id === eventId ? { ...event, isFeatured: !currentFeaturedStatus } : event
						)
					);
					// Clear any previous error messages on successful operation
					setError(null);
				}
			} catch (error) {
				console.error("Error updating event featured status:", error);
				setError("Failed to update event featured status. Please try again.");
			}
		},
		[events]
	);

	// Modal handlers
	const openModal = useCallback((type: "delete" | "flag" | "edit", event: AdminEventData) => {
		setModal({
			isOpen: true,
			type,
			eventId: event._id,
			eventTitle: event.title,
			isFlagged: event.isFlagged || false,
			flagReason: event.flagReason || "",
			eventData: type === "edit" ? event : null,
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({
			...prev,
			isOpen: false,
			type: null,
			eventData: null,
		}));
	}, []);

	const handleConfirm = useCallback(() => {
		if (modal.type === "delete") {
			deleteEvent();
		} else if (modal.type === "flag") {
			toggleFlag();
		}
		// Edit is handled by the CreateEventModal's onSuccess callback
	}, [modal.type, deleteEvent, toggleFlag]);

	const handleEditSuccess = useCallback(
		(updatedEvent: AdminEventData) => {
			// Update the event in the local state
			setEvents((prev) =>
				prev.map((event) => (event._id === updatedEvent._id ? { ...event, ...updatedEvent } : event))
			);
			closeModal();
		},
		[closeModal]
	);

	// Optimized render function
	const renderEventRow = useCallback(
		(event: AdminEventData) => (
			<tr
				key={event._id}
				className={`group hover:bg-card-hover transition-colors ${
					event.isFlagged ? "bg-destructive-5 border-l-4 border-l-destructive" : ""
				}`}
			>
				{/* Event Details */}
				<td className="py-4 px-6">
					<div className="flex items-start space-x-3">
						<div className="relative flex-shrink-0">
							<img
								src={event.poster}
								alt={event.title}
								className="w-12 h-12 object-cover rounded-lg shadow-md"
								onError={(e) => {
									(e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=Event";
								}}
							/>
							{event.isFeatured && (
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full border-2 border-card" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<Link
								to={`/event/${event._id}`}
								className="text-brand-primary hover:text-brand-dark font-semibold text-sm block mb-1 transition-colors leading-tight"
								title={event.title}
							>
								<div className="line-clamp-2 break-words">{event.title}</div>
							</Link>
							{event.isFlagged && (
								<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-destructive-10 text-destructive rounded-full border border-destructive-20">
									<FlagIcon className="w-3 h-3 mr-1" />
									Flagged
								</span>
							)}
						</div>
					</div>
				</td>

				{/* Date & Time */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="font-medium">{format(new Date(event.date), "PPP")}</div>
					<div className="text-xs text-muted-foreground mt-1">{format(new Date(event.date), "p")}</div>
				</td>

				{/* Organizer */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="font-medium">{event.organizer?.name || "Unknown"}</div>
				</td>

				{/* Category */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-50 text-accent-foreground border border-accent-30">
						{event.category}
					</span>
				</td>

				{/* Status */}
				<td className="py-4 px-6">
					<div className="flex flex-col space-y-2">
						<span
							className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
								event.isPublished
									? "bg-success-10 text-success border border-success-20"
									: "bg-warning-10 text-warning border border-warning-20"
							}`}
						>
							{event.isPublished ? "Published" : "Draft"}
						</span>
						{event.isFeatured && (
							<span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-purple-10 text-purple rounded-full border border-purple-20">
								Featured
							</span>
						)}
					</div>
				</td>

				{/* Actions */}
				<td className="py-4 px-6">
					<div className="flex flex-wrap gap-1.5">
						<button
							onClick={() => openModal("edit", event)}
							className="px-2.5 py-1.5 text-xs font-medium bg-primary-10 text-primary rounded-lg hover:bg-primary-20 transition-all border border-primary-20"
						>
							<PencilIcon className="w-3 h-3 mr-1 inline" />
							Edit
						</button>

						<button
							onClick={() => event.isPublished && toggleFeature(event._id, event.isFeatured || false)}
							disabled={!event.isPublished}
							title={
								!event.isPublished
									? "Only published events can be featured"
									: event.isFeatured
									? "Remove from featured events"
									: "Add to featured events"
							}
							className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
								!event.isPublished
									? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
									: event.isFeatured
									? "bg-purple text-white hover:bg-purple-10"
									: "bg-purple-10 text-purple hover:bg-purple-30 border border-purple"
							}`}
						>
							<SparklesIcon className="w-3 h-3 mr-1 inline" />
							{event.isFeatured ? "Unfeature" : "Feature"}
						</button>

						<button
							onClick={() => openModal("flag", event)}
							className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
								event.isFlagged
									? "bg-info text-white hover:bg-info-80"
									: "bg-warning text-white hover:bg-warning-80"
							}`}
						>
							<FlagIcon className="w-3 h-3 mr-1 inline" />
							{event.isFlagged ? "Unflag" : "Flag"}
						</button>

						<button
							onClick={() => openModal("delete", event)}
							className="px-2.5 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive-80 transition-all"
						>
							<TrashIcon className="w-3 h-3 mr-1 inline" />
							Delete
						</button>

						<Link
							to={`/event/${event._id}`}
							className="px-2.5 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-card-hover transition-all"
						>
							<EyeIcon className="w-3 h-3 mr-1 inline" />
							View
						</Link>
					</div>
				</td>
			</tr>
		),
		[openModal, toggleFeature]
	);

	// Load events on mount
	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-surface-primary">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Header */}
				<AdminPageHeader
					icon={<CalendarIcon className="w-8 h-8" />}
					title="Event Management"
					description="Manage and monitor all events in the system"
					iconBgColor="text-brand-primary"
				/>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>

				{/* Enhanced Search and Filters with Advanced Filters */}
				<SearchAndFilter
					data={events}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="events"
					searchPlaceholder="Search events by title, location, or tags..."
					showCategory={true}
					showAdvancedFilters={true}
					categoryOptions={EVENT_CATEGORIES}
					statusOptions={statusOptions}
					eventTypeOptions={EVENT_TYPES}
					enableDateRange={true}
					enableEventType={true}
					enableOrganizer={true}
					enableRegistrationRange={true}
					enablePriceRange={true}
					enableOnlineOnly={true}
					enableFeaturedOnly={true}
					enableFreeOnly={true}
				/>

				{/* Error Alert */}
				{error && (
					<div className="bg-destructive-10 border-2 border-destructive-20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Events Table */}
				<AdminTable
					loading={loading}
					filteredItems={filteredEvents}
					searchTerm=""
					roleFilter="event"
					statusFilter="all"
					renderRow={renderEventRow}
					columns={columns}
					emptyStateConfig={emptyStateConfig}
				/>

				{/* Admin Confirmation Modal */}
				<AdminConfirmationModal
					modalType={modal.type === "edit" ? "delete" : modal.type || "delete"}
					isOpen={modal.isOpen && modal.type !== "edit"}
					onClose={closeModal}
					userName={modal.eventTitle}
					isFlagged={modal.isFlagged}
					flagReason={modal.flagReason}
					onFlagReasonChange={(e) => setModal((prev) => ({ ...prev, flagReason: e.target.value }))}
					onConfirm={handleConfirm}
					context="event"
				/>

				{/* Edit Event Modal */}
				{modal.isOpen && modal.type === "edit" && modal.eventData && (
					<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black-40">
						<div className="ym-bg-card w-full h-full sm:rounded-xl sm:shadow-xl sm:w-full sm:max-w-5xl sm:mx-auto sm:h-auto overflow-hidden">
							<CreateEventModal
								onClose={closeModal}
								onSuccess={handleEditSuccess}
								eventToEdit={modal.eventData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
								isEditing={true}
								apiEndpoint={
									modal.eventData?._id ? `/admin/events/${modal.eventData._id}` : (null as any) // eslint-disable-line @typescript-eslint/no-explicit-any
								}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default EventsManagement;
