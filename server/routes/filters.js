const express = require("express");
const { getFiltersData, getStates, getCities, getCountries } = require("../controllers/filtersController");

const router = express.Router();

// GET /filters - Get all filter data (categories, cities, etc.)
router.get("/internships_cat_loc", getFiltersData);

// GET /filters/states/:countryIso - Get states for a specific country
router.get("/states/:countryIso", getStates);

// GET /filters/cities/:countryIso/:stateIso - Get cities for a specific state and country
router.get("/cities/:countryIso/:stateIso", getCities);

// GET /filters/countries - Get all countries for organizer profiles
router.get("/countries", getCountries);

module.exports = router;
