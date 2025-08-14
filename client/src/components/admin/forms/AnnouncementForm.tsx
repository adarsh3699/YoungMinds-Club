import React, { useState, useCallback } from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { AnnouncementFormComponentProps, AnnouncementFormState, AnnouncementTypeOption, TargetAudienceOption } from '@/types';

// Constants
const INITIAL_ANNOUNCEMENT: AnnouncementFormState = {
	title: '',
	message: '',
	type: 'info',
	target: 'all',
};

const ANNOUNCEMENT_TYPES: AnnouncementTypeOption[] = [
	{ value: 'info', label: 'Information' },
	{ value: 'success', label: 'Success' },
	{ value: 'warning', label: 'Warning' },
	{ value: 'error', label: 'Error' },
];

const TARGET_AUDIENCES: TargetAudienceOption[] = [
	{ value: 'all', label: 'All Users' },
	{ value: 'users', label: 'Regular Users' },
	{ value: 'organizers', label: 'Organizers' },
];

const AnnouncementForm: React.FC<AnnouncementFormComponentProps> = ({ showForm, onToggleForm }) => {
	const [announcement, setAnnouncement] = useState<AnnouncementFormState>(INITIAL_ANNOUNCEMENT);

	const handleAnnouncementChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAnnouncement((prev) => ({ ...prev, [name]: value }));
	}, []);

	const submitAnnouncement = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			try {
				const response = await axios.post('/admin/announcements', announcement);
				if (response.data.success) {
					setAnnouncement(INITIAL_ANNOUNCEMENT);
					onToggleForm();
					alert('Announcement sent successfully!');
				}
			} catch (error) {
				console.error('Error sending announcement:', error);
				alert('Failed to send announcement. Please try again.');
			}
		},
		[announcement, onToggleForm]
	);

	const handleCancel = useCallback(() => {
		setAnnouncement(INITIAL_ANNOUNCEMENT);
		onToggleForm();
	}, [onToggleForm]);

	if (!showForm) {
		return (
			<div className="flex justify-center mb-8">
				<button
					onClick={onToggleForm}
					className="btn-primary px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
				>
					<MegaphoneIcon className="h-5 w-5 mr-2" />
					Send Announcement
				</button>
			</div>
		);
	}

	return (
		<div className="bg-card rounded-xl shadow-lg border border-border/50 p-6 mb-8 backdrop-blur-sm">
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center space-x-2">
					<MegaphoneIcon className="h-6 w-6 text-warning" />
					<h2 className="text-xl font-bold text-card-foreground">Send Announcement</h2>
				</div>
				<button
					onClick={handleCancel}
					className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted/50"
				>
					Cancel
				</button>
			</div>

			<form onSubmit={submitAnnouncement} className="space-y-6">
				<div>
					<label htmlFor="title" className="block text-sm font-semibold text-card-foreground mb-2">
						Announcement Title
					</label>
					<input
						type="text"
						id="title"
						name="title"
						value={announcement.title}
						onChange={handleAnnouncementChange}
						required
						className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
						placeholder="Enter announcement title..."
					/>
				</div>

				<div>
					<label htmlFor="message" className="block text-sm font-semibold text-card-foreground mb-2">
						Message
					</label>
					<textarea
						id="message"
						name="message"
						rows={4}
						value={announcement.message}
						onChange={handleAnnouncementChange}
						required
						className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all resize-none"
						placeholder="Enter your announcement message..."
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label htmlFor="type" className="block text-sm font-semibold text-card-foreground mb-2">
							Announcement Type
						</label>
						<select
							id="type"
							name="type"
							value={announcement.type}
							onChange={handleAnnouncementChange}
							className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
						>
							{ANNOUNCEMENT_TYPES.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="target" className="block text-sm font-semibold text-card-foreground mb-2">
							Target Audience
						</label>
						<select
							id="target"
							name="target"
							value={announcement.target}
							onChange={handleAnnouncementChange}
							className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
						>
							{TARGET_AUDIENCES.map((audience) => (
								<option key={audience.value} value={audience.value}>
									{audience.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex justify-end pt-4 border-t border-border/30">
					<button
						type="submit"
						className="btn-primary px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
					>
						<MegaphoneIcon className="h-5 w-5 mr-2" />
						Send Announcement
					</button>
				</div>
			</form>
		</div>
	);
};

export default AnnouncementForm; 