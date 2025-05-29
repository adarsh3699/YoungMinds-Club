import { memo, useMemo } from 'react';
import { ExclamationTriangleIcon, FlagIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../common';

const AdminUserModal = memo(
	({
		modalType,
		isOpen,
		onClose,
		userName,

		// Delete modal props
		deleteAllData,
		onToggleDeleteAllData,

		// Status modal props
		currentStatus,

		// Flag modal props
		isFlagged,
		flagReason,
		onFlagReasonChange,

		// Common
		onConfirm,
	}) => {
		// Memoized modal configuration
		const config = useMemo(() => {
			switch (modalType) {
				case 'delete':
					return {
						title: 'Delete User',
						icon: <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />,
						iconBg: 'bg-destructive/10',
						headerTitle: 'Delete User Account',
						message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
						confirmText: deleteAllData ? 'Delete Everything' : 'Delete User Only',
						confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
					};

				case 'status':
					const isActivating = currentStatus === 'suspended';
					return {
						title: isActivating ? 'Activate User' : 'Suspend User',
						icon: <ExclamationTriangleIcon className="w-8 h-8 text-warning" />,
						iconBg: 'bg-warning/10',
						headerTitle: isActivating ? 'Activate User Account' : 'Suspend User Account',
						message: isActivating
							? `Are you sure you want to reactivate "${userName}"? They will regain access to the platform.`
							: `Are you sure you want to suspend "${userName}"? They will not be able to login until reactivated.`,
						confirmText: isActivating ? 'Activate' : 'Suspend',
						confirmClass: isActivating
							? 'bg-success text-white hover:bg-success/80'
							: 'bg-warning text-white hover:bg-warning/80',
					};

				case 'flag':
					return {
						title: isFlagged ? 'Unflag User' : 'Flag User',
						icon: <FlagIcon className="w-8 h-8 text-info" />,
						iconBg: 'bg-info/10',
						headerTitle: isFlagged ? 'Remove Flag' : 'Flag User',
						message: isFlagged
							? `Are you sure you want to remove the flag from "${userName}"?`
							: `Please specify a reason for flagging "${userName}":`,
						confirmText: isFlagged ? 'Remove Flag' : 'Flag User',
						confirmClass: 'bg-info text-white hover:bg-info/80',
					};

				default:
					return {};
			}
		}, [modalType, userName, deleteAllData, currentStatus, isFlagged]);

		// Memoized disabled state
		const isDisabled = useMemo(
			() => modalType === 'flag' && !isFlagged && !flagReason?.trim(),
			[modalType, isFlagged, flagReason]
		);

		// Memoized button classes
		const buttonClasses = useMemo(() => {
			const baseClasses = 'flex-1 px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg';

			if (isDisabled) {
				return `${baseClasses} bg-muted text-muted-foreground cursor-not-allowed opacity-50`;
			}

			return `${baseClasses} ${config.confirmClass} transform hover:scale-105`;
		}, [isDisabled, config.confirmClass]);

		// Memoized modal content
		const modalContent = useMemo(() => {
			switch (modalType) {
				case 'delete':
					return (
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
					);

				case 'flag':
					return (
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
									/>
									{!flagReason?.trim() && (
										<p className="text-sm text-muted-foreground mt-2 italic">
											⚠️ Please provide a reason to enable the Flag User button
										</p>
									)}
								</>
							)}
						</>
					);

				default:
					return <p className="text-muted-foreground">{config.message}</p>;
			}
		}, [modalType, config, deleteAllData, onToggleDeleteAllData, isFlagged, flagReason, onFlagReasonChange]);

		if (!isOpen) return null;

		return (
			<Modal isOpen={isOpen} onClose={onClose} title={config.title} maxWidth="max-w-md">
				<div className="mt-2">
					<div
						className={`flex items-center justify-center w-16 h-16 mx-auto ${config.iconBg} rounded-full mb-4`}
					>
						{config.icon}
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold text-card-foreground mb-2">{config.headerTitle}</h3>
						{modalContent}
					</div>
				</div>
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

AdminUserModal.displayName = 'AdminUserModal';

export default AdminUserModal;
