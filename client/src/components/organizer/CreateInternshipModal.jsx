import { useState, useEffect } from "react";
import axios from "axios";
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
	AcademicCapIcon,
	BuildingOfficeIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckIcon,
} from "@heroicons/react/24/outline";

import "./CreateEventModal.css";
import { FormInput, TextareaField, SelectInput, SearchableSelect, DateTimePicker, MsgAlert } from "../common";
import { INTERNSHIP_TYPES, INTERNSHIP_CATEGORIES, INTERNSHIP_COMPENSATION } from "../../utils/internshipConstants";

const CreateInternshipModal = ({
	onClose,
	onSuccess,
	internshipToEdit = null,
	isEditing = false,
	apiEndpoint = null,
}) => {
	// Step configuration
	const STEPS = [
		{
			id: 1,
			title: "Basic Information",
			description: "Tell us about your internship",
			icon: BriefcaseIcon,
		},
		{
			id: 2,
			title: "Type & Category",
			description: "Define internship type and compensation",
			icon: TagIcon,
		},
		{
			id: 3,
			title: "Location & Schedule",
			description: "Set location, dates, and capacity",
			icon: MapPinIcon,
		},
		{
			id: 4,
			title: "Requirements & Details",
			description: "Add requirements, responsibilities, and benefits",
			icon: DocumentCheckIcon,
		},
		{
			id: 5,
			title: "Review",
			description: "Review and publish your internship",
			icon: CheckIcon,
		},
	];

	const [currentStep, setCurrentStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState(new Set());
	const [visitedSteps, setVisitedSteps] = useState(new Set([1])); // Track visited steps, start with step 1

	const initialFormData = {
		title: "",
		companyName: "",
		companyDescription: "",
		internshipDescription: "",
		type: "",
		category: "",
		duration: "",
		capacity: 1,
		compensation: {
			type: "",
			amount: "",
			currency: "INR",
		},
		applicationDeadline: "",
		startDate: "",
		location: {
			type: "remote",
			city: "",
			country: "India",
			address: "",
		},
		requirements: [],
		responsibilities: [],
		benefits: [],
		skills: [],
		isPublished: false,
	};

	const [formData, setFormData] = useState(initialFormData);
	const [skillInput, setSkillInput] = useState("");
	const [requirementInput, setRequirementInput] = useState("");
	const [responsibilityInput, setResponsibilityInput] = useState("");
	const [benefitInput, setBenefitInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [submitType, setSubmitType] = useState(null);
	const [alertMessage, setAlertMessage] = useState(null);
	const [alertType, setAlertType] = useState("error");

	// State for API filter data
	const [filterData, setFilterData] = useState({
		categoryArray: [],
		cityArray: [],
		loading: true,
		error: null,
	});

	// Transform options for select components
	const internshipTypeOptions = INTERNSHIP_TYPES.slice(1);
	const categoryOptions = filterData.categoryArray.map((category) => ({
		value: category.name,
		label: category.label,
	}));
	const cityOptions = filterData.cityArray.map((city) => ({ value: city, label: city }));
	const durationOptions = [
		{ value: "1 Month", label: "1 Month" },
		{ value: "2 Months", label: "2 Months" },
		{ value: "3 Months", label: "3 Months" },
		{ value: "4 Months", label: "4 Months" },
		{ value: "5 Months", label: "5 Months" },
		{ value: "6 Months", label: "6 Months" },
		{ value: "6+ Months", label: "6+ Months" },
		{ value: "Other", label: "Other" },
	];
	const compensationOptions = INTERNSHIP_COMPENSATION.slice(1);

	// Fetch filter data from API
	useEffect(() => {
		const fetchFilterData = async () => {
			try {
				setFilterData((prev) => ({ ...prev, loading: true, error: null }));

				const CACHE_KEY = "internship_filter_data";
				const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

				const getCachedData = () => {
					try {
						const cached = localStorage.getItem(CACHE_KEY);
						if (cached) {
							const { data, timestamp } = JSON.parse(cached);
							if (Date.now() - timestamp < CACHE_DURATION) {
								return data;
							}
							localStorage.removeItem(CACHE_KEY);
						}
					} catch (error) {
						localStorage.removeItem(CACHE_KEY);
					}
					return null;
				};

				const setCachedData = (data) => {
					try {
						localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
					} catch (error) {
						console.error("Error caching data:", error);
					}
				};

				const cachedData = getCachedData();

				if (cachedData) {
					setFilterData({
						categoryArray: cachedData.categoryArray,
						cityArray: cachedData.cityArray,
						loading: false,
						error: null,
					});
				} else {
					const response = await axios.get("/filters/internships_cat_loc");
					if (response.data.success) {
						const apiData = {
							categoryArray: response.data.data.categoryArray,
							cityArray: response.data.data.cityArray,
						};
						setCachedData(apiData);
						setFilterData({ ...apiData, loading: false, error: null });
					}
				}
			} catch (error) {
				console.error("Error fetching filter data:", error);
				setFilterData({
					categoryArray: INTERNSHIP_CATEGORIES.slice(1),
					cityArray: [
						"Mumbai",
						"Delhi",
						"Bangalore",
						"Hyderabad",
						"Chennai",
						"Pune",
						"Kolkata",
						"Ahmedabad",
						"Jaipur",
						"Lucknow",
					],
					loading: false,
					error: "Failed to load categories and cities. Using default options.",
				});
			}
		};

		fetchFilterData();
	}, []);

	// Initialize form data for editing
	useEffect(() => {
		if (isEditing && internshipToEdit) {
			const formatDateForInput = (dateString) => {
				const date = new Date(dateString);
				if (isNaN(date.getTime())) return "";
				return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
			};

			setFormData({
				...internshipToEdit,
				applicationDeadline: formatDateForInput(internshipToEdit.applicationDeadline),
				startDate: formatDateForInput(internshipToEdit.startDate),
				compensation: internshipToEdit.compensation || { type: "", amount: "", currency: "INR" },
				location: internshipToEdit.location || { type: "remote", city: "", country: "India", address: "" },
				requirements: internshipToEdit.requirements || [],
				responsibilities: internshipToEdit.responsibilities || [],
				benefits: internshipToEdit.benefits || [],
				skills: internshipToEdit.skills || [],
			});
		}
	}, [isEditing, internshipToEdit]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		let newFormData = { ...formData };

		if (name.startsWith("location.")) {
			const locationField = name.split(".")[1];
			newFormData = {
				...formData,
				location: { ...formData.location, [locationField]: value },
			};
		} else if (name.startsWith("compensation.")) {
			const compensationField = name.split(".")[1];
			newFormData = {
				...formData,
				compensation: {
					...formData.compensation,
					[compensationField]: compensationField === "amount" ? value : value,
				},
			};
		} else {
			newFormData = { ...formData, [name]: value };
		}

		setFormData(newFormData);

		// Clear related errors
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}

		// Clear compensation amount error when it becomes valid
		if (name === "compensation.amount" && formData.compensation.type === "Paid") {
			const numericAmount = Number(value);
			if (value && !isNaN(numericAmount) && numericAmount > 0) {
				setErrors((prev) => ({ ...prev, "compensation.amount": undefined }));
			}
		}
	};

	const handleLocationTypeChange = (e) => {
		setFormData({
			...formData,
			location: { ...formData.location, type: e.target.value },
		});
	};

	// Array input handlers
	const handleArrayInput = (inputValue, setInputValue, arrayName, currentArray) => {
		if (inputValue.trim() && !currentArray.includes(inputValue.trim())) {
			setFormData({
				...formData,
				[arrayName]: [...currentArray, inputValue.trim()],
			});
		}
		setInputValue("");
	};

	const removeArrayItem = (arrayName, itemToRemove) => {
		setFormData({
			...formData,
			[arrayName]: formData[arrayName].filter((item) => item !== itemToRemove),
		});
	};

	// Step validation
	const validateStep = (step) => {
		const newErrors = {};

		switch (step) {
			case 1: // Basic Information
				if (!formData.title) newErrors.title = "Internship title is required";
				if (!formData.companyName) newErrors.companyName = "Company name is required";
				if (!formData.companyDescription) newErrors.companyDescription = "Company description is required";
				// Internship description is optional
				break;

			case 2: // Type & Category
				if (!formData.type) newErrors.type = "Internship type is required";
				if (!formData.category) newErrors.category = "Category is required";
				if (!formData.compensation.type) newErrors["compensation.type"] = "Compensation type is required";

				// Validation for paid internships
				if (formData.compensation.type === "Paid") {
					const amount = formData.compensation.amount;
					if (!amount || amount === "") {
						newErrors["compensation.amount"] = "Compensation amount is required for paid internships";
					} else {
						const numericAmount = Number(amount);
						if (isNaN(numericAmount)) {
							newErrors["compensation.amount"] = "Compensation amount must be a valid number";
						} else if (numericAmount <= 0) {
							newErrors["compensation.amount"] = "Compensation amount must be greater than 0";
						}
					}
				}
				break;

			case 3: // Location & Schedule
				if (!formData.duration) newErrors.duration = "Duration is required";
				if (!formData.capacity) newErrors.capacity = "Number of positions is required";
				if (!formData.applicationDeadline) newErrors.applicationDeadline = "Application deadline is required";
				if (!formData.startDate) newErrors.startDate = "Start date is required";

				// Date validation
				if (formData.applicationDeadline && formData.startDate) {
					const deadlineDate = new Date(formData.applicationDeadline);
					const startDate = new Date(formData.startDate);
					if (startDate <= deadlineDate) {
						newErrors.startDate = "Start date must be after application deadline";
					}
				}

				// Location validation
				if (formData.location.type === "on-site" || formData.location.type === "hybrid") {
					if (!formData.location.city) newErrors["location.city"] = "City is required";
					if (!formData.location.country) newErrors["location.country"] = "Country is required";
					if (!formData.location.address) newErrors["location.address"] = "Address is required";
				}
				break;

			case 4: // Requirements & Details - Optional but we can add warnings
				// This step is mostly optional, but we can add recommendations
				break;

			case 5: // Review & Publish - Final validation
				// Run all validations
				return validateStep(1) && validateStep(2) && validateStep(3);
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		const nextStep = currentStep + 1;

		// If next step has already been completed, allow navigation without validation
		if (completedSteps.has(nextStep)) {
			setCurrentStep(nextStep);
			setVisitedSteps((prev) => new Set([...prev, nextStep]));
			return;
		}

		// Otherwise, validate current step before moving forward
		if (validateStep(currentStep)) {
			setCompletedSteps((prev) => new Set([...prev, currentStep]));
			if (currentStep < STEPS.length) {
				setCurrentStep(currentStep + 1);
				setVisitedSteps((prev) => new Set([...prev, nextStep]));
			}
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepClick = (stepNumber) => {
		// Allow navigation to completed steps, current step, or the immediate next step after the last completed step
		const maxCompletedStep = Math.max(0, ...Array.from(completedSteps));
		const isClickable =
			completedSteps.has(stepNumber) || stepNumber === currentStep || stepNumber <= maxCompletedStep + 1;

		if (isClickable) {
			setCurrentStep(stepNumber);
			setVisitedSteps((prev) => new Set([...prev, stepNumber]));
		}
	};

	const handleSubmit = async (publishStatus = false) => {
		if (!validateStep(5)) return;

		setLoading(true);
		setSubmitType(publishStatus ? "publish" : "draft");

		try {
			const internshipFormData = new FormData();
			const dataToSubmit = { ...formData, isPublished: publishStatus };

			Object.entries(dataToSubmit).forEach(([key, value]) => {
				if (key === "location" && value && typeof value === "object") {
					Object.entries(value).forEach(([locKey, locValue]) => {
						if (locValue !== null && locValue !== undefined) {
							internshipFormData.append(`location.${locKey}`, locValue);
						}
					});
				} else if (key === "compensation" && value && typeof value === "object") {
					Object.entries(value).forEach(([compKey, compValue]) => {
						if (compValue !== null && compValue !== undefined) {
							internshipFormData.append(`compensation.${compKey}`, compValue);
						}
					});
				} else if (Array.isArray(value)) {
					value.forEach((item) => {
						internshipFormData.append(`${key}[]`, item);
					});
				} else if (value !== null && value !== undefined) {
					internshipFormData.append(key, value);
				}
			});

			const url =
				apiEndpoint ||
				(isEditing ? `/organizer/internships/${internshipToEdit._id}` : "/organizer/internships");
			const method = isEditing ? "put" : "post";

			const response = await axios[method](url, internshipFormData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (response.status === 200 || response.status === 201) {
				const successMessage = isEditing
					? publishStatus
						? "Internship updated and published successfully!"
						: "Internship updated successfully!"
					: publishStatus
					? "Internship created and published successfully!"
					: "Internship saved as draft successfully!";

				setAlertMessage(successMessage);
				setAlertType("success");

				setTimeout(() => {
					if (onSuccess) onSuccess(response.data.internship || response.data);
					onClose();
				}, 1500);
			}
		} catch (error) {
			console.error("Error submitting internship:", error);
			let errorMessage = "An unexpected error occurred. Please try again.";

			if (error.response) {
				const { status, data } = error.response;
				if (status === 400) errorMessage = data.message || "Please check your input and try again.";
				else if (status === 401) errorMessage = "You are not authorized to perform this action.";
				else if (status === 413) errorMessage = "The data is too large. Please reduce the content size.";
				else if (status === 500) errorMessage = "Server error. Please try again later.";
			} else if (error.request) {
				errorMessage = "Network error. Please check your connection and try again.";
			}

			setAlertMessage(errorMessage);
			setAlertType("error");
		} finally {
			setLoading(false);
			setSubmitType(null);
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
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

						<TextareaField
							id="companyDescription"
							label="Company Description"
							name="companyDescription"
							value={formData.companyDescription}
							onChange={handleChange}
							placeholder="Brief description of your company and what it does (max 250 characters)"
							rows={4}
							error={errors.companyDescription}
							required
							maxLength={250}
						/>

						<TextareaField
							id="internshipDescription"
							label="Internship Description"
							name="internshipDescription"
							value={formData.internshipDescription}
							onChange={handleChange}
							placeholder="Provide a comprehensive description of the internship opportunity..."
							rows={6}
							error={errors.internshipDescription}
						/>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
									error={errors["compensation.type"]}
								/>
							</div>
						</div>

						<SearchableSelect
							id="category"
							name="category"
							value={formData.category}
							onChange={handleChange}
							options={categoryOptions}
							label="Category"
							placeholder={filterData.loading ? "Loading categories..." : "Select a category"}
							searchPlaceholder="Search categories..."
							error={errors.category}
							required
							disabled={filterData.loading}
						/>

						{formData.compensation.type === "Paid" && (
							<div className="grid grid-cols-2 gap-4">
								<FormInput
									id="compensation.amount"
									label="Compensation Amount"
									name="compensation.amount"
									type="number"
									min="0"
									step="1"
									value={formData.compensation.amount}
									onChange={handleChange}
									onKeyDown={(e) => {
										// Prevent minus sign, plus sign, and 'e' (scientific notation)
										if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
											e.preventDefault();
										}
									}}
									placeholder="e.g., 5000"
									error={errors["compensation.amount"]}
									required
									icon={<CurrencyDollarIcon className="h-5 w-5" />}
									tooltip="Enter the monthly compensation amount. Must be a positive number greater than 0."
								/>

								<div>
									<label className="block text-sm font-semibold ym-text-primary mb-2">Currency</label>
									<SelectInput
										id="compensation.currency"
										name="compensation.currency"
										value={formData.compensation.currency}
										onChange={handleChange}
										options={[
											{ value: "INR", label: "INR" },
											{ value: "USD", label: "USD" },
											{ value: "EUR", label: "EUR" },
											{ value: "GBP", label: "GBP" },
										]}
									/>
								</div>
							</div>
						)}
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						{/* Location Type */}
						<div className="ym-bg-amber-100 p-4 rounded-xl">
							<h4 className="text-sm font-semibold ym-text-primary mb-3">Location Type</h4>
							<div className="flex flex-wrap gap-4">
								{["remote", "on-site", "hybrid"].map((type) => (
									<label key={type} className="inline-flex items-center cursor-pointer">
										<input
											type="radio"
											name="locationType"
											value={type}
											checked={formData.location.type === type}
											onChange={handleLocationTypeChange}
											className="h-4 w-4 focus:ring-2 focus:ring-offset-0"
										/>
										<span className="ml-2 text-sm font-semibold ym-text-primary capitalize">
											{type === "remote" && "💻"} {type === "on-site" && "🏢"}{" "}
											{type === "hybrid" && "🔄"} {type.replace("-", " ")}
										</span>
									</label>
								))}
							</div>
						</div>

						{/* Schedule - Moved to top */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<DateTimePicker
								id="applicationDeadline"
								label="Application Deadline"
								name="applicationDeadline"
								value={formData.applicationDeadline}
								onChange={handleChange}
								error={errors.applicationDeadline}
								required
								minDate={new Date()}
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
								}
								placeholder="Select start date"
								showTimeSelect={false}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

							<FormInput
								id="capacity"
								label="Number of Positions"
								name="capacity"
								type="number"
								min="1"
								value={formData.capacity}
								onChange={handleChange}
								placeholder="e.g., 5"
								error={errors.capacity}
								required
								icon={<UsersIcon className="h-5 w-5" />}
							/>
						</div>

						{/* Location Details - Moved to bottom */}
						{(formData.location.type === "on-site" || formData.location.type === "hybrid") && (
							<div className="space-y-4">
								<SearchableSelect
									id="location.city"
									name="location.city"
									value={formData.location.city}
									onChange={handleChange}
									options={cityOptions}
									label="City"
									placeholder={filterData.loading ? "Loading cities..." : "Select a city"}
									searchPlaceholder="Search cities..."
									error={errors["location.city"]}
									required
									disabled={filterData.loading}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										id="location.country"
										label="Country"
										name="location.country"
										value={formData.location.country}
										onChange={handleChange}
										placeholder="e.g., India, USA, UK"
										error={errors["location.country"]}
										required
									/>

									<FormInput
										id="location.address"
										label="Complete Address"
										name="location.address"
										value={formData.location.address}
										onChange={handleChange}
										placeholder="Full address with landmarks"
										error={errors["location.address"]}
										required
									/>
								</div>
							</div>
						)}
					</div>
				);

			case 4:
				return (
					<div className="space-y-8">
						{/* Requirements */}
						<div className="space-y-4">
							<h4 className="text-lg font-semibold ym-text-primary flex items-center">
								<AcademicCapIcon className="h-5 w-5 mr-2" />
								Requirements
							</h4>
							<FormInput
								id="requirementInput"
								name="requirementInput"
								value={requirementInput}
								onChange={(e) => setRequirementInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleArrayInput(
											requirementInput,
											setRequirementInput,
											"requirements",
											formData.requirements
										);
									}
								}}
								placeholder="e.g., Knowledge of React.js, Basic programming skills (Press Enter to add)"
								icon={<SparklesIcon className="h-5 w-5" />}
							/>
							{formData.requirements.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.requirements.map((req, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ym-bg-blue-100 ym-text-blue-800"
										>
											{req}
											<button
												type="button"
												onClick={() => removeArrayItem("requirements", req)}
												className="ml-2 text-blue-600 hover:text-red-600"
											>
												<XMarkIcon className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						{/* Responsibilities */}
						<div className="space-y-4">
							<h4 className="text-lg font-semibold ym-text-primary flex items-center">
								<DocumentCheckIcon className="h-5 w-5 mr-2" />
								Responsibilities
							</h4>
							<FormInput
								id="responsibilityInput"
								name="responsibilityInput"
								value={responsibilityInput}
								onChange={(e) => setResponsibilityInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleArrayInput(
											responsibilityInput,
											setResponsibilityInput,
											"responsibilities",
											formData.responsibilities
										);
									}
								}}
								placeholder="e.g., Develop user interfaces, Assist with testing (Press Enter to add)"
								icon={<DocumentCheckIcon className="h-5 w-5" />}
							/>
							{formData.responsibilities.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.responsibilities.map((resp, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ym-bg-green-100 ym-text-green-800"
										>
											{resp}
											<button
												type="button"
												onClick={() => removeArrayItem("responsibilities", resp)}
												className="ml-2 text-green-600 hover:text-red-600"
											>
												<XMarkIcon className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						{/* Benefits */}
						<div className="space-y-4">
							<h4 className="text-lg font-semibold ym-text-primary flex items-center">
								<SparklesIcon className="h-5 w-5 mr-2" />
								Benefits
							</h4>
							<FormInput
								id="benefitInput"
								name="benefitInput"
								value={benefitInput}
								onChange={(e) => setBenefitInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleArrayInput(benefitInput, setBenefitInput, "benefits", formData.benefits);
									}
								}}
								placeholder="e.g., Flexible working hours, Health insurance (Press Enter to add)"
								icon={<SparklesIcon className="h-5 w-5" />}
							/>
							{formData.benefits.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.benefits.map((benefit, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ym-bg-purple-100 ym-text-purple-800"
										>
											{benefit}
											<button
												type="button"
												onClick={() => removeArrayItem("benefits", benefit)}
												className="ml-2 text-purple-600 hover:text-red-600"
											>
												<XMarkIcon className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						{/* Skills */}
						<div className="space-y-4">
							<h4 className="text-lg font-semibold ym-text-primary flex items-center">
								<TagIcon className="h-5 w-5 mr-2" />
								Skills
							</h4>
							<FormInput
								id="skillInput"
								name="skillInput"
								value={skillInput}
								onChange={(e) => setSkillInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleArrayInput(skillInput, setSkillInput, "skills", formData.skills);
									}
								}}
								placeholder="e.g., JavaScript, React, Python, Communication (Press Enter to add)"
								icon={<TagIcon className="h-5 w-5" />}
							/>
							{formData.skills.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.skills.map((skill, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ym-bg-amber-100 ym-text-yellow-700"
										>
											{skill}
											<button
												type="button"
												onClick={() => removeArrayItem("skills", skill)}
												className="ml-2 text-yellow-600 hover:text-red-600"
											>
												<XMarkIcon className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				);

			case 5:
				return (
					<div className="space-y-6">
						<div className="ym-bg-amber-50 p-6 rounded-xl border border-amber-200">
							<h4 className="text-lg font-semibold ym-text-primary mb-4">Review Your Internship</h4>
							<div className="space-y-4">
								<div>
									<h5 className="font-semibold ym-text-primary">Basic Information</h5>
									<p className="text-sm ym-text-muted">
										{formData.title} at {formData.companyName}
									</p>
									<p className="text-sm ym-text-muted">{formData.companyDescription}</p>
								</div>

								<div>
									<h5 className="font-semibold ym-text-primary">Type & Compensation</h5>
									<p className="text-sm ym-text-muted">
										{formData.type} • {formData.category} • {formData.compensation.type}
										{formData.compensation.type === "Paid" &&
											` (${formData.compensation.amount} ${formData.compensation.currency})`}
									</p>
								</div>

								<div>
									<h5 className="font-semibold ym-text-primary">Schedule & Location</h5>
									<p className="text-sm ym-text-muted">
										{formData.duration} • {formData.capacity} positions • {formData.location.type}
										{formData.location.city && ` in ${formData.location.city}`}
									</p>
								</div>

								{(formData.requirements.length > 0 ||
									formData.responsibilities.length > 0 ||
									formData.benefits.length > 0 ||
									formData.skills.length > 0) && (
									<div>
										<h5 className="font-semibold ym-text-primary">Additional Details</h5>
										<p className="text-sm ym-text-muted">
											{formData.requirements.length} requirements,{" "}
											{formData.responsibilities.length} responsibilities,{" "}
											{formData.benefits.length} benefits, {formData.skills.length} skills
										</p>
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<button
								type="button"
								onClick={() => handleSubmit(false)}
								disabled={loading}
								className="flex-1 px-6 py-3 bg-secondary border-2 border-secondary text-secondary-foreground rounded-xl font-semibold transition-all duration-200 hover:bg-muted hover:ym-border-card focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:ring-offset-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{loading && submitType === "draft" ? (
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
										Save as Draft
									</span>
								)}
							</button>

							<button
								type="button"
								onClick={() => handleSubmit(true)}
								disabled={loading}
								className="flex-1 px-6 py-3 gradient-bg text-white rounded-xl font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:ring-offset-2 hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
							>
								{loading && submitType === "publish" ? (
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
										Publishing...
									</span>
								) : (
									<span className="flex items-center justify-center">
										<BriefcaseIcon className="w-5 h-5 mr-2" />
										Publish Internship
									</span>
								)}
							</button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="ym-bg-card rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
			{/* Message Alert */}
			{alertMessage && (
				<div className="flex-shrink-0">
					<MsgAlert type={alertType} message={alertMessage} />
				</div>
			)}

			{/* Header */}
			<div className="gradient-bg text-white flex justify-between items-center p-4 sm:p-6 flex-shrink-0">
				<div className="flex items-center min-w-0 flex-1">
					<div className="ym-bg-white-20 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 backdrop-blur-sm flex-shrink-0">
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
							{isEditing ? "Edit Internship" : "Create New Internship"}
						</h2>
						<p className="ym-text-white-80 text-xs sm:text-sm font-medium">
							{STEPS[currentStep - 1].description}
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

			{/* Step Progress */}
			<div className="px-4 py-3 sm:px-6 sm:py-2 border-b ym-border-card flex-shrink-0">
				<div className="flex items-center justify-between overflow-x-auto">
					{STEPS.map((step, index) => {
						const isCompleted = completedSteps.has(step.id);
						const isCurrent = currentStep === step.id;
						const isVisited = visitedSteps.has(step.id);
						const maxCompletedStep = Math.max(0, ...Array.from(completedSteps));
						const isClickable = isCompleted || isCurrent || step.id <= maxCompletedStep + 1;

						return (
							<div key={step.id} className="flex items-center flex-shrink-0 sm:py-2">
								<button
									onClick={() => handleStepClick(step.id)}
									disabled={!isClickable}
									className={`flex items-center transition-all duration-200 ${
										isClickable ? "cursor-pointer group" : "cursor-not-allowed"
									}`}
								>
									<div
										className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
											isCompleted
												? "bg-green-500 text-white"
												: isCurrent
												? "gradient-bg text-white"
												: isVisited
												? "bg-blue-500 text-white"
												: "ym-bg-gray-200 ym-text-gray-500"
										} ${isClickable ? "group-hover:scale-105" : ""}`}
									>
										{isCompleted ? (
											<CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
										) : (
											<step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
										)}
									</div>
									<div className="ml-2 hidden sm:block">
										<p
											className={`text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
												isCurrent
													? "ym-text-primary"
													: isClickable
													? "ym-text-muted group-hover:ym-text-primary"
													: "ym-text-muted"
											}`}
										>
											{step.title}
										</p>
									</div>
								</button>
								{index < STEPS.length - 1 && (
									<div
										className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-3 flex-shrink-0 ${
											isCompleted ? "bg-green-500" : "ym-bg-gray-200"
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Step Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-4 sm:p-6">
					<div className="max-w-4xl mx-auto">
						<div className="mb-6">
							<h3 className="text-xl sm:text-2xl font-bold ym-text-primary mb-2">
								{STEPS[currentStep - 1].title}
							</h3>
							<p className="ym-text-muted">{STEPS[currentStep - 1].description}</p>
						</div>

						{renderStepContent()}
					</div>
				</div>
			</div>

			{/* Navigation */}
			{currentStep < 5 && (
				<div className="px-4 py-3 sm:px-6 sm:py-4 border-t ym-border-card flex-shrink-0 bg-white">
					<div className="flex justify-between items-center">
						<button
							onClick={handlePrevious}
							disabled={currentStep === 1}
							className="px-3 py-2 text-sm font-semibold ym-text-muted hover:ym-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
						>
							<ArrowLeftIcon className="w-4 h-4 mr-1" />
							Previous
						</button>

						<button
							onClick={handleNext}
							className="px-5 py-2.5 gradient-bg text-white rounded-lg font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center"
						>
							Next
							<ArrowRightIcon className="w-4 h-4 ml-1" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateInternshipModal;
