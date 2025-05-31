import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ErrorAlertProps } from '@/types';

interface ExtendedErrorAlertProps extends ErrorAlertProps {
	duration?: number;
}

const ErrorAlert: React.FC<ExtendedErrorAlertProps> = ({ error, onClose, duration = 10000 }) => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	useEffect(() => {
		if (error) {
			// Show animation
			setIsVisible(true);
			setTimeout(() => setIsAnimating(true), 50); // Small delay for smooth animation

			// Auto-dismiss after duration
			const timer = setTimeout(() => {
				handleClose();
			}, duration);

			return () => clearTimeout(timer);
		} else {
			setIsVisible(false);
			setIsAnimating(false);
			return;
		}
	}, [error, duration]);

	const handleClose = (): void => {
		setIsAnimating(false);
		setTimeout(() => {
			setIsVisible(false);
			if (onClose) onClose();
		}, 300); // Wait for animation to complete
	};

	if (!error || !isVisible) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center">
			<div
				className={`mt-4 mx-4 max-w-md w-full bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm transform transition-all duration-300 ease-out ${
					isAnimating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
				}`}
			>
				<div className="flex items-start">
					<ExclamationTriangleIcon className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
					<div className="flex-grow">
						<strong className="font-bold block">Error!</strong>
						<span className="text-sm mt-1 block leading-relaxed">{error}</span>
					</div>
					<button
						onClick={handleClose}
						className="ml-3 flex-shrink-0 text-destructive/60 hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/5"
					>
						<XMarkIcon className="h-4 w-4" />
					</button>
				</div>

				{/* Progress bar */}
				<div className="mt-3 w-full bg-destructive/20 rounded-full h-1">
					<div
						className="bg-destructive h-1 rounded-full transition-all duration-300 ease-linear"
						style={{
							width: isAnimating ? '0%' : '100%',
							transition: isAnimating ? `width ${duration}ms linear` : 'none',
						}}
					></div>
				</div>
			</div>
		</div>
	);
};

export default ErrorAlert; 