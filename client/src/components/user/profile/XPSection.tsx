import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import XPProgressBar from '../XPProgressBar';
import { XPSectionProps } from '@/types';

const XPSection: React.FC<XPSectionProps> = ({ userProfile, xpHistory }) => {
	return (
		<div className="ym-bg-card rounded-xl shadow-lg p-6 mt-6 border ym-border-card animate-fade-in">
			<h2 className="text-xl font-semibold ym-text-primary mb-4">XP Progress</h2>
			<div className="mb-6">
				<p className="ym-text-secondary mb-1">Current XP: {userProfile?.xp || 0}</p>
				<XPProgressBar xp={userProfile?.xp || 0} />
				<p className="ym-text-muted mt-2 text-sm">
					{userProfile?.xp || 0} / {Math.ceil((userProfile?.xp || 0) / 100) * 100} XP to next level
				</p>
			</div>

			<h3 className="text-lg font-medium ym-text-primary mb-3">XP History</h3>

			{!xpHistory || xpHistory.length === 0 ? (
				<div className="ym-bg-amber-100 p-6 rounded-lg text-center">
					<div className="ym-bg-amber-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
						<AcademicCapIcon className="h-6 w-6 ym-text-yellow-700" />
					</div>
					<p className="ym-text-yellow-700">No XP history available.</p>
					<p className="ym-text-yellow-600 text-sm mt-1">Start attending events to earn XP!</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y ym-border-card">
						<thead className="ym-bg-amber-100">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium ym-text-yellow-700 uppercase tracking-wider">
									Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium ym-text-yellow-700 uppercase tracking-wider">
									Activity
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium ym-text-yellow-700 uppercase tracking-wider">
									XP Earned
								</th>
							</tr>
						</thead>
						<tbody className="ym-bg-card divide-y ym-border-card">
							{xpHistory.map((entry) => (
								<tr
									key={entry?._id || Math.random().toString()}
									className="hover:ym-bg-card-hover transition-colors"
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm ym-text-primary">
										{entry?.date ? new Date(entry.date).toLocaleDateString() : 'Unknown date'}
									</td>
									<td className="px-6 py-4 text-sm ym-text-secondary">
										{entry?.description || 'Unknown activity'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm ym-text-success font-medium">
										+{entry?.amount || 0} XP
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default XPSection; 