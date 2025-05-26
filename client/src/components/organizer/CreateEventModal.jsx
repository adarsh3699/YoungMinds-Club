import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
	XMarkIcon,
	CalendarIcon,
	MapPinIcon,
	TagIcon,
	UsersIcon,
	CurrencyDollarIcon,
	PhotoIcon,
	SparklesIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import './CreateEventModal.css';
import { FormInput, TextareaField, SelectInput, DateTimePicker, Tooltip } from '../common';

const CreateEventModal = ({ onClose, onSuccess, eventToEdit = null, isEditing = false }) => {
	const [formData, setFormData] = useState({
		title: '',
		shortDescription: '',
		description: '',
		type: 'Workshop',
		category: 'Technology',
		date: '',
		endDate: '',
		location: {
			type: 'offline',
			city: '',
			venue: '',
			address: '',
			onlineUrl: '',
		},
		capacity: 50,
		tags: [],
		price: 0,
		registrationDeadline: '',
	});

	const [posterFile, setPosterFile] = useState(null);
	const [posterPreview, setPosterPreview] = useState(null);
	const [tagInput, setTagInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// If editing, populate form with event data
	useEffect(() => {
		if (!isEditing || !eventToEdit) return;

		// Format date fields correctly for the datetime-local input
		const formatDatesForForm = (event) => ({
			...event,
			date: formatDateForInput(event.date),
			endDate: event.endDate ? formatDateForInput(event.endDate) : '',
			registrationDeadline: event.registrationDeadline ? formatDateForInput(event.registrationDeadline) : '',
		});

		const formattedEvent = formatDatesForForm(eventToEdit);
		setFormData(formattedEvent);

		// Set poster preview if one exists
		if (eventToEdit.poster) {
			setPosterPreview(eventToEdit.poster);
		}
	}, [isEditing, eventToEdit]);

	// Format date for datetime-local input
	const formatDateForInput = (dateString) => {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return '';

		return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		let newFormData = { ...formData };

		// Handle nested location object
		if (name.startsWith('location.')) {
			const locationField = name.split('.')[1];
			newFormData = {
				...formData,
				location: {
					...formData.location,
					[locationField]: value,
				},
			};
		} else {
			newFormData = {
				...formData,
				[name]: value,
			};
		}

		// Clear dependent fields and errors when start date changes
		if (name === 'date') {
			const startDate = new Date(value);
			const now = new Date();

			// Clear end date if it's now before the new start date
			if (newFormData.endDate && new Date(newFormData.endDate) <= startDate) {
				newFormData.endDate = '';
			}

			// Clear registration deadline if it's now after the new start date
			if (newFormData.registrationDeadline && new Date(newFormData.registrationDeadline) > startDate) {
				newFormData.registrationDeadline = '';
			}

			// Clear related errors
			const newErrors = { ...errors };
			if (startDate > now) {
				delete newErrors.date;
			}
			if (!newFormData.endDate) {
				delete newErrors.endDate;
			}
			if (!newFormData.registrationDeadline) {
				delete newErrors.registrationDeadline;
			}
			setErrors(newErrors);
		}

		// Clear end date error if valid
		if (name === 'endDate' && value && formData.date) {
			const startDate = new Date(formData.date);
			const endDate = new Date(value);
			if (endDate > startDate) {
				const newErrors = { ...errors };
				delete newErrors.endDate;
				setErrors(newErrors);
			}
		}

		// Clear registration deadline error if valid
		if (name === 'registrationDeadline' && value && formData.date) {
			const startDate = new Date(formData.date);
			const deadlineDate = new Date(value);
			const now = new Date();
			if (deadlineDate <= startDate && (isEditing || deadlineDate > now)) {
				const newErrors = { ...errors };
				delete newErrors.registrationDeadline;
				setErrors(newErrors);
			}
		}

		setFormData(newFormData);
	};

	const handleLocationTypeChange = (e) => {
		const locationType = e.target.value;
		setFormData({
			...formData,
			location: {
				...formData.location,
				type: locationType,
			},
		});
	};

	const onDrop = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];
		if (file) {
			setPosterFile(file);

			// Create a preview URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setPosterPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	}, []);

	// Memoize dropzone configuration
	const dropzoneConfig = useMemo(
		() => ({
			onDrop,
			accept: {
				'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
			},
			maxSize: 5242880, // 5MB
			multiple: false,
		}),
		[onDrop]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

	const handleTagInputChange = (e) => {
		setTagInput(e.target.value);
	};

	const handleTagInputKeyDown = (e) => {
		if (e.key === 'Enter' && tagInput.trim() !== '') {
			e.preventDefault();
			if (!formData.tags.includes(tagInput.trim())) {
				setFormData({
					...formData,
					tags: [...formData.tags, tagInput.trim()],
				});
			}
			setTagInput('');
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const validateForm = () => {
		const newErrors = {};
		const now = new Date();

		// Required field validation
		const requiredFields = {
			title: 'Title is required',
			shortDescription: 'Short description is required',
			description: 'Description is required',
			date: 'Start date and time is required',
			endDate: 'End date and time is required',
			capacity: 'Capacity is required',
			price: 'Ticket price is required',
			registrationDeadline: 'Registration deadline is required',
		};

		// Check all required fields at once
		Object.entries(requiredFields).forEach(([field, message]) => {
			if (!formData[field]) newErrors[field] = message;
		});

		// Enhanced Date validation checks
		if (formData.date) {
			const startDate = new Date(formData.date);

			// 1. Start Date and Time must be greater than or equal to current date and time
			if (startDate <= now) {
				newErrors.date = 'Start date and time must be in the future';
			}

			// 2. End Date and Time must be greater than Start Date and Time
			if (formData.endDate) {
				const endDate = new Date(formData.endDate);
				if (endDate <= startDate) {
					newErrors.endDate = 'End date and time must be after the start date and time';
				}
			}

			// 3. Registration Deadline must be on or before the Start Date and Time
			if (formData.registrationDeadline) {
				const deadlineDate = new Date(formData.registrationDeadline);
				if (deadlineDate > startDate) {
					newErrors.registrationDeadline =
						'Registration deadline must be on or before the start date and time';
				}

				// Additional check: Registration deadline should also be in the future (unless editing)
				if (!isEditing && deadlineDate <= now) {
					newErrors.registrationDeadline = 'Registration deadline must be in the future';
				}
			}
		}

		// Location validation based on type
		if (formData.location.type === 'offline') {
			const requiredLocationFields = {
				'location.city': 'City is required',
				'location.venue': 'Venue is required',
				'location.address': 'Address is required',
			};

			Object.entries(requiredLocationFields).forEach(([field, message]) => {
				const [parent, child] = field.split('.');
				if (!formData[parent][child]) newErrors[field] = message;
			});
		} else if (!formData.location.onlineUrl) {
			newErrors['location.onlineUrl'] = 'Online URL is required';
		}

		// Poster validation only for new events
		if (!isEditing && !posterFile && !posterPreview) {
			newErrors.poster = 'Event poster is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const eventFormData = new FormData();

			// Process form data for submission
			const appendToFormData = (obj, prefix = '') => {
				Object.entries(obj).forEach(([key, value]) => {
					const formKey = prefix ? `${prefix}[${key}]` : key;

					if (value !== null && typeof value === 'object' && !(value instanceof File)) {
						if (Array.isArray(value)) {
							// Handle arrays
							value.forEach((item) => {
								eventFormData.append(`${formKey}[]`, item);
							});
						} else {
							// Handle nested objects
							appendToFormData(value, formKey);
						}
					} else {
						// Handle primitive values
						eventFormData.append(formKey, value);
					}
				});
			};

			// Add form data
			appendToFormData(formData);

			// Add poster file if available
			if (posterFile) {
				eventFormData.append('poster', posterFile);
			}

			// Send request
			const url = isEditing ? `/organizer/events/${eventToEdit._id}` : '/organizer/events';

			const method = isEditing ? 'put' : 'post';

			const response = await axios[method](url, eventFormData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			if (response.data.success) {
				onSuccess(response.data.event);
			}
		} catch (error) {
			console.error('Error submitting event:', error);

			// Handle validation errors from the server
			if (error.response?.data?.errors) {
				setErrors(error.response.data.errors);
			} else {
				alert('Failed to save event. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const eventTypeOptions = [
		{ value: 'Conference', label: 'Conference' },
		{ value: 'Workshop', label: 'Workshop' },
		{ value: 'Meetup', label: 'Meetup' },
		{ value: 'Hackathon', label: 'Hackathon' },
		{ value: 'MUN', label: 'MUN' },
		{ value: 'Concert', label: 'Concert' },
		{ value: 'Other', label: 'Other' },
	];

	const categoryOptions = [
		{ value: 'Technology', label: 'Technology' },
		{ value: 'Business', label: 'Business' },
		{ value: 'Education', label: 'Education' },
		{ value: 'Arts', label: 'Arts' },
		{ value: 'Science', label: 'Science' },
		{ value: 'Music', label: 'Music' },
		{ value: 'Sports', label: 'Sports' },
		{ value: 'Other', label: 'Other' },
	];

	return (
		<>
			{/* Enhanced Header with YoungMinds Gradient */}
			<div className="gradient-bg text-white z-10 flex justify-between items-center p-6 rounded-t-xl shadow-lg">
				<div className="flex items-center">
					<div className="ym-bg-white-20 p-3 rounded-xl mr-4 backdrop-blur-sm">
						{isEditing ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
								/>
							</svg>
						) : (
							<SparklesIcon className="w-6 h-6" />
						)}
					</div>
					<div>
						<h2 className="text-2xl font-bold ym-text-white">
							{isEditing ? 'Edit Event' : 'Create New Event'}
						</h2>
						<p className="ym-text-white-80 text-sm font-medium">
							{isEditing ? 'Update your event details' : 'Bring your vision to life'}
						</p>
					</div>
				</div>
				<button
					onClick={onClose}
					className="ym-text-white hover:ym-text-white-80 transition-all duration-200 p-2 rounded-xl hover:ym-bg-white-20 backdrop-blur-sm"
				>
					<XMarkIcon className="h-6 w-6" />
				</button>
			</div>

			{/* Enhanced Form Container */}
			<div className="overflow-y-auto ym-features-bg" style={{ maxHeight: 'calc(85vh - 88px)' }}>
				<form onSubmit={handleSubmit} className="p-8" style={{ backgroundColor: 'var(--background)' }}>
					{/* Basic Information Section - Left Column */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						{/* Left Column - Basic Information */}
						<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card">
							<h3 className="text-lg font-bold ym-text-primary mb-6 flex items-center">
								<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
									<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
								</div>
								Basic Information
							</h3>

							<div className="space-y-6">
								<FormInput
									id="title"
									label="Event Title"
									name="title"
									value={formData.title}
									onChange={handleChange}
									placeholder="Enter a compelling event title"
									error={errors.title}
									required
								/>

								<TextareaField
									id="shortDescription"
									label="Short Description"
									name="shortDescription"
									value={formData.shortDescription}
									onChange={handleChange}
									placeholder="Brief summary that captures attention"
									maxLength={200}
									error={errors.shortDescription}
									required
									rows={3}
								/>

								<TextareaField
									id="description"
									label="Full Description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Detailed description of your event, agenda, and what attendees can expect"
									rows={10}
									error={errors.description}
									required
								/>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Event Type
											<span className="ym-text-yellow-600 ml-1">*</span>
										</label>
										<SelectInput
											id="type"
											name="type"
											value={formData.type}
											onChange={handleChange}
											options={eventTypeOptions}
											error={errors.type}
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Category
											<span className="ym-text-yellow-600 ml-1">*</span>
										</label>
										<SelectInput
											id="category"
											name="category"
											value={formData.category}
											onChange={handleChange}
											options={categoryOptions}
											error={errors.category}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Media & Location */}
						<div className="space-y-6">
							{/* Event Poster Section */}
							<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-lg font-bold ym-text-primary mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
										<PhotoIcon className="h-5 w-5 ym-text-yellow-600" />
									</div>
									Event Poster
									<span className="ym-text-yellow-600 ml-2">*</span>
								</h3>

								<div
									{...getRootProps()}
									className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg
                    ${
						isDragActive
							? 'bg-brand-light scale-105'
							: errors.poster
							? 'border-red-400 bg-red-50'
							: 'ym-border-card hover:bg-brand-light'
					}`}
									style={isDragActive ? { borderColor: 'var(--ring)' } : {}}
								>
									<input {...getInputProps()} />
									{posterPreview ? (
										<div className="relative group">
											<img
												src={posterPreview}
												alt="Event poster preview"
												className="max-h-64 mx-auto rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
											/>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setPosterFile(null);
													setPosterPreview(null);
												}}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-110"
											>
												<XMarkIcon className="h-4 w-4" />
											</button>
											<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 rounded-b-lg">
												<p className="text-sm font-semibold truncate">
													{posterFile?.name || 'Event Poster'}
												</p>
											</div>
										</div>
									) : (
										<div className="text-center">
											<div className="flex flex-col items-center justify-center gap-4">
												<div className="p-4 ym-bg-amber-100 rounded-full">
													<PhotoIcon className="w-12 h-12 ym-text-yellow-600" />
												</div>
												<div>
													<p className="text-lg font-semibold ym-text-primary mb-2">
														{isDragActive ? 'Drop your image here!' : 'Upload Event Poster'}
													</p>
													<p className="text-sm ym-text-muted">
														Drag & drop an image, or click to browse
													</p>
													<p className="text-xs ym-text-muted mt-1">
														PNG, JPG, GIF up to 5MB
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
								{errors.poster && (
									<div className="mt-3 flex items-center space-x-2 animate-fade-in">
										<div className="w-1 h-4 bg-red-500 rounded-full"></div>
										<p className="text-red-600 dark:text-red-400 text-sm">{errors.poster}</p>
									</div>
								)}
							</div>

							{/* Location Section */}
							<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-lg font-bold ym-text-primary mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
										<MapPinIcon className="h-5 w-5 ym-text-yellow-600" />
									</div>
									Location Details
								</h3>

								<div className="space-y-6">
									{/* Location Type Toggle */}
									<div className="ym-bg-amber-100 p-4 rounded-xl">
										<div className="flex space-x-6">
											<label className="inline-flex items-center cursor-pointer">
												<input
													type="radio"
													name="locationType"
													value="offline"
													checked={formData.location.type === 'offline'}
													onChange={handleLocationTypeChange}
													className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
													style={{ color: 'var(--ring)', '--tw-ring-color': 'var(--ring)' }}
												/>
												<span className="ml-3 font-semibold ym-text-primary">
													🏢 Physical Venue
												</span>
											</label>
											<label className="inline-flex items-center cursor-pointer">
												<input
													type="radio"
													name="locationType"
													value="online"
													checked={formData.location.type === 'online'}
													onChange={handleLocationTypeChange}
													className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
													style={{ color: 'var(--ring)', '--tw-ring-color': 'var(--ring)' }}
												/>
												<span className="ml-3 font-semibold ym-text-primary">
													💻 Online Event
												</span>
											</label>
										</div>
									</div>

									{formData.location.type === 'offline' ? (
										<div className="space-y-4">
											<FormInput
												id="location.city"
												label="City"
												name="location.city"
												value={formData.location.city}
												onChange={handleChange}
												placeholder="e.g., Mumbai, Delhi, Bangalore"
												error={errors['location.city']}
												required
												icon={<MapPinIcon className="h-5 w-5" />}
											/>

											<FormInput
												id="location.venue"
												label="Venue Name"
												name="location.venue"
												value={formData.location.venue}
												onChange={handleChange}
												placeholder="e.g., Convention Center, University Hall"
												error={errors['location.venue']}
												required
											/>

											<FormInput
												id="location.address"
												label="Complete Address"
												name="location.address"
												value={formData.location.address}
												onChange={handleChange}
												placeholder="Full address with landmarks"
												error={errors['location.address']}
												required
											/>
										</div>
									) : (
										<FormInput
											id="location.onlineUrl"
											label="Online Meeting URL"
											name="location.onlineUrl"
											value={formData.location.onlineUrl}
											onChange={handleChange}
											placeholder="e.g., Zoom, Google Meet, or custom platform URL"
											error={errors['location.onlineUrl']}
											required
										/>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Schedule Section - Full Width */}
					<div className="mb-8">
						<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card">
							<h3 className="text-lg font-bold ym-text-primary mb-6 flex items-center">
								<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
									<CalendarIcon className="h-5 w-5 ym-text-yellow-600" />
								</div>
								Schedule
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<DateTimePicker
									id="date"
									label="Start Date and Time"
									name="date"
									value={formData.date}
									onChange={handleChange}
									error={errors.date}
									required
									minDate={new Date()} // Cannot be in the past
									placeholder="Must be in the future"
								/>

								<DateTimePicker
									id="endDate"
									label="End Date and Time"
									name="endDate"
									value={formData.endDate}
									onChange={handleChange}
									error={errors.endDate}
									required
									minDate={
										formData.date ? new Date(new Date(formData.date).getTime() + 60000) : new Date()
									} // Must be after start date
									placeholder={
										formData.date ? 'Must be after start time' : 'Select end date and time'
									}
								/>

								<DateTimePicker
									id="registrationDeadline"
									label="Registration Deadline"
									name="registrationDeadline"
									value={formData.registrationDeadline}
									onChange={handleChange}
									error={errors.registrationDeadline}
									required
									minDate={isEditing ? null : new Date()} // Must be in future for new events
									maxDate={formData.date ? new Date(formData.date) : null} // Cannot be after start date
									placeholder={
										formData.date ? 'Must be before start time' : 'Select registration deadline'
									}
								/>
							</div>
						</div>
					</div>

					{/* Additional Details - Full Width */}
					<div className="mt-8">
						<div className="ym-bg-card p-6 rounded-xl shadow-lg border ym-border-card">
							<h3 className="text-lg font-bold ym-text-primary mb-6 flex items-center">
								<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
									<TagIcon className="h-5 w-5 ym-text-yellow-600" />
								</div>
								Additional Details
							</h3>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Tags Section */}
								<div>
									<FormInput
										id="tagInput"
										label="Event Tags (Press Enter to add)"
										name="tagInput"
										value={tagInput}
										onChange={handleTagInputChange}
										onKeyDown={handleTagInputKeyDown}
										placeholder="Add relevant tags (e.g., AI, Workshop, Networking)"
										icon={<TagIcon className="h-5 w-5" />}
										tooltip="Tags help attendees discover your event. Press Enter to add each tag."
									/>

									<div className="mt-4">
										{formData.tags.length === 0 ? (
											<p className="text-sm ym-text-muted italic p-4 ym-bg-amber-100 rounded-lg text-center">
												No tags added yet. Tags help attendees discover your event!
											</p>
										) : (
											<div className="flex flex-wrap gap-3">
												{formData.tags.map((tag, index) => (
													<span
														key={index}
														className="inline-flex items-center px-4 py-2 ym-bg-amber-100 ym-text-yellow-700 text-sm font-semibold rounded-full hover:ym-bg-amber-200 transition-colors duration-200 group"
													>
														#{tag}
														<button
															type="button"
															onClick={() => removeTag(tag)}
															className="ml-2 ym-text-yellow-600 hover:ym-text-yellow-800 transition-colors duration-200 group-hover:scale-110"
															aria-label={`Remove tag ${tag}`}
														>
															<XMarkIcon className="w-4 h-4" />
														</button>
													</span>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Capacity & Price Section */}
								<div className="space-y-6">
									<div>
										<FormInput
											id="capacity"
											label="Event Capacity"
											name="capacity"
											type="number"
											value={formData.capacity}
											onChange={handleChange}
											min="1"
											placeholder="Maximum attendees"
											error={errors.capacity}
											required
											icon={<UsersIcon className="h-5 w-5" />}
											tooltip="Set the maximum number of people who can attend"
										/>
									</div>

									<div>
										<FormInput
											id="price"
											label="Ticket Price (₹ INR)"
											name="price"
											type="number"
											value={formData.price}
											onChange={handleChange}
											min="0"
											step="1"
											placeholder="0"
											error={errors.price}
											required
											icon={
												<span className="text-lg" style={{ color: '#f59e0b' }}>
													₹
												</span>
											}
											tooltip="Set to 0 for free events"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Action Buttons */}
					<div className="mt-8 pt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:ring-offset-2 shadow-sm"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className={`px-8 py-3 gradient-bg text-white rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:ring-offset-2 ${
								loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
							}`}
						>
							{loading ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{isEditing ? 'Updating...' : 'Creating...'}
								</span>
							) : (
								<span className="flex items-center">
									<SparklesIcon className="w-5 h-5 mr-2" />
									{isEditing ? 'Update Event' : 'Create Event'}
								</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default CreateEventModal;
