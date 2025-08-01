import React from "react";
import { ShieldCheckIcon, EyeIcon, UserGroupIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const PrivacyPolicy: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			<div className="py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold mb-4 ym-text-primary">
							Privacy <span className="gradient-text">Policy</span>
						</h1>
						<p className="text-xl ym-text-secondary max-w-3xl mx-auto">
							How we collect, use, store, and share your personal information
						</p>
						<div className="mt-6 flex items-center justify-center">
							<ShieldCheckIcon className="w-6 h-6 ym-text-yellow-600 mr-2" />
							<span className="text-sm ym-text-secondary">Last updated: August 2025</span>
						</div>
					</div>

					{/* Introduction Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-4">
							<DocumentTextIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">About This Policy</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-6">
								This Privacy Policy describes how <strong>Youngminds Club</strong> ("we", "us", or
								"our") collects, uses, stores, and shares your personal information when you interact
								with our services ("Services"), including:
							</p>
							<ul className="list-disc list-inside space-y-2 mb-6">
								<li>
									Visiting our website at{" "}
									<a
										href="https://www.youngminds.club"
										className="text-amber-600 hover:text-amber-700 underline"
									>
										https://www.youngminds.club
									</a>
									, or any webpage that links to this Privacy Policy
								</li>
								<li>
									Participating in our events, educational initiatives, training programs, internship
									offers, or community platforms
								</li>
								<li>
									Engaging with us in any other capacity, including sales, marketing, online/offline
									campaigns, or outreach
								</li>
							</ul>
						</div>
					</div>

					{/* Information We Collect Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<EyeIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">1. What Information We Collect</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<h3 className="text-lg font-semibold mb-3 ym-text-primary">
								Personal Information You Provide:
							</h3>
							<p className="mb-4">
								We may collect personal information that you voluntarily provide, such as:
							</p>
							<ul className="list-disc list-inside space-y-2 mb-6">
								<li>Name, email address, phone number</li>
								<li>Educational details (institute, course, year of study)</li>
								<li>Professional details (LinkedIn URL, resume, work experience)</li>
								<li>Social media handles (when optimizing profiles or offering SMM services)</li>
								<li>Payment details (only when applicable through secure gateways)</li>
								<li>Event registration details (form responses, participation history)</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 ym-text-primary">Technical Information:</h3>
							<p className="mb-4">
								We also collect limited technical information when you visit our site, such as:
							</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Browser type, IP address, device information</li>
								<li>Interaction logs (pages visited, time spent, clicks)</li>
							</ul>
						</div>
					</div>

					{/* How We Use Information Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<UserGroupIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">2. How We Use Your Information</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-4">We use your data to:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Process registrations for internships, events, or opportunities</li>
								<li>Contact you regarding upcoming programs, updates, or offers</li>
								<li>Improve our website, services, and user experience</li>
								<li>
									Conduct outreach or marketing campaigns relevant to students, startups, or
									professionals
								</li>
								<li>Comply with legal or regulatory requirements</li>
							</ul>
						</div>
					</div>

					{/* Sharing Information Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<ShieldCheckIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">3. Sharing Your Information</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
								<p className="font-semibold text-green-800">
									We do not sell your personal information.
								</p>
							</div>
							<p className="mb-4">We may share limited data only when:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>Required by law or a legal process</li>
								<li>
									Engaging third-party service providers (like email or analytics platforms) under
									strict confidentiality
								</li>
								<li>
									Collaborating with verified partners or event hosts, after obtaining your consent
								</li>
							</ul>
						</div>
					</div>

					{/* Data Protection Highlights */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
						{/* Data Security */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Data Security</h3>
							<p className="ym-text-secondary">
								We implement appropriate security measures to protect your personal information against
								unauthorized access, alteration, disclosure, or destruction.
							</p>
						</div>

						{/* Your Rights */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Your Rights</h3>
							<p className="ym-text-secondary">
								You have the right to access, update, or delete your personal information. Contact us to
								exercise these rights.
							</p>
						</div>

						{/* Data Retention */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Data Retention</h3>
							<p className="ym-text-secondary">
								We retain your information only as long as necessary to provide our services and comply
								with legal obligations.
							</p>
						</div>

						{/* Contact Preferences */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Contact Preferences</h3>
							<p className="ym-text-secondary">
								You can opt out of marketing communications at any time by following the unsubscribe
								instructions in our emails.
							</p>
						</div>
					</div>

					{/* Contact Information */}
					<div className="text-center ym-bg-card rounded-lg shadow-md border ym-border-card p-8">
						<h2 className="text-2xl font-bold mb-4 ym-text-primary">Questions About Your Privacy?</h2>
						<p className="text-lg ym-text-secondary mb-6">
							If you have any questions about this Privacy Policy or how we handle your data, please
							contact us.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<a
								href="/contact"
								className="inline-flex items-center px-6 py-3 text-base font-medium ym-text-white gradient-bg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
							>
								Contact Us
							</a>
							<a
								href="mailto:clubyoungminds@gmail.com"
								className="inline-flex items-center px-6 py-3 text-base font-medium ym-text-primary border ym-border-card rounded-lg hover:ym-bg-card transition-all duration-300"
							>
								clubyoungminds@gmail.com
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicy;
