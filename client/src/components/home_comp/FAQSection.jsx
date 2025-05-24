import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const FAQSection = () => {
	const [openItem, setOpenItem] = useState(null);

	const faqs = [
		{
			question: 'How do I register for events on YoungMinds?',
			answer: "Simply browse our events, click on the one that interests you, and follow the registration process. You'll need to create a free account to register for events and access additional features.",
		},
		{
			question: 'Are there any fees for using YoungMinds?',
			answer: 'Creating an account and browsing events is completely free. Some premium events may have registration fees, which are clearly displayed on each event page.',
		},
		{
			question: 'Can I organize my own event through YoungMinds?',
			answer: 'Absolutely! YoungMinds welcomes event organizers. You can create an organizer account and list your events on our platform.',
		},
		{
			question: 'What types of internship opportunities are available?',
			answer: 'We offer a wide range of internship opportunities across various industries including tech, finance, marketing, design, and more.',
		},
	];

	const toggleItem = (index) => {
		setOpenItem(openItem === index ? null : index);
	};

	return (
		<section className="py-20 ym-faq-bg" id="faq">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold ym-text-primary mb-4 animate-on-scroll">
						Frequently Asked <span className="gradient-text">Questions</span>
					</h2>
					<p className="text-xl ym-text-secondary max-w-2xl mx-auto animate-on-scroll">
						Get answers to common questions about YoungMinds and how to make the most of our platform.
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="animate-on-scroll ym-bg-card rounded-lg shadow-md border ym-border-card overflow-hidden transition-all duration-300 hover:shadow-lg"
						>
							<div
								className="flex justify-between items-center cursor-pointer p-6 hover:ym-bg-card-hover transition-all duration-300"
								onClick={() => toggleItem(index)}
							>
								<span className="font-semibold ym-text-card pr-4">{faq.question}</span>
								<ChevronRightIcon
									className={`w-5 h-5 ym-text-muted transition-all duration-300 transform ${
										openItem === index ? 'rotate-90 text-amber-600' : ''
									}`}
								/>
							</div>
							<div
								className={`transition-all duration-500 ease-in-out ${
									openItem === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
								} overflow-hidden`}
							>
								<div className="px-6 pb-6 transform transition-transform duration-300 ease-out">
									<div
										className={`transition-all duration-300 ${
											openItem === index ? 'translate-y-0' : 'translate-y-2'
										}`}
									>
										<p className="ym-text-secondary leading-relaxed">{faq.answer}</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="text-center mt-12">
					<p className="ym-text-secondary mb-4">Still have questions?</p>
					<Link
						to="/contact"
						className="inline-flex items-center px-6 py-3 text-base font-medium ym-text-white gradient-bg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
					>
						Contact Support
					</Link>
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
