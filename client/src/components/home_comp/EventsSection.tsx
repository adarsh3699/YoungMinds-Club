import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AdminEventData } from "@/types";

const EventsSection: React.FC = () => {
	const [events, setEvents] = useState<AdminEventData[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch featured events
	useEffect(() => {
		const fetchFeaturedEvents = async () => {
			try {
				setLoading(true);
				const response = await axios.get("/events", {
					params: {
						featured: "true",
						limit: 3,
					},
				});

				if (response.data.success) {
					setEvents(response.data.events);
				}
			} catch (error) {
				console.error("Error fetching featured events:", error);
				// Fallback to empty array on error
				setEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedEvents();
	}, []);

	// Helper functions for rendering event data
	const getLocationDisplay = (event: AdminEventData) => {
		if (event.location?.type === "online") {
			return "Virtual Event";
		}
		return event.location?.city ? `${event.location.city}` : "Location TBD";
	};

	const getPriceDisplay = (event: AdminEventData) => {
		if (event.price === 0) {
			return "Free";
		}
		return `₹${event.price}`;
	};

	const getGradientForCategory = (category: string) => {
		const gradients: { [key: string]: string } = {
			Technology: "from-purple-200 to-blue-200",
			Business: "from-pink-200 to-purple-200",
			Workshop: "from-green-200 to-blue-200",
			Conference: "from-blue-200 to-indigo-200",
			Networking: "from-yellow-200 to-orange-200",
			Competition: "from-red-200 to-pink-200",
		};
		return gradients[category] || "from-gray-200 to-gray-300";
	};

	// Don't render the section if loading or no featured events
	if (loading || events.length === 0) {
		return null;
	}

	return (
		<section className="py-20 ym-events-bg" id="events">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold ym-text-primary mb-4 animate-on-scroll">
						Featured <span className="gradient-text">Events</span>
					</h2>
					<p className="text-xl ym-text-secondary max-w-3xl mx-auto animate-on-scroll">
						Discover exciting events that will accelerate your career and expand your network.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{events.slice(0, 3).map((event) => (
						<div
							key={event._id}
							className="animate-on-scroll ym-bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border ym-border-card h-full flex flex-col"
						>
							<div
								className={`aspect-video bg-gradient-to-br ${getGradientForCategory(
									event.category || "Technology"
								)} relative`}
							>
								{event.poster ? (
									<img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
								) : (
									<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
										<CalendarIcon className="w-16 h-16 ym-text-white-80" />
									</div>
								)}
								<span className="absolute top-4 left-4 ym-bg-white-90 ym-text-primary px-3 py-1 rounded-full text-sm font-medium">
									{event.type || event.category || "Event"}
								</span>
								<span className="absolute top-4 right-4 ym-bg-success ym-text-white px-3 py-1 rounded-full text-sm font-medium">
									{getPriceDisplay(event)}
								</span>
							</div>

							<div className="p-6 flex flex-col flex-grow">
								<h3 className="text-xl font-semibold ym-text-card mb-2">{event.title}</h3>
								<p className="ym-text-secondary mb-4 line-clamp-2">
									{event.description || "Join us for an amazing event experience."}
								</p>

								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm ym-text-muted">
										<CalendarIcon className="w-4 h-4 mr-2" />
										{format(new Date(event.date), "PPP")}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<ClockIcon className="w-4 h-4 mr-2" />
										{format(new Date(event.date), "p")}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<MapPinIcon className="w-4 h-4 mr-2" />
										{getLocationDisplay(event)}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<UsersIcon className="w-4 h-4 mr-2" />
										{event.registrationCount || 0} registered
									</div>
								</div>

								<Link
									to={`/event/${event._id}`}
									className="block w-full py-3 text-center font-bold ym-text-white gradient-bg rounded-lg transition-all duration-300 transform hover:scale-105 mt-auto"
								>
									Register Now
								</Link>
							</div>
						</div>
					))}
				</div>

				<div className="text-center">
					<Link
						to="/events"
						className="inline-flex items-center px-8 py-4 text-lg font-medium ym-btn-secondary hover:ym-bg-card-hover rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
					>
						View All Events
						<ChevronRightIcon className="w-5 h-5 ml-2" />
					</Link>
				</div>
			</div>
		</section>
	);
};

export default EventsSection;
