const express = require("express");
const { getProfile } = require("../middleware/getProfile");
const router = express.Router();
const adminServices = require("../services/admin.js");

router.get("/admin/best-profession", adminServices.findBestProfession);

router.get("/admin/best-clients", adminServices.findBestClients);

module.exports = router;
