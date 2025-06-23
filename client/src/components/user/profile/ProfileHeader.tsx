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
								
								{/* Upload Loading Overlay */}
								{saving && (
									<div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full backdrop-blur-sm z-10">
										<div className="text-center text-white">
											<div role="status" className="mb-2">
												<svg 
													aria-hidden="true" 
													className="w-8 h-8 text-white/30 animate-spin fill-white mx-auto" 
													viewBox="0 0 100 101" 
													fill="none" 
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
													<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
												</svg>
												<span className="sr-only">Loading...</span>
											</div>
											<span className="text-xs font-medium">
												Uploading...
											</span>
										</div>
									</div>
								)}

								{/* Hover Overlay */}
								{!saving && (
									<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
										<div className="text-center text-white">
											<CameraIcon className="h-8 w-8 mx-auto mb-1" />
											<span className="text-xs font-medium">
												Change Photo
											</span>
										</div>
									</div>
								)}
							</div>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								onChange={onFileChange}
								disabled={saving}
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
												<div role="status" className="mr-2">
													<svg 
														aria-hidden="true" 
														className="w-4 h-4 text-white/30 animate-spin fill-white" 
														viewBox="0 0 100 101" 
														fill="none" 
														xmlns="http://www.w3.org/2000/svg"
													>
														<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
														<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
													</svg>
													<span className="sr-only">Loading...</span>
												</div>
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