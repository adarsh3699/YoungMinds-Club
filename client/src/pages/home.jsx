import { useEffect } from 'react';
import { HeroSection, FeaturesSection, EventsSection, FAQSection, CTASection } from '../components/home_comp';

const HomePage = () => {
	useEffect(() => {
		// Intersection Observer for animations
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('animate-fade-in-up');
					}
				});
			},
			{ threshold: 0.1 }
		);

		const elements = document.querySelectorAll('.animate-on-scroll');
		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<HeroSection />
			<FeaturesSection />
			<EventsSection />
			<FAQSection />
			<CTASection />
		</div>
	);
};

export default HomePage;
