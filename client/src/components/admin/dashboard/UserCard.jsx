import { memo } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

// Optimized User Card Component
const UserCard = memo(({ user, index, type = 'user' }) => {
	const isOrganizer = type === 'organizer';
	const colorClass = isOrganizer ? 'success' : 'info';

	return (
		<div className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 border-b border-border/20 last:border-0">
			<div className="flex items-center">
				<div className="relative">
					{user.profilePicture ? (
						<img
							src={user.profilePicture}
							alt={user.name}
							className={`w-12 h-12 rounded-xl mr-4 object-cover border-2 border-${colorClass}/20`}
						/>
					) : (
						<div
							className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${colorClass}/20 to-${colorClass}/10 flex items-center justify-center mr-4 border-2 border-${colorClass}/20`}
						>
							<span className={`text-${colorClass} font-bold text-lg`}>{user.name.charAt(0)}</span>
						</div>
					)}
					<div
						className={`absolute -top-1 -left-1 w-6 h-6 bg-${colorClass} rounded-full flex items-center justify-center text-white text-xs font-bold`}
					>
						{index + 1}
					</div>
				</div>
				<div>
					<h3
						className={`font-semibold text-card-foreground group-hover:text-${colorClass} transition-colors`}
					>
						{user.name}
					</h3>
					{isOrganizer ? (
						<p className="text-sm text-muted-foreground">
							{user.organizationName || 'Individual Organizer'}
						</p>
					) : (
						<div className="flex items-center text-sm">
							<span
								className={`inline-block px-2 py-1 bg-${colorClass}/10 text-${colorClass} rounded-lg text-xs font-medium mr-2`}
							>
								{user.badge}
							</span>
							<span className="text-muted-foreground">{user.xp} XP</span>
						</div>
					)}
				</div>
			</div>
			<div className="text-right">
				<p className="text-sm font-medium text-card-foreground">
					<span className={`text-${colorClass} font-bold`}>
						{isOrganizer ? user.eventsCount : user.eventsAttended}
					</span>{' '}
					events
				</p>
				{isOrganizer ? (
					<div className="flex items-center justify-end mt-1">
						{[...Array(5)].map((_, starIndex) => (
							<StarIcon
								key={starIndex}
								className={`h-4 w-4 transition-colors ${
									starIndex < Math.floor(user.rating || 0)
										? 'text-brand-primary fill-current'
										: 'text-muted-foreground/30'
								}`}
							/>
						))}
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						{user.lastActive ? `Last: ${new Date(user.lastActive).toLocaleDateString()}` : ''}
					</p>
				)}
			</div>
		</div>
	);
});

UserCard.displayName = 'UserCard';

export default UserCard;
