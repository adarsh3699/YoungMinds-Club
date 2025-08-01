import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, UsersIcon, StarIcon } from "@heroicons/react/24/outline";
import { StatItem } from "@/types";

const HeroSection: React.FC = () => {
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const stats: StatItem[] = [
		{
			icon: CalendarIcon,
			value: "500+",
			label: "Events Listed",
		},
		{
			icon: UsersIcon,
			value: "10K+",
			label: "Active Members",
		},
		{
			icon: StarIcon,
			value: "4.9/5",
			label: "User Rating",
		},
	];

	return (
		<section className="pt-24 pb-16 ym-hero-bg overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					{/* Badge */}
					<div
						className={`inline-flex items-center px-4 py-2 mb-6 ym-bg-yellow-100 ym-text-yellow-700 border border-yellow-200 dark:border-yellow-800 rounded-full text-sm font-medium transform transition-all duration-500 ${
							isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
						}`}
					>
						🎉 Join 10,000+ Young Professionals
					</div>

					{/* Main Heading */}
					<h1
						className={`text-4xl md:text-6xl lg:text-7xl font-bold ym-text-primary mb-6 transform transition-all duration-700 delay-200 ${
							isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
						}`}
					>
						Connect. Learn. <span className="gradient-text">Grow.</span>
					</h1>

					{/* Subheading */}
					<p
						className={`text-xl md:text-2xl ym-text-secondary mb-8 max-w-3xl mx-auto transform transition-all duration-700 delay-300 ${
							isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
						}`}
					>
						The premier platform connecting event organizers with ambitious young minds seeking meaningful
						experiences and career opportunities.
					</p>

					{/* CTA Buttons */}
					<div
						className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transform transition-all duration-700 delay-400 ${
							isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
						}`}
					>
						<Link
							to="/events"
							className="inline-flex items-center px-8 py-4 text-lg font-medium ym-text-white gradient-bg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-lg shadow-lg animate-glow"
						>
							<CalendarIcon className="w-5 h-5 mr-2" />
							Explore Events
						</Link>
						<Link
							to="/internships"
							className="inline-flex items-center px-8 py-4 text-lg font-medium ym-btn-secondary hover:ym-bg-card-hover rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
						>
							<UsersIcon className="w-5 h-5 mr-2" />
							Find Internships
						</Link>
					</div>

					{/* Stats */}
					<div
						className={`flex flex-wrap justify-center gap-8 text-center transform transition-all duration-700 delay-500 ${
							isVisible ? "opacity-100" : "opacity-0"
						}`}
					>
						{stats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<div key={index} className="flex items-center space-x-2">
									<div className="w-10 h-10 ym-bg-yellow-100 rounded-full flex items-center justify-center">
										<Icon className="w-5 h-5 ym-text-yellow-600" />
									</div>
									<div>
										<div className="text-2xl font-bold ym-text-primary">{stat.value}</div>
										<div className="text-sm ym-text-muted">{stat.label}</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Hero Image/Illustration */}
				<div
					className={`mt-16 relative transform transition-all duration-1000 delay-600 ${
						isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
					}`}
				>
					<div className="relative max-w-4xl mx-auto">
						<div className="aspect-video ym-hero-image-bg rounded-2xl shadow-2xl overflow-hidden">
							<div className="w-full h-full ym-hero-image-overlay flex items-center justify-center">
								<div className="text-center">
									<div className="w-24 h-24 mx-auto mb-4 ym-bg-white-20 rounded-full flex items-center justify-center backdrop-blur-sm">
										<CalendarIcon className="w-12 h-12 ym-text-white" />
									</div>
									<p className="ym-text-white-bold text-lg">Your Next Opportunity Awaits</p>
								</div>
							</div>
						</div>

						{/* Floating Elements */}
						<div className="absolute -top-4 -left-4 w-16 h-16 ym-bg-amber-400 rounded-full animate-bounce opacity-80"></div>
						<div className="absolute -bottom-4 -right-4 w-12 h-12 ym-bg-amber-400 rounded-full animate-pulse opacity-80"></div>
						<div className="absolute top-1/2 -right-8 w-8 h-8 ym-bg-orange-400 rounded-full animate-ping opacity-60"></div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
