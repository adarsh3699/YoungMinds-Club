import React from "react";
import { ShieldCheckIcon, UserGroupIcon, DocumentTextIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const GDPR: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			<div className="py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold mb-4 ym-text-primary">
							GDPR <span className="gradient-text">Compliance</span>
						</h1>
						<p className="text-xl ym-text-secondary max-w-3xl mx-auto">
							Your rights under the General Data Protection Regulation
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
							<h2 className="text-2xl font-bold ym-text-primary">What is GDPR?</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-4">
								The General Data Protection Regulation (GDPR) is a comprehensive data protection law
								that gives individuals control over their personal data and simplifies the regulatory
								environment for international business.
							</p>
							<p className="mb-6">
								At <strong>YoungMinds Club</strong>, we are committed to protecting your privacy and
								ensuring compliance with GDPR requirements. This page outlines your rights and how we
								handle your personal data in accordance with GDPR.
							</p>
							<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
								<p className="font-semibold text-blue-800">
									GDPR applies to all individuals within the European Union (EU), regardless of
									nationality or residence, and to organizations that process their personal data.
								</p>
							</div>
						</div>
					</div>

					{/* Legal Basis Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<ExclamationTriangleIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">Legal Basis for Processing</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-4">We process your personal data based on the following legal grounds:</p>
							<ul className="list-disc list-inside space-y-2">
								<li>
									<strong>Consent:</strong> When you explicitly agree to our processing of your data
									for specific purposes
								</li>
								<li>
									<strong>Contract:</strong> When processing is necessary for the performance of a
									contract with you
								</li>
								<li>
									<strong>Legitimate Interest:</strong> When we have a legitimate business interest
									that doesn't override your privacy rights
								</li>
								<li>
									<strong>Legal Obligation:</strong> When we must process data to comply with legal
									requirements
								</li>
							</ul>
						</div>
					</div>

					{/* Your Rights Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<UserGroupIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">Your Rights Under GDPR</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-6">As a data subject, you have the following rights:</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">1. Right to Information</h3>
									<p className="text-sm">
										You have the right to know what personal data we collect and how we use it.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">2. Right of Access</h3>
									<p className="text-sm">
										You can request a copy of the personal data we hold about you.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">3. Right to Rectification</h3>
									<p className="text-sm">
										You can request correction of inaccurate or incomplete personal data.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">4. Right to Erasure</h3>
									<p className="text-sm">
										You can request deletion of your personal data in certain circumstances.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">
										5. Right to Restrict Processing
									</h3>
									<p className="text-sm">
										You can request limitation of how we process your personal data.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">6. Right to Data Portability</h3>
									<p className="text-sm">
										You can request transfer of your data to another service provider.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">7. Right to Object</h3>
									<p className="text-sm">
										You can object to processing based on legitimate interests or direct marketing.
									</p>
								</div>

								<div className="border ym-border-card rounded-lg p-4">
									<h3 className="font-semibold ym-text-primary mb-2">
										8. Rights Related to Automated Decision-making
									</h3>
									<p className="text-sm">
										You have rights regarding automated processing and profiling.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* How to Exercise Rights Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-6">
							<ShieldCheckIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">How to Exercise Your Rights</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-4">
								To exercise any of your GDPR rights, please contact us using the information provided
								below. We will:
							</p>
							<ul className="list-disc list-inside space-y-2 mb-6">
								<li>
									Respond to your request within one month (extendable to three months for complex
									requests)
								</li>
								<li>Verify your identity before processing your request</li>
								<li>Provide information free of charge (unless requests are excessive)</li>
								<li>Explain any reasons if we cannot comply with your request</li>
							</ul>
							<div className="bg-amber-50 border-l-4 border-amber-500 p-4">
								<p className="font-semibold text-amber-800">
									You also have the right to lodge a complaint with your local data protection
									authority if you believe we have not handled your personal data appropriately.
								</p>
							</div>
						</div>
					</div>

					{/* Additional Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
						{/* Data Transfers */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Data Transfers</h3>
							<p className="ym-text-secondary">
								When we transfer your data outside the EU, we ensure appropriate safeguards are in
								place, such as adequacy decisions or standard contractual clauses.
							</p>
						</div>

						{/* Data Retention */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Data Retention</h3>
							<p className="ym-text-secondary">
								We retain your personal data only for as long as necessary to fulfill the purposes for
								which it was collected and to comply with legal obligations.
							</p>
						</div>

						{/* Security Measures */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Security Measures</h3>
							<p className="ym-text-secondary">
								We implement appropriate technical and organizational measures to ensure a level of
								security appropriate to the risk of processing.
							</p>
						</div>

						{/* Data Breach Notification */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Data Breach Notification</h3>
							<p className="ym-text-secondary">
								In case of a data breach that poses a risk to your rights and freedoms, we will notify
								you without undue delay as required by GDPR.
							</p>
						</div>
					</div>

					{/* Contact Information */}
					<div className="text-center ym-bg-card rounded-lg shadow-md border ym-border-card p-8">
						<h2 className="text-2xl font-bold mb-4 ym-text-primary">Contact Our Data Protection Team</h2>
						<p className="text-lg ym-text-secondary mb-6">
							For any GDPR-related inquiries, to exercise your rights, or to report concerns about data
							processing, please contact us.
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
						<div className="mt-6 text-sm ym-text-secondary">
							<p>
								<strong>Data Protection Officer:</strong> Available via the contact methods above
							</p>
							<p className="mt-2">
								<strong>Response Time:</strong> We aim to respond to all GDPR requests within one month
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GDPR;
