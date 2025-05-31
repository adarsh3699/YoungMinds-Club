import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import UserCard from './UserCard';
import { TopOrganizersProps } from '@/types';

const TopOrganizers: React.FC<TopOrganizersProps> = ({ organizers = [] }) => {
	return (
		<div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm">
			<div className="bg-gradient-to-r from-success/10 to-brand-light/10 p-6 border-b border-border/30">
				<h2 className="text-xl font-bold text-card-foreground flex items-center">
					<UserGroupIcon className="h-6 w-6 text-success mr-3" />
					Top Organizers
				</h2>
				<p className="text-muted-foreground mt-1">Most successful event organizers</p>
			</div>

			<div className="p-6">
				{organizers.length === 0 ? (
					<div className="text-center py-8">
						<UserGroupIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
						<p className="text-muted-foreground">No data available</p>
					</div>
				) : (
					<div className="space-y-4">
						{organizers.map((organizer, index) => (
							<UserCard key={organizer._id} user={organizer} index={index} type="organizer" />
						))}
					</div>
				)}

				<div className="mt-6 pt-4 border-t border-border/30 text-right">
					<Link
						to="/admin/organizers"
						className="text-success hover:text-success/80 font-medium text-sm transition-colors inline-flex items-center"
					>
						View All Organizers
						<span className="ml-1">→</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default TopOrganizers; 