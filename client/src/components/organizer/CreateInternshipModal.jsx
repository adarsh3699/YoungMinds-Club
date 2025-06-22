import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
	XMarkIcon,
	BriefcaseIcon,
	MapPinIcon,
	TagIcon,
	UsersIcon,
	CurrencyDollarIcon,
	SparklesIcon,
	DocumentCheckIcon,
	CalendarIcon,
	ClockIcon,
	AcademicCapIcon,
	BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

import './CreateEventModal.css';
import { FormInput, TextareaField, SelectInput, DateTimePicker, Tooltip, MsgAlert } from '../common';
import { INTERNSHIP_TYPES, INTERNSHIP_CATEGORIES, INTERNSHIP_COMPENSATION } from '../../utils/internshipConstants';

const CreateInternshipModal = ({
	onClose,
	onSuccess,
	internshipToEdit = null,
	isEditing = false,
	apiEndpoint = null,
}) => {
	const initialFormData = {
		title: '',
		companyName: '',
		shortDescription: '',
		description: '',
		type: '',
		category: '',
		duration: '',
		compensation: {
			type: '',
			amount: 0,
			currency: 'USD',
		},
		applicationDeadline: '',
		startDate: '',
		location: {
			type: 'remote',
			city: '',
			country: '',
			address: '',
		},
		requirements: [],
		responsibilities: [],
		benefits: [],
		skills: [],
		isPublished: false,
	};

	const [formData, setFormData] = useState({
		...initialFormData,
		...internshipToEdit,
		type: internshipToEdit?.type || '',
		category: internshipToEdit?.category || '',
		duration: internshipToEdit?.duration || '',
		compensation: internshipToEdit?.compensation || {
			type: '',
			amount: 0,
			currency: 'USD',
		},
		applicationDeadline: internshipToEdit?.applicationDeadline || '',
		startDate: internshipToEdit?.startDate || '',
		location: internshipToEdit?.location || {
			type: 'remote',
			city: '',
			country: '',
			address: '',
		},
		requirements: internshipToEdit?.requirements || [],
		responsibilities: internshipToEdit?.responsibilities || [],
		benefits: internshipToEdit?.benefits || [],
		skills: internshipToEdit?.skills || [],
		isPublished: internshipToEdit?.isPublished || false,
	});

	const [skillInput, setSkillInput] = useState('');
	const [requirementInput, setRequirementInput] = useState('');
	const [responsibilityInput, setResponsibilityInput] = useState('');
	const [benefitInput, setBenefitInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [submitType, setSubmitType] = useState(null);
	const [alertMessage, setAlertMessage] = useState(null);
	const [alertType, setAlertType] = useState('error');

	// Transform options for select components
	const internshipTypeOptions = INTERNSHIP_TYPES.slice(1); // Remove 'All Types' option
	const categoryOptions = INTERNSHIP_CATEGORIES.slice(1); // Remove 'All Categories' option
	const durationOptions = [
		{ value: '1 Month', label: '1 Month' },
		{ value: '2 Months', label: '2 Months' },
		{ value: '3 Months', label: '3 Months' },
		{ value: '4 Months', label: '4 Months' },
		{ value: '5 Months', label: '5 Months' },
		{ value: '6 Months', label: '6 Months' },
		{ value: '6+ Months', label: '6+ Months' },
		{ value: 'Other', label: 'Other' },
	];
	const compensationOptions = INTERNSHIP_COMPENSATION.slice(1); // Remove 'All Compensation' option

	// If editing, populate form with internship data
	useEffect(() => {
		if (!isEditing || !internshipToEdit) return;

		// Format date fields correctly for the datetime-local input
		const formattedInternship = {
			...formData,
			type: internshipToEdit.type || '',
			category: internshipToEdit.category || '',
			duration: internshipToEdit.duration || '',
			compensation: internshipToEdit.compensation || {
				type: '',
				amount: 0,
				currency: 'USD',
			},
			applicationDeadline: formatDateForInput(internshipToEdit.applicationDeadline),
			startDate: formatDateForInput(internshipToEdit.startDate),
			location: internshipToEdit.location || {
				type: 'remote',
				city: '',
				country: '',
				address: '',
			},
			requirements: internshipToEdit.requirements || [],
			responsibilities: internshipToEdit.responsibilities || [],
			benefits: internshipToEdit.benefits || [],
			skills: internshipToEdit.skills || [],
			isPublished: internshipToEdit.isPublished || false,
		};

		setFormData(formattedInternship);
	}, [isEditing, internshipToEdit]);

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
		}
		// Handle nested compensation object
		else if (name.startsWith('compensation.')) {
			const compensationField = name.split('.')[1];
			newFormData = {
				...formData,
				compensation: {
					...formData.compensation,
					[compensationField]: compensationField === 'amount' ? Number(value) : value,
				},
			};
		} else {
			newFormData = {
				...formData,
				[name]: value,
			};
		}

		// Clear dependent fields and errors when application deadline changes
		if (name === 'applicationDeadline') {
			const deadlineDate = new Date(value);
			const now = new Date();

			// Clear start date if it's now before the new deadline
			if (newFormData.startDate && new Date(newFormData.startDate) <= deadlineDate) {
				newFormData.startDate = '';
			}

			// Clear related errors
			const newErrors = { ...errors };
			if (deadlineDate > now) {
				delete newErrors.applicationDeadline;
			}
			if (!newFormData.startDate) {
				delete newErrors.startDate;
			}
			setErrors(newErrors);
		}

		// Clear compensation amount error when amount is changed and valid
		if (name === 'compensation.amount' && value !== '') {
			const numericAmount = Number(value);
			if (!isNaN(numericAmount) && numericAmount >= 0) {
				const newErrors = { ...errors };
				delete newErrors['compensation.amount'];
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

	const handleSkillInputChange = (e) => {
		setSkillInput(e.target.value);
	};

	const handleSkillInputKeyDown = (e) => {
		if (e.key === 'Enter' && skillInput.trim() !== '') {
			e.preventDefault();
			if (!formData.skills.includes(skillInput.trim())) {
				setFormData({
					...formData,
					skills: [...formData.skills, skillInput.trim()],
				});
			}
			setSkillInput('');
		}
	};

	const removeSkill = (skillToRemove) => {
		setFormData({
			...formData,
			skills: formData.skills.filter((skill) => skill !== skillToRemove),
		});
	};

	const handleRequirementInputChange = (e) => {
		setRequirementInput(e.target.value);
	};

	const handleRequirementInputKeyDown = (e) => {
		if (e.key === 'Enter' && requirementInput.trim() !== '') {
			e.preventDefault();
			if (!formData.requirements.includes(requirementInput.trim())) {
				setFormData({
					...formData,
					requirements: [...formData.requirements, requirementInput.trim()],
				});
			}
			setRequirementInput('');
		}
	};

	const removeRequirement = (requirementToRemove) => {
		setFormData({
			...formData,
			requirements: formData.requirements.filter((req) => req !== requirementToRemove),
		});
	};

	const handleResponsibilityInputChange = (e) => {
		setResponsibilityInput(e.target.value);
	};

	const handleResponsibilityInputKeyDown = (e) => {
		if (e.key === 'Enter' && responsibilityInput.trim() !== '') {
			e.preventDefault();
			if (!formData.responsibilities.includes(responsibilityInput.trim())) {
				setFormData({
					...formData,
					responsibilities: [...formData.responsibilities, responsibilityInput.trim()],
				});
			}
			setResponsibilityInput('');
		}
	};

	const removeResponsibility = (responsibilityToRemove) => {
		setFormData({
			...formData,
			responsibilities: formData.responsibilities.filter((resp) => resp !== responsibilityToRemove),
		});
	};

	const handleBenefitInputChange = (e) => {
		setBenefitInput(e.target.value);
	};

	const handleBenefitInputKeyDown = (e) => {
		if (e.key === 'Enter' && benefitInput.trim() !== '') {
			e.preventDefault();
			if (!formData.benefits.includes(benefitInput.trim())) {
				setFormData({
					...formData,
					benefits: [...formData.benefits, benefitInput.trim()],
				});
			}
			setBenefitInput('');
		}
	};

	const removeBenefit = (benefitToRemove) => {
		setFormData({
			...formData,
			benefits: formData.benefits.filter((benefit) => benefit !== benefitToRemove),
		});
	};

	const validateForm = () => {
		const newErrors = {};
		const now = new Date();

		// Required field validation
		const requiredFields = {
			title: 'Internship title is required',
			companyName: 'Company name is required',
			shortDescription: 'Short description is required',
			description: 'Description is required',
			type: 'Internship type is required',
			category: 'Category is required',
			duration: 'Duration is required',
			applicationDeadline: 'Application deadline is required',
			startDate: 'Start date is required',
		};

		// Check all required fields at once
		Object.entries(requiredFields).forEach(([field, message]) => {
			if (!formData[field]) newErrors[field] = message;
		});

		// Special validation for compensation amount (0 is allowed for unpaid)
		if (formData.compensation.type === 'Paid' || formData.compensation.type === 'Stipend') {
			const compensationAmount = formData.compensation.amount;
			if (compensationAmount === null || compensationAmount === undefined || compensationAmount === '') {
				newErrors['compensation.amount'] = 'Compensation amount is required';
			} else {
				const numericAmount = Number(compensationAmount);
				if (isNaN(numericAmount)) {
					newErrors['compensation.amount'] = 'Compensation amount must be a valid number';
				} else if (numericAmount < 0) {
					newErrors['compensation.amount'] = 'Compensation amount cannot be negative';
				}
			}
		}

		// Enhanced Date validation checks
		if (formData.applicationDeadline) {
			const deadlineDate = new Date(formData.applicationDeadline);

			// 1. Application Deadline must be greater than or equal to current date and time
			if (deadlineDate <= now) {
				newErrors.applicationDeadline = 'Application deadline must be in the future';
			}

			// 2. Start Date must be greater than Application Deadline
			if (formData.startDate) {
				const startDate = new Date(formData.startDate);
				if (startDate <= deadlineDate) {
					newErrors.startDate = 'Start date must be after the application deadline';
				}
			}
		}

		// Location validation based on type
		if (formData.location.type === 'on-site' || formData.location.type === 'hybrid') {
			const requiredLocationFields = {
				'location.city': 'City is required',
				'location.country': 'Country is required',
				'location.address': 'Address is required',
			};

			Object.entries(requiredLocationFields).forEach(([field, message]) => {
				const [parent, child] = field.split('.');
				if (!formData[parent][child]) newErrors[field] = message;
			});
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (publishStatus = false) => {
		if (!validateForm()) {
			// Count the number of validation errors
			const errorCount = Object.keys(errors).length;
			const errorMessage =
				errorCount === 1
					? 'Please fix the highlighted field to continue.'
					: `Please fix the ${errorCount} highlighted fields to continue.`;

			// Show alert message when validation fails
			setAlertMessage(errorMessage);
			setAlertType('error');
			return;
		}

		setLoading(true);
		setSubmitType(publishStatus ? 'publish' : 'draft');

		try {
			const internshipFormData = new FormData();

			// Process form data for submission with publication status
			const dataToSubmit = {
				...formData,
				isPublished: publishStatus,
			};

			// Handle form data properly for multipart submission
			Object.entries(dataToSubmit).forEach(([key, value]) => {
				if (key === 'location' && value && typeof value === 'object') {
					// Handle location object specially
					Object.entries(value).forEach(([locKey, locValue]) => {
						if (locValue !== null && locValue !== undefined && locValue !== '') {
							internshipFormData.append(`location.${locKey}`, locValue);
						}
					});
				} else if (key === 'compensation' && value && typeof value === 'object') {
					// Handle compensation object specially
					Object.entries(value).forEach(([compKey, compValue]) => {
						if (compValue !== null && compValue !== undefined && compValue !== '') {
							internshipFormData.append(`compensation.${compKey}`, compValue);
						}
					});
				} else if (Array.isArray(value)) {
					// Handle arrays
					value.forEach((item) => {
						internshipFormData.append(`${key}[]`, item);
					});
				} else {
					// Handle primitive values - only append if value is not null/undefined/empty string
					// But allow 0 and false as valid values
					if (value !== null && value !== undefined && value !== '') {
						internshipFormData.append(key, value);
					} else if (value === 0 || value === false) {
						// Explicitly allow 0 and false as valid values
						internshipFormData.append(key, value);
					}
				}
			});

			// Send request - use custom apiEndpoint if provided, otherwise use default organizer endpoint
			const url =
				apiEndpoint ||
				(isEditing ? `/organizer/internships/${internshipToEdit._id}` : '/organizer/internships');

			const method = isEditing ? 'put' : 'post';

			const response = await axios[method](url, internshipFormData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			if (response.status === 200 || response.status === 201) {
				// Success response
				const successMessage = isEditing
					? publishStatus
						? 'Internship updated and published successfully!'
						: 'Internship updated successfully!'
					: publishStatus
					? 'Internship created and published successfully!'
					: 'Internship saved as draft successfully!';

				setAlertMessage(successMessage);
				setAlertType('success');

				// Wait a moment to show success message before closing
				setTimeout(() => {
					if (onSuccess) {
						onSuccess(response.data.internship || response.data);
					}
					onClose();
				}, 1500);
			}
		} catch (error) {
			console.error('Error submitting internship:', error);

			// Handle different types of errors
			let errorMessage = 'An unexpected error occurred. Please try again.';

			if (error.response) {
				// Server responded with error status
				const { status, data } = error.response;

				if (status === 400) {
					// Bad request - likely validation errors
					errorMessage = data.message || 'Please check your input and try again.';
				} else if (status === 401) {
					// Unauthorized
					errorMessage = 'You are not authorized to perform this action.';
				} else if (status === 413) {
					// Payload too large
					errorMessage = 'The poster image is too large. Please use an image smaller than 5MB.';
				} else if (status === 500) {
					// Internal server error
					errorMessage = 'Server error. Please try again later.';
				}
			} else if (error.request) {
				// Network error
				errorMessage = 'Network error. Please check your connection and try again.';
			}

			setAlertMessage(errorMessage);
			setAlertType('error');
		} finally {
			setLoading(false);
			setSubmitType(null);
		}
	};

	return (
		<>
			<div className="ym-bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
				{/* Message Alert */}
				{alertMessage && (
					<div className="">
						<MsgAlert type={alertType} message={alertMessage} />
					</div>
				)}

				{/* Enhanced Header with YoungMinds Gradient - Mobile Optimized */}
				<div className="gradient-bg text-white z-10 flex justify-between items-center p-3 sm:p-6 sm:rounded-t-xl shadow-lg">
					<div className="flex items-center min-w-0 flex-1">
						<div className="ym-bg-white-20 p-2 sm:p-3 rounded-xl mr-2 sm:mr-4 backdrop-blur-sm flex-shrink-0">
							{isEditing ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
									className="w-5 h-5 sm:w-6 sm:h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
									/>
								</svg>
							) : (
								<BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-lg sm:text-2xl font-bold ym-text-white truncate">
								{isEditing ? 'Edit Internship' : 'Create New Internship'}
							</h2>
							<p className="ym-text-white-80 text-xs sm:text-sm font-medium hidden xs:block">
								{isEditing ? 'Update your internship details' : 'Post your internship opportunity'}
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
						{/* Status Badge - Only show when editing - Mobile Optimized */}
						{isEditing && internshipToEdit && (
							<div className="flex items-center">
								<span
									className={`inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg border-2 transform transition-all duration-200 hover:scale-105 ${
										internshipToEdit.isPublished
											? 'bg-green-600 text-white border-green-400 shadow-green-500/30'
											: 'bg-orange-600 text-white border-orange-400 shadow-orange-500/30'
									}`}
								>
									{internshipToEdit.isPublished ? (
										<>
											<div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-green-300 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
											<span className="font-extrabold hidden xs:inline">PUBLISHED</span>
											<span className="font-extrabold xs:hidden">PUB</span>
										</>
									) : (
										<>
											<div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-orange-300 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
											<span className="font-extrabold hidden xs:inline">DRAFT</span>
											<span className="font-extrabold xs:hidden">DRAFT</span>
										</>
									)}
								</span>
							</div>
						)}

						<button
							onClick={onClose}
							className="ym-text-white hover:ym-text-white-80 transition-all duration-200 p-1.5 sm:p-2 rounded-xl hover:ym-bg-white-20 backdrop-blur-sm cursor-pointer group"
						>
							<XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
						</button>
					</div>
				</div>

				{/* Enhanced Form Container */}
				<div className="overflow-y-auto ym-features-bg formContainer">
					<form
						onSubmit={(e) => e.preventDefault()}
						className="p-4 sm:p-8"
						style={{ backgroundColor: 'var(--background)' }}
					>
						{/* Main Grid Layout */}
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-4 sm:mb-8">
							{/* Left Column - Basic Information */}
							<div className="space-y-4 sm:space-y-6">
								{/* Basic Information Section */}
								<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
									<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
										<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
											<BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
										</div>
										Basic Information
									</h3>

									<div className="space-y-4 sm:space-y-6">
										<FormInput
											id="title"
											label="Internship Title"
											name="title"
											value={formData.title}
											onChange={handleChange}
											placeholder="e.g., Software Development Intern, Marketing Intern"
											error={errors.title}
											required
											icon={<BriefcaseIcon className="h-5 w-5" />}
										/>

										<FormInput
											id="companyName"
											label="Company Name"
											name="companyName"
											value={formData.companyName}
											onChange={handleChange}
											placeholder="e.g., Tech Corp, StartupXYZ"
											error={errors.companyName}
											required
											icon={<BuildingOfficeIcon className="h-5 w-5" />}
										/>

										<FormInput
											id="shortDescription"
											label="Short Description"
											name="shortDescription"
											value={formData.shortDescription}
											onChange={handleChange}
											placeholder="Brief summary of the internship (max 200 characters)"
											error={errors.shortDescription}
											required
											maxLength={200}
										/>

										<TextareaField
											id="description"
											label="Detailed Description"
											name="description"
											value={formData.description}
											onChange={handleChange}
											placeholder="Provide a comprehensive description of the internship opportunity, including what the intern will learn and contribute..."
											rows={8}
											error={errors.description}
											required
										/>

										{/* Compensation Amount - Show only for paid internships */}
										{(formData.compensation.type === 'Paid' ||
											formData.compensation.type === 'Stipend') && (
											<div className="grid grid-cols-2 gap-4">
												<FormInput
													id="compensation.amount"
													label="Compensation Amount"
													name="compensation.amount"
													type="number"
													value={formData.compensation.amount}
													onChange={handleChange}
													placeholder="e.g., 5000"
													error={errors['compensation.amount']}
													required
													icon={<CurrencyDollarIcon className="h-5 w-5" />}
												/>

												<div>
													<label className="block text-sm font-semibold ym-text-primary mb-2">
														Currency
													</label>
													<SelectInput
														id="compensation.currency"
														name="compensation.currency"
														value={formData.compensation.currency}
														onChange={handleChange}
														options={[
															{ value: 'INR', label: 'INR' },
															{ value: 'USD', label: 'USD' },
															{ value: 'EUR', label: 'EUR' },
															{ value: 'GBP', label: 'GBP' },
														]}
													/>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Right Column - Type & Location */}
							<div className="space-y-4 sm:space-y-6">
								{/* Internship Type & Category Section */}
								<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
									<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
										<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
											<BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
										</div>
										Type & Category
									</h3>

									<div className="space-y-4 sm:space-y-6">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-semibold ym-text-primary mb-2">
													Internship Type
													<span className="ym-text-yellow-600 ml-1">*</span>
												</label>
												<SelectInput
													id="type"
													name="type"
													value={formData.type}
													onChange={handleChange}
													options={internshipTypeOptions}
													error={errors.type}
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold ym-text-primary mb-2">
													Compensation Type
													<span className="ym-text-yellow-600 ml-1">*</span>
												</label>
												<SelectInput
													id="compensation.type"
													name="compensation.type"
													value={formData.compensation.type}
													onChange={handleChange}
													options={compensationOptions}
													error={errors['compensation.type']}
												/>
											</div>
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

								{/* Location Section */}
								<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
									<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
										<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
											<MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
										</div>
										Location Details
									</h3>

									<div className="space-y-4 sm:space-y-6">
										{/* Location Type Toggle */}
										<div className="ym-bg-amber-100 p-3 sm:p-4 rounded-xl">
											<div className="flex flex-col xs:flex-row space-y-3 xs:space-y-0 xs:space-x-6">
												<label className="inline-flex items-center cursor-pointer">
													<input
														type="radio"
														name="locationType"
														value="remote"
														checked={formData.location.type === 'remote'}
														onChange={handleLocationTypeChange}
														className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
														style={{
															color: 'var(--ring)',
															'--tw-ring-color': 'var(--ring)',
														}}
													/>
													<span className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold ym-text-primary">
														💻 Remote
													</span>
												</label>
												<label className="inline-flex items-center cursor-pointer">
													<input
														type="radio"
														name="locationType"
														value="on-site"
														checked={formData.location.type === 'on-site'}
														onChange={handleLocationTypeChange}
														className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
														style={{
															color: 'var(--ring)',
															'--tw-ring-color': 'var(--ring)',
														}}
													/>
													<span className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold ym-text-primary">
														🏢 On-site
													</span>
												</label>
												<label className="inline-flex items-center cursor-pointer">
													<input
														type="radio"
														name="locationType"
														value="hybrid"
														checked={formData.location.type === 'hybrid'}
														onChange={handleLocationTypeChange}
														className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
														style={{
															color: 'var(--ring)',
															'--tw-ring-color': 'var(--ring)',
														}}
													/>
													<span className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold ym-text-primary">
														🔄 Hybrid
													</span>
												</label>
											</div>
										</div>

										{(formData.location.type === 'on-site' ||
											formData.location.type === 'hybrid') && (
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
													id="location.country"
													label="Country"
													name="location.country"
													value={formData.location.country}
													onChange={handleChange}
													placeholder="e.g., India, USA, UK"
													error={errors['location.country']}
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
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Schedule Section - Full Width */}
						<div className="mb-4 sm:mb-8">
							<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
										<CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
									</div>
									Schedule
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
									<DateTimePicker
										id="applicationDeadline"
										label="Application Deadline"
										name="applicationDeadline"
										value={formData.applicationDeadline}
										onChange={handleChange}
										error={errors.applicationDeadline}
										required
										minDate={new Date()} // Cannot be in the past
										placeholder="Select deadline date"
										showTimeSelect={false}
									/>

									<DateTimePicker
										id="startDate"
										label="Start Date"
										name="startDate"
										value={formData.startDate}
										onChange={handleChange}
										error={errors.startDate}
										required
										minDate={
											formData.applicationDeadline
												? new Date(new Date(formData.applicationDeadline).getTime() + 86400000)
												: new Date()
										} // Must be after application deadline
										placeholder={
											formData.applicationDeadline
												? 'Must be after application deadline'
												: 'Select start date'
										}
										showTimeSelect={false}
									/>

									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Duration
											<span className="ym-text-yellow-600 ml-1">*</span>
										</label>
										<SelectInput
											id="duration"
											name="duration"
											value={formData.duration}
											onChange={handleChange}
											options={durationOptions}
											error={errors.duration}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Requirements & Responsibilities Section */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-4 sm:mb-8">
							{/* Requirements Section */}
							<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
										<AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
									</div>
									Requirements
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Add Requirements
											<span className="text-xs ym-text-muted ml-2">(Press Enter to add)</span>
										</label>
										<FormInput
											id="requirementInput"
											name="requirementInput"
											value={requirementInput}
											onChange={handleRequirementInputChange}
											onKeyDown={handleRequirementInputKeyDown}
											placeholder="e.g., Knowledge of React.js, Basic programming skills"
											icon={<SparklesIcon className="h-5 w-5" />}
										/>
									</div>

									{formData.requirements.length > 0 && (
										<div className="space-y-2">
											<p className="text-sm font-semibold ym-text-primary">Requirements List:</p>
											<div className="space-y-2 max-h-40 overflow-y-auto">
												{formData.requirements.map((requirement, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 ym-bg-gray-50 rounded-lg border ym-border-card"
													>
														<span className="text-sm ym-text-primary flex-1">
															{requirement}
														</span>
														<button
															type="button"
															onClick={() => removeRequirement(requirement)}
															className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
														>
															<XMarkIcon className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Responsibilities Section */}
							<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
										<DocumentCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
									</div>
									Responsibilities
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Add Responsibilities
											<span className="text-xs ym-text-muted ml-2">(Press Enter to add)</span>
										</label>
										<FormInput
											id="responsibilityInput"
											name="responsibilityInput"
											value={responsibilityInput}
											onChange={handleResponsibilityInputChange}
											onKeyDown={handleResponsibilityInputKeyDown}
											placeholder="e.g., Develop user interfaces, Assist with testing"
											icon={<DocumentCheckIcon className="h-5 w-5" />}
										/>
									</div>

									{formData.responsibilities.length > 0 && (
										<div className="space-y-2">
											<p className="text-sm font-semibold ym-text-primary">
												Responsibilities List:
											</p>
											<div className="space-y-2 max-h-40 overflow-y-auto">
												{formData.responsibilities.map((responsibility, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 ym-bg-gray-50 rounded-lg border ym-border-card"
													>
														<span className="text-sm ym-text-primary flex-1">
															{responsibility}
														</span>
														<button
															type="button"
															onClick={() => removeResponsibility(responsibility)}
															className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
														>
															<XMarkIcon className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Benefits Section */}
						<div className="mb-6 sm:mb-8">
							<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
										<SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
									</div>
									Benefits
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Add Benefits
											<span className="text-xs ym-text-muted ml-2">(Press Enter to add)</span>
										</label>
										<FormInput
											id="benefitInput"
											name="benefitInput"
											value={benefitInput}
											onChange={handleBenefitInputChange}
											onKeyDown={handleBenefitInputKeyDown}
											placeholder="e.g., Flexible working hours, Health insurance, Learning opportunities"
											icon={<SparklesIcon className="h-5 w-5" />}
										/>
									</div>

									{formData.benefits.length > 0 && (
										<div className="space-y-2">
											<p className="text-sm font-semibold ym-text-primary">Benefits List:</p>
											<div className="space-y-2 max-h-40 overflow-y-auto">
												{formData.benefits.map((benefit, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 ym-bg-gray-50 rounded-lg border ym-border-card"
													>
														<span className="text-sm ym-text-primary flex-1">
															{benefit}
														</span>
														<button
															type="button"
															onClick={() => removeBenefit(benefit)}
															className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
														>
															<XMarkIcon className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Skills Section */}
						<div className="mb-6 sm:mb-8">
							<div className="ym-bg-card p-4 sm:p-6 rounded-xl shadow-lg border ym-border-card">
								<h3 className="text-base sm:text-lg font-bold ym-text-primary mb-4 sm:mb-6 flex items-center">
									<div className="ym-bg-amber-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
										<TagIcon className="h-4 w-4 sm:h-5 sm:w-5 ym-text-yellow-600" />
									</div>
									Skills
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold ym-text-primary mb-2">
											Add Skills
											<span className="text-xs ym-text-muted ml-2">(Press Enter to add)</span>
										</label>
										<FormInput
											id="skillInput"
											name="skillInput"
											value={skillInput}
											onChange={handleSkillInputChange}
											onKeyDown={handleSkillInputKeyDown}
											placeholder="e.g., JavaScript, React, Python, Communication"
											icon={<TagIcon className="h-5 w-5" />}
										/>
									</div>

									{formData.skills.length > 0 && (
										<div className="space-y-2">
											<p className="text-sm font-semibold ym-text-primary">Skills:</p>
											<div className="flex flex-wrap gap-2">
												{formData.skills.map((skill, index) => (
													<span
														key={index}
														className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ym-bg-amber-100 ym-text-yellow-700 hover:bg-amber-200 transition-colors"
													>
														{skill}
														<button
															type="button"
															onClick={() => removeSkill(skill)}
															className="ml-2 p-0.5 hover:text-red-600 transition-colors"
														>
															<XMarkIcon className="h-3 w-3" />
														</button>
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Enhanced Action Buttons - Mobile Optimized */}
						<div className="mt-4 sm:mt-8 pt-4 sm:pt-6">
							<div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
								{/* Cancel Button */}
								<button
									type="button"
									onClick={onClose}
									disabled={loading}
									className={`w-full sm:w-auto px-4 sm:px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:ring-offset-2 shadow-sm ${
										loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
									}`}
								>
									Cancel
								</button>

								{/* Save as Draft Button */}
								<button
									type="button"
									onClick={() => handleSubmit(false)}
									disabled={loading}
									className={`w-full sm:w-auto px-4 sm:px-6 py-3 bg-secondary border-2 border-secondary text-secondary-foreground rounded-xl font-semibold transition-all duration-200 hover:bg-muted hover:ym-border-card focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:ring-offset-2 shadow-sm ${
										loading
											? 'opacity-70 cursor-not-allowed'
											: 'hover:shadow-md hover:scale-[1.02] cursor-pointer'
									}`}
								>
									{loading && submitType === 'draft' ? (
										<span className="flex items-center justify-center">
											<svg
												className="animate-spin -ml-1 mr-3 h-5 w-5"
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
											Saving as Draft...
										</span>
									) : (
										<span className="flex items-center justify-center">
											<DocumentCheckIcon className="w-5 h-5 mr-2" />
											<span className="hidden xs:inline">Save as </span>Draft
										</span>
									)}
								</button>

								{/* Publish Button */}
								<button
									type="button"
									onClick={() => handleSubmit(true)}
									disabled={loading}
									className={`w-full sm:w-auto px-6 sm:px-8 py-3 gradient-bg text-white rounded-xl font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:ring-offset-2 ${
										loading
											? 'opacity-70 cursor-not-allowed transform-none'
											: 'hover:shadow-xl hover:scale-105 cursor-pointer'
									}`}
								>
									{loading && submitType === 'publish' ? (
										<span className="flex items-center justify-center">
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
											{isEditing ? 'Publishing...' : 'Publishing...'}
										</span>
									) : (
										<span className="flex items-center justify-center">
											<BriefcaseIcon className="w-5 h-5 mr-2" />
											<span className="hidden xs:inline">
												{isEditing ? 'Publish Internship' : 'Publish Internship'}
											</span>
											Publish Internship
										</span>
									)}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default CreateInternshipModal;
