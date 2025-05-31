import React, { useRef } from 'react';
import {
	PencilIcon,
	CameraIcon,
	BuildingLibraryIcon,
	EnvelopeIcon,
	UserIcon,
	AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { ProfileHeaderProps } from '@/types';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
	userProfile,
	editMode,
	formValues,
	saving,
	onToggleEditMode,
	onInputChange,
	onSaveProfile,
	onFileChange,
	getBadgeInfo,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleProfilePictureClick = (): void => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="ym-bg-card rounded-xl shadow-lg overflow-hidden border ym-border-card animate-fade-in">
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold ym-text-primary">Profile Information</h1>
					<button
						onClick={onToggleEditMode}
						className="flex items-center px-4 py-2 text-sm font-medium text-brand border rounded-lg hover:bg-brand-light transition-all duration-300 hover:scale-105"
						style={{ borderColor: 'var(--ring)' }}
					>
						{editMode ? (
							'Cancel'
						) : (
							<>
								<PencilIcon className="h-4 w-4 mr-1" />
								Edit Profile
							</>
						)}
					</button>
				</div>

				<div className="flex flex-col md:flex-row">
					{/* Profile Picture */}
					<div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
						<div className="relative group">
							<div
								className="h-32 w-32 rounded-full ym-bg-amber-100 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
								onClick={handleProfilePictureClick}
							>
								{userProfile?.profilePicture ? (
									<img
										src={userProfile.profilePicture}
										alt="Profile"
										className="h-full w-full object-cover"
									/>
								) : (
									<span className="text-5xl ym-text-yellow-600">
										{userProfile?.name ? userProfile.name.charAt(0) : '?'}
									</span>
								)}
								<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
									<CameraIcon className="h-10 w-10 text-white" />
								</div>
							</div>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								onChange={onFileChange}
							/>
						</div>
					</div>

					{/* Profile Details */}
					<div className="flex-grow">
						{editMode ? (
							<form onSubmit={onSaveProfile}>
								<div className="mb-4">
									<label htmlFor="name" className="block text-sm font-medium ym-text-primary mb-1">
										<UserIcon className="h-5 w-5 inline mr-1 ym-text-yellow-600" />
										Full Name
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formValues.name}
										onChange={onInputChange}
										className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
										required
									/>
								</div>

								<div className="mb-4">
									<label htmlFor="email" className="block text-sm font-medium ym-text-primary mb-1">
										<EnvelopeIcon className="h-5 w-5 inline mr-1 ym-text-yellow-600" />
										Email Address
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formValues.email}
										onChange={onInputChange}
										className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
										required
									/>
								</div>

								<div className="mb-4">
									<label htmlFor="college" className="block text-sm font-medium ym-text-primary mb-1">
										<BuildingLibraryIcon className="h-5 w-5 inline mr-1 ym-text-yellow-600" />
										College/University
									</label>
									<input
										type="text"
										id="college"
										name="college"
										value={formValues.college}
										onChange={onInputChange}
										className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
									/>
								</div>

								<div className="flex justify-end space-x-3 mt-6">
									<button
										type="button"
										onClick={onToggleEditMode}
										className="px-4 py-2 text-sm font-medium ym-text-card border ym-border-card rounded-lg hover:ym-bg-card-hover transition-all duration-300"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 text-sm font-medium text-white gradient-bg rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
										disabled={saving}
									>
										{saving ? (
											<>
												<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
												Saving...
											</>
										) : (
											'Save Changes'
										)}
									</button>
								</div>
							</form>
						) : (
							<>
								<div className="mb-4">
									<p className="text-sm ym-text-muted mb-1 flex items-center">
										<UserIcon className="h-5 w-5 mr-1 ym-text-yellow-600" />
										Full Name
									</p>
									<p className="text-lg font-medium ym-text-primary">
										{userProfile?.name || 'Not specified'}
									</p>
								</div>

								<div className="mb-4">
									<p className="text-sm ym-text-muted mb-1 flex items-center">
										<EnvelopeIcon className="h-5 w-5 mr-1 ym-text-yellow-600" />
										Email Address
									</p>
									<p className="text-lg font-medium ym-text-primary">
										{userProfile?.email || 'Not specified'}
									</p>
								</div>

								<div className="mb-4">
									<p className="text-sm ym-text-muted mb-1 flex items-center">
										<BuildingLibraryIcon className="h-5 w-5 mr-1 ym-text-yellow-600" />
										College/University
									</p>
									<p className="text-lg font-medium ym-text-primary">
										{userProfile?.college || 'Not specified'}
									</p>
								</div>

								<div className="mt-6">
									<p className="text-sm ym-text-muted mb-1 flex items-center">
										<AcademicCapIcon className="h-5 w-5 mr-1 ym-text-yellow-600" />
										Current Badge Level
									</p>
									<div className="flex items-center">
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
												getBadgeInfo(userProfile?.badge || 'Newbie').color
											}`}
										>
											<span className="mr-1">
												{getBadgeInfo(userProfile?.badge || 'Newbie').icon}
											</span>
											{userProfile?.badge || 'Newbie'}
										</span>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader; 