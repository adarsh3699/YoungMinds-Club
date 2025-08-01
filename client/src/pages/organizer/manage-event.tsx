import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import {
	ArrowLeftIcon,
	PencilIcon,
	DocumentDuplicateIcon,
	ArrowDownTrayIcon,
	UsersIcon,
	ChartBarIcon,
	QrCodeIcon,
} from "@heroicons/react/24/outline";
import CreateEventModal from "../../components/organizer/CreateEventModal";
import { Modal, Tabs } from "../../components/common";
import { ManageEventData, AttendeeData, EventManageApiResponse, AttendeesApiResponse } from "@/types";

// Custom tab item interface to allow JSX labels
interface EventTabItem {
	id: string;
	key?: string;
	label: React.ReactNode;
	content: React.ReactNode;
}

const EventManagePage: React.FC = () => {
	const { id: eventId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [event, setEvent] = useState<ManageEventData | null>(null);
	const [attendees, setAttendees] = useState<AttendeeData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState<boolean>(false);
	const [showQrCode, setShowQrCode] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("attendees");

	// Fetch event and attendee data
	useEffect(() => {
		const fetchData = async (): Promise<void> => {
			try {
				setLoading(true);
				// Fetch event details
				const eventResponse: AxiosResponse<EventManageApiResponse> = await axios.get(
					`/organizer/events/${eventId}`
				);
				setEvent(eventResponse.data.event);

				// Fetch attendees
				const attendeesResponse: AxiosResponse<AttendeesApiResponse> = await axios.get(
					`/organizer/events/${eventId}/attendees`
				);
				setAttendees(attendeesResponse.data.attendees);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching event data:", error);
				setError("Failed to load event data. Please try again.");
				setLoading(false);
			}
		};

		fetchData();
	}, [eventId]);

	const formatDate = (dateString: string): string => {
		try {
			return format(new Date(dateString), "MMMM d, yyyy h:mm a");
		} catch {
			return "Invalid date";
		}
	};

	const handleEditSuccess = (updatedEvent: ManageEventData): void => {
		setShowEditModal(false);
		setEvent(updatedEvent);
	};

	const handleDuplicateEvent = (): void => {
		if (!event) return;

		const eventToDuplicate = { ...event };
		// Remove specific fields
		delete (eventToDuplicate as Partial<ManageEventData>)._id;
		delete (eventToDuplicate as Partial<ManageEventData>).createdAt;
		delete (eventToDuplicate as Partial<ManageEventData>).updatedAt;

		// Set a default title to indicate it's a duplicate
		eventToDuplicate.title = `Copy of ${eventToDuplicate.title}`;

		localStorage.setItem("duplicateEvent", JSON.stringify(eventToDuplicate));
		navigate("/organizer/events/create");
	};

	const downloadCSV = (): void => {
		if (!event) return;

		// Format attendees data for CSV
		const csvContent = [
			// CSV Header
			["Name", "Email", "Registration Date", "Status"].join(","),
			// CSV Data Rows
			...attendees.map((attendee) =>
				[
					attendee.name,
					attendee.email,
					format(new Date(attendee.registrationDate), "yyyy-MM-dd"),
					attendee.status,
				].join(",")
			),
		].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_attendees.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const downloadQRCode = (): void => {
		if (!event) return;

		const canvas = document.getElementById("event-qrcode") as HTMLCanvasElement;
		if (canvas) {
			const link = document.createElement("a");
			link.download = `${event.title.replace(/\s+/g, "_")}_qrcode.png`;
			link.href = canvas.toDataURL("image/png");
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-gray-200">
				<div className="text-red-400 mb-4">{error}</div>
				<button
					onClick={() => navigate("/organizer/dashboard")}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				>
					Return to Dashboard
				</button>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-gray-200">
				<div className="text-red-400 mb-4">Event not found or you do not have permission.</div>
				<button
					onClick={() => navigate("/organizer/dashboard")}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				>
					Return to Dashboard
				</button>
			</div>
		);
	}

	// Prepare the content for attendees tab
	const attendeesTabContent = (
		<div className="bg-gray-800 rounded-lg p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold text-gray-200">Registered Attendees ({attendees.length})</h3>
				{attendees.length > 0 && (
					<button
						onClick={downloadCSV}
						className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
					>
						<ArrowDownTrayIcon className="h-4 w-4 mr-1" />
						Download CSV
					</button>
				)}
			</div>

			{attendees.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-400">No attendees have registered for this event yet.</p>
				</div>
			) : (
				<div className="table-scroll overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-700">
						<thead className="bg-gray-800">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Email
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Registered On
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Feedback
								</th>
							</tr>
						</thead>
						<tbody className="bg-gray-800 divide-y divide-gray-700">
							{attendees.map((attendee) => (
								<tr key={attendee.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
												{attendee.profilePicture ? (
													<img
														src={attendee.profilePicture}
														alt={attendee.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<span className="text-sm font-medium text-gray-300">
														{attendee.name.charAt(0).toUpperCase()}
													</span>
												)}
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-200">{attendee.name}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-300">{attendee.email}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-300">
											{format(new Date(attendee.registrationDate), "MMM d, yyyy")}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												attendee.status === "attended"
													? "bg-green-900 text-green-200"
													: "bg-blue-900 text-blue-200"
											}`}
										>
											{attendee.status === "attended" ? "Attended" : "Registered"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{attendee.hasFeedback ? (
											<span className="text-green-400 text-sm">Submitted</span>
										) : (
											<span className="text-gray-500 text-sm">None</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);

	// Prepare the content for analytics tab
	const analyticsTabContent = (
		<div className="bg-gray-800 rounded-lg p-6">
			<h3 className="text-lg font-semibold mb-4 text-gray-200">Registration Analytics</h3>

			<div className="bg-gray-700 p-6 rounded-lg">
				<p className="text-center text-gray-400">
					Registration analytics visualization will be available in a future update.
				</p>

				<div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Total Registrations</h4>
						<p className="text-3xl font-bold text-blue-400">{event.registrationCount}</p>
					</div>

					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Capacity Filled</h4>
						<p className="text-3xl font-bold text-green-400">
							{Math.round((event.registrationCount / event.capacity) * 100)}%
						</p>
					</div>

					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Feedback Rate</h4>
						<p className="text-3xl font-bold text-purple-400">
							{attendees.length > 0
								? Math.round((attendees.filter((a) => a.hasFeedback).length / attendees.length) * 100)
								: 0}
							%
						</p>
					</div>
				</div>
			</div>
		</div>
	);

	const tabs: EventTabItem[] = [
		{
			id: "attendees",
			key: "attendees",
			label: (
				<span className="flex items-center">
					<UsersIcon className="h-5 w-5 mr-2" />
					Attendees
				</span>
			),
			content: attendeesTabContent,
		},
		{
			id: "analytics",
			key: "analytics",
			label: (
				<span className="flex items-center">
					<ChartBarIcon className="h-5 w-5 mr-2" />
					Analytics
				</span>
			),
			content: analyticsTabContent,
		},
	];

	return (
		<div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-gray-200">
			{/* Back Button and Event Title */}
			<div className="mb-6">
				<button
					onClick={() => navigate("/dashboard")}
					className="flex items-center text-blue-400 hover:text-blue-300 mb-2"
				>
					<ArrowLeftIcon className="h-4 w-4 mr-1" />
					Back to Dashboard
				</button>
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-white">{event.title}</h1>
					<div className="flex space-x-2">
						<button
							onClick={() => setShowEditModal(true)}
							className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
						>
							<PencilIcon className="h-4 w-4 mr-1" />
							Edit
						</button>
						<button
							onClick={handleDuplicateEvent}
							className="flex items-center px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
						>
							<DocumentDuplicateIcon className="h-4 w-4 mr-1" />
							Duplicate
						</button>
					</div>
				</div>
			</div>

			{/* Event Information */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-md overflow-hidden">
					<img src={event.poster} alt={event.title} className="w-full h-64 object-cover" />
					<div className="p-6">
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
								{event.category}
							</span>
							<span className="bg-purple-900 text-purple-200 text-xs font-medium px-2.5 py-0.5 rounded">
								{event.type}
							</span>
							{event.tags &&
								event.tags.map((tag, index) => (
									<span
										key={index}
										className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded"
									>
										{tag}
									</span>
								))}
						</div>

						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold text-gray-200">Description</h3>
								<p className="text-gray-300 mt-1 whitespace-pre-line">{event.description}</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h3 className="text-sm font-semibold text-gray-200">Date & Time</h3>
									<p className="text-gray-300">{formatDate(event.date)}</p>
									{event.endDate && <p className="text-gray-300">To: {formatDate(event.endDate)}</p>}
								</div>

								<div>
									<h3 className="text-sm font-semibold text-gray-200">Location</h3>
									{event.location.type === "online" ? (
										<div>
											<p className="text-gray-300">Online Event</p>
											<a
												href={event.location.onlineUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-400 hover:underline"
											>
												{event.location.onlineUrl}
											</a>
										</div>
									) : (
										<div>
											<p className="text-gray-300">{event.location.venue}</p>
											<p className="text-gray-300">{event.location.address}</p>
											<p className="text-gray-300">{event.location.city}</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-gray-800 rounded-lg shadow-md p-6">
					<h3 className="text-xl font-semibold mb-4 text-gray-200">Event Stats</h3>
					<div className="space-y-4">
						<div className="bg-gray-700 p-4 rounded-lg">
							<p className="text-sm text-gray-300">Registrations</p>
							<div className="flex items-end justify-between">
								<p className="text-3xl font-bold text-blue-400">{event.registrationCount}</p>
								<p className="text-sm text-gray-400">of {event.capacity} capacity</p>
							</div>
							<div className="mt-2 bg-gray-600 rounded-full h-2.5">
								<div
									className="bg-blue-500 h-2.5 rounded-full"
									style={{
										width: `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%`,
									}}
								></div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-700 p-4 rounded-lg">
								<p className="text-sm text-gray-300">Price</p>
								<p className="text-2xl font-bold text-green-400">₹{event.price || 0}</p>
							</div>
							<div className="bg-gray-700 p-4 rounded-lg">
								<p className="text-sm text-gray-300">Revenue</p>
								<p className="text-2xl font-bold text-purple-400">
									₹{(event.price || 0) * event.registrationCount}
								</p>
							</div>
						</div>

						<div className="border-t border-gray-700 pt-4">
							<button
								onClick={() => setShowQrCode(true)}
								className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700"
							>
								<QrCodeIcon className="h-5 w-5 mr-2" />
								Show Event QR Code
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-gray-800 shadow-md overflow-hidden border-0">
				<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
			</div>

			{/* Edit Event Modal */}
			<Modal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				maxWidth="max-w-4xl"
				noPadding={true}
				showCloseButton={false}
			>
				{event && (
					<CreateEventModal
						onClose={() => setShowEditModal(false)}
						onSuccess={handleEditSuccess}
						eventToEdit={event as any} // eslint-disable-line @typescript-eslint/no-explicit-any
						isEditing={true}
					/>
				)}
			</Modal>

			{/* QR Code Modal */}
			<Modal isOpen={showQrCode} onClose={() => setShowQrCode(false)} title="Event QR Code" maxWidth="max-w-md">
				<div className="flex flex-col items-center">
					<p className="text-sm text-gray-400 mb-4">Scan this QR code to view event details</p>

					<div className="bg-white p-4 rounded-lg shadow-sm">
						<QRCodeCanvas
							id="event-qrcode"
							value={`${window.location.origin}/event/${event._id}`}
							size={200}
							level="H"
							includeMargin={true}
						/>
					</div>

					<button
						onClick={downloadQRCode}
						className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
					>
						<ArrowDownTrayIcon className="h-5 w-5 mr-2" />
						Download QR Code
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default EventManagePage;
