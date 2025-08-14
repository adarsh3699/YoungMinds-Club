import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AdminApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: "approve" | "reject";
	applicantName: string;
	rejectionReason?: string;
	onRejectionReasonChange?: (reason: string) => void;
}

const AdminApplicationModal: React.FC<AdminApplicationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	type,
	applicantName,
	rejectionReason,
	onRejectionReasonChange,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop with blur effect */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-900">
						{type === "approve" ? "Approve Application" : "Reject Application"}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
					>
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>

				{/* Content */}
				<div className="mb-6">
					<p className="text-gray-700 text-base leading-relaxed">
						{type === "approve"
							? `Are you sure you want to approve ${applicantName}'s organizer application? They will be able to create events and internships once approved.`
							: `Are you sure you want to reject ${applicantName}'s organizer application? This action will prevent them from becoming an organizer.`}
					</p>

					{/* Rejection reason input */}
					{type === "reject" && (
						<div className="mt-4">
							<label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
								Rejection Reason (Optional)
							</label>
							<textarea
								id="rejectionReason"
								value={rejectionReason || ""}
								onChange={(e) => onRejectionReasonChange?.(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
								rows={3}
								placeholder="Provide a reason for rejection (optional)..."
							/>
						</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className={`px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 ${
							type === "approve"
								? "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
								: "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
						}`}
					>
						{type === "approve" ? "Approve Application" : "Reject Application"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminApplicationModal;
