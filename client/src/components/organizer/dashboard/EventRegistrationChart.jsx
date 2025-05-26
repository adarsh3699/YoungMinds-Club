import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline';

const EventRegistrationChart = ({ events }) => {
	if (!events || events.length === 0) {
		return (
			<div className="ym-bg-card p-8 rounded-xl shadow-lg border ym-border-card mb-8 animate-fade-in">
				<div className="text-center">
					<ChartBarIcon className="h-16 w-16 ym-text-yellow-600 mx-auto mb-4 opacity-50" />
					<h3 className="text-lg font-semibold ym-text-primary mb-2">No Events Yet</h3>
					<p className="ym-text-muted">Create your first event to see registration analytics</p>
				</div>
			</div>
		);
	}

	// Calculate total registrations and average fill rate
	const totalRegistrations = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);
	const eventsWithCapacity = events.filter((event) => event.capacity);
	const averageFillRate =
		eventsWithCapacity.length > 0
			? eventsWithCapacity.reduce(
					(sum, event) => sum + ((event.registrationCount || 0) / event.capacity) * 100,
					0
			  ) / eventsWithCapacity.length
			: 0;

	// Get top 5 events by registration count
	const topEvents = [...events].sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0)).slice(0, 5);

	const getProgressColor = (percentage) => {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 75) return 'ym-bg-orange-400';
		if (percentage >= 50) return 'ym-bg-amber-400';
		return 'gradient-bg';
	};

	const getProgressGlow = (percentage) => {
		if (percentage >= 90) return 'shadow-red-500/30';
		if (percentage >= 75) return 'shadow-orange-400/30';
		if (percentage >= 50) return 'shadow-amber-400/30';
		return 'shadow-yellow-400/30';
	};

	return (
		<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card mb-8 animate-fade-in hover:shadow-xl transition-all duration-300">
			{/* Header Section */}
			<div className="flex items-center justify-between mb-6 pb-6 border-b ym-border-card">
				<div className="flex items-center">
					<div className="ym-bg-amber-100 p-3 rounded-xl mr-4">
						<ChartBarIcon className="h-6 w-6 ym-text-yellow-600" />
					</div>
					<div>
						<h2 className="text-xl font-bold ym-text-primary">Event Registration Analytics</h2>
						<p className="ym-text-secondary text-sm">Track your event performance</p>
					</div>
				</div>

				{/* Summary Stats */}
				<div className="hidden md:flex space-x-6">
					<div className="text-center">
						<div className="flex items-center justify-center mb-1">
							<ArrowTrendingUpIcon className="h-4 w-4 ym-text-yellow-600 mr-1" />
							<span className="text-2xl font-bold ym-text-yellow-600">{averageFillRate.toFixed(1)}%</span>
						</div>
						<p className="text-xs ym-text-muted">Avg Fill Rate</p>
					</div>
				</div>
			</div>

			{/* Mobile Summary Stats */}
			<div className="md:hidden grid grid-cols-2 gap-4 mb-6">
				<div className="ym-bg-amber-100 p-3 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<UsersIcon className="h-4 w-4 ym-text-yellow-600 mr-1" />
						<span className="text-xl font-bold ym-text-yellow-600">{totalRegistrations}</span>
					</div>
					<p className="text-xs ym-text-muted">Total Registrations</p>
				</div>
				<div className="ym-bg-amber-100 p-3 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<ArrowTrendingUpIcon className="h-4 w-4 ym-text-yellow-600 mr-1" />
						<span className="text-xl font-bold ym-text-yellow-600">{averageFillRate.toFixed(1)}%</span>
					</div>
					<p className="text-xs ym-text-muted">Avg Fill Rate</p>
				</div>
			</div>

			{/* Events Progress Bars */}
			<div className="space-y-4">
				{topEvents.map((event, index) => {
					const registrationCount = event.registrationCount || 0;
					const capacity = event.capacity || 0;
					const percentage = capacity > 0 ? (registrationCount / capacity) * 100 : 0;
					const progressColor = getProgressColor(percentage);
					const progressGlow = getProgressGlow(percentage);

					return (
						<div
							key={event._id}
							className="group p-4 rounded-lg ym-bg-white-90 hover:ym-bg-card-hover transition-all duration-300 animate-fade-in-up"
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							{/* Event Info Header */}
							<div className="flex justify-between items-start mb-3">
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold ym-text-primary truncate group-hover:ym-text-yellow-600 transition-colors duration-200">
										{event.title}
									</h3>
									<p className="text-sm ym-text-muted">
										{new Date(event.date).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										})}
									</p>
								</div>
								<div className="text-right ml-4">
									<div className="flex items-center space-x-2 justify-end">
										<span className="text-lg font-bold ym-text-yellow-600">
											{registrationCount}
										</span>
										{capacity > 0 && (
											<>
												<span className="ym-text-muted">/</span>
												<span className="ym-text-secondary font-medium">{capacity}</span>
											</>
										)}
									</div>
									{capacity > 0 && (
										<div className="text-xs ym-text-muted">{percentage.toFixed(1)}% filled</div>
									)}
								</div>
							</div>
							{/* Progress Bar */}
							<div className="relative">
								<div className="w-full bg-gray-200 dark:bg-gray-700 ym-bg-yellow-100 rounded-full h-3 overflow-hidden">
									<div
										className={`${progressColor} h-3 rounded-full transition-all duration-700 ease-out shadow-lg ${progressGlow} animate-pulse`}
										style={{
											width:
												capacity > 0
													? `${Math.min(100, percentage)}%`
													: `${Math.min(100, registrationCount * 10)}%`,
											animationDuration: '2s',
										}}
									></div>
								</div>

								{/* Capacity indicator line */}
								{capacity > 0 && percentage > 80 && (
									<div className="absolute top-0 right-0 h-3 w-1 bg-red-500 rounded-r-full opacity-75"></div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer */}
			{events.length > 5 && (
				<div className="mt-6 p-3 ym-bg-amber-100 rounded-lg">
					<p className="text-sm ym-text-yellow-700 text-center">
						📊 Showing top 5 events by registration count.
						<span className="font-medium"> {events.length - 5} more events</span> available in the events
						section below.
					</p>
				</div>
			)}
		</div>
	);
};

export default EventRegistrationChart;
