import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon, EnvelopeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface SuspendedAccountModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({ isOpen, onClose }) => {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={() => {}}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card p-8 text-center align-middle shadow-xl transition-all border border-border">
								{/* Warning Icon */}
								<div className="mx-auto flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6">
									<ShieldExclamationIcon className="w-10 h-10 text-destructive" />
								</div>

								{/* Header */}
								<Dialog.Title as="h1" className="text-2xl font-bold text-card-foreground mb-3">
									Account Suspended
								</Dialog.Title>

								{/* Description */}
								<p className="text-muted-foreground mb-6 leading-relaxed">
									Your account has been temporarily suspended due to a policy violation. You cannot
									access the platform until your account is reviewed and reactivated.
								</p>

								{/* What to do next */}
								<div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
									<h3 className="font-semibold text-card-foreground mb-2 flex items-center">
										<ExclamationTriangleIcon className="w-4 h-4 mr-2 text-warning" />
										What you can do:
									</h3>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Contact our support team for assistance</li>
										<li>• Review our community guidelines</li>
										<li>• Wait for admin review of your account</li>
									</ul>
								</div>

								{/* Contact Support Button */}
								<div className="space-y-3">
									<a
										target="_blank"
										href="https://mail.google.com/mail/?view=cm&fs=1&to=adarsh3699@gmail.com"
										className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
									>
										<EnvelopeIcon className="w-4 h-4 mr-2" />
										Contact Support
									</a>

									<button
										onClick={onClose}
										className="w-full inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
									>
										Close
									</button>
								</div>

								{/* Footer Note */}
								<p className="text-xs text-muted-foreground mt-6">
									Account suspensions are reviewed within 24-48 hours. You will be notified once your
									account status is updated.
								</p>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default SuspendedAccountModal;
