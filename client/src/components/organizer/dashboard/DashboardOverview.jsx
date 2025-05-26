import { PlusIcon, CalendarIcon, UsersIcon, StarIcon } from '@heroicons/react/24/outline';

const DashboardOverview = ({ onCreateEvent, dashboardData, calculatedTotalRegistrations, feedbackSummary }) => {
	const statsData = [
		{
			title: 'Total Events',
			value: dashboardData?.stats?.eventCount || 0,
			icon: CalendarIcon,
			bgColor: 'ym-bg-amber-100',
			iconColor: 'ym-text-yellow-600',
			valueColor: 'ym-text-yellow-600',
			delay: '0s',
		},
		{
			title: 'Total Registrations',
			value: dashboardData?.stats?.attendeeCount || calculatedTotalRegistrations || 0,
			icon: UsersIcon,
			bgColor: 'ym-bg-success bg-opacity-10',
			iconColor: 'text-white',
			valueColor: 'ym-text-success',
			delay: '0.1s',
		},
		{
			title: 'Total Feedback',
			value: feedbackSummary?.overallStats?.totalFeedback || 0,
			icon: StarIcon,
			bgColor: 'ym-bg-amber-100',
			iconColor: 'ym-text-yellow-600',
			valueColor: 'ym-text-yellow-600',
			delay: '0.2s',
		},
		{
			title: 'Average Rating',
			value: feedbackSummary?.overallStats?.averageRating
				? `${feedbackSummary.overallStats.averageRating.toFixed(1)}/5`
				: 'N/A',
			icon: StarIcon,
			bgColor: 'ym-bg-orange-400',
			iconColor: 'text-white',
			valueColor: 'ym-text-yellow-600',
			delay: '0.3s',
		},
	];

	return (
		<div className="mb-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
				<div>
					<h1 className="text-3xl font-bold ym-text-primary mb-2">Organizer Dashboard</h1>
					<p className="ym-text-secondary">Manage your events and engage with attendees</p>
				</div>
				<button
					onClick={onCreateEvent}
					className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 gradient-bg text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					Create New Event
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{statsData.map((stat, index) => (
					<div
						key={index}
						className="ym-bg-card p-6 rounded-lg shadow-md border ym-border-card flex items-center animate-fade-in-up hover:shadow-lg transition-all duration-300"
						style={{ animationDelay: stat.delay }}
					>
						<div className={`${stat.bgColor} p-3 rounded-full mr-4`}>
							<stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-1 ym-text-card">{stat.title}</h3>
							<p className={`text-3xl font-bold ${stat.valueColor}`}>{stat.value}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DashboardOverview;
