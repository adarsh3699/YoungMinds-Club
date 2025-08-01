import React from "react";
import { ScaleIcon, ShieldCheckIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const TermsOfService: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			<div className="py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold mb-4 ym-text-primary">
							Terms of <span className="gradient-text">Service</span>
						</h1>
						<p className="text-xl ym-text-secondary max-w-3xl mx-auto">
							Legal Terms and Conditions for using YoungMinds Club Services
						</p>
						<div className="mt-6 flex items-center justify-center">
							<ScaleIcon className="w-6 h-6 ym-text-yellow-600 mr-2" />
							<span className="text-sm ym-text-secondary">Last updated: August 2025</span>
						</div>
					</div>

					{/* Legal Agreement Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-4">
							<DocumentTextIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">Legal Agreement</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-6">
								These Legal Terms constitute a legally binding agreement made between you, whether
								personally or on behalf of an entity ('you'), and <strong>Youngminds Club</strong>,
								concerning your access to and use of the Services. You agree that by accessing the
								Services, you have read, understood, and agreed to be bound by all of these Legal Terms.
							</p>
							<div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
								<p className="font-semibold text-red-800">
									IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED
									FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
								</p>
							</div>
						</div>
					</div>

					{/* Terms Updates Section */}
					<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-8 mb-8">
						<div className="flex items-center mb-4">
							<ShieldCheckIcon className="w-6 h-6 ym-text-yellow-600 mr-3" />
							<h2 className="text-2xl font-bold ym-text-primary">Terms Updates</h2>
						</div>
						<div className="prose prose-lg ym-text-secondary max-w-none">
							<p className="mb-4">
								Supplemental terms and conditions or documents that may be posted on the Services from
								time to time are hereby expressly incorporated herein by reference. We reserve the
								right, in our sole discretion, to make changes or modifications to these Legal Terms
								from time to time.
							</p>
							<p className="mb-4">
								We will alert you about any changes by updating the 'Last updated' date of these Legal
								Terms, and you waive any right to receive specific notice of each such change. It is
								your responsibility to periodically review these Legal Terms to stay informed of
								updates.
							</p>
							<p>
								You will be subject to, and will be deemed to have been made aware of and to have
								accepted, the changes in any revised Legal Terms by your continued use of the Services
								after the date such revised Legal Terms are posted.
							</p>
						</div>
					</div>

					{/* Key Terms Sections */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
						{/* Acceptance of Terms */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Acceptance of Terms</h3>
							<p className="ym-text-secondary">
								By accessing and using YoungMinds Club, you acknowledge that you have read, understood,
								and agree to be bound by these terms and conditions.
							</p>
						</div>

						{/* Service Description */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Service Description</h3>
							<p className="ym-text-secondary">
								YoungMinds Club provides a platform for event discovery, internship opportunities, and
								professional networking for young professionals.
							</p>
						</div>

						{/* User Responsibilities */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">User Responsibilities</h3>
							<p className="ym-text-secondary">
								Users are responsible for maintaining the confidentiality of their account information
								and for all activities that occur under their account.
							</p>
						</div>

						{/* Privacy Policy */}
						<div className="ym-bg-card rounded-lg shadow-md border ym-border-card p-6">
							<h3 className="text-xl font-bold mb-3 ym-text-primary">Privacy Policy</h3>
							<p className="ym-text-secondary">
								Your privacy is important to us. Please review our Privacy Policy, which also governs
								your use of the Services, to understand our practices.
							</p>
						</div>
					</div>

					{/* Contact Information */}
					<div className="text-center ym-bg-card rounded-lg shadow-md border ym-border-card p-8">
						<h2 className="text-2xl font-bold mb-4 ym-text-primary">Questions About These Terms?</h2>
						<p className="text-lg ym-text-secondary mb-6">
							If you have any questions about these Terms of Service, please don't hesitate to contact us.
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

export default TermsOfService;
