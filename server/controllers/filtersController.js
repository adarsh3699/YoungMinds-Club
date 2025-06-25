const { CATEGORY_ARRAY, CITY_ARRAY } = require("../utils/filterConstants");

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

module.exports = {
	getFiltersData,
};
