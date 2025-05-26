import { ChartBarIcon } from '@heroicons/react/24/outline';

const EventRegistrationChart = ({ events }) => {
	if (!events || events.length === 0) {
		return null;
	}

	return (
		<div className="ym-bg-card p-6 rounded-lg shadow-md border ym-border-card mb-8 animate-fade-in">
			<h2 className="text-xl font-semibold ym-text-primary mb-4 flex items-center">
				<ChartBarIcon className="h-5 w-5 mr-2 ym-text-yellow-600" />
				Registration Per Event
			</h2>
			<div className="mt-4">
				{events.slice(0, 5).map((event) => (
					<div key={event._id} className="mb-4">
						<div className="flex justify-between mb-1">
							<span className="ym-text-card font-medium">{event.title}</span>
							<span className="ym-text-secondary">
								{event.registrationCount || 0} / {event.capacity || '∞'}
							</span>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
							<div
								className="gradient-bg h-2.5 rounded-full transition-all duration-500"
								style={{
									width: event.capacity
										? `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%`
										: `${Math.min(100, event.registrationCount)}%`,
								}}
							></div>
						</div>
					</div>
				))}
			</div>
			{events.length > 5 && (
				<p className="text-sm ym-text-muted mt-2">
					Showing top 5 events. View all in the events section below.
				</p>
			)}
		</div>
	);
};

export default EventRegistrationChart;
