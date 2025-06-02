import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';
import UserCard from './UserCard';
import { ActiveUsersProps } from '@/types';

const ActiveUsers: React.FC<ActiveUsersProps> = ({ users = [] }) => {
	return (
		<div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm">
			<div className="bg-gradient-to-r from-info/10 to-brand-light/10 p-6 border-b border-border/30">
				<h2 className="text-xl font-bold text-card-foreground flex items-center">
					<UserIcon className="h-6 w-6 text-info mr-3" />
					Most Active Users
				</h2>
				<p className="text-muted-foreground mt-1">Users with highest engagement</p>
			</div>

			<div className="p-6">
				{users.length === 0 ? (
					<div className="text-center py-8">
						<UserIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
						<p className="text-muted-foreground">No data available</p>
					</div>
				) : (
					<div className="space-y-4">
						{users.map((user, index) => (
							<UserCard key={user._id} user={user} index={index} type="user" />
						))}
					</div>
				)}

				<div className="mt-6 pt-4 border-t border-border/30 text-right">
					<Link
						to="/admin/users"
						className="text-info hover:text-info/80 font-medium text-sm transition-colors inline-flex items-center"
					>
						View All Users
						<span className="ml-1">→</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ActiveUsers; 