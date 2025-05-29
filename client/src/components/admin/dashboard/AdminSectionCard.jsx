import { Link } from 'react-router-dom';

const AdminSectionCard = ({ section }) => {
	return (
		<Link
			to={section.link}
			className={`group ${section.bg} hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 rounded-xl border border-border/30 hover:border-primary/30 flex flex-col backdrop-blur-sm min-h-[180px]`}
		>
			<div className="flex items-center mb-4">
				<div className="p-3 rounded-xl bg-card/80 shadow-sm border border-border/20">{section.icon}</div>
				<h3 className="text-lg font-semibold ml-3 text-card-foreground group-hover:text-primary transition-colors">
					{section.title}
				</h3>
			</div>
			<p className="text-muted-foreground mb-4 flex-grow leading-relaxed text-sm">{section.description}</p>
			{section.count !== undefined ? (
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-border/20">
					<p className={`text-2xl font-bold ${section.text}`}>{section.count}</p>
					<div className="text-xs text-muted-foreground font-medium">View Details →</div>
				</div>
			) : (
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-border/20">
					<div
						className={`px-3 py-1 rounded-lg ${section.bg} border ${section.text.replace(
							'text-',
							'border-'
						)} text-xs font-semibold`}
					>
						Available
					</div>
					<div className="text-xs text-muted-foreground font-medium">Access Now →</div>
				</div>
			)}
		</Link>
	);
};

export default AdminSectionCard;
