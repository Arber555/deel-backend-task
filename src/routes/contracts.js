const express = require("express");
const { getProfile } = require("../middleware/getProfile");
const router = express.Router();
const contractServices = require("../services/contracts.js");

router.get("/contracts/:id", getProfile, contractServices.findById);

router.get("/contracts", getProfile, contractServices.findAll);

module.exports = router;
