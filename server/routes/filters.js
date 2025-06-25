const express = require("express");
const router = express.Router();
const { getFiltersData } = require("../controllers/filtersController");

// GET /filters - Get all filter data (categories, cities, etc.)
router.get("/internships_cat_loc", getFiltersData);

module.exports = router;
