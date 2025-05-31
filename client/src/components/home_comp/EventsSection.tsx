import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FeaturedEvent } from '@/types';

const EventsSection: React.FC = () => {
	const events: FeaturedEvent[] = [
		{
			id: 1,
			title: 'Tech Leadership Summit 2024',
			description: 'Join industry leaders for insights on emerging technologies and leadership strategies.',
			date: 'March 15, 2024',
			time: '9:00 AM - 6:00 PM',
			location: 'San Francisco, CA',
			attendees: 250,
			price: 'Free',
			type: 'Conference',
			gradient: 'from-purple-200 to-blue-200',
		},
		{
			id: 2,
			title: 'Startup Pitch Competition',
			description: 'Present your innovative ideas to top investors and win funding opportunities.',
			date: 'March 22, 2024',
			time: '2:00 PM - 8:00 PM',
			location: 'New York, NY',
			attendees: 150,
			price: '$25',
			type: 'Competition',
			gradient: 'from-pink-200 to-purple-200',
		},
		{
			id: 3,
			title: 'Digital Marketing Masterclass',
			description: 'Learn advanced digital marketing strategies from industry experts.',
			date: 'March 28, 2024',
			time: '10:00 AM - 4:00 PM',
			location: 'Virtual Event',
			attendees: 500,
			price: '$49',
			type: 'Workshop',
			gradient: 'from-green-200 to-blue-200',
		},
	];

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
					{events.map((event) => (
						<div
							key={event.id}
							className="animate-on-scroll ym-bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border ym-border-card"
						>
							<div className={`aspect-video bg-gradient-to-br ${event.gradient} relative`}>
								<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
									<CalendarIcon className="w-16 h-16 ym-text-white-80" />
								</div>
								<span className="absolute top-4 left-4 ym-bg-white-90 ym-text-primary px-3 py-1 rounded-full text-sm font-medium">
									{event.type}
								</span>
								<span className="absolute top-4 right-4 ym-bg-success ym-text-white px-3 py-1 rounded-full text-sm font-medium">
									{event.price}
								</span>
							</div>

							<div className="p-6">
								<h3 className="text-xl font-semibold ym-text-card mb-2">{event.title}</h3>
								<p className="ym-text-secondary mb-4 line-clamp-2">{event.description}</p>

								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm ym-text-muted">
										<CalendarIcon className="w-4 h-4 mr-2" />
										{event.date}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<ClockIcon className="w-4 h-4 mr-2" />
										{event.time}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<MapPinIcon className="w-4 h-4 mr-2" />
										{event.location}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<UsersIcon className="w-4 h-4 mr-2" />
										{event.attendees} attendees
									</div>
								</div>

								<Link
									to={`/event/${event.id}`}
									className="block w-full py-3 text-center font-bold ym-text-white gradient-bg rounded-lg transition-all duration-300 transform hover:scale-105"
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