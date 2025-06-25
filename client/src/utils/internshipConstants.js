// Internship Types and Categories Constants
// This file contains all the available internship types and categories for consistent use across the application

export const INTERNSHIP_TYPES = [
	{ value: "", label: "All Types" },
	{ value: "Full-time", label: "Full-time" },
	{ value: "Part-time", label: "Part-time" },
	{ value: "Project-based", label: "Project-based" },
	{ value: "Research", label: "Research" },
	{ value: "Summer", label: "Summer Internship" },
	{ value: "Winter", label: "Winter Internship" },
	{ value: "Other", label: "Other" },
];

export const INTERNSHIP_CATEGORIES = [
	{ value: "", label: "All Categories" },
	{ value: "Technology", label: "Technology & Software" },
	{ value: "Business", label: "Business & Management" },
	{ value: "Marketing", label: "Marketing & Sales" },
	{ value: "Design", label: "Design & Creative" },
	{ value: "Finance", label: "Finance & Banking" },
	{ value: "Engineering", label: "Engineering" },
	{ value: "Data Science", label: "Data Science & Analytics" },
	{ value: "Content", label: "Content & Writing" },
	{ value: "HR", label: "Human Resources" },
	{ value: "Legal", label: "Legal" },
	{ value: "Healthcare", label: "Healthcare" },
	{ value: "Education", label: "Education & Training" },
	{ value: "Research", label: "Research & Development" },
	{ value: "Consulting", label: "Consulting" },
	{ value: "Nonprofit", label: "Nonprofit & Social Impact" },
	{ value: "Media", label: "Media & Communications" },
	{ value: "Other", label: "Other" },
];

export const INTERNSHIP_DURATION = [
	{ value: "", label: "All Durations" },
	{ value: "1 Month", label: "1 Month" },
	{ value: "2 Months", label: "2 Months" },
	{ value: "3 Months", label: "3 Months" },
	{ value: "4 Months", label: "4 Months" },
	{ value: "5 Months", label: "5 Months" },
	{ value: "6 Months", label: "6 Months" },
	{ value: "6+ Months", label: "6+ Months" },
	{ value: "Other", label: "Other" },
];

export const INTERNSHIP_COMPENSATION = [
	{ value: "", label: "All Compensation" },
	{ value: "Paid", label: "Paid" },
	{ value: "Unpaid", label: "Unpaid" },
];

export const INTERNSHIP_CITIES = [
	"Mumbai",
	"Delhi",
	"Bangalore",
	"Chennai",
	"Hyderabad",
	"Pune",
	"Kolkata",
	"Ahmedabad",
	"Jaipur",
	"Lucknow",
	"Kanpur",
	"Nagpur",
	"Indore",
	"Thane",
	"Bhopal",
	"Visakhapatnam",
	"Patna",
	"Vadodara",
	"Ludhiana",
	"Agra",
	"Faridabad",
	"Meerut",
	"Rajkot",
	"Varanasi",
	"Srinagar",
	"Amritsar",
	"Navi Mumbai",
	"Allahabad",
	"Ranchi",
	"Howrah",
	"Gwalior",
	"Vijayawada",
	"Jodhpur",
	"Madurai",
	"Raipur",
	"Kota",
	"Guwahati",
	"Chandigarh",
	"Solapur",
	"Bareilly",
	"Mysore",
	"Tiruppur",
	"Gurgaon",
	"Aligarh",
	"Jalandhar",
	"Bhubaneswar",
	"Gorakhpur",
	"Noida",
	"Jamshedpur",
	"Firozabad",
	"Kochi",
	"Asansol",
	"Ajmer",
	"Jamnagar",
	"Ujjain",
	"Loni",
	"Siliguri",
	"Jhansi",
	"Jammu",
	"Mangalore",
	"Erode",
	"Gaya",
	"Jalgaon",
	"Udaipur",
	"Maheshtala",
];

// Helper functions to get specific values
export const getInternshipTypeOptions = () => INTERNSHIP_TYPES;
export const getInternshipCategoryOptions = () => INTERNSHIP_CATEGORIES;
export const getInternshipDurationOptions = () => INTERNSHIP_DURATION;
export const getInternshipCompensationOptions = () => INTERNSHIP_COMPENSATION;

// Helper functions to get labels by value
export const getInternshipTypeLabel = (value) => {
	const internshipType = INTERNSHIP_TYPES.find((type) => type.value === value);
	return internshipType ? internshipType.label : value;
};

export const getInternshipCategoryLabel = (value) => {
	const category = INTERNSHIP_CATEGORIES.find((cat) => cat.value === value);
	return category ? category.label : value;
};

export const getInternshipDurationLabel = (value) => {
	const duration = INTERNSHIP_DURATION.find((dur) => dur.value === value);
	return duration ? duration.label : value;
};

export const getInternshipCompensationLabel = (value) => {
	const compensation = INTERNSHIP_COMPENSATION.find((comp) => comp.value === value);
	return compensation ? compensation.label : value;
};

// Aliases for backward compatibility
export const COMPENSATION_TYPES = INTERNSHIP_COMPENSATION;
export const INTERNSHIP_DURATIONS = INTERNSHIP_DURATION;
