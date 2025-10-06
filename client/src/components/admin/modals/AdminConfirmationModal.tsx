import React, { memo, useMemo, useCallback } from "react";
import { ExclamationTriangleIcon, FlagIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../common";
import { AdminConfirmationModalProps, ModalConfiguration } from "@/types";

// Constants for better maintainability and performance
const MODAL_TYPES = {
	DELETE: "delete" as const,
	STATUS: "status" as const,
	FLAG: "flag" as const,
	DEMOTE: "demote" as const,
} as const;

type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES];

// Context-aware configuration factory
const getModalConfigurations = (
	context: "user" | "event" | "internship" = "user"
): Record<ModalType, ModalConfiguration> => {
	const isEvent = context === "event";
	const isInternship = context === "internship";
	const entityType = isEvent ? "Event" : isInternship ? "Internship" : "User";

	return {
		[MODAL_TYPES.DELETE]: {
			title: `Delete ${entityType}`,
			iconBg: "bg-destructive/10",
			headerTitle: `Delete ${entityType}${isEvent || isInternship ? "" : " Account"}`,
			baseMessage: `Are you sure you want to delete "${
				isEvent || isInternship ? "{userName}" : "{userName}"
			}"? This action cannot be undone.`,
			confirmClass: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
			getIcon: () => <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />,
			getConfirmText: (deleteAllData: boolean) => (deleteAllData ? "Delete Everything" : `Delete ${entityType}`),
		},
		[MODAL_TYPES.STATUS]: {
			iconBg: "bg-warning/10",
			confirmClass: "",
			getIcon: () => <ExclamationTriangleIcon className="w-8 h-8 text-warning" />,
			getConfig: (isActivating: boolean) => ({
				title: isActivating ? `Activate ${entityType}` : `Suspend ${entityType}`,
				headerTitle: isActivating
					? `Activate ${entityType}${isEvent || isInternship ? "" : " Account"}`
					: `Suspend ${entityType}${isEvent || isInternship ? "" : " Account"}`,
				message: isActivating
					? `Are you sure you want to reactivate "${
							isEvent || isInternship ? "{userName}" : "{userName}"
					  }"? ${
							isEvent
								? "The event will be visible to users again."
								: isInternship
								? "The internship will be visible to users again."
								: "They will regain access to the platform."
					  }`
					: `Are you sure you want to suspend "${isEvent || isInternship ? "{userName}" : "{userName}"}"? ${
							isEvent
								? "The event will be hidden from users."
								: isInternship
								? "The internship will be hidden from users."
								: "They will not be able to login until reactivated."
					  }`,
				confirmText: isActivating ? "Activate" : "Suspend",
				confirmClass: isActivating
					? "bg-success text-white hover:bg-success/80"
					: "bg-warning text-white hover:bg-warning/80",
			}),
		},
		[MODAL_TYPES.FLAG]: {
			iconBg: "bg-info/10",
			confirmClass: "bg-info text-white hover:bg-info/80",
			getIcon: () => <FlagIcon className="w-8 h-8 text-info" />,
			getConfig: (isFlagged: boolean) => ({
				title: isFlagged ? `Unflag ${entityType}` : `Flag ${entityType}`,
				headerTitle: isFlagged ? "Remove Flag" : `Flag ${entityType}`,
				message: isFlagged
					? `Are you sure you want to remove the flag from "${
							isEvent || isInternship ? "{userName}" : "{userName}"
					  }"?`
					: `Please specify a reason for flagging "${
							isEvent || isInternship ? "{userName}" : "{userName}"
					  }":`,
				confirmText: isFlagged ? "Remove Flag" : `Flag ${entityType}`,
			}),
		},
		[MODAL_TYPES.DEMOTE]: {
			title: "Demote Organizer",
			iconBg: "bg-warning/10",
			headerTitle: "Demote to Regular User",
			baseMessage: 'Are you sure you want to demote "{userName}" to a regular user?',
			confirmText: "Demote to User",
			confirmClass: "bg-warning text-white hover:bg-warning/80",
			getIcon: () => <ArrowDownIcon className="w-8 h-8 text-warning" />,
		},
	};
};

const BASE_BUTTON_CLASSES = "flex-1 px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg";
const DISABLED_BUTTON_CLASSES = `${BASE_BUTTON_CLASSES} bg-muted text-muted-foreground cursor-not-allowed opacity-50`;
const ACTIVE_BUTTON_TRANSFORM = "transform hover:scale-105";

interface ExtendedConfig extends ModalConfiguration {
	title: string;
	headerTitle: string;
	message: string;
	confirmText: string;
	icon: React.ReactNode;
}

const AdminConfirmationModal: React.FC<AdminConfirmationModalProps> = memo(
	({
		modalType,
		isOpen,
		onClose,
		userName,
		deleteAllData = false,
		onToggleDeleteAllData,
		currentStatus,
		isFlagged = false,
		flagReason = "",
		onFlagReasonChange,
		onConfirm,
		context = "user", // Default to 'user' for backward compatibility
		isLoading = false,
	}) => {
		// Memoized modal configuration with optimized logic
		const config = useMemo((): ExtendedConfig => {
			const baseConfig = getModalConfigurations(context)[modalType];
			if (!baseConfig) return {} as ExtendedConfig;

			const message = (baseConfig.baseMessage || baseConfig.message || "").replace("{userName}", userName);

			switch (modalType) {
				case MODAL_TYPES.DELETE:
					return {
						...baseConfig,
						title: baseConfig.title!,
						headerTitle: baseConfig.headerTitle!,
						message,
						icon: baseConfig.getIcon!(),
						confirmText: baseConfig.getConfirmText!(deleteAllData),
					};

				case MODAL_TYPES.STATUS: {
					const isActivating = currentStatus === "suspended";
					const statusConfig = baseConfig.getConfig!(isActivating);
					return {
						...baseConfig,
						...statusConfig,
						message: statusConfig.message.replace("{userName}", userName),
						icon: baseConfig.getIcon!(),
						confirmClass: statusConfig.confirmClass || baseConfig.confirmClass,
					};
				}

				case MODAL_TYPES.FLAG: {
					const flagConfig = baseConfig.getConfig!(isFlagged);
					return {
						...baseConfig,
						...flagConfig,
						message: flagConfig.message.replace("{userName}", userName),
						icon: baseConfig.getIcon!(),
					};
				}

				case MODAL_TYPES.DEMOTE:
					return {
						...baseConfig,
						title: baseConfig.title!,
						headerTitle: baseConfig.headerTitle!,
						message,
						confirmText: baseConfig.confirmText!,
						icon: baseConfig.getIcon!(),
					};

				default:
					return baseConfig as ExtendedConfig;
			}
		}, [modalType, userName, deleteAllData, currentStatus, isFlagged, context]);

		// Optimized disabled state calculation
		const isDisabled = useMemo(
			() => isLoading || (modalType === MODAL_TYPES.FLAG && !isFlagged && !flagReason?.trim()),
			[modalType, isFlagged, flagReason, isLoading]
		);

		// Memoized button classes with performance optimization
		const buttonClasses = useMemo(() => {
			if (isDisabled) return DISABLED_BUTTON_CLASSES;
			return `${BASE_BUTTON_CLASSES} ${config.confirmClass} ${ACTIVE_BUTTON_TRANSFORM}`;
		}, [isDisabled, config.confirmClass]);

		// Optimized content renderers - Update delete content for events and internships
		const renderDeleteContent = useCallback(
			() => (
				<>
					<p className="text-muted-foreground mb-6">{config.message}</p>
					{context === "user" && (
						<>
							<div className="bg-muted/50 rounded-xl p-4 mb-6">
								<div className="flex items-start gap-3">
									<input
										type="checkbox"
										id="deleteAllData"
										checked={deleteAllData}
										onChange={onToggleDeleteAllData}
										className="w-4 h-4 text-primary bg-card rounded border-border focus:ring-primary focus:ring-2 mt-0.5"
									/>
									<label
										htmlFor="deleteAllData"
										className="text-sm text-secondary-foreground text-left"
									>
										<span className="font-medium">Also delete all user data</span>
										<br />
										<span className="text-muted-foreground">
											Events, registrations, activities, etc.
										</span>
									</label>
								</div>
							</div>
							<div
								className={`p-4 rounded-xl ${
									deleteAllData
										? "bg-destructive/10 border border-destructive/20"
										: "bg-warning/10 border border-warning/20"
								}`}
							>
								<p className={`text-sm ${deleteAllData ? "text-destructive" : "text-warning"}`}>
									{deleteAllData
										? "⚠️ All user data will be permanently deleted, including events they've created, registrations, and activity history."
										: "ℹ️ The user account will be deleted, but their data will remain in the system."}
								</p>
							</div>
						</>
					)}
					{context === "event" && (
						<div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
							<p className="text-sm text-destructive">
								⚠️ This will permanently delete the event and all associated data, including
								registrations and activity history.
							</p>
						</div>
					)}
				</>
			),
			[config.message, deleteAllData, onToggleDeleteAllData, context]
		);

		const renderFlagContent = useCallback(
			() => (
				<>
					{isFlagged ? (
						<p className="text-muted-foreground">{config.message}</p>
					) : (
						<>
							<p className="text-muted-foreground mb-4">{config.message}</p>
							<textarea
								value={flagReason}
								onChange={onFlagReasonChange}
								className="input-base w-full px-4 py-3 rounded-xl border-2 focus:border-primary transition-all duration-200 resize-none"
								rows={4}
								placeholder={`Enter reason for flagging this ${context}...`}
								autoFocus
							/>
							{!flagReason?.trim() && (
								<p className="text-sm text-muted-foreground mt-2 italic">
									⚠️ Please provide a reason to enable the Flag{" "}
									{context === "event" ? "Event" : "User"} button
								</p>
							)}
						</>
					)}
				</>
			),
			[config.message, isFlagged, flagReason, onFlagReasonChange, context]
		);

		const renderDemoteContent = useCallback(
			() => (
				<>
					<p className="text-muted-foreground mb-4">{config.message}</p>
					<div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-left">
						<p className="text-sm text-warning font-medium mb-2">⚠️ This action will:</p>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Remove organizer privileges</li>
							<li>• Convert to regular user account</li>
							<li>• Retain all created events and data</li>
							<li>• Lose ability to create new events</li>
						</ul>
					</div>
				</>
			),
			[config.message]
		);

		const renderDefaultContent = useCallback(
			() => <p className="text-muted-foreground">{config.message}</p>,
			[config.message]
		);

		// Optimized content selector with memoization
		const modalContent = useMemo(() => {
			switch (modalType) {
				case MODAL_TYPES.DELETE:
					return renderDeleteContent();
				case MODAL_TYPES.FLAG:
					return renderFlagContent();
				case MODAL_TYPES.DEMOTE:
					return renderDemoteContent();
				default:
					return renderDefaultContent();
			}
		}, [modalType, renderDeleteContent, renderFlagContent, renderDemoteContent, renderDefaultContent]);

		// Early return for better performance
		if (!isOpen || !config.title) return null;

		return (
			<Modal isOpen={isOpen} onClose={onClose} title={config.title} maxWidth="max-w-md">
				<div className="mt-2">
					{/* Icon Section */}
					<div
						className={`flex items-center justify-center w-16 h-16 mx-auto ${config.iconBg} rounded-full mb-4`}
					>
						{config.icon}
					</div>

					{/* Content Section */}
					<div className="text-center">
						<h3 className="text-lg font-semibold text-card-foreground mb-2">{config.headerTitle}</h3>
						{modalContent}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="mt-8 flex gap-3">
					<button
						type="button"
						className="flex-1 px-4 py-3 bg-card text-card-foreground border border-border rounded-xl hover:bg-muted transition-all duration-200 font-medium transform hover:scale-105"
						onClick={onClose}
					>
						Cancel
					</button>
					<button type="button" className={buttonClasses} onClick={onConfirm} disabled={isDisabled}>
						{isLoading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
								<span>Processing...</span>
							</div>
						) : (
							config.confirmText
						)}
					</button>
				</div>
			</Modal>
		);
	}
);

AdminConfirmationModal.displayName = "AdminConfirmationModal";

export default AdminConfirmationModal;
