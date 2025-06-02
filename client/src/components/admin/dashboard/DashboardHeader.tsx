import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { DashboardHeaderProps } from '@/types';

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
	return (
		<div className="bg-gradient-to-r from-primary/10 via-brand-light to-accent/20 p-8 border-b border-border/30">
			<div className="flex items-center space-x-3">
				<SparklesIcon className="h-8 w-8 text-primary" />
				<h1 className="text-3xl font-bold text-card-foreground">Admin Control Panel</h1>
			</div>
			<p className="text-muted-foreground mt-2">Manage your platform with comprehensive admin tools</p>
		</div>
	);
};

export default DashboardHeader; 