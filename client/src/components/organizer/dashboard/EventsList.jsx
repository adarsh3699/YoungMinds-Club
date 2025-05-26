import { Link } from 'react-router-dom';
import { CalendarIcon, UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SelectInput } from '../../common';

const EventsList = ({ events, eventFilter, setEventFilter, filterOptions, onCreateEvent }) => {
	const getFilteredEvents = () => {
		const now = new Date();

		if (eventFilter === 'upcoming') {
			return events.filter((event) => new Date(event.date) >= now && event.status !== 'draft');
		} else if (eventFilter === 'past') {
			return events.filter((event) => new Date(event.date) < now && event.status !== 'draft');
		} else if (eventFilter === 'draft') {
			return events.filter((event) => event.status === 'draft');
		}

		return events;
	};

	const filteredEvents = getFilteredEvents();

	return (
		<div className="ym-bg-card rounded-lg shadow-md border ym-border-card overflow-hidden animate-fade-in mb-25">
			<div className="p-6 pb-0">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold ym-text-primary">My Events</h2>
					<div className="flex space-x-4 items-center">
						<div className="w-48">
							<SelectInput
								value={eventFilter}
								onChange={(e) => setEventFilter(e.target.value)}
								options={filterOptions}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="p-6">
				{filteredEvents.length === 0 ? (
					<div className="text-center py-8">
						<p className="ym-text-muted mb-4">
							You don't have any {eventFilter !== 'all' ? eventFilter : ''} events yet.
						</p>
						<button
							onClick={onCreateEvent}
							className="inline-flex items-center px-6 py-3 gradient-bg text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
						>
							<PlusIcon className="h-5 w-5 mr-2" />
							Create Your First Event
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredEvents.map((event) => (
							<div
								key={event._id}
								className="ym-bg-card border ym-border-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
							>
								{event.poster ? (
									<img src={event.poster} alt={event.title} className="w-full h-48 object-cover" />
								) : (
									<div className="w-full h-48 ym-hero-image-bg flex items-center justify-center">
										<CalendarIcon className="h-12 w-12 text-white" />
									</div>
								)}

								<div className="p-4">
									<div className="flex justify-between items-start">
										<h3 className="text-lg font-semibold ym-text-primary mb-2">{event.title}</h3>
										{event.status === 'draft' && (
											<span className="ym-bg-amber-100 ym-text-yellow-700 text-xs px-2 py-1 rounded">
												Draft
											</span>
										)}
									</div>

									<p className="ym-text-secondary text-sm mb-3">
										{new Date(event.date).toLocaleDateString()} at {event.time}
									</p>

									<div className="flex items-center ym-text-muted text-sm mb-4">
										<UsersIcon className="h-4 w-4 mr-1" />
										<span>{event.registrationCount || 0} registrations</span>
									</div>

									<div className="flex justify-between">
										<Link
											to={`/organizer/event/${event._id}`}
											className="ym-text-yellow-600 hover:underline text-sm font-medium"
										>
											Manage Event
										</Link>

										<Link
											to={`/event/${event._id}`}
											className="ym-text-secondary hover:underline text-sm"
										>
											View Event
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EventsList;
