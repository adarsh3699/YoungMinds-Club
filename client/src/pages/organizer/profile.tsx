import React, { useState, useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import {
	PencilIcon,
	CameraIcon,
	UserIcon,
	BuildingOfficeIcon,
	LinkIcon,
	EnvelopeIcon,
	DocumentTextIcon,
	StarIcon,
	CheckCircleIcon,
	SparklesIcon,
	GlobeAltIcon,
	BriefcaseIcon,
	ChatBubbleLeftRightIcon,
	CameraIcon as InstagramIcon,
} from "@heroicons/react/24/outline";
import { FormInput, TextareaField, SearchableSelect, getErrorMessage } from "../../components/common";
import {
	OrganizerProfileData,
	OrganizerFormValues,
	OrganizerFeedbackSummary,
	OrganizerProfileApiResponse,
	OrganizerProfilePictureResponse,
} from "@/types";

const Profile: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfileData | null>(null);
	const [feedbackSummary, setFeedbackSummary] = useState<OrganizerFeedbackSummary | null>(null);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
	const [stateOptions, setStateOptions] = useState<{ value: string; label: string; iso2?: string }[]>([]);
	const [countryOptions, setCountryOptions] = useState<{ value: string; label: string; iso2: string }[]>([]);
	const [selectedCountryIso, setSelectedCountryIso] = useState<string>("IN");
	const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
	const [loadingStates, setLoadingStates] = useState<boolean>(false);
	const [loadingCities, setLoadingCities] = useState<boolean>(false);
	const [locationCache, setLocationCache] = useState<{
		countries: { value: string; label: string; iso2: string }[];
		states: { [countryIso: string]: { value: string; label: string; iso2?: string }[] };
		cities: { [key: string]: { value: string; label: string }[] };
	}>({
		countries: [],
		states: {},
		cities: {},
	});
	const [formValues, setFormValues] = useState<OrganizerFormValues>({
		name: "",
		organizationName: "",
		bio: "",
		email: "",
		socialLinks: {
			website: "",
			linkedin: "",
			twitter: "",
			instagram: "",
		},
		location: {
			city: "",
			state: "",
			country: "India",
			address: "",
		},
	});
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Generic API fetch function with caching
	const fetchLocationData = async (
		endpoint: string,
		cacheKey: string,
		cacheType: "countries" | "states" | "cities"
	): Promise<{ value: string; label: string; iso2?: string }[]> => {
		// Check cache first
		if (cacheType === "countries" && locationCache.countries.length > 0) {
			return locationCache.countries;
		}
		if (cacheType === "states" && locationCache.states[cacheKey]) {
			return locationCache.states[cacheKey];
		}
		if (cacheType === "cities" && locationCache.cities[cacheKey]) {
			return locationCache.cities[cacheKey];
		}

		// Set loading state
		if (cacheType === "countries") setLoadingCountries(true);
		else if (cacheType === "states") setLoadingStates(true);
		else if (cacheType === "cities") setLoadingCities(true);

		try {
			const response = await axios.get(endpoint);
			if (response.data.success) {
				const data = response.data[cacheType];

				// Update cache
				setLocationCache((prev) => {
					const newCache = { ...prev };
					if (cacheType === "countries") {
						newCache.countries = data;
					} else if (cacheType === "states") {
						newCache.states[cacheKey] = data;
					} else if (cacheType === "cities") {
						newCache.cities[cacheKey] = data;
					}
					return newCache;
				});

				return data;
			}
			return [];
		} catch (error) {
			console.error(`Error fetching ${cacheType}:`, error);
			return [];
		} finally {
			// Clear loading state
			if (cacheType === "countries") setLoadingCountries(false);
			else if (cacheType === "states") setLoadingStates(false);
			else if (cacheType === "cities") setLoadingCities(false);
		}
	};

	const loadLocationOptions = async (countryIso?: string, stateIso?: string): Promise<void> => {
		try {
			// Load countries if not cached
			if (locationCache.countries.length === 0) {
				const countries = await fetchLocationData("/filters/countries", "", "countries");
				setCountryOptions(countries as { value: string; label: string; iso2: string }[]);

				// Set default country ISO if countries loaded
				if (!countryIso && countries.length > 0) {
					const defaultCountry = countries.find((c) => c.value === "India");
					if (defaultCountry && defaultCountry.iso2) {
						setSelectedCountryIso(defaultCountry.iso2);
						countryIso = defaultCountry.iso2;
					}
				}
			} else {
				setCountryOptions(locationCache.countries);
			}

			// Load states for specified country
			if (countryIso) {
				const states = await fetchLocationData(`/filters/states/${countryIso}`, countryIso, "states");
				setStateOptions(states);

				// Load cities if state is specified
				if (stateIso) {
					const cityKey = `${countryIso}-${stateIso}`;
					const cities = await fetchLocationData(
						`/filters/cities/${countryIso}/${stateIso}`,
						cityKey,
						"cities"
					);
					setCityOptions(cities);
				} else {
					setCityOptions([]);
				}
			}
		} catch (error) {
			console.error("Error loading location options:", error);
		}
	};

	// Helper function to load location data based on saved user values
	const loadSavedLocationData = async (): Promise<void> => {
		const savedCountry = organizerProfile?.location?.country || "India";
		const savedState = organizerProfile?.location?.state || "";

		try {
			// First, ensure countries are loaded
			let countries = locationCache.countries;
			if (countries.length === 0) {
				const fetchedCountries = await fetchLocationData("/filters/countries", "", "countries");
				// Filter countries that have iso2 and cast to proper type
				countries = fetchedCountries.filter((c): c is { value: string; label: string; iso2: string } =>
					Boolean(c.iso2)
				);
				setCountryOptions(countries);
			} else {
				setCountryOptions(countries);
			}

			// Find the saved country's ISO code
			const savedCountryObj = countries.find((c) => c.value === savedCountry);
			const countryIso = savedCountryObj?.iso2 || "IN";
			setSelectedCountryIso(countryIso);

			// Load states for the saved country
			let states = locationCache.states[countryIso];
			if (!states) {
				states = await fetchLocationData(`/filters/states/${countryIso}`, countryIso, "states");
			}
			setStateOptions(states);

			// Load cities for the saved state if it exists
			if (savedState) {
				const savedStateObj = states.find((s) => s.value === savedState);
				if (savedStateObj?.iso2) {
					const cityKey = `${countryIso}-${savedStateObj.iso2}`;
					let cities = locationCache.cities[cityKey];
					if (!cities) {
						cities = await fetchLocationData(
							`/filters/cities/${countryIso}/${savedStateObj.iso2}`,
							cityKey,
							"cities"
						);
					}
					setCityOptions(cities);
				} else {
					setCityOptions([]);
				}
			} else {
				setCityOptions([]);
			}
		} catch (error) {
			console.error("Error loading saved location data:", error);
		}
	};

	useEffect(() => {
		const fetchProfileData = async (): Promise<void> => {
			setLoading(true);
			try {
				// Get organizer profile data
				const profileResponse: AxiosResponse<OrganizerProfileApiResponse> = await axios.get(
					"/organizer/profile"
				);
				if (profileResponse.data.success) {
					const profileData = profileResponse.data.profile;
					setOrganizerProfile(profileData);

					// Set form values
					setFormValues({
						name: profileData.name || "",
						organizationName: profileData.organizationName || "",
						bio: profileData.bio || "",
						email: profileData.email || "",
						socialLinks: {
							website: profileData.socialLinks?.website || "",
							linkedin: profileData.socialLinks?.linkedin || "",
							twitter: profileData.socialLinks?.twitter || "",
							instagram: profileData.socialLinks?.instagram || "",
						},
						location: {
							city: profileData.location?.city || "",
							state: profileData.location?.state || "",
							country: profileData.location?.country || "India",
							address: profileData.location?.address || "",
						},
					});
				}

				// Get feedback summary
				const feedbackResponse: AxiosResponse<{ summary: OrganizerFeedbackSummary }> = await axios.get(
					"/organizer/feedback/summary"
				);
				setFeedbackSummary(feedbackResponse.data.summary);

				// Don't load location data on page load - only when entering edit mode
				// This improves performance and reduces unnecessary API calls
			} catch (error) {
				console.error("Error fetching profile data:", error);
				setError("Failed to load profile data. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	}, []);

	const toggleEditMode = (): void => {
		if (editMode) {
			// Reset form values when canceling edit
			const resetCountry = organizerProfile?.location?.country || "India";

			setFormValues({
				name: organizerProfile?.name || "",
				organizationName: organizerProfile?.organizationName || "",
				bio: organizerProfile?.bio || "",
				email: organizerProfile?.email || "",
				socialLinks: {
					website: organizerProfile?.socialLinks?.website || "",
					linkedin: organizerProfile?.socialLinks?.linkedin || "",
					twitter: organizerProfile?.socialLinks?.twitter || "",
					instagram: organizerProfile?.socialLinks?.instagram || "",
				},
				location: {
					city: organizerProfile?.location?.city || "",
					state: organizerProfile?.location?.state || "",
					country: resetCountry,
					address: organizerProfile?.location?.address || "",
				},
			});
		} else {
			// Load location data when entering edit mode (non-blocking)
			// Use the helper function to handle saved location data properly
			loadSavedLocationData();
		}
		setEditMode(!editMode);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			socialLinks: {
				...formValues.socialLinks,
				[name]: value,
			},
		});
	};

	const handleLocationChange = async (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
	): Promise<void> => {
		const { name, value } = e.target;

		// If country is changed, load states for the new country
		if (name === "country") {
			const selectedCountry = countryOptions.find((c) => c.value === value);
			if (selectedCountry) {
				setSelectedCountryIso(selectedCountry.iso2);
				await loadLocationOptions(selectedCountry.iso2);
			}
			// Reset state and city when country changes
			setFormValues({
				...formValues,
				location: {
					...formValues.location,
					[name]: value,
					state: "",
					city: "",
				},
			});
		} else if (name === "state") {
			// If state is changed, load cities for the new state
			const selectedState = stateOptions.find((s) => s.value === value);
			if (selectedState && selectedState.iso2) {
				await loadLocationOptions(selectedCountryIso, selectedState.iso2);
			} else {
				// If state doesn't have ISO code (fallback), clear cities
				setCityOptions([]);
			}
			// Reset city when state changes
			setFormValues({
				...formValues,
				location: {
					...formValues.location,
					[name]: value,
					city: "",
				},
			});
		} else {
			setFormValues({
				...formValues,
				location: {
					...formValues.location,
					[name]: value,
				},
			});
		}
	};

	const saveProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setSaving(true);
		try {
			const response: AxiosResponse<OrganizerProfileApiResponse> = await axios.put(
				"/organizer/profile",
				formValues
			);

			if (response.data.success) {
				setOrganizerProfile({
					...organizerProfile!,
					...formValues,
				});

				setEditMode(false);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			setError("Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleProfilePictureClick = (): void => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file size on frontend (2MB limit for logos)
		const maxSize = 2 * 1024 * 1024; // 2MB in bytes
		if (file.size > maxSize) {
			setError("Logo file is too large. Please choose an image smaller than 2MB.");
			return;
		}

		// Check file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
		if (!allowedTypes.includes(file.type)) {
			setError("Invalid file type. Please upload a JPG, PNG, GIF, WebP, or SVG image.");
			return;
		}

		const formData = new FormData();
		formData.append("organizerBrandLogo", file);

		setSaving(true);
		try {
			const response: AxiosResponse<OrganizerProfilePictureResponse> = await axios.post(
				"/organizer/profile/picture",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.success) {
				setOrganizerProfile({
					...organizerProfile!,
					organizerBrandLogo: response.data.organizerBrandLogo,
				});
				// Clear any previous errors on success
				setError(null);
			}
		} catch (error: unknown) {
			console.error("Error uploading logo:", error);
			setError(getErrorMessage(error));
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
				<div className="container mx-auto px-4 py-8 mt-12">
					<div className="flex justify-center items-center h-64">
						<div className="relative">
							<div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
							<div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary rounded-full animate-ping"></div>
						</div>
						<div className="ml-6">
							<h2 className="text-2xl font-bold text-primary animate-pulse">Loading Profile</h2>
							<p className="text-muted-foreground mt-2">Please wait while we fetch your information...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!organizerProfile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
				<div className="container mx-auto px-4 py-8 mt-12">
					<div className="max-w-md mx-auto bg-card rounded-2xl shadow-xl border border-destructive/20 p-8 animate-fade-in">
						<div className="text-center">
							<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">⚠️</span>
							</div>
							<h3 className="text-xl font-bold text-destructive mb-2">Profile Not Found</h3>
							<p className="text-muted-foreground">
								Failed to load profile data. Please try refreshing the page.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="container mx-auto px-4 py-8 mt-12 mb-24">
				{error && (
					<div className="max-w-4xl mx-auto mb-8 animate-fade-in">
						<div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm">
							<div className="flex items-center">
								<div className="w-2 h-8 bg-destructive rounded-full mr-4"></div>
								<div>
									<strong className="font-bold">Error!</strong>
									<span className="block sm:inline ml-2">{error}</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column: Profile Info */}
						<div className="lg:col-span-2 space-y-8">
							{/* Main Profile Card */}
							<div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm animate-fade-in">
								{/* Header with gradient */}
								<div className="bg-gradient-to-r from-primary/10 via-brand-light to-accent/20 p-8 border-b border-border/30">
									<div className="flex justify-between items-start">
										<div className="flex items-center space-x-2">
											<SparklesIcon className="h-6 w-6 text-primary" />
											<h1 className="text-3xl font-bold text-card-foreground">
												Organizer Profile
											</h1>
										</div>
										<button
											onClick={toggleEditMode}
											className={`group flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
												editMode
													? "bg-muted text-muted-foreground hover:bg-muted/80"
													: "bg-primary text-primary-foreground hover:bg-brand-dark shadow-lg hover:shadow-xl"
											}`}
										>
											{editMode ? (
												<>
													<span>Cancel</span>
												</>
											) : (
												<>
													<PencilIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
													<span>Edit Profile</span>
												</>
											)}
										</button>
									</div>
								</div>

								<div className="p-8">
									<div className="flex flex-col md:flex-row gap-8">
										{/* Enhanced Profile Picture */}
										<div className="flex-shrink-0">
											<div className="relative group">
												<div className="relative">
													<div
														className="h-40 w-40 rounded-2xl bg-gradient-to-br from-primary/20 to-brand-light flex items-center justify-center overflow-hidden cursor-pointer shadow-xl border-4 border-white/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
														onClick={handleProfilePictureClick}
													>
														{organizerProfile.organizerBrandLogo ? (
															<img
																src={organizerProfile.organizerBrandLogo}
																alt="Brand Logo"
																className="h-full w-full object-cover rounded-xl"
															/>
														) : (
															<span className="text-6xl font-bold text-primary/60">
																{organizerProfile.name
																	? organizerProfile.name.charAt(0)
																	: "?"}
															</span>
														)}

														{/* Upload Loading Overlay */}
														{saving && (
															<div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl backdrop-blur-sm z-10">
																<div className="text-center text-white">
																	<div role="status" className="mb-3">
																		<svg
																			aria-hidden="true"
																			className="w-8 h-8 text-white/30 animate-spin fill-white mx-auto"
																			viewBox="0 0 100 101"
																			fill="none"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
																				fill="currentColor"
																			/>
																			<path
																				d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
																				fill="currentFill"
																			/>
																		</svg>
																		<span className="sr-only">Loading...</span>
																	</div>
																	<span className="text-sm font-medium">
																		Uploading
																	</span>
																</div>
															</div>
														)}

														{/* Hover Overlay */}
														{!saving && (
															<div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl backdrop-blur-sm">
																<div className="text-center text-white">
																	<CameraIcon className="h-8 w-8 mx-auto mb-2" />
																	<span className="text-sm font-medium">
																		Change Logo
																	</span>
																</div>
															</div>
														)}
													</div>
													{/* Decorative ring */}
													<div className="absolute -inset-1 bg-gradient-to-r from-primary via-brand-secondary to-brand-tertiary rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
												</div>
												<input
													type="file"
													ref={fileInputRef}
													className="hidden"
													accept="image/*"
													onChange={handleFileChange}
													disabled={saving}
												/>
											</div>

											{/* Enhanced Rating Display */}
											{feedbackSummary && (
												<div className="mt-6 bg-gradient-to-r from-accent/30 to-brand-light/30 p-4 rounded-xl border border-accent/20 backdrop-blur-sm">
													<div className="flex items-center justify-between mb-2">
														<h3 className="text-sm font-semibold text-accent-foreground flex items-center">
															<StarIcon className="h-4 w-4 mr-1 text-brand-primary" />
															Organizer Rating
														</h3>
														<CheckCircleIcon className="h-5 w-5 text-success" />
													</div>
													<div className="flex items-center space-x-2">
														<div className="flex">
															{[...Array(5)].map((_, index) => (
																<StarIcon
																	key={index}
																	className={`h-5 w-5 transition-colors duration-200 ${
																		index <
																		Math.floor(feedbackSummary.averageRating || 0)
																			? "text-brand-primary fill-current"
																			: "text-muted-foreground/30"
																	}`}
																/>
															))}
														</div>
														<span className="text-lg font-bold text-accent-foreground">
															{feedbackSummary.averageRating
																? feedbackSummary.averageRating.toFixed(1)
																: "N/A"}
														</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Based on {feedbackSummary.totalFeedbacks || 0} reviews
													</p>
												</div>
											)}
										</div>

										{/* Enhanced Profile Details */}
										<div className="flex-grow">
											{editMode ? (
												<form onSubmit={saveProfile} className="space-y-6">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
														<FormInput
															type="text"
															id="name"
															name="name"
															value={formValues.name}
															onChange={handleInputChange}
															label="Full Name"
															placeholder="Enter your full name"
															required
															icon={<UserIcon className="h-5 w-5" />}
															className="animate-fade-in"
														/>

														<FormInput
															type="text"
															id="organizationName"
															name="organizationName"
															value={formValues.organizationName}
															onChange={handleInputChange}
															label="Organization Name"
															placeholder="Enter your organization name"
															icon={<BuildingOfficeIcon className="h-5 w-5" />}
															className="animate-fade-in"
														/>
													</div>

													<FormInput
														type="email"
														id="email"
														name="email"
														value={formValues.email}
														onChange={handleInputChange}
														label="Email Address"
														placeholder="Enter your email address"
														required
														icon={<EnvelopeIcon className="h-5 w-5" />}
														className="animate-fade-in"
													/>

													<TextareaField
														id="bio"
														name="bio"
														value={formValues.bio}
														onChange={handleInputChange}
														label="Bio / About"
														placeholder="Tell us about yourself and your organization..."
														rows={4}
														maxLength={500}
														className="animate-fade-in"
													/>

													{/* Location Fields */}
													<div className="space-y-6">
														<h3 className="text-lg font-semibold text-card-foreground flex items-center">
															<GlobeAltIcon className="h-5 w-5 text-primary mr-2" />
															Location Details
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															<SearchableSelect
																id="city"
																name="city"
																value={formValues.location.city || ""}
																onChange={handleLocationChange}
																options={cityOptions}
																placeholder={
																	loadingCities
																		? "Loading cities..."
																		: "Select your city"
																}
																searchPlaceholder="Search Indian cities..."
																label="City"
																disabled={loadingCities}
															/>

															<SearchableSelect
																id="state"
																name="state"
																value={formValues.location.state || ""}
																onChange={handleLocationChange}
																options={stateOptions}
																placeholder={
																	loadingStates
																		? "Loading states..."
																		: "Select your state"
																}
																searchPlaceholder="Search Indian states..."
																label="State"
																disabled={loadingStates}
															/>
														</div>

														<div className="grid grid-cols-1 gap-6">
															<SearchableSelect
																id="country"
																name="country"
																value={formValues.location.country || ""}
																onChange={handleLocationChange}
																options={countryOptions}
																placeholder={
																	loadingCountries
																		? "Loading countries..."
																		: "Select your country"
																}
																searchPlaceholder="Search countries..."
																label="Country"
																disabled={loadingCountries}
															/>
														</div>

														<TextareaField
															id="address"
															name="address"
															value={formValues.location.address || ""}
															onChange={handleLocationChange}
															label="Complete Address"
															placeholder="Enter your complete address..."
															rows={3}
															maxLength={200}
															className="animate-fade-in"
														/>
													</div>

													<div className="flex justify-end space-x-4 pt-6">
														<button
															type="button"
															onClick={toggleEditMode}
															className="px-6 py-3 text-sm font-medium text-muted-foreground bg-muted rounded-xl hover:bg-muted/80 transition-all duration-200 transform hover:scale-105"
														>
															Cancel
														</button>
														<button
															type="submit"
															className="px-8 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-brand-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
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
																			<path
																				d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
																				fill="currentColor"
																			/>
																			<path
																				d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
																				fill="currentFill"
																			/>
																		</svg>
																		<span className="sr-only">Loading...</span>
																	</div>
																	<span className="text-white font-semibold">
																		Saving...
																	</span>
																</>
															) : (
																<>
																	<CheckCircleIcon className="h-4 w-4 mr-2 text-white" />
																	<span className="text-white font-semibold">
																		Save Changes
																	</span>
																</>
															)}
														</button>
													</div>
												</form>
											) : (
												<div>
													{[
														{
															icon: UserIcon,
															label: "Full Name",
															value: organizerProfile.name,
														},
														{
															icon: BuildingOfficeIcon,
															label: "Organization",
															value: organizerProfile.organizationName || "Not specified",
														},
														{
															icon: EnvelopeIcon,
															label: "Email Address",
															value: organizerProfile.email,
														},
													].map((field, index) => (
														<div
															key={index}
															className="group p-4 rounded-xl hover:bg-muted/30 transition-all duration-200"
														>
															<div className="flex items-center mb-2">
																<field.icon className="h-5 w-5 text-primary mr-2" />
																<p className="text-sm font-medium text-muted-foreground">
																	{field.label}
																</p>
															</div>
															<p className="text-lg font-semibold text-card-foreground ml-7">
																{field.value}
															</p>
														</div>
													))}

													{organizerProfile.bio && (
														<div className="group p-4 rounded-xl hover:bg-muted/30 transition-all duration-200">
															<div className="flex items-center mb-2">
																<DocumentTextIcon className="h-5 w-5 text-primary mr-2" />
																<p className="text-sm font-medium text-muted-foreground">
																	Bio
																</p>
															</div>
															<p className="text-primary ml-7 leading-relaxed">
																{organizerProfile.bio}
															</p>
														</div>
													)}

													{/* Location Information */}
													{(organizerProfile.location?.city ||
														organizerProfile.location?.state ||
														organizerProfile.location?.country ||
														organizerProfile.location?.address) && (
														<div className="group p-4 rounded-xl hover:bg-muted/30 transition-all duration-200">
															<div className="flex items-center mb-3">
																<GlobeAltIcon className="h-5 w-5 text-primary mr-2" />
																<p className="text-sm font-medium text-muted-foreground">
																	Location
																</p>
															</div>
															<div className="ml-7 space-y-2">
																{organizerProfile.location?.city && (
																	<div>
																		<span className="text-sm text-muted-foreground">
																			City:{" "}
																		</span>
																		<span className="text-base font-medium text-card-foreground">
																			{organizerProfile.location.city}
																		</span>
																	</div>
																)}
																{organizerProfile.location?.state && (
																	<div>
																		<span className="text-sm text-muted-foreground">
																			State:{" "}
																		</span>
																		<span className="text-base font-medium text-card-foreground">
																			{organizerProfile.location.state}
																		</span>
																	</div>
																)}
																{organizerProfile.location?.country && (
																	<div>
																		<span className="text-sm text-muted-foreground">
																			Country:{" "}
																		</span>
																		<span className="text-base font-medium text-card-foreground">
																			{organizerProfile.location.country}
																		</span>
																	</div>
																)}
																{organizerProfile.location?.address && (
																	<div>
																		<span className="text-sm text-muted-foreground">
																			Address:{" "}
																		</span>
																		<span className="text-base text-card-foreground">
																			{organizerProfile.location.address}
																		</span>
																	</div>
																)}
															</div>
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Enhanced Social Links Card */}
							<div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm animate-fade-in">
								<div className="bg-gradient-to-r from-accent/10 to-brand-light/10 p-6 border-b border-border/30">
									<h2 className="text-2xl font-bold text-card-foreground flex items-center">
										<LinkIcon className="h-6 w-6 text-primary mr-3" />
										Social Links
									</h2>
									<p className="text-muted-foreground mt-1">
										Connect with your audience across platforms
									</p>
								</div>

								<div className="p-6">
									{editMode ? (
										<div className="space-y-6">
											{[
												{
													name: "website",
													label: "Website URL",
													placeholder: "https://yourwebsite.com",
												},
												{
													name: "linkedin",
													label: "LinkedIn",
													placeholder: "https://linkedin.com/in/username",
												},
												{
													name: "twitter",
													label: "Twitter / X",
													placeholder: "https://twitter.com/username",
												},
												{
													name: "instagram",
													label: "Instagram",
													placeholder: "https://instagram.com/username",
												},
											].map((social, index) => (
												<FormInput
													key={social.name}
													type="url"
													id={social.name}
													name={social.name}
													value={formValues.socialLinks[social.name] || ""}
													onChange={handleSocialLinkChange}
													label={social.label}
													placeholder={social.placeholder}
													className="animate-fade-in"
													style={{ animationDelay: `${index * 100}ms` }}
												/>
											))}
										</div>
									) : (
										<div>
											{Object.values(organizerProfile.socialLinks || {}).some((link) => link) ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{[
														{
															key: "website",
															label: "Website",
															icon: <GlobeAltIcon className="h-5 w-5 text-primary" />,
														},
														{
															key: "linkedin",
															label: "LinkedIn",
															icon: <BriefcaseIcon className="h-5 w-5 text-primary" />,
														},
														{
															key: "twitter",
															label: "Twitter / X",
															icon: (
																<ChatBubbleLeftRightIcon className="h-5 w-5 text-primary" />
															),
														},
														{
															key: "instagram",
															label: "Instagram",
															icon: <InstagramIcon className="h-5 w-5 text-primary" />,
														},
													].map(
														(social) =>
															organizerProfile.socialLinks?.[social.key] && (
																<a
																	key={social.key}
																	href={organizerProfile.socialLinks[social.key]}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-brand-light/5 hover:from-primary/10 hover:to-brand-light/10 border border-primary/10 hover:border-primary/20 transition-all duration-300 transform hover:scale-105"
																>
																	<div className="mr-3">{social.icon}</div>
																	<div>
																		<span className="font-medium text-primary group-hover:text-brand-dark transition-colors">
																			{social.label}
																		</span>
																		<LinkIcon className="h-4 w-4 ml-2 inline opacity-60 group-hover:opacity-100 transition-opacity" />
																	</div>
																</a>
															)
													)}
												</div>
											) : (
												<div className="text-center py-12">
													<LinkIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
													<p className="text-muted-foreground text-lg">
														No social links added yet
													</p>
													<p className="text-muted-foreground/60 text-sm mt-1">
														Click edit to add your social profiles
													</p>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Enhanced Right Column: Feedback Summary */}
						<div className="space-y-8">
							<div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm animate-fade-in sticky top-20">
								<div className="bg-gradient-to-r from-success/10 to-brand-light/10 p-6 border-b border-border/30">
									<h2 className="text-2xl font-bold text-card-foreground flex items-center">
										<StarIcon className="h-6 w-6 text-brand-primary mr-3" />
										Feedback Summary
									</h2>
									<p className="text-muted-foreground mt-1">Your organizer performance metrics</p>
								</div>

								<div className="p-6">
									{feedbackSummary ? (
										<div className="space-y-6">
											{/* Overall Rating Card */}
											<div className="bg-gradient-to-br from-accent/20 to-brand-light/20 rounded-xl p-6 border border-accent/20">
												<h3 className="font-bold text-accent-foreground mb-4 flex items-center">
													<SparklesIcon className="h-5 w-5 mr-2" />
													Overall Rating
												</h3>
												<div className="flex items-center justify-center mb-4">
													<div className="text-center">
														<div className="flex justify-center mb-2">
															{[...Array(5)].map((_, index) => (
																<StarIcon
																	key={index}
																	className={`h-8 w-8 transition-all duration-200 ${
																		index <
																		Math.floor(feedbackSummary.averageRating || 0)
																			? "text-brand-primary fill-current"
																			: "text-muted-foreground/20"
																	}`}
																/>
															))}
														</div>
														<span className="text-4xl font-bold text-accent-foreground">
															{feedbackSummary.averageRating
																? feedbackSummary.averageRating.toFixed(1)
																: "N/A"}
														</span>
														<span className="text-muted-foreground text-lg ml-1">/ 5</span>
													</div>
												</div>
												<p className="text-center text-muted-foreground">
													Based on{" "}
													<span className="font-semibold text-accent-foreground">
														{feedbackSummary.totalFeedbacks || 0}
													</span>{" "}
													feedback submissions
												</p>
											</div>

											{/* Feedback Breakdown */}
											<div>
												<h3 className="font-bold text-card-foreground mb-4">
													Feedback Breakdown
												</h3>
												<div className="space-y-3">
													{[5, 4, 3, 2, 1].map((rating) => {
														const count =
															feedbackSummary.ratingDistribution[
																rating as keyof typeof feedbackSummary.ratingDistribution
															] || 0;
														const percentage = feedbackSummary.totalFeedbacks
															? Math.round((count / feedbackSummary.totalFeedbacks) * 100)
															: 0;

														return (
															<div key={rating} className="flex items-center space-x-3">
																<div className="w-16 text-sm font-medium text-muted-foreground">
																	{rating} stars
																</div>
																<div className="flex-grow">
																	<div className="w-full bg-muted rounded-full h-3 overflow-hidden">
																		<div
																			className={`h-full rounded-full transition-all duration-500 ${
																				rating >= 4
																					? "bg-gradient-to-r from-success to-success/80"
																					: rating >= 3
																					? "bg-gradient-to-r from-warning to-warning/80"
																					: "bg-gradient-to-r from-error to-error/80"
																			}`}
																			style={{ width: `${percentage}%` }}
																		></div>
																	</div>
																</div>
																<div className="w-12 text-sm font-semibold text-muted-foreground text-right">
																	{percentage}%
																</div>
															</div>
														);
													})}
												</div>
											</div>

											{/* No Recent Feedback - Property not available yet */}
										</div>
									) : (
										<div className="text-center py-12">
											<div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
												<StarIcon className="h-10 w-10 text-muted-foreground/40" />
											</div>
											<h3 className="text-lg font-semibold text-muted-foreground mb-2">
												No Feedback Yet
											</h3>
											<p className="text-muted-foreground/60 text-sm leading-relaxed">
												As you host more events and receive feedback, this section will be
												populated with valuable insights.
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
