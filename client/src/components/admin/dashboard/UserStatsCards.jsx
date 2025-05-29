import { memo } from 'react';

const StatCard = memo(({ value, label, color = 'text-card-foreground', delay }) => (
	<div
		className="bg-card rounded-xl p-4 shadow-lg border border-border hover:shadow-xl transition-all duration-200 animate-fade-in"
		style={{
			animationDelay: delay,
			animationFillMode: 'both',
		}}
	>
		<div className={`text-2xl font-bold ${color}`}>{value}</div>
		<div className="text-sm text-muted-foreground">{label}</div>
	</div>
));

StatCard.displayName = 'StatCard';

const UserStatsCards = ({ userStats }) => {
	const stats = [
		{ value: userStats.total, label: 'Total Users', color: 'text-card-foreground' },
		{ value: userStats.active, label: 'Active', color: 'text-success' },
		{ value: userStats.suspended, label: 'Suspended', color: 'text-warning' },
		{ value: userStats.flagged, label: 'Flagged', color: 'text-destructive' },
		{ value: userStats.admins, label: 'Admins', color: 'text-purple' },
		{ value: userStats.organizers, label: 'Organizers', color: 'text-primary' },
		{ value: userStats.regularUsers, label: 'Users', color: 'text-muted-foreground' },
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
			{stats.map((stat, index) => (
				<StatCard
					key={stat.label}
					value={stat.value}
					label={stat.label}
					color={stat.color}
					delay={`${0.05 + index * 0.04}s`}
				/>
			))}
		</div>
	);
};

export default UserStatsCards;
