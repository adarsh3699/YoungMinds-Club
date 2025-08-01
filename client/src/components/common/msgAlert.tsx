import React, { useState, useEffect, useCallback } from "react";
import {
	XMarkIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	InformationCircleIcon,
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface MsgAlertProps {
	message: string | null;
	type?: "success" | "error" | "warning" | "info";
	onClose: () => void;
	duration?: number;
}

const MsgAlert: React.FC<MsgAlertProps> = ({ message, type = "error", onClose, duration = 10000 }) => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const handleClose = useCallback((): void => {
		setIsAnimating(false);
		setTimeout(() => {
			setIsVisible(false);
			if (onClose) onClose();
		}, 300); // Wait for animation to complete
	}, [onClose]);

	useEffect(() => {
		if (message) {
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
	}, [message, duration, handleClose]);

	if (!message || !isVisible) return null;

	// Get styling and icon based on type
	const getAlertConfig = () => {
		switch (type) {
			case "success":
				return {
					bgColor: "bg-green-500/10",
					borderColor: "border-green-500/30",
					textColor: "text-green-600",
					progressColor: "bg-green-500",
					icon: <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />,
					title: "Success!",
				};
			case "warning":
				return {
					bgColor: "bg-yellow-500/10",
					borderColor: "border-yellow-500/30",
					textColor: "text-yellow-600",
					progressColor: "bg-yellow-500",
					icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />,
					title: "Warning!",
				};
			case "info":
				return {
					bgColor: "bg-blue-500/10",
					borderColor: "border-blue-500/30",
					textColor: "text-blue-600",
					progressColor: "bg-blue-500",
					icon: <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />,
					title: "Info!",
				};
			case "error":
			default:
				return {
					bgColor: "bg-red-500/10",
					borderColor: "border-red-500/30",
					textColor: "text-red-600",
					progressColor: "bg-red-500",
					icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />,
					title: "Error!",
				};
		}
	};

	const config = getAlertConfig();

	return (
		<div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9999]">
			<div
				className={`mt-4 ${config.bgColor} border ${config.borderColor} ${
					config.textColor
				} px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm transform transition-all duration-300 ease-out ${
					isAnimating ? "translate-y-0 opacity-100 scale-100" : "-translate-y-full opacity-0 scale-95"
				}`}
			>
				<div className="flex items-start">
					{config.icon}
					<div className="flex-grow">
						<strong className="font-bold block">{config.title}</strong>
						<span className="text-sm mt-1 block leading-relaxed">{message}</span>
					</div>
					<button
						onClick={handleClose}
						className={`ml-3 flex-shrink-0 ${config.textColor}/60 hover:${config.textColor} transition-colors p-1 rounded-lg hover:${config.bgColor}`}
					>
						<XMarkIcon className="h-4 w-4" />
					</button>
				</div>

				{/* Progress bar */}
				<div className={`mt-3 w-full ${config.textColor}/20 rounded-full h-1`}>
					<div
						className={`${config.progressColor} h-1 rounded-full transition-all duration-300 ease-linear`}
						style={{
							width: isAnimating ? "0%" : "100%",
							transition: isAnimating ? `width ${duration}ms linear` : "none",
						}}
					></div>
				</div>
			</div>
		</div>
	);
};

export default MsgAlert;
