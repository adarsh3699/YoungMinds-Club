import React from 'react';
import { BadgeCollectionProps } from '@/types';

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges, getBadgeInfo }) => {
	return (
		<div className="ym-bg-card rounded-xl shadow-lg p-6 border ym-border-card animate-fade-in h-fit">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold ym-text-primary flex items-center">
					<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
						<svg className="w-6 h-6 ym-text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					Badge Collection
				</h2>
				<div className="text-sm ym-text-muted">
					{badges?.filter((badge) => badge?.unlocked ?? true).length || 0} / {badges?.length || 5} Earned
				</div>
			</div>

			{!badges || badges.length === 0 ? (
				<div className="ym-bg-amber-100 p-8 rounded-xl text-center relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 opacity-50"></div>
					<div className="relative z-10">
						<div className="ym-bg-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
							<div className="text-5xl">🏆</div>
						</div>
						<h3 className="ym-text-yellow-700 font-bold text-lg mb-2">Start Your Journey!</h3>
						<p className="ym-text-yellow-600 text-sm mb-4">
							Participate in events to unlock amazing badges and showcase your achievements!
						</p>
						<div className="flex justify-center space-x-2">
							<div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
							<div
								className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"
								style={{ animationDelay: '0.2s' }}
							></div>
							<div
								className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"
								style={{ animationDelay: '0.4s' }}
							></div>
						</div>
					</div>
				</div>
			) : (
				<>
					{/* Progress Bar */}
					<div className="mb-6">
						<div className="flex justify-between text-sm ym-text-muted mb-2">
							<span>Badge Progress</span>
							<span>
								{Math.round(
									((badges?.filter((badge) => badge?.unlocked ?? true).length || 0) /
										(badges?.length || 1)) *
										100
								)}
								% Complete
							</span>
						</div>
						<div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
							<div
								className="h-full gradient-bg rounded-full transition-all duration-1000 ease-out"
								style={{
									width: `${
										((badges?.filter((badge) => badge?.unlocked ?? true).length || 0) /
											(badges?.length || 1)) *
										100
									}%`,
								}}
							></div>
						</div>
					</div>

					{/* Badges Grid */}
					<div className="grid grid-cols-2 gap-4">
						{badges.map((badge, index) => {
							const isUnlocked = badge?.unlocked ?? true;
							const badgeInfo = getBadgeInfo(badge?.name || 'Newbie');

							return (
								<div
									key={badge?._id || Math.random().toString()}
									className={`group relative p-4 rounded-xl text-center transition-all duration-500 hover:scale-105 cursor-pointer ${
										isUnlocked
											? `${badgeInfo.color} shadow-lg hover:shadow-xl`
											: 'bg-gray-100 border-2 border-dashed border-gray-300 opacity-60'
									}`}
									style={{
										animationDelay: `${index * 0.1}s`,
									}}
								>
									{/* Unlock Animation Overlay */}
									{isUnlocked && (
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse rounded-xl"></div>
									)}

									{/* Badge Icon with Glow Effect */}
									<div
										className={`text-4xl mb-3 transition-all duration-300 ${
											isUnlocked ? 'group-hover:scale-110 group-hover:animate-pulse' : 'grayscale'
										}`}
									>
										<div className="relative">{badgeInfo.icon}</div>
									</div>

									{/* Badge Name */}
									<h3
										className={`font-bold mb-2 transition-all duration-300 ${
											isUnlocked ? 'group-hover:scale-105' : 'text-gray-500'
										}`}
									>
										{badge?.name || 'Mystery Badge'}
									</h3>

									{/* Badge Description */}
									<p className={`text-xs leading-relaxed ${isUnlocked ? '' : 'text-gray-400'}`}>
										{isUnlocked
											? badge?.description || 'Achievement unlocked!'
											: 'Complete challenges to unlock'}
									</p>

									{/* Unlock Status */}
									{!isUnlocked && (
										<div className="mt-3">
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
												<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
														clipRule="evenodd"
													/>
												</svg>
												Locked
											</span>
										</div>
									)}

									{/* Earned Date for Unlocked Badges */}
									{isUnlocked && badge?.earnedDate && (
										<div className="mt-2">
											<span className="text-xs opacity-75">
												Earned {new Date(badge.earnedDate).toLocaleDateString()}
											</span>
										</div>
									)}

									{/* Rarity Indicator */}
									{isUnlocked && badge?.rarity && (
										<div className="absolute top-2 left-2">
											<div
												className={`w-3 h-3 rounded-full ${
													badge.rarity === 'legendary'
														? 'bg-purple-500'
														: badge.rarity === 'epic'
														? 'bg-blue-500'
														: badge.rarity === 'rare'
														? 'bg-green-500'
														: 'bg-gray-400'
												} animate-pulse`}
											></div>
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Achievement Stats */}
					<div className="mt-6 p-4 ym-bg-amber-100 rounded-lg">
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<div className="text-2xl font-bold ym-text-yellow-700">
									{badges?.filter((badge) => badge?.unlocked ?? true).length || 0}
								</div>
								<div className="text-xs ym-text-yellow-600">Earned</div>
							</div>
							<div>
								<div className="text-2xl font-bold ym-text-yellow-700">
									{badges?.filter((badge) => !(badge?.unlocked ?? true)).length || 0}
								</div>
								<div className="text-xs ym-text-yellow-600">Locked</div>
							</div>
							<div>
								<div className="text-2xl font-bold ym-text-yellow-700">
									{Math.round(
										((badges?.filter((badge) => badge?.unlocked ?? true).length || 0) /
											(badges?.length || 1)) *
											100
									)}
									%
								</div>
								<div className="text-xs ym-text-yellow-600">Complete</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default BadgeCollection; 