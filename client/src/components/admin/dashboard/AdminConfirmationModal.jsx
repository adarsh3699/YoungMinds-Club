import { memo, useMemo, useCallback } from 'react';
import { ExclamationTriangleIcon, FlagIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../common';

// Constants for better maintainability and performance
const MODAL_TYPES = {
	DELETE: 'delete',
	STATUS: 'status',
	FLAG: 'flag',
	DEMOTE: 'demote',
};

const MODAL_CONFIGURATIONS = {
	[MODAL_TYPES.DELETE]: {
		title: 'Delete User',
		iconBg: 'bg-destructive/10',
		headerTitle: 'Delete User Account',
		baseMessage: 'Are you sure you want to delete "{userName}"? This action cannot be undone.',
		confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
		getIcon: () => <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />,
		getConfirmText: (deleteAllData) => (deleteAllData ? 'Delete Everything' : 'Delete User Only'),
	},
	[MODAL_TYPES.STATUS]: {
		iconBg: 'bg-warning/10',
		getIcon: () => <ExclamationTriangleIcon className="w-8 h-8 text-warning" />,
		getConfig: (isActivating) => ({
			title: isActivating ? 'Activate User' : 'Suspend User',
			headerTitle: isActivating ? 'Activate User Account' : 'Suspend User Account',
			message: isActivating
				? 'Are you sure you want to reactivate "{userName}"? They will regain access to the platform.'
				: 'Are you sure you want to suspend "{userName}"? They will not be able to login until reactivated.',
			confirmText: isActivating ? 'Activate' : 'Suspend',
			confirmClass: isActivating
				? 'bg-success text-white hover:bg-success/80'
				: 'bg-warning text-white hover:bg-warning/80',
		}),
	},
	[MODAL_TYPES.FLAG]: {
		iconBg: 'bg-info/10',
		confirmClass: 'bg-info text-white hover:bg-info/80',
		getIcon: () => <FlagIcon className="w-8 h-8 text-info" />,
		getConfig: (isFlagged) => ({
			title: isFlagged ? 'Unflag User' : 'Flag User',
			headerTitle: isFlagged ? 'Remove Flag' : 'Flag User',
			message: isFlagged
				? 'Are you sure you want to remove the flag from "{userName}"?'
				: 'Please specify a reason for flagging "{userName}":',
			confirmText: isFlagged ? 'Remove Flag' : 'Flag User',
		}),
	},
	[MODAL_TYPES.DEMOTE]: {
		title: 'Demote Organizer',
		iconBg: 'bg-warning/10',
		headerTitle: 'Demote to Regular User',
		baseMessage: 'Are you sure you want to demote "{userName}" to a regular user?',
		confirmText: 'Demote to User',
		confirmClass: 'bg-warning text-white hover:bg-warning/80',
		getIcon: () => <ArrowDownIcon className="w-8 h-8 text-warning" />,
	},
};

const BASE_BUTTON_CLASSES = 'flex-1 px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg';
const DISABLED_BUTTON_CLASSES = `${BASE_BUTTON_CLASSES} bg-muted text-muted-foreground cursor-not-allowed opacity-50`;
const ACTIVE_BUTTON_TRANSFORM = 'transform hover:scale-105';

const AdminConfirmationModal = memo(
	({
		modalType,
		isOpen,
		onClose,
		userName,
		deleteAllData,
		onToggleDeleteAllData,
		currentStatus,
		isFlagged,
		flagReason,
		onFlagReasonChange,
		onConfirm,
	}) => {
		// Memoized modal configuration with optimized logic
		const config = useMemo(() => {
			if (!modalType || !MODAL_CONFIGURATIONS[modalType]) return {};

			const baseConfig = MODAL_CONFIGURATIONS[modalType];
			const message = (baseConfig.baseMessage || baseConfig.message || '').replace('{userName}', userName);

			switch (modalType) {
				case MODAL_TYPES.DELETE:
					return {
						...baseConfig,
						message,
						icon: baseConfig.getIcon(),
						confirmText: baseConfig.getConfirmText(deleteAllData),
					};

				case MODAL_TYPES.STATUS:
					const isActivating = currentStatus === 'suspended';
					const statusConfig = baseConfig.getConfig(isActivating);
					return {
						...baseConfig,
						...statusConfig,
						message: statusConfig.message.replace('{userName}', userName),
						icon: baseConfig.getIcon(),
					};

				case MODAL_TYPES.FLAG:
					const flagConfig = baseConfig.getConfig(isFlagged);
					return {
						...baseConfig,
						...flagConfig,
						message: flagConfig.message.replace('{userName}', userName),
						icon: baseConfig.getIcon(),
					};

				case MODAL_TYPES.DEMOTE:
					return {
						...baseConfig,
						message,
						icon: baseConfig.getIcon(),
					};

				default:
					return baseConfig;
			}
		}, [modalType, userName, deleteAllData, currentStatus, isFlagged]);

		// Optimized disabled state calculation
		const isDisabled = useMemo(
			() => modalType === MODAL_TYPES.FLAG && !isFlagged && !flagReason?.trim(),
			[modalType, isFlagged, flagReason]
		);

		// Memoized button classes with performance optimization
		const buttonClasses = useMemo(() => {
			if (isDisabled) return DISABLED_BUTTON_CLASSES;
			return `${BASE_BUTTON_CLASSES} ${config.confirmClass} ${ACTIVE_BUTTON_TRANSFORM}`;
		}, [isDisabled, config.confirmClass]);

		// Optimized content renderers
		const renderDeleteContent = useCallback(
			() => (
				<>
					<p className="text-muted-foreground mb-6">{config.message}</p>
					<div className="bg-muted/50 rounded-xl p-4 mb-6">
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								id="deleteAllData"
								checked={deleteAllData}
								onChange={onToggleDeleteAllData}
								className="w-4 h-4 text-primary bg-card rounded border-border focus:ring-primary focus:ring-2 mt-0.5"
							/>
							<label htmlFor="deleteAllData" className="text-sm text-secondary-foreground text-left">
								<span className="font-medium">Also delete all user data</span>
								<br />
								<span className="text-muted-foreground">Events, registrations, activities, etc.</span>
							</label>
						</div>
					</div>
					<div
						className={`p-4 rounded-xl ${
							deleteAllData
								? 'bg-destructive/10 border border-destructive/20'
								: 'bg-warning/10 border border-warning/20'
						}`}
					>
						<p className={`text-sm ${deleteAllData ? 'text-destructive' : 'text-warning'}`}>
							{deleteAllData
								? "⚠️ All user data will be permanently deleted, including events they've created, registrations, and activity history."
								: 'ℹ️ The user account will be deleted, but their data will remain in the system.'}
						</p>
					</div>
				</>
			),
			[config.message, deleteAllData, onToggleDeleteAllData]
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
								placeholder="Enter reason for flagging this user..."
								autoFocus
							/>
							{!flagReason?.trim() && (
								<p className="text-sm text-muted-foreground mt-2 italic">
									⚠️ Please provide a reason to enable the Flag User button
								</p>
							)}
						</>
					)}
				</>
			),
			[config.message, isFlagged, flagReason, onFlagReasonChange]
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
						{config.confirmText}
					</button>
				</div>
			</Modal>
		);
	}
);

AdminConfirmationModal.displayName = 'AdminConfirmationModal';

export default AdminConfirmationModal;
