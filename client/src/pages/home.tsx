import React, { useEffect } from "react";
import {
	HeroSection,
	FeaturesSection,
	EventsSection,
	InternshipsSection,
	FAQSection,
	CTASection,
} from "../components/home_comp";

const HomePage: React.FC = () => {
	useEffect(() => {
		// Add initial styles to elements before they animate
		const elements = document.querySelectorAll(".animate-on-scroll");
		elements.forEach((el) => {
			if (!(el as HTMLElement).classList.contains("animate-fade-in-up")) {
				(el as HTMLElement).style.opacity = "0";
				(el as HTMLElement).style.transform = "translateY(20px)";
			}
		});

		// Intersection Observer for animations
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !entry.target.classList.contains("animate-fade-in-up")) {
						// Only animate if not already animated
						entry.target.classList.add("animate-fade-in-up");
						// Remove inline styles after animation starts
						setTimeout(() => {
							(entry.target as HTMLElement).style.opacity = "";
							(entry.target as HTMLElement).style.transform = "";
						}, 50);
						// Stop observing this element once it's animated
						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.15,
				rootMargin: "0px 0px -50px 0px", // Only trigger when element is more visible
			}
		);

		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<HeroSection />
			<FeaturesSection />
			<EventsSection />
			<InternshipsSection />
			<FAQSection />
			<CTASection />
		</div>
	);
};

export default HomePage;
