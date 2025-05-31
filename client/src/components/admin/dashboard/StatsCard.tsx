import React, { memo } from 'react';
import { StatsCardProps } from '@/types';

// Optimized Stats Card Component
const StatsCard: React.FC<StatsCardProps> = memo(({ title, value, description, icon, bgClass, borderClass, iconBgClass }) => (
	<div
		className={`${bgClass} p-6 rounded-xl border ${borderClass} hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}
	>
		<div
			className={`absolute top-0 right-0 w-20 h-20 ${iconBgClass} rounded-full -translate-y-10 translate-x-10`}
		></div>
		<div className="relative z-10">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
				<div
					className={`p-2 rounded-lg ${iconBgClass.replace('-5', '-10')} group-hover:${iconBgClass.replace(
						'-5',
						'-20'
					)} transition-colors`}
				>
					{icon}
				</div>
			</div>
			<p className="text-3xl font-bold text-primary">{value}</p>
			<p className="text-sm text-muted-foreground mt-1">{description}</p>
		</div>
	</div>
));

StatsCard.displayName = 'StatsCard';

export default StatsCard; 