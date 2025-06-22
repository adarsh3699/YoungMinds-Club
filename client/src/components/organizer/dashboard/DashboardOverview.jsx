import {
	PlusIcon,
	CalendarDaysIcon,
	UsersIcon,
	StarIcon,
	BriefcaseIcon,
	DocumentTextIcon,
	ClockIcon,
	ChartBarIcon,
	ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const DashboardOverview = ({
	type = 'events', // 'events' or 'internships'
	onCreateAction,
	title,
	subtitle,
	buttonText,
	// Direct data props for events
	totalEvents = 0,
	totalRegistrations = 0,
	upcomingEvents = 0,
	averageRating = 'N/A',
	// Direct data props for internships
	totalInternships = 0,
	totalApplications = 0,
	activeInternships = 0,
	avgApplications = 0,
}) => {
	// Default titles and subtitles
	const defaultTitles = {
		events: {
			title: 'Events Management',
			subtitle: 'Create and manage your events, track registrations',
			buttonText: 'Create New Event',
		},
		internships: {
			title: 'Internships Management',
			subtitle: 'Create and manage your internships, track applications',
			buttonText: 'Create New Internship',
		},
	};

	const currentConfig = defaultTitles[type] || defaultTitles.events;
	const displayTitle = title || currentConfig.title;
	const displaySubtitle = subtitle || currentConfig.subtitle;
	const displayButtonText = buttonText || currentConfig.buttonText;

	// Generate stats based on type
	const statsData =
		type === 'events'
			? [
					{
						title: 'Total Events',
						value: totalEvents,
						icon: CalendarDaysIcon,
						bgColor: 'bg-warning-10',
						iconColor: 'text-warning',
						valueColor: 'text-warning',
						delay: '0s',
					},
					{
						title: 'Total Registration',
						value: totalRegistrations,
						icon: UsersIcon,
						bgColor: 'bg-success-10',
						iconColor: 'text-success',
						valueColor: 'text-success',
						delay: '0.1s',
					},
					{
						title: 'Upcoming Events',
						value: upcomingEvents,
						icon: ArrowTrendingUpIcon,
						bgColor: 'bg-info-10',
						iconColor: 'text-info',
						valueColor: 'text-info',
						delay: '0.2s',
					},
					{
						title: 'Avg Rating',
						value: averageRating,
						icon: StarIcon,
						bgColor: 'bg-warning-10',
						iconColor: 'text-warning',
						valueColor: 'text-warning',
						delay: '0.3s',
					},
			  ]
			: [
					{
						title: 'Total Internships',
						value: totalInternships,
						icon: BriefcaseIcon,
						bgColor: 'bg-purple-10',
						iconColor: 'text-purple',
						valueColor: 'text-purple',
						delay: '0s',
					},
					{
						title: 'Total Applications',
						value: totalApplications,
						icon: DocumentTextIcon,
						bgColor: 'bg-success-10',
						iconColor: 'text-success',
						valueColor: 'text-success',
						delay: '0.1s',
					},
					{
						title: 'Active Internships',
						value: activeInternships,
						icon: ClockIcon,
						bgColor: 'bg-info-10',
						iconColor: 'text-info',
						valueColor: 'text-info',
						delay: '0.2s',
					},
					{
						title: 'Avg Applications',
						value: avgApplications,
						icon: ChartBarIcon,
						bgColor: 'bg-gradient-brand-tertiary-light',
						iconColor: 'text-brand-tertiary',
						valueColor: 'text-brand-tertiary',
						delay: '0.3s',
					},
			  ];

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<div>
					<h2 className="text-2xl font-bold ym-text-primary mb-2">{displayTitle}</h2>
					<p className="ym-text-secondary">{displaySubtitle}</p>
				</div>
				<button
					onClick={onCreateAction}
					className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 gradient-bg text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					{displayButtonText}
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
