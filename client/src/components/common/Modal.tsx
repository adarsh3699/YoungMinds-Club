import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ModalProps } from '@/types';

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'max-w-md',
	showCloseButton = true,
	titleClassName = 'text-lg font-medium leading-6 ym-text-primary',
	contentClassName = '',
	noPadding = false,
}) => {
	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-50 overflow-y-auto">
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
							<Dialog.Panel
								className={`w-full ${maxWidth} transform overflow-hidden rounded-lg ym-bg-card border ym-border-card ${
									noPadding ? 'p-0' : 'p-6'
								} text-left align-middle shadow-xl transition-all ${contentClassName}`}
							>
								{title && !noPadding && (
									<Dialog.Title as="div" className="flex justify-between items-center">
										<h3 className={titleClassName}>{title}</h3>
										{showCloseButton && (
											<button
												type="button"
												className="ym-text-muted hover:ym-text-secondary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
												onClick={onClose}
											>
												<span className="sr-only">Close</span>
												<XMarkIcon className="h-5 w-5" aria-hidden="true" />
											</button>
										)}
									</Dialog.Title>
								)}
								<div className={title && !noPadding ? 'mt-4' : ''}>{children}</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default Modal; 