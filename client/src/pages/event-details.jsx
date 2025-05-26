import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDate } from '../utils/formatDate';
import { Tabs } from '../components/common';

const EventDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated } = useAuth();

	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSaved, setIsSaved] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [xpEarned, setXpEarned] = useState(null);
	const [registrationError, setRegistrationError] = useState(null);
	const [activeTab, setActiveTab] = useState('details');

	// Check for registration success from URL query
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		if (queryParams.get('registered') === 'true') {
			setRegistrationSuccess(true);
			// Clear the URL parameter without refreshing the page
			const newUrl = window.location.pathname;
			window.history.replaceState({}, '', newUrl);
		}
	}, [location.search]);

	// Fetch event details
	useEffect(() => {
		const fetchEventDetails = async () => {
			setLoading(true);
			try {
				const response = await axios.get(`/events/${id}`);
				setEvent(response.data.event);

				// If user is authenticated, check if they've saved or registered for this event
				if (isAuthenticated) {
					const userEventsResponse = await axios.get('/user/events');

					// Check if event is saved
					const eventIsSaved = userEventsResponse.data.savedEvents?.some(
						(savedEvent) => savedEvent.id === id
					);
					setIsSaved(eventIsSaved || false);

					// Check if event is registered
					const eventIsRegistered = userEventsResponse.data.events?.some((regEvent) => regEvent.id === id);
					setIsRegistered(eventIsRegistered || false);
				}
			} catch (error) {
				console.error('Error fetching event details:', error);
				setError('Failed to load event details. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchEventDetails();
	}, [id, isAuthenticated]);

	// Handle saving/unsaving event
	const handleSaveEvent = async () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: `/event/${id}` } });
			return;
		}

		try {
			const response = await axios.post(`/events/${id}/save`);
			setIsSaved(response.data.isSaved);
		} catch (error) {
			console.error('Error saving event:', error);
		}
	};

	// Handle registration
	const handleRegister = async () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: `/event/${id}` } });
			return;
		}

		setRegistrationError(null);

		try {
			const response = await axios.post(`/events/${id}/register`);
			setIsRegistered(true);
			setRegistrationSuccess(true);
			setXpEarned(response.data.xp);
			setRegistrationError(null);
		} catch (error) {
			console.error('Error registering for event:', error);
			setRegistrationError(error.response?.data?.message || 'Failed to register. Please try again.');
		}
	};

	// Generate Google Calendar link
	const generateGoogleCalendarLink = () => {
		if (!event) return '#';

		const startDate = new Date(event.date);
		const endDate = new Date(startDate);
		endDate.setHours(endDate.getHours() + 2); // Assume 2 hours duration

		const details = `${event.description}\n\nVenue: ${event.location.venue}, ${event.location.address}, ${event.location.city}\n\nOrganized by: ${event.organizer.name}`;

		// Format dates for Google Calendar
		const formatForCalendar = (date) => {
			return date.toISOString().replace(/-|:|\.\d+/g, '');
		};

		return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
			event.title
		)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(
			details
		)}&location=${encodeURIComponent(`${event.location.venue}, ${event.location.city}`)}&sf=true&output=xml`;
	};

	// Generate WhatsApp share link
	const generateWhatsAppLink = () => {
		if (!event) return '#';

		const eventDate = formatDate(event.date);
		const shareText = `Check out this event: "${event.title}" on ${eventDate} at ${event.location.venue}, ${event.location.city}. Register here: ${window.location.href}`;

		return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
	};

	// Show loading state
	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="flex flex-col items-center justify-center h-64">
					<div
						className="w-12 h-12 border-t-4 border-solid rounded-full animate-spin mb-4"
						style={{ borderTopColor: 'var(--ring)' }}
					></div>
					<h2 className="text-xl font-semibold ym-text-secondary">Loading event details...</h2>
				</div>
			</div>
		);
	}

	// Show error state
	if (error || !event) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> {error || 'Event not found'}</span>
					<button
						onClick={() => navigate('/dashboard')}
						className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-12 mt-12">
				{/* Registration Success Message */}
				{registrationSuccess && (
					<div className="ym-bg-success bg-opacity-10 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-start animate-fade-in">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 mr-2 mt-0.5 ym-text-success"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<p className="font-bold">Registration Successful!</p>
							<p>You have successfully registered for this event.</p>
							{xpEarned && <p className="mt-1">You earned 10 XP for registering. Keep it up!</p>}
						</div>
					</div>
				)}

				{/* Registration Error Message */}
				{registrationError && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 animate-fade-in">
						<p className="font-bold">Registration Failed</p>
						<p>{registrationError}</p>
					</div>
				)}

				<div className="flex flex-col md:flex-row gap-8">
					{/* Event Image */}
					<div className="md:w-1/2 lg:w-2/5">
						<div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
							<img src={event.poster} alt={event.title} className="w-full h-auto object-cover" />
						</div>

						{/* Action Buttons (Mobile) */}
						<div className="mt-6 flex flex-col gap-3 md:hidden">
							{!isRegistered ? (
								<button
									onClick={handleRegister}
									className="w-full gradient-bg text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
								>
									Register Now
								</button>
							) : (
								<button
									disabled
									className="w-full ym-bg-success text-white py-3 px-4 rounded-lg font-medium cursor-default flex items-center justify-center"
								>
									✓ Registered
								</button>
							)}

							<button
								onClick={handleSaveEvent}
								className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
									isSaved
										? 'ym-bg-amber-100 ym-text-yellow-700'
										: 'ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card'
								}`}
							>
								{isSaved ? (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 7H4v8h12V9z"
												clipRule="evenodd"
											/>
										</svg>
										Saved
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										Save Event
									</>
								)}
							</button>
						</div>
					</div>

					{/* Event Details */}
					<div className="md:w-1/2 lg:w-3/5">
						<div className="mb-4">
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-2xl md:text-3xl font-bold ym-text-primary mb-2">
										{event.title}
									</h1>
									<p className="ym-text-secondary mb-3">{event.shortDescription}</p>
								</div>

								{event.price > 0 ? (
									<span className="ym-bg-success text-white text-lg font-semibold rounded-lg py-1 px-3">
										₹{event.price}
									</span>
								) : (
									<span className="ym-bg-success text-white text-sm font-semibold rounded-lg py-1 px-3">
										Free
									</span>
								)}
							</div>

							<div className="flex flex-wrap gap-2 mb-6">
								<span className="ym-bg-amber-100 ym-text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded">
									{event.category}
								</span>
								<span className="ym-bg-orange-400 text-white text-xs font-medium px-2.5 py-0.5 rounded">
									{event.type}
								</span>
								{event.tags &&
									event.tags.map((tag, index) => (
										<span
											key={index}
											className="ym-bg-card ym-text-card text-xs font-medium px-2.5 py-0.5 rounded border ym-border-card"
										>
											{tag}
										</span>
									))}
							</div>
						</div>

						{/* Action Buttons (Desktop) */}
						<div className="hidden mb-8 md:flex gap-3">
							{!isRegistered ? (
								<button
									onClick={handleRegister}
									className="gradient-bg text-white py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center"
								>
									Register Now
								</button>
							) : (
								<button
									disabled
									className="ym-bg-success text-white py-2 px-6 rounded-lg font-medium cursor-default flex items-center"
								>
									✓ Registered
								</button>
							)}

							<button
								onClick={handleSaveEvent}
								className={`flex items-center py-2 px-6 rounded-lg font-medium transition-all duration-300 ${
									isSaved
										? 'ym-bg-amber-100 ym-text-yellow-700'
										: 'ym-bg-card hover:ym-bg-card-hover ym-text-card border ym-border-card'
								}`}
							>
								{isSaved ? (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 7H4v8h12V9z"
												clipRule="evenodd"
											/>
										</svg>
										Saved
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										Save Event
									</>
								)}
							</button>
						</div>

						{/* Event Information Tabs */}
						<Tabs
							tabs={[
								{
									id: 'details',
									label: 'Event Details',
									content: (
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-2">
													Description
												</h3>
												<p className="ym-text-secondary whitespace-pre-line">
													{event.description}
												</p>
											</div>

											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-2">
													Date & Time
												</h3>
												<div className="flex items-center ym-text-secondary">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5 mr-2 ym-text-yellow-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													<div>
														<p>{formatDate(event.date)}</p>
														{event.endDate && <p>To: {formatDate(event.endDate)}</p>}
													</div>
												</div>
											</div>

											<div>
												<h3 className="text-lg font-semibold ym-text-primary mb-2">Location</h3>
												<div className="flex items-start ym-text-secondary">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5 mr-2 mt-0.5 ym-text-yellow-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
														/>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													</svg>
													<div>
														{event.location.type === 'online' ? (
															<>
																<p>Online Event</p>
																<a
																	href={event.location.onlineUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="ym-text-yellow-600 hover:ym-text-yellow-700 hover:underline transition-colors"
																>
																	{event.location.onlineUrl}
																</a>
															</>
														) : (
															<>
																<p>{event.location.venue}</p>
																<p>{event.location.address}</p>
																<p>{event.location.city}</p>
															</>
														)}
													</div>
												</div>
											</div>

											{event.registrationDeadline && (
												<div>
													<h3 className="text-lg font-semibold ym-text-primary mb-2">
														Registration Deadline
													</h3>
													<div className="flex items-center ym-text-secondary">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-5 w-5 mr-2 ym-text-yellow-600"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<p>{formatDate(event.registrationDeadline)}</p>
													</div>
												</div>
											)}
										</div>
									),
								},
								{
									id: 'organizer',
									label: 'Organizer',
									content: (
										<div className="space-y-6">
											<div className="flex items-center mb-4">
												<div className="h-12 w-12 rounded-full ym-bg-amber-100 flex items-center justify-center overflow-hidden mr-4">
													{event.organizer.profilePicture ? (
														<img
															src={event.organizer.profilePicture}
															alt={event.organizer.name}
															className="h-full w-full object-cover"
														/>
													) : (
														<span className="text-lg font-medium ym-text-yellow-700">
															{event.organizer.name.charAt(0).toUpperCase()}
														</span>
													)}
												</div>
												<div>
													<h3 className="text-lg font-semibold ym-text-primary">
														{event.organizer.name}
													</h3>
													<p className="text-sm ym-text-secondary">Event Organizer</p>
												</div>
											</div>

											<p className="ym-text-secondary">
												{event.organizer.bio || 'No organizer information available.'}
											</p>

											<div className="ym-bg-card p-4 rounded-lg border ym-border-card">
												<h4 className="font-medium ym-text-primary mb-2">
													Contact Information
												</h4>
												<p className="ym-text-secondary">
													<a
														href={`mailto:${event.organizer.email}`}
														className="ym-text-yellow-600 hover:ym-text-yellow-700 hover:underline transition-colors"
													>
														{event.organizer.email}
													</a>
												</p>
											</div>
										</div>
									),
								},
								{
									id: 'share',
									label: 'Share',
									content: (
										<div className="space-y-6">
											<p className="ym-text-secondary">
												Share this event with friends and colleagues:
											</p>

											<div className="flex flex-wrap gap-4">
												<a
													href={generateWhatsAppLink()}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
												>
													<svg
														className="h-5 w-5 mr-2"
														viewBox="0 0 24 24"
														fill="currentColor"
													>
														<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
													</svg>
													WhatsApp
												</a>

												<a
													href={`mailto:?subject=${encodeURIComponent(
														`Join me at ${event.title}`
													)}&body=${encodeURIComponent(
														`I thought you might be interested in this event: ${
															event.title
														}.\n\nDate: ${formatDate(event.date)}\nLocation: ${
															event.location.type === 'online'
																? 'Online Event'
																: `${event.location.venue}, ${event.location.city}`
														}\n\nCheck it out here: ${window.location.href}`
													)}`}
													className="flex items-center gradient-bg text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300"
												>
													<svg
														className="h-5 w-5 mr-2"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
														/>
													</svg>
													Email
												</a>

												<a
													href={generateGoogleCalendarLink()}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
												>
													<svg
														className="h-5 w-5 mr-2"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													Add to Calendar
												</a>

												<button
													onClick={() => {
														navigator.clipboard.writeText(window.location.href);
														alert('Link copied to clipboard!');
													}}
													className="flex items-center ym-bg-card ym-text-card py-2 px-4 rounded-lg hover:ym-bg-card-hover transition-colors border ym-border-card"
												>
													<svg
														className="h-5 w-5 mr-2"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
													Copy Link
												</button>
											</div>
										</div>
									),
								},
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>

						{/* Registration Status */}
						<div className="mt-8 ym-bg-card rounded-lg p-4 border ym-border-card">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium ym-text-primary">Registration Status</h3>
									<div className="flex items-center mt-1">
										<div
											className={`h-2.5 w-2.5 rounded-full mr-2 ${
												event.registrationCount >= event.capacity
													? 'bg-red-500'
													: 'ym-bg-success'
											}`}
										></div>
										<p className="text-sm ym-text-secondary">
											{event.registrationCount >= event.capacity
												? 'Sold Out'
												: 'Open for Registration'}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm ym-text-secondary">Spots Remaining</p>
									<p className="text-lg font-semibold ym-text-primary">
										{Math.max(0, event.capacity - event.registrationCount)} / {event.capacity}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventDetails;
