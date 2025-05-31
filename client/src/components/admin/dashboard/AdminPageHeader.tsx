import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { AdminPageHeaderProps } from '@/types';

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
	icon,
	title,
	description,
	backLink = '/admin/dashboard',
	backText = 'Back to Dashboard',
	iconBgColor = 'text-destructive',
}) => {
	return (
		<div
			className="bg-gradient-to-r from-primary/10 via-brand-light to-accent/20 rounded-2xl shadow-xl p-8 mb-8 animate-fade-in"
			style={{ animationFillMode: 'both' }}
		>
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
				<div className="flex items-center gap-4">
					<div className={`p-3 rounded-xl bg-card/80 ${iconBgColor} border border-border/20 shadow-lg`}>
						{icon}
					</div>
					<div>
						<h1 className="text-3xl font-bold text-card-foreground">{title}</h1>
						<p className="text-muted-foreground mt-1">{description}</p>
					</div>
				</div>
				<NavLink
					to={backLink}
					className="btn-primary px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2 w-fit"
				>
					<ChevronDownIcon className="w-4 h-4 rotate-90" />
					{backText}
				</NavLink>
			</div>
		</div>
	);
};

export default AdminPageHeader; 