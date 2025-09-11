const { CATEGORY_ARRAY, CITY_ARRAY, STATE_ARRAY } = require("../utils/filterConstants");
const https = require("https");

// Helper function to make API requests to Country State City API
const makeApiRequest = async (path) => {
	const options = {
		hostname: "api.countrystatecity.in",
		path,
		method: "GET",
		headers: {
			"X-CSCAPI-KEY": process.env.COUNTRY_STATE_CITY_API_KEY,
		},
	};

	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let data = "";

			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				try {
					const parsedData = JSON.parse(data);
					resolve(parsedData);
				} catch (parseError) {
					reject(new Error("Failed to parse API response"));
				}
			});
		});

		req.on("error", (error) => {
			reject(error);
		});

		req.end();
	});
};

const getFiltersData = async (req, res) => {
	try {
		const filtersData = {
			success: true,
			data: {
				category_count: CATEGORY_ARRAY.length,
				location_count: CITY_ARRAY.length,
				categoryArray: CATEGORY_ARRAY,
				cityArray: CITY_ARRAY,
			},
		};

		res.status(200).json(filtersData);
	} catch (error) {
		console.error("Error fetching filters data:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching filters data",
			error: error.message,
		});
	}
};

const getStates = async (req, res) => {
	try {
		const { countryIso } = req.params;

		if (!countryIso) {
			return res.status(400).json({
				success: false,
				message: "Country ISO code is required",
			});
		}

		const response = await makeApiRequest(`/v1/countries/${countryIso}/states`);

		if (response && Array.isArray(response)) {
			const states = response
				.map((state) => ({
					value: state.name,
					label: state.name,
					iso2: state.iso2,
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			return res.status(200).json({
				success: true,
				states,
			});
		}

		throw new Error("Invalid response from states API");
	} catch (error) {
		console.error("Error fetching states:", error);

		// Fallback to Indian states if API fails and country is India
		if (req.params.countryIso === "IN") {
			const fallbackStates = STATE_ARRAY.map((state) => ({
				value: state,
				label: state,
				iso2: null,
			}));

			return res.status(200).json({
				success: true,
				states: fallbackStates,
				fallback: true,
				message: "Using fallback Indian states due to API failure",
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to fetch states",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

const getCities = async (req, res) => {
	try {
		const { countryIso, stateIso } = req.params;

		if (!countryIso || !stateIso) {
			return res.status(400).json({
				success: false,
				message: "Country ISO and State ISO codes are required",
			});
		}

		const response = await makeApiRequest(`/v1/countries/${countryIso}/states/${stateIso}/cities`);

		if (response && Array.isArray(response)) {
			const cities = response
				.map((city) => ({
					value: city.name,
					label: city.name,
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			return res.status(200).json({
				success: true,
				cities,
			});
		}

		throw new Error("Invalid response from cities API");
	} catch (error) {
		console.error("Error fetching cities:", error);

		// Fallback to Indian cities if API fails and country is India
		if (req.params.countryIso === "IN") {
			const fallbackCities = CITY_ARRAY.map((city) => ({
				value: city,
				label: city,
			}));

			return res.status(200).json({
				success: true,
				cities: fallbackCities,
				fallback: true,
				message: "Using fallback Indian cities due to API failure",
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to fetch cities",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

const getCountries = async (req, res) => {
	try {
		const response = await makeApiRequest("/v1/countries");

		if (response && Array.isArray(response)) {
			const countries = response
				.map((country) => ({
					value: country.name,
					label: country.name,
					iso2: country.iso2,
				}))
				.sort((a, b) => {
					if (a.value === "India") return -1;
					if (b.value === "India") return 1;
					return a.label.localeCompare(b.label);
				});

			return res.status(200).json({
				success: true,
				countries,
			});
		}

		throw new Error("Invalid response from countries API");
	} catch (error) {
		console.error("Error fetching countries:", error);

		const fallbackCountries = [{ value: "India", label: "India", iso2: "IN" }];

		res.status(200).json({
			success: true,
			countries: fallbackCountries,
			fallback: true,
			message: "Using fallback countries due to API failure",
		});
	}
};

module.exports = {
	getFiltersData,
	getStates,
	getCities,
	getCountries,
};
